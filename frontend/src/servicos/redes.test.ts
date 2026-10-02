import { describe, expect, it } from "vitest";
import {
  chainIdsPorRede,
  redePorChainId,
  redeSelecionadaCompativel
} from "./redes";

describe("mapeamento de redes da carteira e API", () => {
  it.each([
    [1, "ethereum"],
    [56, "bnb"],
    [137, "polygon"],
    [42161, "arbitrum"]
  ] as const)("mapeia chainId %i para %s", (chainId, rede) => {
    expect(redePorChainId(chainId)).toBe(rede);
    expect(chainIdsPorRede[rede]).toBe(chainId);
  });

  it("não inventa rede para chainId ausente ou não suportado", () => {
    expect(redePorChainId(undefined)).toBeNull();
    expect(redePorChainId(999999)).toBeNull();
  });

  it("só permite analisar quando a rede escolhida coincide com a wallet", () => {
    expect(redeSelecionadaCompativel(56, "bnb")).toBe(true);
    expect(redeSelecionadaCompativel(56, "ethereum")).toBe(false);
    expect(redeSelecionadaCompativel(undefined, "ethereum")).toBe(false);
  });
});