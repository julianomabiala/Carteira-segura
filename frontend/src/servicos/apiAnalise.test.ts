import { describe, expect, it, vi, afterEach } from "vitest";
import { pedirAnalise, pedirAnaliseContrato } from "./apiAnalise";

function criarRespostaMock() {
  return {
    ok: true,
    status: 200,
    headers: {
      get: (nome: string) =>
        nome.toLowerCase() === "x-analysis-id"
          ? "analysis-test-001"
          : null
    },
    json: async () => ({
      nivel: "baixo",
      titulo: "Baixo risco",
      explicacao: "Sem sinais relevantes.",
      razoes: [],
      rede: "ethereum",
      endereco:
        "0x0000000000000000000000000000000000000000",
      analisadoEm: "2026-09-30T00:00:00.000Z",
      detalhesTecnicos: {}
    })
  };
}

describe("servico de analise", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("chama apenas o backend local", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      criarRespostaMock()
    );

    vi.stubGlobal("fetch", fetchMock);

    const resultado = await pedirAnalise({
      wallet:
        "0x0000000000000000000000000000000000000000",
      network: "ethereum"
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/scan",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          wallet:
            "0x0000000000000000000000000000000000000000",
          network: "ethereum"
        })
      })
    );

    expect(
      resultado.detalhesTecnicos
    ).toMatchObject({
      __metadadosApi: expect.objectContaining({
        analysisId: "analysis-test-001",
        endpoint: "http://localhost:3001/api/scan",
        httpStatus: 200
      })
    });
  });

  it("nao usa variavel secreta no frontend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      criarRespostaMock()
    );

    vi.stubGlobal("fetch", fetchMock);

    await pedirAnalise({
      wallet:
        "0x0000000000000000000000000000000000000000",
      network: "ethereum"
    });

    const chamadas = fetchMock.mock.calls;

    expect(JSON.stringify(chamadas)).not.toContain(
      "NZOCHAIN_API_KEY"
    );

    expect(JSON.stringify(chamadas)).not.toContain(
      "X-API-Key"
    );
  });

  it.each([
    "ethereum",
    "bnb",
    "polygon",
    "arbitrum"
  ] as const)("envia a rede API selecionada sem a alterar: %s", async (network) => {
    const fetchMock = vi.fn().mockResolvedValue(criarRespostaMock());
    vi.stubGlobal("fetch", fetchMock);

    await pedirAnalise({
      wallet: "0x0000000000000000000000000000000000000000",
      network
    });
    await pedirAnaliseContrato({
      address: "0x0000000000000000000000000000000000000001",
      network
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      network
    });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      network
    });
  });
});
