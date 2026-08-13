import type { PedidoAnalise, RespostaAnalise } from "../tipos/analise.js";
import { classificarRisco } from "./classificarRisco.js";

const URL_NZOCHAIN = "https://api.nzochain.com/api/risk/scan";
const TEMPO_LIMITE_MS = 10000;

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

  const controlador = new AbortController();
  const tempo = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS);

  try {
    const resposta = await fetch(URL_NZOCHAIN, {
      method: "POST",
      signal: controlador.signal,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": chave
      },
      body: JSON.stringify({
        wallet: pedido.wallet,
        network: pedido.network
      })
    });

    const tipoConteudo = resposta.headers.get("content-type") ?? "";
    const corpo = tipoConteudo.includes("application/json") ? await resposta.json() : await resposta.text();

    if (!resposta.ok) {
      throw new ErroServicoNZOChain(mensagemPorEstado(resposta.status), resposta.status === 429 ? 429 : 502);
    }

    if (!corpo || typeof corpo !== "object") {
      throw new ErroServicoNZOChain("Resposta inesperada da NZOChain.", 502);
    }

    function sanitizar(obj: unknown): unknown {
      const sensiveis = ["auth", "apiKey", "apikey", "token", "credentials", "authorization", "X-API-Key"];

      if (obj === null || typeof obj !== "object") return obj;
      if (Array.isArray(obj)) return obj.map((item) => sanitizar(item));

      const entrada = obj as Record<string, unknown>;
      const saida: Record<string, unknown> = {};

      for (const [chave, valor] of Object.entries(entrada)) {
        if (sensiveis.includes(chave.toLowerCase())) continue;
        // evitar exposição de tokens em objetos meta
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
    if (erro instanceof ErroServicoNZOChain) throw erro;
    if (erro instanceof Error && erro.name === "AbortError") {
      throw new ErroServicoNZOChain("Tempo limite excedido ao contactar a NZOChain.", 504);
    }
    throw new ErroServicoNZOChain("Nao foi possivel contactar o servico.", 502);
  } finally {
    clearTimeout(tempo);
  }
}
