import fs from "node:fs";
import path from "node:path";
import { ethers } from "ethers";

const raiz = process.cwd();

function carregarSegredos() {
  const arquivo = path.join(raiz, ".segredo", "test-wallets.env");

  if (!fs.existsSync(arquivo)) {
    throw new Error(
      "Ficheiro .segredo/test-wallets.env não encontrado."
    );
  }

  const resultado = {};

  for (const linha of fs.readFileSync(arquivo, "utf8").split(/\r?\n/)) {
    const texto = linha.trim();

    if (!texto || texto.startsWith("#")) continue;

    const indice = texto.indexOf("=");

    if (indice === -1) continue;

    const chave = texto.slice(0, indice).trim();
    const valor = texto.slice(indice + 1).trim();

    resultado[chave] = valor;
  }

  return resultado;
}

function exigir(nome, valor) {
  if (!valor) {
    throw new Error(`${nome} não configurado.`);
  }

  return valor;
}

async function main() {
  console.log("\n========== DEPLOY TESTNET ==========\n");

  const segredos = carregarSegredos();

  const arquivoRpc = path.join(
    raiz,
    ".segredo",
    "testnet.env"
  );

  let rpcUrl = process.env.TESTNET_RPC_URL;

  if (!rpcUrl && fs.existsSync(arquivoRpc)) {
    const linhas = fs.readFileSync(
      arquivoRpc,
      "utf8"
    ).split(/\\r?\\n/);

    for (const linha of linhas) {
      const texto = linha.trim();

      if (texto.startsWith("TESTNET_RPC_URL=")) {
        rpcUrl = texto
          .slice("TESTNET_RPC_URL=".length)
          .trim();
        break;
      }
    }
  }

  rpcUrl = exigir(
    "TESTNET_RPC_URL",
    rpcUrl
  );

  const privateKey = exigir(
    "W3_CONTROL_PRIVATE_KEY",
    segredos.W4_CONTROL_PRIVATE_KEY
  );

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const wallet = new ethers.Wallet(
    privateKey,
    provider
  );

  const rede = await provider.getNetwork();
  const balance = await provider.getBalance(wallet.address);

  console.log(`Rede chainId: ${rede.chainId.toString()}`);
  console.log(`Deployer: ${wallet.address}`);
  console.log(
    `Saldo: ${ethers.formatEther(balance)}`
  );

  if (balance === 0n) {
    throw new Error(
      "A carteira de deployment não possui saldo nativo para pagar gas."
    );
  }

  const tokenArtifact = JSON.parse(
    fs.readFileSync(
      path.join(
        raiz,
        "artifacts/contracts/TestRiskToken.json"
      ),
      "utf8"
    )
  );

  const contractArtifact = JSON.parse(
    fs.readFileSync(
      path.join(
        raiz,
        "artifacts/contracts/TestRiskContract.json"
      ),
      "utf8"
    )
  );

  const tokenFactory = new ethers.ContractFactory(
    tokenArtifact.abi,
    tokenArtifact.bytecode,
    wallet
  );

  // 1 milhão de CSTT com 18 casas decimais.
  // O token não possui valor económico.
  const initialSupply = ethers.parseUnits(
    "1000000",
    18
  );

  console.log("\nA criar TestRiskToken...");

  const token = await tokenFactory.deploy(
    initialSupply
  );

  await token.waitForDeployment();

  const tokenAddress =
    await token.getAddress();

  console.log(
    `TestRiskToken: ${tokenAddress}`
  );

  console.log(
    `Tx token: ${token.deploymentTransaction()?.hash ?? "n/a"}`
  );

  // 1 segundo entre deployments ajuda RPCs públicos.
  await new Promise((resolve) =>
    setTimeout(resolve, 1000)
  );

  // 2. Contrato controlado
  const contractFactory =
    new ethers.ContractFactory(
      contractArtifact.abi,
      contractArtifact.bytecode,
      wallet
    );

  console.log(
    "\nA criar TestRiskContract..."
  );

  const riskContract =
    await contractFactory.deploy(
      tokenAddress
    );

  await riskContract.waitForDeployment();

  const riskContractAddress =
    await riskContract.getAddress();

  console.log(
    `TestRiskContract: ${riskContractAddress}`
  );

  console.log(
    `Tx contract: ${
      riskContract.deploymentTransaction()?.hash ??
      "n/a"
    }`
  );

  const deployment = {
    chainId: rede.chainId.toString(),
    deployer: wallet.address,
    testRiskToken: tokenAddress,
    testRiskContract: riskContractAddress,
    deployedAt: new Date().toISOString()
  };

  const destino = path.join(
    raiz,
    "artifacts",
    "test-deployment.json"
  );

  fs.writeFileSync(
    destino,
    JSON.stringify(deployment, null, 2) + "\n"
  );

  console.log(
    `\nConfiguração guardada em: ${destino}`
  );

  console.log(
    "\n========== DEPLOY CONCLUÍDO ==========\n"
  );
}

main().catch((erro) => {
  console.error(
    `\nDEPLOY FALHOU: ${erro.message}\n`
  );

  process.exit(1);
});
