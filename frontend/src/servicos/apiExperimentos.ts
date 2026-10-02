import type {
  DiferencaAnalise,
  EvidenciaCasoTeste
} from "../experimento/tipos";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(
  /\/+$/,
  ""
);

const BASE = API_URL || "";

export async function listarEvidenciasRemotas(): Promise<
  EvidenciaCasoTeste[]
> {
  const resposta = await fetch(
    `${BASE}/api/experimentos/evidencias`,
    {
      method: "GET",
      credentials: "include"
    }
  );

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível carregar as evidências remotas."
    );
  }

  const dados = await resposta.json();

  return Array.isArray(dados) ? dados : [];
}

export async function guardarEvidenciaRemota(
  evidencia: EvidenciaCasoTeste,
  diferencas: DiferencaAnalise[] = []
): Promise<void> {
  const resposta = await fetch(
    `${BASE}/api/experimentos/evidencias`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        ...evidencia,
        diferencas
      })
    }
  );

  if (!resposta.ok) {
    const resultado = await resposta
      .json()
      .catch(() => null);

    throw new Error(
      resultado?.mensagem ??
        "Não foi possível guardar a evidência."
    );
  }
}
