import { beforeEach, describe, expect, it } from "vitest";
import {
  carregarEvidencias,
  guardarEvidencia,
  limparEvidencias
} from "./armazenamento";
import type { EvidenciaCasoTeste } from "./tipos";

function criarEvidencia(runId: string): EvidenciaCasoTeste {
  return {
    id: "TC-05",
    runId,
    titulo: "Interação suspeita",
    descricao: "Teste repetível",
    wallet: "0x0000000000000000000000000000000000000001",
    network: "ethereum",
    contract: "0x0000000000000000000000000000000000000002",
    estado: "em_execucao",
    before: null,
    action: null,
    after: null,
    observacao: "",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z"
  };
}

describe("armazenamento de evidências do experimento", () => {
  beforeEach(() => limparEvidencias());

  it("mantém execuções repetidas do mesmo caso e atualiza a execução atual", () => {
    guardarEvidencia(criarEvidencia("run-1"));
    guardarEvidencia(criarEvidencia("run-2"));
    guardarEvidencia({
      ...criarEvidencia("run-1"),
      estado: "passou"
    });

    const evidencias = carregarEvidencias();

    expect(evidencias).toHaveLength(2);
    expect(evidencias.find((item) => item.runId === "run-1")?.estado).toBe("passou");
    expect(evidencias.find((item) => item.runId === "run-2")?.estado).toBe("em_execucao");
  });
});