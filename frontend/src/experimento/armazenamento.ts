import type { EvidenciaCasoTeste } from "./tipos";

const CHAVE = "carteira-segura-experimento-v1";

function ambienteDisponivel(): boolean {
  return typeof window !== "undefined";
}

export function carregarEvidencias(): EvidenciaCasoTeste[] {
  if (!ambienteDisponivel()) {
    return [];
  }

  try {
    const valor = window.localStorage.getItem(CHAVE);

    if (!valor) {
      return [];
    }

    const dados = JSON.parse(valor);

    if (!Array.isArray(dados)) {
      return [];
    }

    return dados;
  } catch {
    return [];
  }
}

export function guardarEvidencias(
  evidencias: EvidenciaCasoTeste[]
): void {
  if (!ambienteDisponivel()) {
    return;
  }

  window.localStorage.setItem(
    CHAVE,
    JSON.stringify(evidencias)
  );
}

export function guardarEvidencia(
  evidencia: EvidenciaCasoTeste
): EvidenciaCasoTeste[] {
  const evidencias = carregarEvidencias();

  const indice = evidencias.findIndex(
    (item) =>
      (item.runId ?? item.createdAt) ===
      (evidencia.runId ?? evidencia.createdAt)
  );

  if (indice >= 0) {
    evidencias[indice] = evidencia;
  } else {
    evidencias.push(evidencia);
  }

  guardarEvidencias(evidencias);

  return evidencias;
}

export function limparEvidencias(): void {
  if (!ambienteDisponivel()) {
    return;
  }

  window.localStorage.removeItem(CHAVE);
}

export function exportarEvidencias(): string {
  return JSON.stringify(
    carregarEvidencias(),
    null,
    2
  );
}
