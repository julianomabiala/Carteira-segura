import type { Address, Hash } from "viem";
import {
  arbitrum,
  bsc,
  mainnet,
  polygon
} from "viem/chains";
import type { Config } from "wagmi";
import {
  getPublicClient,
  getWalletClient,
  switchChain
} from "wagmi/actions";
import type { RedeSuportada } from "../tipos/analise";
import { chainIdsPorRede } from "../servicos/redes";
import {
  TEST_RISK_CONTRACT_ADDRESS,
  TEST_RISK_TOKEN_ADDRESS
} from "../contrato/configuracao";
import {
  TEST_RISK_CONTRACT_ABI,
  TEST_RISK_TOKEN_ABI
} from "../contrato/abi";

const CHAIN_IDS = chainIdsPorRede;

function obterChain(rede: RedeSuportada) {
  switch (rede) {
    case "ethereum":
      return mainnet;
    case "bnb":
      return bsc;
    case "polygon":
      return polygon;
    case "arbitrum":
      return arbitrum;
  }
}

function obterEndereco(
  mapa: Record<RedeSuportada, string>,
  rede: RedeSuportada,
  nome: string
): Address {
  const endereco = mapa[rede];

  if (!endereco) {
    throw new Error(
      `${nome} ainda não está configurado para ${rede}.`
    );
  }

  return endereco as Address;
}

async function prepararCarteira(
  config: Config,
  wallet: Address,
  rede: RedeSuportada
) {
  const chainId = CHAIN_IDS[rede];
  await switchChain(config, { chainId });
  const walletClient = await getWalletClient(config, {
    account: wallet,
    chainId
  });

  return {
    walletClient,
    account: wallet
  };
}

async function esperarConfirmacao(
  config: Config,
  rede: RedeSuportada,
  hash: Hash
) {
  const publicClient = getPublicClient(config, {
    chainId: CHAIN_IDS[rede]
  });

  if (!publicClient) {
    throw new Error("Não foi possível criar o cliente RPC da rede.");
  }

  const receipt =
    await publicClient.waitForTransactionReceipt({
      hash
    });

  if (receipt.status !== "success") {
    throw new Error(
      "A transação foi confirmada, mas falhou."
    );
  }

  return receipt;
}

export async function executarAcaoNormal(
  config: Config,
  wallet: Address,
  rede: RedeSuportada
) {
  const { walletClient, account } =
    await prepararCarteira(config, wallet, rede);

  const contract = obterEndereco(
    TEST_RISK_CONTRACT_ADDRESS,
    rede,
    "Contrato de teste"
  );

  const hash =
    await walletClient.writeContract({
      address: contract,
      abi: TEST_RISK_CONTRACT_ABI,
      functionName: "normalAction",
      account
    });

  const receipt =
    await esperarConfirmacao(config, rede, hash);

  return {
    transactionHash: hash,
    blockNumber: Number(receipt.blockNumber)
  };
}

export async function executarAcaoSuspeita(
  config: Config,
  wallet: Address,
  rede: RedeSuportada
) {
  const { walletClient, account } =
    await prepararCarteira(config, wallet, rede);

  const contract = obterEndereco(
    TEST_RISK_CONTRACT_ADDRESS,
    rede,
    "Contrato de teste"
  );

  const hash =
    await walletClient.writeContract({
      address: contract,
      abi: TEST_RISK_CONTRACT_ABI,
      functionName: "suspiciousAction",
      account
    });

  const receipt =
    await esperarConfirmacao(config, rede, hash);

  return {
    transactionHash: hash,
    blockNumber: Number(receipt.blockNumber)
  };
}

export async function executarSimulacaoAltoImpacto(
  config: Config,
  wallet: Address,
  rede: RedeSuportada
) {
  const { walletClient, account } =
    await prepararCarteira(config, wallet, rede);

  const contract = obterEndereco(
    TEST_RISK_CONTRACT_ADDRESS,
    rede,
    "Contrato de teste"
  );

  const hash =
    await walletClient.writeContract({
      address: contract,
      abi: TEST_RISK_CONTRACT_ABI,
      functionName: "highImpactSimulation",
      account
    });

  const receipt =
    await esperarConfirmacao(config, rede, hash);

  return {
    transactionHash: hash,
    blockNumber: Number(receipt.blockNumber)
  };
}

export async function aprovarToken(
  config: Config,
  wallet: Address,
  rede: RedeSuportada,
  approvalAmount: bigint = 100n * 10n ** 18n
) {
  const { walletClient, account } =
    await prepararCarteira(config, wallet, rede);

  const token = obterEndereco(
    TEST_RISK_TOKEN_ADDRESS,
    rede,
    "Token de teste"
  );

  const contract = obterEndereco(
    TEST_RISK_CONTRACT_ADDRESS,
    rede,
    "Contrato de teste"
  );

  const hash =
    await walletClient.writeContract({
      address: token,
      abi: TEST_RISK_TOKEN_ABI,
      functionName: "approve",
      args: [contract, approvalAmount],
      account
    });

  const receipt =
    await esperarConfirmacao(config, rede, hash);

  return {
    transactionHash: hash,
    blockNumber: Number(receipt.blockNumber)
  };
}

export async function revogarAprovacao(
  config: Config,
  wallet: Address,
  rede: RedeSuportada
) {
  return aprovarToken(config, wallet, rede, 0n);
}

export type ResultadoAcaoContrato = {
  transactionHash: string | null;
  blockNumber: number | null;
};

export async function executarAcaoContrato(
  parametros: {
    config: Config;
    wallet: Address;
    approvalAmount?: bigint;
    acao:
      | "analyzeOnly"
      | "normalAction"
      | "approveToken"
      | "revokeApproval"
      | "suspiciousAction"
      | "highImpactSimulation";
    rede: RedeSuportada;
  }
): Promise<ResultadoAcaoContrato> {
  switch (parametros.acao) {
    case "analyzeOnly":
      return {
        transactionHash: null,
        blockNumber: null
      };

    case "normalAction":
      return executarAcaoNormal(parametros.config, parametros.wallet, parametros.rede);

    case "approveToken":
      return aprovarToken(
        parametros.config,
        parametros.wallet,
        parametros.rede,
        parametros.approvalAmount
      );

    case "revokeApproval":
      return revogarAprovacao(parametros.config, parametros.wallet, parametros.rede);

    case "suspiciousAction":
      return executarAcaoSuspeita(parametros.config, parametros.wallet, parametros.rede);

    case "highImpactSimulation":
      return executarSimulacaoAltoImpacto(
        parametros.config,
        parametros.wallet,
        parametros.rede
      );
  }
}

export function obterChainId(
  rede: RedeSuportada
): number {
  return CHAIN_IDS[rede];
}
