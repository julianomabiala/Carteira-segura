import type {
  PedidoAnalise,
  PedidoAnaliseContrato,
  RespostaAnalise,
  RespostaAnaliseContrato
} from "../tipos/analise";
import type {
  MetadadosAnalise,
  RespostaPedidoAnalise
} from "../experimento/tipos";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

const URL_SCAN = API_URL ? `${API_URL}/api/scan` : "/api/scan";
const URL_CONTRACT_SCAN = API_URL
  ? `${API_URL}/api/contract-scan`
  : "/api/contract-scan";

async function fazerPedido(
  url: string,
  corpo: unknown
): Promise<RespostaPedidoAnalise> {
  const requestedAt = new Date().toISOString();

  let resposta: Response;

  try {
    resposta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(corpo)
    });
  } catch {
    throw new Error(
      "Não foi possível contactar o serviço. Verifique a sua ligação e tente novamente."
    );
  }

  const completedAt = new Date().toISOString();
  const resultado = await resposta.json().catch(() => null);

  const metadados: MetadadosAnalise = {
    analysisId:
      resposta.headers.get("X-Analysis-Id") ??
      resposta.headers.get("x-analysis-id"),
    endpoint: url,
    httpStatus: resposta.status,
    requestedAt,
    completedAt
  };

  if (!resposta.ok) {
    throw new Error(
      resultado?.mensagem ??
        "Não foi possível concluir a análise neste momento. Tente novamente."
    );
  }

  return {
    dados: resultado,
    metadados
  };
}

export async function pedirAnalise(
  pedido: PedidoAnalise
): Promise<RespostaAnalise> {
  const resultado = await fazerPedido(URL_SCAN, pedido);

  return {
    ...(resultado.dados as RespostaAnalise),
    detalhesTecnicos: {
      ...((resultado.dados as RespostaAnalise).detalhesTecnicos ?? {}),
      __metadadosApi: resultado.metadados
    }
  };
}

export async function pedirAnaliseContrato(
  pedido: PedidoAnaliseContrato
): Promise<RespostaAnaliseContrato> {
  const resultado = await fazerPedido(
    URL_CONTRACT_SCAN,
    pedido
  );

  return {
    ...(resultado.dados as RespostaAnaliseContrato),
    detalhesTecnicos: {
      ...(
        (resultado.dados as RespostaAnaliseContrato)
          .detalhesTecnicos ?? {}
      ),
      __metadadosApi: resultado.metadados
    }
  };
}
