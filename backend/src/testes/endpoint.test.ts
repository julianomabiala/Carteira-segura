import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { criarApp } from "../aplicacao.js";

const wallet = "0x0000000000000000000000000000000000000000";

vi.mock("../repositorios/repositorioAuth.js", async (importOriginal) => {
  const original = await importOriginal<typeof import("../repositorios/repositorioAuth.js")>();

  return {
    ...original,
    obterSessaoPorToken: vi.fn(async () => ({
      id: "session-id",
      walletId: "wallet-id",
      wallet
    })),
    obterOuCriarWallet: vi.fn(async () => ({
      id: "wallet-id",
      address: wallet,
      network: "ethereum"
    }))
  };
});

vi.mock("../repositorios/repositorioAnalises.js", () => ({
  guardarAnalise: vi.fn(async () => "analysis-id")
}));

describe("endpoint /api/scan", () => {
  beforeEach(() => {
    process.env.NZOCHAIN_API_KEY = "chave_de_teste";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NZOCHAIN_API_KEY;
  });

  it("devolve analise normalizada sem expor a API Key", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({
        "content-type": "application/json"
      }),
      json: async () => ({
        success: true,
        data: {
          riskScore: 0,
          riskLevel: "SAFE",
          decision: "ALLOW",
          reasons: [
            "Nenhuma ameaça material detectada nesta carteira."
          ],
          permissions: []
        }
      })
    });

    vi.stubGlobal("fetch", fetchMock);

    const resposta = await request(criarApp())
      .post("/api/scan")
      .set("Cookie", "carteira_segura_session=session-token")
      .send({
        wallet,
        network: "ethereum"
      })
      .expect(200);

    expect(resposta.body.nivel).toBe("baixo");
    expect(resposta.body.razoes).toBeDefined();
    expect(resposta.body.detalhesTecnicos).toBeDefined();

    expect(JSON.stringify(resposta.body)).not.toContain(
      "chave_de_teste"
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.nzochain.com/api/v1/wallets/risk",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-API-Key": "chave_de_teste",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          wallet,
          network: "ethereum"
        })
      })
    );
  });

  it("rejeita pedidos invalidos", async () => {
    const resposta = await request(criarApp())
      .post("/api/scan")
      .set("Cookie", "carteira_segura_session=session-token")
      .send({
        wallet: "0x123",
        network: "ethereum"
      })
      .expect(400);

    expect(resposta.body.mensagem).toContain("endereço");
  });

  it("trata erro da NZOChain com mensagem segura", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({
          "content-type": "application/json"
        }),
        json: async () => ({
          error: "unauthorized"
        })
      })
    );

    const resposta = await request(criarApp())
      .post("/api/scan")
      .set("Cookie", "carteira_segura_session=session-token")
      .send({
        wallet,
        network: "ethereum"
      })
      .expect(502);

    expect(resposta.body.mensagem).toBe(
      "Não foi possível concluir a análise neste momento. Tente novamente."
    );

    expect(JSON.stringify(resposta.body)).not.toContain(
      "chave_de_teste"
    );
  });

  it("bloqueia scans de wallet e contrato sem sessão SIWE", async () => {
    for (const [endpoint, corpo] of [
      ["/api/scan", { wallet, network: "ethereum" }],
      [
        "/api/contract-scan",
        {
          address: "0x0000000000000000000000000000000000000001",
          network: "ethereum"
        }
      ]
    ] as const) {
      const resposta = await request(criarApp())
        .post(endpoint)
        .send(corpo)
        .expect(401);

      expect(resposta.body.codigo).toBe("NAO_AUTENTICADO");
    }
  });
});
