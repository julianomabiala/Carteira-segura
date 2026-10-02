import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const raiz = process.cwd();

const contratos = [
  {
    arquivo: "contracts/TestRiskToken/TestRiskToken.sol",
    nome: "TestRiskToken"
  },
  {
    arquivo: "contracts/TestRiskContract/TestRiskContract.sol",
    nome: "TestRiskContract"
  }
];

function erroFatal(mensagem) {
  console.error(`\nERRO: ${mensagem}\n`);
  process.exit(1);
}

const sources = {};

for (const contrato of contratos) {
  const caminho = path.join(raiz, contrato.arquivo);

  if (!fs.existsSync(caminho)) {
    erroFatal(`Contrato não encontrado: ${contrato.arquivo}`);
  }

  sources[contrato.arquivo] = {
    content: fs.readFileSync(caminho, "utf8")
  };
}

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      "*": {
        "*": [
          "abi",
          "evm.bytecode.object",
          "evm.deployedBytecode.object"
        ]
      }
    }
  }
};

const resultado = JSON.parse(
  solc.compile(JSON.stringify(input))
);

if (resultado.errors) {
  const erros = resultado.errors.filter(
    (item) => item.severity === "error"
  );

  for (const item of resultado.errors) {
    console.log(item.formattedMessage);
  }

  if (erros.length > 0) {
    erroFatal("A compilação falhou.");
  }
}

for (const contrato of contratos) {
  const compilado =
    resultado.contracts?.[contrato.arquivo]?.[contrato.nome];

  if (!compilado) {
    erroFatal(
      `Artefato não encontrado para ${contrato.nome}.`
    );
  }

  const destino = path.join(
    raiz,
    "artifacts",
    "contracts",
    `${contrato.nome}.json`
  );

  const artefato = {
    contractName: contrato.nome,
    sourceName: contrato.arquivo,
    abi: compilado.abi,
    bytecode: `0x${compilado.evm.bytecode.object}`,
    deployedBytecode: `0x${compilado.evm.deployedBytecode.object}`
  };

  fs.writeFileSync(
    destino,
    JSON.stringify(artefato, null, 2) + "\n"
  );

  console.log(`OK: ${destino}`);
}

console.log("\n========== COMPILAÇÃO CONCLUÍDA ==========");
