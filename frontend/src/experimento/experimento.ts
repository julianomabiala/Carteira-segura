import type { Config } from "wagmi";
import { pedirAnalise } from "../servicos/apiAnalise";
import type {
  RedeSuportada,
  RespostaAnalise
} from "../tipos/analise";
import { executarAcaoContrato } from "./execucaoContrato";
import { compararAnalises } from "./comparacao";
import { guardarEvidencia } from "./armazenamento";
import type {
  AcaoExperimento,
  EvidenciaCasoTeste,
  SnapshotAnalise
} from "./tipos";

type ExecutarExperimentoArgs = {
  config: Config;
  casoId: string;
  titulo: string;
  descricao: string;
  wallet: `0x${string}`;
  rede: RedeSuportada;
  contract: string;
  acao: AcaoExperimento;
  approvalAmount?: bigint;
};

export type ResultadoExperimento = {
  evidencia: EvidenciaCasoTeste;
  diferencas: ReturnType<typeof compararAnalises>;
};

function obterMetadadosApi(
  resposta: RespostaAnalise
) {
  const detalhes =
    resposta.detalhesTecnicos &&
    typeof resposta.detalhesTecnicos === "object"
      ? (resposta.detalhesTecnicos as Record<string, unknown>)
      : {};

  const metadados =
    detalhes.__metadadosApi &&
    typeof detalhes.__metadadosApi === "object"
      ? (detalhes.__metadadosApi as Record<string, unknown>)
      : {};

  return {
    analysisId:
      typeof metadados.analysisId === "string"
        ? metadados.analysisId
        : null,
    endpoint:
      typeof metadados.endpoint === "string"
        ? metadados.endpoint
        : "",
    httpStatus:
      typeof metadados.httpStatus === "number"
        ? metadados.httpStatus
        : null,
    requestedAt:
      typeof metadados.requestedAt === "string"
        ? metadados.requestedAt
        : resposta.analisadoEm,
    completedAt:
      typeof metadados.completedAt === "string"
        ? metadados.completedAt
        : resposta.analisadoEm
  };
}

function criarSnapshot(
  resposta: RespostaAnalise
): SnapshotAnalise {
  const detalhes =
    resposta.detalhesTecnicos &&
    typeof resposta.detalhesTecnicos === "object"
      ? (resposta.detalhesTecnicos as Record<string, unknown>)
      : {};

  const data =
    detalhes.data &&
    typeof detalhes.data === "object"
      ? (detalhes.data as Record<string, unknown>)
      : {};

  const meta =
    data.meta &&
    typeof data.meta === "object"
      ? (data.meta as Record<string, unknown>)
      : {};

  const scan =
    meta.scan &&
    typeof meta.scan === "object"
      ? (meta.scan as Record<string, unknown>)
      : {};

  const metadados = obterMetadadosApi(resposta);

  return {
    timestamp: resposta.analisadoEm,
    analysisId: metadados.analysisId,
    endpoint: metadados.endpoint,
    httpStatus: metadados.httpStatus,
    riskScore:
      typeof data.riskScore === "number"
        ? data.riskScore
        : null,
    riskLevel:
      typeof data.riskLevel === "string"
        ? data.riskLevel
        : null,
    decision:
      typeof data.decision === "string"
        ? data.decision
        : null,
    transactionsAnalyzed:
      typeof meta.transactionsAnalyzed === "number"
        ? meta.transactionsAnalyzed
        : null,
    activeApprovals:
      typeof scan.activeApprovals === "number"
        ? scan.activeApprovals
        : null,
    actionableApprovals:
      typeof scan.actionableApprovals === "number"
        ? scan.actionableApprovals
        : null,
    dataQuality:
      typeof scan.dataQuality === "string"
        ? scan.dataQuality
        : null,
    degraded:
      typeof scan.degraded === "boolean"
        ? scan.degraded
        : null,
    resposta
  };
}

