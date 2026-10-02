import type { Address } from "viem";
import type { RedeSuportada } from "../tipos/analise";

export const TEST_RISK_CONTRACT_ADDRESS = {
  ethereum: "",
  bnb: "",
  polygon: "",
  arbitrum: ""
} satisfies Record<RedeSuportada, string>;

export const TEST_RISK_TOKEN_ADDRESS = {
  ethereum: "",
  bnb: "",
  polygon: "",
  arbitrum: ""
} satisfies Record<RedeSuportada, string>;

export function obterEnderecoContrato(
  rede: RedeSuportada
): Address | null {
  const endereco = TEST_RISK_CONTRACT_ADDRESS[rede];

  if (!endereco) {
    return null;
  }

  return endereco as Address;
}

export function obterEnderecoToken(
  rede: RedeSuportada
): Address | null {
  const endereco = TEST_RISK_TOKEN_ADDRESS[rede];

  if (!endereco) {
    return null;
  }

  return endereco as Address;
}
