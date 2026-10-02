import { z } from "zod";
import type {
  PedidoAnalise,
  PedidoAnaliseContrato,
  RedeSuportada
} from "../tipos/analise.js";

export const redesSuportadas: Record<RedeSuportada, string> = {
  ethereum: "Ethereum",
  bnb: "BNB Chain",
  polygon: "Polygon",
  arbitrum: "Arbitrum"
};

const formatoEnderecoEvm = /^0x[a-fA-F0-9]{40}$/;

export function enderecoWalletValido(wallet: string): boolean {
  return formatoEnderecoEvm.test(wallet.trim());
}

export function enderecoContratoValido(address: string): boolean {
  return formatoEnderecoEvm.test(address.trim());
}

export function redeValida(network: string): network is RedeSuportada {
  return Object.prototype.hasOwnProperty.call(redesSuportadas, network);
}

export const esquemaPedidoAnalise = z.object({
  wallet: z
    .string()
    .trim()
    .min(1, "A wallet e obrigatoria.")
    .max(64, "O endereco introduzido e demasiado longo.")
    .refine(enderecoWalletValido, "O endereco introduzido nao parece valido."),
  network: z
    .string()
    .trim()
    .refine(redeValida, "A rede selecionada nao e suportada.")
});

export const esquemaPedidoAnaliseContrato = z.object({
  address: z
    .string()
    .trim()
    .min(1, "O endereco do contrato e obrigatorio.")
    .max(64, "O endereco introduzido e demasiado longo.")
    .refine(
      enderecoContratoValido,
      "O endereco do contrato nao parece valido."
    ),
  network: z
    .string()
    .trim()
    .refine(redeValida, "A rede selecionada nao e suportada.")
});

export function validarPedidoAnalise(corpo: unknown): PedidoAnalise {
  const dados = esquemaPedidoAnalise.parse(corpo);

  return {
    wallet: dados.wallet,
    network: dados.network as RedeSuportada
  };
}

export function validarPedidoAnaliseContrato(
  corpo: unknown
): PedidoAnaliseContrato {
  const dados = esquemaPedidoAnaliseContrato.parse(corpo);

  return {
    address: dados.address,
    network: dados.network as RedeSuportada
  };
}
