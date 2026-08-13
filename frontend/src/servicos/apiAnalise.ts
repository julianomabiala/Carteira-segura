import type { PedidoAnalise, ResultadoAnalise } from "../tipos/analise";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export async function pedirAnalise(
  pedido: PedidoAnalise
): Promise<ResultadoAnalise> {
  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
