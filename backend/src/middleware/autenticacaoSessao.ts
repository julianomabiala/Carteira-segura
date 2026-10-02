import type { NextFunction, Request, Response } from "express";
import {
  gerarHashToken,
  obterSessaoPorToken
} from "../repositorios/repositorioAuth.js";

const COOKIE_NAME = "carteira_segura_session";

export function obterCookie(
  req: Request,
  nome: string
): string | null {
  const cabecalho = req.headers.cookie;
  if (!cabecalho) return null;

  for (const parte of cabecalho.split(";")) {
    const indice = parte.indexOf("=");
    if (indice < 0) continue;

    const chave = parte.slice(0, indice).trim();
    const valor = parte.slice(indice + 1).trim();

    if (chave === nome) {
      return decodeURIComponent(valor);
    }
  }

  return null;
}

export async function exigirSessao(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = obterCookie(req, COOKIE_NAME);

    if (!token) {
      res.status(401).json({
        codigo: "NAO_AUTENTICADO",
        mensagem: "É necessário ligar uma wallet para continuar."
      });
      return;
    }

    const sessao = await obterSessaoPorToken(
      gerarHashToken(token)
    );

    if (!sessao) {
      res.status(401).json({
        codigo: "SESSAO_INVALIDA",
        mensagem: "A sessão não é válida ou expirou."
      });
      return;
    }

    res.locals.sessao = sessao;
    next();
  } catch (erro) {
    console.error("Erro ao validar sessão:", erro);

    res.status(500).json({
      codigo: "ERRO_INTERNO",
      mensagem: "Não foi possível validar a sessão."
    });
  }
}
