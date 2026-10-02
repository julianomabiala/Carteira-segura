import type {
  ClassificacaoRisco,
  NivelRisco
} from "../tipos/analise.js";

type DadosRisco = {
  riskScore?: unknown;
  riskLevel?: unknown;
  decision?: unknown;
  reasons?: unknown;
  malicious?: unknown;
};

function extrairDados(resposta: unknown): DadosRisco {
  if (!resposta || typeof resposta !== "object") {
    return {};
  }

  const raiz = resposta as Record<string, unknown>;

  const data =
    raiz.data && typeof raiz.data === "object"
      ? (raiz.data as Record<string, unknown>)
      : raiz;

  return {
    riskScore:
      data.riskScore ??
      data.risk_score,

    riskLevel:
      data.riskLevel ??
      data.risk_level,

    decision: data.decision,

    reasons: data.reasons,

    malicious: data.malicious
  };
}

function extrairScore(valor: unknown): number | null {
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return Math.max(0, Math.min(100, valor));
  }

  if (typeof valor === "string" && valor.trim() !== "") {
    const score = Number(valor);

    if (Number.isFinite(score)) {
      return Math.max(0, Math.min(100, score));
    }
  }

  return null;
}

function normalizarNivel(valor: unknown): NivelRisco | null {
  if (typeof valor !== "string") {
    return null;
  }

  const nivel = valor.trim().toLowerCase();

  switch (nivel) {
    case "safe":
    case "low":
    case "baixo":
      return "baixo";

    case "warning":
    case "medium":
    case "moderate":
    case "attention":
    case "atencao":
    case "atenção":
      return "atencao";

    case "high":
    case "alto":
      return "alto";

    case "critical":
    case "critico":
    case "crítico":
      return "critico";

    case "inconclusive":
    case "inconclusivo":
      return "inconclusivo";

    default:
      return null;
  }
}

function classificarPorScore(score: number | null): NivelRisco {
  if (score === null) {
    return "inconclusivo";
  }

  if (score <= 30) {
    return "baixo";
  }

  if (score <= 60) {
    return "atencao";
  }

  if (score <= 85) {
    return "alto";
  }

  return "critico";
}

function tituloPorNivel(nivel: NivelRisco): string {
  switch (nivel) {
    case "baixo":
      return "Baixo risco";

    case "atencao":
      return "Atenção";

    case "alto":
      return "Alto risco";

    case "critico":
      return "Crítico";

    default:
      return "Análise inconclusiva";
  }
}

function explicacaoPorNivel(nivel: NivelRisco): string {
  switch (nivel) {
    case "baixo":
      return "Não foram identificados sinais relevantes de risco nos dados analisados.";

    case "atencao":
      return "Foram identificados sinais que justificam atenção adicional antes de interagir.";

    case "alto":
      return "Foram encontrados sinais que sugerem risco elevado. Evite interagir sem verificação adicional.";

    case "critico":
      return "Foram encontrados sinais críticos de risco. A interação deve ser tratada com máxima cautela e verificação adicional.";

    default:
      return "Não foi possível determinar um nível de risco confiável a partir dos dados recebidos.";
  }
}

function normalizarRazoes(
  reasons: unknown,
  nivel: NivelRisco,
  score: number | null,
  malicious: boolean
): ClassificacaoRisco["razoes"] {
  if (Array.isArray(reasons) && reasons.length > 0) {
    return reasons.map((razao) => ({
      titulo: "Sinal recebido",
      descricao:
        typeof razao === "string"
          ? razao
          : JSON.stringify(razao)
    }));
  }

  if (malicious) {
    return [
      {
        titulo: "Indicador malicioso",
        descricao:
          "Os dados recebidos indicam a presença de atividade ou comportamento marcado como malicioso."
      }
    ];
  }

  if (nivel === "baixo" && score !== null) {
    return [
      {
        titulo: "Score de risco baixo",
        descricao:
          "O score de risco recebido está dentro da faixa de 0 a 30, correspondente a baixo risco."
      }
    ];
  }

  if (nivel === "atencao" && score !== null) {
    return [
      {
        titulo: "Score de risco moderado",
        descricao:
          "O score de risco recebido está dentro da faixa de 31 a 60, correspondente a atenção."
      }
    ];
  }

  if (nivel === "alto" && score !== null) {
    return [
      {
        titulo: "Score de risco elevado",
        descricao:
          "O score de risco recebido está dentro da faixa de 61 a 85, correspondente a alto risco."
      }
    ];
  }

  if (nivel === "critico" && score !== null) {
    return [
      {
        titulo: "Score de risco crítico",
        descricao:
          "O score de risco recebido está dentro da faixa de 86 a 100, correspondente a risco crítico."
      }
    ];
  }

  return [
    {
      titulo: "Análise inconclusiva",
      descricao:
        "A resposta recebida não contém dados de risco suficientes para determinar uma classificação."
    }
  ];
}

export function classificarRisco(
  resposta: unknown
): ClassificacaoRisco {
  const dados = extrairDados(resposta);

  const score = extrairScore(dados.riskScore);
  const nivelRecebido = normalizarNivel(dados.riskLevel);

  const malicious =
    dados.malicious === true ||
    (
      typeof dados.malicious === "string" &&
      dados.malicious.toLowerCase() === "true"
    );

  /*
   * A NZOChain é a fonte primária quando fornece riskLevel.
   *
   * O Risk Score continua preservado separadamente.
   * A decision (ALLOW/BLOCK) também permanece separada.
   *
   * Portanto:
   *
   * riskScore = 30
   * riskLevel = SAFE
   * decision = BLOCK
   *
   * não deve ser transformado silenciosamente em outra decisão.
   */
  let nivel: NivelRisco;

  if (malicious) {
    nivel = "alto";
  } else if (nivelRecebido && nivelRecebido !== "inconclusivo") {
    nivel = nivelRecebido;
  } else {
    nivel = classificarPorScore(score);
  }

  return {
    nivel,
    titulo: tituloPorNivel(nivel),
    explicacao: explicacaoPorNivel(nivel),
    razoes: normalizarRazoes(
      dados.reasons,
      nivel,
      score,
      malicious
    )
  };
}
