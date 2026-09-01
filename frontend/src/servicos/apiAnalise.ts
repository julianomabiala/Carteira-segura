import type { PedidoAnalise, ResultadoAnalise } from "../tipos/analise";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const URL_SCAN = API_URL ? `${API_URL}/api/scan` : "/api/scan";

export async function pedirAnalise(
  pedido: PedidoAnalise,
  idToken?: string
): Promise<ResultadoAnalise> {
  let resposta: Response;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (idToken) headers["Authorization"] = `Bearer ${idToken}`;

  try {
    resposta = await fetch(URL_SCAN, {
      method: "POST",
      headers,
      body: JSON.stringify(pedido)
    });
  } catch {
    throw new Error(
      "Nao foi possivel contactar o servico. Verifique a sua ligacao e tente novamente."
    );
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(
      corpo?.mensagem ??
        "Nao foi possivel concluir a analise neste momento. Tente novamente."
    );
  }

  return corpo as ResultadoAnalise;
}
