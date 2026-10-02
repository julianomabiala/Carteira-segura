import { describe, expect, it } from "vitest";
import { enderecoWalletValido, redeValida, validarPedidoAnalise } from "../utilitarios/validacao.js";

describe("validacao da analise", () => {
  it("aceita enderecos EVM validos", () => {
    expect(enderecoWalletValido("0x0000000000000000000000000000000000000000")).toBe(true);
  });

  it("rejeita enderecos malformados", () => {
    expect(enderecoWalletValido("0x123")).toBe(false);
    expect(() => validarPedidoAnalise({ wallet: "0x123", network: "ethereum" })).toThrow();
  });

  it("aceita apenas redes suportadas", () => {
    expect(redeValida("ethereum")).toBe(true);
    expect(redeValida("bnb")).toBe(true);
    expect(redeValida("polygon")).toBe(true);
    expect(redeValida("arbitrum")).toBe(true);
    expect(redeValida("bitcoin")).toBe(false);
  });
});
