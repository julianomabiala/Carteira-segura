import {
  arbitrum,
  bsc,
  mainnet,
  polygon
} from "@reown/appkit/networks";
import {
  createAppKit
} from "@reown/appkit/react";
import {
  WagmiAdapter
} from "@reown/appkit-adapter-wagmi";
import type { RedeSuportada } from "../tipos/analise";
import {
  nomeRede as obterNomeRede,
  redePorChainId as mapearRedePorChainId
} from "../servicos/redes";
import {
  http
} from "wagmi";
import type { Config as WagmiConfig } from "wagmi";

export const projectId =
  import.meta.env.VITE_REOWN_PROJECT_ID ??
  "00000000000000000000000000000000";

export const redesWallet = [
  mainnet,
  bsc,
  polygon,
  arbitrum
] as [typeof mainnet, typeof bsc, typeof polygon, typeof arbitrum];

export const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  projectId,
  networks: redesWallet,
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http()
  }
});

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: redesWallet,
  defaultNetwork: mainnet,
  metadata: {
    name: "Carteira Segura",
    description:
      "Análise de risco de carteiras blockchain com NZOChain",
    url: window.location.origin,
    icons: []
  },
  features: {
    analytics: false
  }
});

export const config = wagmiAdapter.wagmiConfig as unknown as WagmiConfig;
export const wagmiConfig = config;

export function redePorChainId(
  chainId: number | undefined
): RedeSuportada | null {
  return mapearRedePorChainId(chainId);
}

export function nomeRede(
  rede: RedeSuportada
): string {
  return obterNomeRede(rede);
}
