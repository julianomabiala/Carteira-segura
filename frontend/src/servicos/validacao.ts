import type { RedeSuportada } from "../tipos/analise";
import { redes } from "./redes";

const formatoEnderecoEvm = /^0x[a-fA-F0-9]{40}$/;

export function validarEndereco(endereco: string): boolean {
  return formatoEnderecoEvm.test(endereco.trim());
}

export function validarRede(rede: string): rede is RedeSuportada {
  return redes.some((item) => item.valor === rede);
}
