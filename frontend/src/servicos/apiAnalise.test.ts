import { afterEach, describe, expect, it, vi } from "vitest";
import { pedirAnalise } from "./apiAnalise";

describe("servico de analise", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("chama apenas o backend local", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ nivel: "baixo" })
    });
    vi.stubGlobal("fetch", fetchMock);

    await pedirAnalise({
      wallet: "0x0000000000000000000000000000000000000000",
      network: "ethereum"
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/scan",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("nao usa variavel secreta no frontend", async () => {
    const modulos = await import.meta.glob("../**/*.{ts,tsx}", {
      query: "?raw",
      import: "default",
      eager: true
    });

    const conteudo = Object.entries(modulos)
      .filter(([caminho]) => !caminho.endsWith("apiAnalise.test.ts"))
      .map(([, texto]) => texto)
      .join("\n");

    expect(conteudo).not.toContain("NZOCHAIN_API_KEY");
    expect(conteudo).not.toContain("X-API-Key");
    expect(conteudo).not.toContain("pk_live_");
  });
});
