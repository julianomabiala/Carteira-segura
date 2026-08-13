import { describe, expect, it } from "vitest";
import { validarEndereco, validarRede } from "./validacao";

describe("validacao do formulario", () => {
  it("valida endereco EVM", () => {
    expect(validarEndereco("0x0000000000000000000000000000000000000000")).toBe(true);
    expect(validarEndereco("0x123")).toBe(false);
  });

  it("valida redes suportadas", () => {
    expect(validarRede("arbitrum")).toBe(true);
    expect(validarRede("solana")).toBe(false);
  });
});
