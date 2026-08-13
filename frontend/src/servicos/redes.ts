import type { RedeSuportada } from "../tipos/analise";

export const redes = [
  { valor: "ethereum", nome: "Ethereum" },
  { valor: "bnb", nome: "BNB Chain" },
  { valor: "polygon", nome: "Polygon" },
  { valor: "arbitrum", nome: "Arbitrum" }
] as const satisfies ReadonlyArray<{ valor: RedeSuportada; nome: string }>;

export function nomeRede(rede: RedeSuportada): string {
  return redes.find((item) => item.valor === rede)?.nome ?? rede;
}
