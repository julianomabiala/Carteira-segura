import type { Request, Response } from "express";
import crypto from "node:crypto";
import { ethers } from "ethers";
import {
  apagarNonce,
  consumirNonce,
  criarSessao,
  gerarHashToken,
  limparNoncesExpirados,
  limparSessoesExpiradas,
  obterOuCriarWallet,
  obterSessaoPorToken,
  revogarSessao,
  guardarNonce
} from "../repositorios/repositorioAuth.js";

const COOKIE_NAME = "carteira_segura_session";
const NONCE_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function gerarToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

function obterCookie(req: Request, nome: string): string | null {
  const header = req.headers.cookie;

  if (!header) {
    return null;
  }

  const cookies = header.split(";");

  for (const cookie of cookies) {
    const [chave, ...resto] = cookie.trim().split("=");

    if (chave === nome) {
      return decodeURIComponent(resto.join("="));
    }
  }

  return null;
}

function opcoesCookie() {
  const producao = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: producao,
    sameSite: "lax" as const,
    maxAge: SESSION_TTL_MS,
    path: "/"
  };
}

function limparCookie(res: Response): void {
  const opcoes = opcoesCookie();

  res.clearCookie(COOKIE_NAME, {
    httpOnly: opcoes.httpOnly,
    secure: opcoes.secure,
    sameSite: opcoes.sameSite,
    path: opcoes.path
  });
}

export async function obterNonce(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    await limparNoncesExpirados();

    const nonce = gerarToken(16);
    const expiresAt = new Date(Date.now() + NONCE_TTL_MS);

    await guardarNonce(nonce, expiresAt);

    res.setHeader("Cache-Control", "no-store");

    res.json({
      nonce,
      expiresIn: NONCE_TTL_MS
    });
  } catch (erro) {
    console.error("Erro ao gerar nonce SIWE:", erro);

    res.status(503).json({
      codigo: "BANCO_INDISPONIVEL",
      mensagem:
        "Não foi possível iniciar a autenticação neste momento."
    });
  }
}

export async function verificarSiwe(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { message, signature } = req.body as {
      message?: string;
      signature?: string;
    };

    if (!message || !signature) {
      res.status(400).json({
        codigo: "INVALIDO",
        mensagem: "Mensagem ou assinatura em falta."
      });
      return;
    }

    const nonceMatch = message.match(/^Nonce:\s*([0-9a-f]+)$/im);
    const nonce = nonceMatch?.[1] ?? null;

    if (!nonce) {
      res.status(400).json({
        codigo: "INVALID_NONCE",
        mensagem: "Nonce ausente na mensagem."
      });
      return;
    }

    const addressMatch = message.match(
      /Ethereum account:\s*\n(0x[a-fA-F0-9]{40})/i
    );

    if (!addressMatch?.[1]) {
      res.status(400).json({
        codigo: "INVALID_MESSAGE",
        mensagem: "Endereço da wallet ausente na mensagem."
      });
      return;
    }

    const enderecoDeclarado = addressMatch[1];

    let enderecoRecuperado: string;

    try {
      enderecoRecuperado = ethers.verifyMessage(message, signature);
    } catch {
      res.status(400).json({
        codigo: "INVALID_SIGNATURE",
        mensagem: "Assinatura inválida."
      });
      return;
    }

    if (
      enderecoRecuperado.toLowerCase() !==
      enderecoDeclarado.toLowerCase()
    ) {
      res.status(400).json({
        codigo: "WALLET_MISMATCH",
        mensagem: "A assinatura não corresponde à wallet indicada."
      });
      return;
    }

    const nonceValido = await consumirNonce(nonce);

    if (!nonceValido) {
      res.status(400).json({
        codigo: "INVALID_NONCE",
        mensagem: "Nonce inválido, expirado ou já utilizado."
      });
      return;
    }

    const wallet = ethers.getAddress(enderecoRecuperado).toLowerCase();

    const walletPersistida = await obterOuCriarWallet(wallet);

    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const token = gerarToken(32);
    const tokenHash = gerarHashToken(token);

    await criarSessao(
      walletPersistida.id,
      tokenHash,
      expiresAt
    );

    res.cookie(
      COOKIE_NAME,
      token,
      opcoesCookie()
    );

    console.log(
      `[SIWE] Sessão criada para ${wallet}. Cookie enviado: ${COOKIE_NAME}`
    );

    res.setHeader("Cache-Control", "no-store");

    res.json({
      autenticado: true,
      wallet,
      expiresAt: expiresAt.toISOString()
    });
  } catch (erro) {
    console.error("Erro SIWE:", erro);

    res.status(503).json({
      codigo: "BANCO_INDISPONIVEL",
      mensagem:
        "Não foi possível concluir a autenticação neste momento."
    });
  }
}

export async function obterSessao(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await limparSessoesExpiradas();

    const token = obterCookie(req, COOKIE_NAME);

    console.log(
      `[SIWE] /session → cookie recebido: ${token ? "SIM" : "NÃO"}`
    );

    if (!token) {
      res.status(401).json({
        autenticado: false
      });
      return;
    }

    const tokenHash = gerarHashToken(token);
    const sessao = await obterSessaoPorToken(tokenHash);

    if (!sessao) {
      limparCookie(res);

      res.status(401).json({
        autenticado: false
      });
      return;
    }

    res.setHeader("Cache-Control", "no-store");

    res.json({
      autenticado: true,
      wallet: sessao.wallet,
      expiresAt: sessao.expiresAt.toISOString()
    });
  } catch (erro) {
    console.error("Erro ao obter sessão:", erro);

    res.status(503).json({
      codigo: "BANCO_INDISPONIVEL",
      mensagem:
        "Não foi possível verificar a sessão neste momento."
    });
  }
}

export async function terminarSessao(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const token = obterCookie(req, COOKIE_NAME);

    if (token) {
      const tokenHash = gerarHashToken(token);
      await revogarSessao(tokenHash);
    }

    limparCookie(res);

    res.setHeader("Cache-Control", "no-store");

    res.json({
      autenticado: false
    });
  } catch (erro) {
    console.error("Erro ao terminar sessão:", erro);

    limparCookie(res);

    res.status(503).json({
      codigo: "BANCO_INDISPONIVEL",
      mensagem:
        "Não foi possível terminar a sessão neste momento."
    });
  }
}
