import type { RedeSuportada } from "../tipos/analise";

export const redes = [
  { valor: "ethereum", nome: "Ethereum" },
  { valor: "bnb", nome: "BNB Chain" },
  { valor: "polygon", nome: "Polygon" },
  { valor: "arbitrum", nome: "Arbitrum" }
] as const satisfies ReadonlyArray<{ valor: RedeSuportada; nome: string }>;

export const chainIdsPorRede: Record<RedeSuportada, number> = {
  ethereum: 1,
  bnb: 56,
  polygon: 137,
  arbitrum: 42161
};

export function redePorChainId(
  chainId: number | undefined
): RedeSuportada | null {
  if (chainId === undefined) return null;

  return (
    redes.find((item) => chainIdsPorRede[item.valor] === chainId)
      ?.valor ?? null
  );
}

export function redeSelecionadaCompativel(
  chainId: number | undefined,
  redeSelecionada: RedeSuportada
): boolean {
  return redePorChainId(chainId) === redeSelecionada;
}

export function nomeRede(rede: RedeSuportada): string {
  return redes.find((item) => item.valor === rede)?.nome ?? rede;
}
