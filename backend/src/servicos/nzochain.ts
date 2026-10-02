import type {
  PedidoAnalise,
  PedidoAnaliseContrato,
  RespostaAnalise,
  RespostaAnaliseContrato
} from "../tipos/analise.js";
import { classificarRisco } from "./classificarRisco.js";

const URL_WALLET_RISK =
  "https://api.nzochain.com/api/v1/wallets/risk";

const URL_CONTRACT_RISK =
  "https://api.nzochain.com/api/v1/contracts/risk";

const TEMPO_LIMITE_MS = 60000;
const MAX_ATTEMPTS = 3;

export class ErroServicoNZOChain extends Error {
  constructor(
    message: string,
    public readonly statusHttp = 502
  ) {
    super(message);
    this.name = "ErroServicoNZOChain";
  }
}

function mensagemPorEstado(status: number): string {
  if (status === 400) return "Pedido rejeitado pela NZOChain.";
  if (status === 401) return "Credenciais da NZOChain recusadas.";
  if (status === 403) return "Funcionalidade não disponível no plano atual.";
  if (status === 404) return "Recurso da NZOChain não encontrado.";
  if (status === 429) return "Limite de pedidos da NZOChain atingido.";
  if (status >= 500) return "NZOChain indisponível.";
  return "Não foi possível concluir a análise.";
}

function erroExterno(status: number): ErroServicoNZOChain {
  return new ErroServicoNZOChain(
    mensagemPorEstado(status),
    status === 403 ? 403 : 502
  );
}

function sanitizar(obj: unknown): unknown {
  const sensiveis = new Set([
    "auth",
    "apikey",
    "token",
    "credentials",
    "authorization",
    "x-api-key"
  ]);

  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizar(item));
  }

  const entrada = obj as Record<string, unknown>;
  const saida: Record<string, unknown> = {};

  for (const [chave, valor] of Object.entries(entrada)) {
    if (sensiveis.has(chave.toLowerCase())) {
      continue;
    }

    saida[chave] = sanitizar(valor);
  }

  return saida;
}

async function chamarNZOChain(
  url: string,
  body: Record<string, unknown>,
  identificador: string
): Promise<unknown> {
  const chave = process.env.NZOCHAIN_API_KEY;

  if (!chave) {
    throw new ErroServicoNZOChain(
      "API Key da NZOChain ausente.",
      500
    );
  }

  for (let tentativa = 1; tentativa <= MAX_ATTEMPTS; tentativa++) {
    const controlador = new AbortController();

    const tempo = setTimeout(
      () => controlador.abort(),
      TEMPO_LIMITE_MS
    );

    try {
      console.info(
        `NZOChain: attempt ${tentativa} -> ${identificador}`
      );

      const resposta = await fetch(url, {
        method: "POST",
        signal: controlador.signal,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": chave
        },
        body: JSON.stringify(body)
      });

      const tipoConteudo =
        resposta.headers.get("content-type") ?? "";

      const corpo = tipoConteudo.includes("application/json")
        ? await resposta.json()
        : await resposta.text();

      if (!resposta.ok) {
        if (
          resposta.status >= 400 &&
          resposta.status < 500
        ) {
          throw erroExterno(resposta.status);
        }

        if (resposta.status >= 500) {
          if (tentativa < MAX_ATTEMPTS) {
            const espera = 500 * Math.pow(2, tentativa - 1);

            await new Promise((resolve) =>
              setTimeout(resolve, espera)
            );

            continue;
          }

          throw new ErroServicoNZOChain(
            "NZOChain respondeu com erro de servidor.",
            502
          );
        }

        throw erroExterno(resposta.status);
      }

      if (!corpo || typeof corpo !== "object") {
        throw new ErroServicoNZOChain(
          "Resposta inesperada da NZOChain.",
          502
        );
      }

      return corpo;
    } catch (erro) {
      if (erro instanceof ErroServicoNZOChain) {
        throw erro;
      }

      if (
        erro instanceof Error &&
        erro.name === "AbortError"
      ) {
        throw new ErroServicoNZOChain(
          "Tempo limite excedido ao contactar a NZOChain.",
          504
        );
      }

      if (tentativa === MAX_ATTEMPTS) {
        throw new ErroServicoNZOChain(
          "Não foi possível contactar o serviço.",
          502
        );
      }

      const espera = 500 * Math.pow(2, tentativa - 1);

      await new Promise((resolve) =>
        setTimeout(resolve, espera)
      );
    } finally {
      clearTimeout(tempo);
    }
  }

  throw new ErroServicoNZOChain(
    "Não foi possível contactar a NZOChain.",
    502
  );
}

export async function analisarCarteira(
  pedido: PedidoAnalise
): Promise<RespostaAnalise> {
  const corpo = await chamarNZOChain(
    URL_WALLET_RISK,
    {
      wallet: pedido.wallet,
      network: pedido.network
    },
    `${pedido.wallet} / ${pedido.network}`
  );

  return {
    ...classificarRisco(corpo),
    rede: pedido.network,
    endereco: pedido.wallet,
    analisadoEm: new Date().toISOString(),
    detalhesTecnicos: sanitizar(corpo)
  };
}

export async function analisarContrato(
  pedido: PedidoAnaliseContrato
): Promise<RespostaAnaliseContrato> {
  const corpo = await chamarNZOChain(
    URL_CONTRACT_RISK,
    {
      address: pedido.address,
      network: pedido.network
    },
    `contract ${pedido.address} / ${pedido.network}`
  );

  return {
    ...classificarRisco(corpo),
    rede: pedido.network,
    endereco: pedido.address,
    analisadoEm: new Date().toISOString(),
    detalhesTecnicos: sanitizar(corpo)
  };
}
