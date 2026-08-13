import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { criarApp } from "../aplicacao.js";

const wallet = "0x0000000000000000000000000000000000000000";

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
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ risk_level: "low", malicious: false })
    });
    vi.stubGlobal("fetch", fetchMock);

    const resposta = await request(criarApp())
      .post("/api/scan")
      .send({ wallet, network: "ethereum" })
      .expect(200);

    expect(resposta.body.nivel).toBe("baixo");
    expect(resposta.body.razoes).toBeDefined();
    expect(JSON.stringify(resposta.body)).not.toContain("chave_de_teste");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.nzochain.com/api/risk/scan",
      expect.objectContaining({
        headers: expect.objectContaining({ "X-API-Key": "chave_de_teste" })
      })
    );
  });

  it("rejeita pedidos invalidos", async () => {
    const resposta = await request(criarApp())
      .post("/api/scan")
      .send({ wallet: "0x123", network: "ethereum" })
      .expect(400);

    expect(resposta.body.mensagem).toContain("endereco");
  });

  it("trata erro da NZOChain com mensagem segura", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ error: "unauthorized" })
      })
    );

    const resposta = await request(criarApp())
      .post("/api/scan")
      .send({ wallet, network: "ethereum" })
      .expect(502);

    expect(resposta.body.mensagem).toBe("Nao foi possivel concluir a analise neste momento. Tente novamente.");
    expect(JSON.stringify(resposta.body)).not.toContain("chave_de_teste");
  });
});