function determinarEstado(
  acao: AcaoExperimento,
  before: SnapshotAnalise,
  after: SnapshotAnalise
): {
  estado: EvidenciaCasoTeste["estado"];
  observacao: string;
} {
  const diferencas = compararAnalises(before, after);
  const alteracoes = diferencas.filter(
    (item) => item.alterou
  );

  if (acao === "analyzeOnly") {
    return alteracoes.length === 0
      ? {
          estado: "passou",
          observacao:
            "Análise repetida sem interação on-chain; os indicadores permaneceram estáveis."
        }
      : {
          estado: "investigar",
          observacao:
            "A análise sem interação encontrou alterações entre as consultas; valide a atividade externa e a consistência da API."
        };
  }

  if (
    before.httpStatus !== 200 ||
    after.httpStatus !== 200
  ) {
    return {
      estado: "investigar",
      observacao:
        "A transação foi executada, mas uma das análises não terminou com HTTP 200."
    };
  }

  if (
    before.degraded === true ||
    after.degraded === true
  ) {
    return {
      estado: "investigar",
      observacao:
        "A transação foi confirmada, mas a qualidade dos dados da análise está degradada."
    };
  }

  if (
    (acao === "approveToken" ||
      acao === "revokeApproval") &&
    before.activeApprovals === null &&
    after.activeApprovals === null
  ) {
    return {
      estado: "investigar",
      observacao:
        "A aprovação foi executada on-chain, mas a resposta NZOChain não forneceu o indicador de aprovações necessário para validar TC-06/TC-07."
    };
  }

  if (
    acao === "approveToken" &&
    before.activeApprovals !== null &&
    after.activeApprovals !== null &&
    after.activeApprovals > before.activeApprovals
  ) {
    return {
      estado: "passou",
      observacao:
        "A aprovação ERC-20 foi confirmada on-chain e o indicador de aprovações aumentou na análise posterior."
    };
  }

  if (
    acao === "revokeApproval" &&
    before.activeApprovals !== null &&
    after.activeApprovals !== null &&
    after.activeApprovals < before.activeApprovals
  ) {
    return {
      estado: "passou",
      observacao:
        "A revogação ERC-20 foi confirmada on-chain e o indicador de aprovações diminuiu na análise posterior."
    };
  }

  if (alteracoes.length > 0) {
    return {
      estado: "passou",
      observacao:
        `Ação confirmada e alterações observadas: ${alteracoes
          .map(
            (item) =>
              `${item.campo}: ${String(item.antes)} → ${String(item.depois)}`
          )
          .join("; ")}`
    };
  }

  return {
    estado: "investigar",
    observacao:
      "A transação foi confirmada, mas não foram observadas alterações nos indicadores comparados. É necessária investigação antes de considerar o caso validado."
  };
}

export async function executarExperimento({
  config,
  casoId,
  titulo,
  descricao,
  wallet,
  rede,
  contract,
  acao,
  approvalAmount
}: ExecutarExperimentoArgs): Promise<ResultadoExperimento> {
  const agora = new Date().toISOString();
  const runId = crypto.randomUUID();

  const evidenciaInicial: EvidenciaCasoTeste = {
    id: casoId,
    runId,
    titulo,
    descricao,
    wallet,
    network: rede,
    contract,
    estado: "em_execucao",
    before: null,
    action: null,
    after: null,
    observacao: "",
    createdAt: agora,
    updatedAt: agora
  };

  guardarEvidencia(evidenciaInicial);
  let evidenciaAtual = evidenciaInicial;

  try {
    const respostaBefore = await pedirAnalise({
      wallet,
      network: rede
    });

    const before = criarSnapshot(respostaBefore);
    evidenciaAtual = {
      ...evidenciaInicial,
      before,
      updatedAt: new Date().toISOString()
    };
    guardarEvidencia(evidenciaAtual);

    const inicioAcao = new Date().toISOString();

    const transacao = await executarAcaoContrato({
      config,
      wallet,
      rede,
      acao,
      approvalAmount
    });

    const action = {
      functionName: acao,
      timestamp: inicioAcao,
      transactionHash: transacao.transactionHash,
      blockNumber: transacao.blockNumber
    };
    evidenciaAtual = {
      ...evidenciaInicial,
      before,
      action,
      updatedAt: new Date().toISOString()
    };
    guardarEvidencia(evidenciaAtual);

    const respostaAfter = await pedirAnalise({
      wallet,
      network: rede
    });

    const after = criarSnapshot(respostaAfter);

    const diferencas = compararAnalises(
      before,
      after
    );

    const validacao = determinarEstado(
      acao,
      before,
      after
    );

    const evidenciaFinal: EvidenciaCasoTeste = {
      ...evidenciaInicial,
      estado: validacao.estado,
      before,
      action,
      after,
      observacao: validacao.observacao,
      updatedAt: new Date().toISOString()
    };

    evidenciaAtual = evidenciaFinal;
    guardarEvidencia(evidenciaFinal);

    return {
      evidencia: evidenciaFinal,
      diferencas
    };
  } catch (erro) {
    const mensagem =
      erro instanceof Error
        ? erro.message
        : "Não foi possível concluir o experimento.";

    const evidenciaFalhou: EvidenciaCasoTeste = {
      ...evidenciaInicial,
      before: evidenciaAtual.before,
      action: evidenciaAtual.action,
      estado: "falhou",
      observacao: mensagem,
      updatedAt: new Date().toISOString()
    };

    guardarEvidencia(evidenciaFalhou);

    throw erro;
  }
}
