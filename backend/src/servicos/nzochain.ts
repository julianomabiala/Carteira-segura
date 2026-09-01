import type { PedidoAnalise, RespostaAnalise } from "../tipos/analise.js";
import { classificarRisco } from "./classificarRisco.js";

const URL_NZOCHAIN = "https://api.nzochain.com/api/risk/scan";
const TEMPO_LIMITE_MS = 60000; // aumentar timeout para 60s por chamada
const MAX_ATTEMPTS = 3;

export class ErroServicoNZOChain extends Error {
  constructor(
    message: string,
    public readonly statusHttp = 502
  ) {
    super(message);
  }
}

function mensagemPorEstado(status: number): string {
  if (status === 400) return "Pedido rejeitado pela NZOChain.";
  if (status === 401 || status === 403) return "Credenciais da NZOChain recusadas.";
  if (status === 404) return "Recurso da NZOChain nao encontrado.";
  if (status === 429) return "Limite de pedidos da NZOChain atingido.";
  if (status >= 500) return "NZOChain indisponivel.";
  return "Nao foi possivel concluir a analise.";
}

export async function analisarCarteira(pedido: PedidoAnalise): Promise<RespostaAnalise> {
  const chave = process.env.NZOCHAIN_API_KEY;
  if (!chave) {
    throw new ErroServicoNZOChain("API Key da NZOChain ausente.", 500);
  }

  async function attemptCall(attempt: number) {
    const controlador = new AbortController();
    const tempo = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS);
    try {
      console.info(`NZOChain: attempt ${attempt} -> ${pedido.wallet} / ${pedido.network}`);
      const resposta = await fetch(URL_NZOCHAIN, {
        method: "POST",
        signal: controlador.signal,
       headers: {
  "Content-Type": "application/json",
  "X-API-Key": chave
} as Record<string, string>,        body: JSON.stringify({ wallet: pedido.wallet, network: pedido.network })
      });

      const tipoConteudo = resposta.headers.get("content-type") ?? "";
      const corpo = tipoConteudo.includes("application/json") ? await resposta.json() : await resposta.text();

      if (!resposta.ok) {
        // 429 -> return immediately as rate limit
        if (resposta.status === 429) {
          throw new ErroServicoNZOChain(mensagemPorEstado(resposta.status), 429);
        }
        // 4xx -> client error
        if (resposta.status >= 400 && resposta.status < 500) {
          throw new ErroServicoNZOChain(mensagemPorEstado(resposta.status), 400);
        }
        // 5xx -> server error (may retry)
        throw { transient: true, status: resposta.status, message: mensagemPorEstado(resposta.status) };
      }

      if (!corpo || typeof corpo !== "object") {
        throw new ErroServicoNZOChain("Resposta inesperada da NZOChain.", 502);
      }

      return corpo;
    } finally {
      clearTimeout(tempo);
    }
  }

  // retry loop for transient errors
  let ultimoErro: unknown = null;
  for (let tentativa = 1; tentativa <= MAX_ATTEMPTS; tentativa++) {
    try {
      const corpo = await attemptCall(tentativa);

      function sanitizar(obj: unknown): unknown {
        const sensiveis = ["auth", "apiKey", "apikey", "token", "credentials", "authorization", "X-API-Key"];

        if (obj === null || typeof obj !== "object") return obj;
        if (Array.isArray(obj)) return obj.map((item) => sanitizar(item));

        const entrada = obj as Record<string, unknown>;
        const saida: Record<string, unknown> = {};

        for (const [chave, valor] of Object.entries(entrada)) {
          if (sensiveis.includes(chave.toLowerCase())) continue;
          if (chave.toLowerCase() === "meta" && valor && typeof valor === "object") {
            const meta = { ...(valor as Record<string, unknown>) };
            delete meta.auth;
            delete meta.apikey;
            saida[chave] = sanitizar(meta);
            continue;
          }

          saida[chave] = sanitizar(valor);
        }

        return saida;
      }

      return {
        ...classificarRisco(corpo),
        rede: pedido.network,
        endereco: pedido.wallet,
        analisadoEm: new Date().toISOString(),
        detalhesTecnicos: sanitizar(corpo)
      };
    } catch (erro) {
      ultimoErro = erro;
      // if it's our typed ErroServicoNZOChain, rethrow
      if (erro instanceof ErroServicoNZOChain) throw erro;
      // if transient marker, retry
      if (erro && typeof erro === "object" && (erro as any).transient) {
        const status = (erro as any).status ?? 502;
        console.warn(`NZOChain transient error (status=${status}), tentativa ${tentativa}`);
        if (tentativa < MAX_ATTEMPTS) {
          const espera = 500 * Math.pow(2, tentativa - 1);
          await new Promise((r) => setTimeout(r, espera));
          continue;
        }
        throw new ErroServicoNZOChain("NZOChain respondeu com erro de servidor.", 502);
      }
      // non-transient -> wrap and throw
      if (erro instanceof Error && erro.name === "AbortError") {
        throw new ErroServicoNZOChain("Tempo limite excedido ao contactar a NZOChain.", 504);
      }
      throw new ErroServicoNZOChain("Nao foi possivel contactar o servico.", 502);
    }
  }

  // Se o loop terminou sem sucesso, lança o último erro conhecido
  if (ultimoErro instanceof ErroServicoNZOChain) throw ultimoErro;
  throw new ErroServicoNZOChain("Nao foi possivel contactar a NZOChain.", 502);
}
