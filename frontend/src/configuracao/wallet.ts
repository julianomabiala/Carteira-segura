import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { arbitrum, bsc, mainnet, polygon } from "@reown/appkit/networks";
import { createConfig, http } from "wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import type { RedeSuportada } from "../tipos/analise";

// Array mutável exigido pelo AppKit 1.7.8
export const redesWallet: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  bsc,
  polygon,
  arbitrum
];

// Tuple exigida pelo Wagmi
const chains = [
  mainnet,
  bsc,
  polygon,
  arbitrum
] as const;

export const wagmiConfig = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http()
  }
});

const projectId = String(import.meta.env.VITE_REOWN_PROJECT_ID ?? "");

if (projectId) {
  const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: redesWallet
  });

  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: redesWallet,
    metadata: {
      name: "Carteira Segura",
      description: "NZOChain Wallet Risk Scanner",
      url: "http://localhost:5173",
      icons: ["https://avatars.githubusercontent.com/u/0?v=4"]
    },
    features: {
      analytics: false,
      email: false,
      socials: false
    }
  });
}

export function redePorChainId(
  chainId?: number | null
): RedeSuportada | null {
  if (chainId === mainnet.id) return "ethereum";
  if (chainId === bsc.id) return "bnb";
  if (chainId === polygon.id) return "polygon";
  if (chainId === arbitrum.id) return "arbitrum";

  return null;
}