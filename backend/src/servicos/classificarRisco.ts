import type { ClassificacaoRisco, NivelRisco, Razao } from "../tipos/analise.js";

type DadosSoltos = Record<string, unknown>;

function objeto(valor: unknown): DadosSoltos {
  return valor && typeof valor === "object" && !Array.isArray(valor) ? (valor as DadosSoltos) : {};
}

function procurarValor(dados: unknown, nomes: string[]): unknown {
  const raiz = objeto(dados);
  const pilha: DadosSoltos[] = [raiz];

  while (pilha.length > 0) {
    const atual = pilha.pop() ?? {};
    for (const nome of nomes) {
      if (nome in atual) return atual[nome];
    }

    for (const valor of Object.values(atual)) {
      if (valor && typeof valor === "object" && !Array.isArray(valor)) {
        pilha.push(valor as DadosSoltos);
      }
    }
  }

  return undefined;
}

function obterRiskScore(dados: unknown): number | null {
  const valor = procurarValor(dados, ["risk_score", "riskScore", "score", "risk", "value", "pontuacao"]);
  const numero = typeof valor === "number" ? valor : typeof valor === "string" ? Number(valor) : Number.NaN;
  return Number.isFinite(numero) ? numero : null;
}

function obterStatus(dados: unknown): string {
  const valor = procurarValor(dados, ["status", "risk_level", "riskLevel", "level", "severity"]);
  return typeof valor === "string" ? valor.toLowerCase() : "";
}

function extrairAlertas(dados: unknown): string[] {
  const warnings = procurarValor(dados, ["warnings", "alerts", "flags", "sinais"]);
  if (Array.isArray(warnings)) {
    return warnings.filter((w): w is string => typeof w === "string");
  }
  return [];
}

function verificarMalicioso(dados: unknown): boolean {
  const malicioso = procurarValor(dados, ["malicious", "isMalicious"]);
  const blacklisted = procurarValor(dados, ["blacklisted"]);
  const sanctioned = procurarValor(dados, ["sanctioned"]);
  return malicioso === true || blacklisted === true || sanctioned === true;
}

export function classificarRisco(dados: unknown): ClassificacaoRisco {
  const riskScore = obterRiskScore(dados);
  const status = obterStatus(dados);
  const alertas = extrairAlertas(dados);
  const emalicioso = verificarMalicioso(dados);

  const razoes: Razao[] = [];
  let nivel: NivelRisco = "baixo";

  // Verificar indicadores de risco
  if (emalicioso) {
    nivel = "alto";
    razoes.push({
      titulo: "Carteira listada como perigosa",
      descricao: "Este endereço foi identificado por serviços de segurança como potencialmente malicioso ou bloqueado."
    });
  }

  if (riskScore !== null) {
    if (riskScore >= 60) {
      nivel = "alto";
      razoes.push({
        titulo: "Sinais preocupantes na atividade",
        descricao: "A atividade observada nesta carteira sugere comportamentos atípicos que recomendam precaução."
      });
    } else if (riskScore >= 30) {
      nivel = "atencao";
      razoes.push({
        titulo: "Indicadores moderados de risco",
        descricao: "Os dados apontam para sinais que merecem atenção e validação adicional."
      });
    }
  }

  if (alertas.length > 0 && riskScore !== null && riskScore >= 30 && riskScore < 60) {
    nivel = "atencao";
    razoes.push({
      titulo: "Foram encontrados sinais de alerta",
      descricao: "Foram detectadas atividades atípicas. Exemplos: " + alertas.slice(0, 2).join(", ") + (alertas.length > 2 ? ", e mais..." : "")
    });
  }

  if (status.includes("medium") || status.includes("moderate") || status.includes("warning") || status.includes("attention")) {
    nivel = "atencao";
    if (!razoes.some((r) => r.titulo.includes("atenção") || r.titulo.includes("risco") || r.titulo.includes("alerta"))) {
      razoes.push({
        titulo: "Análise externa indica atenção",
        descricao: "Classificações externas sugerem que esta carteira merece verificação adicional."
      });
    }
  }

  if (status.includes("high") || status.includes("critical") || status.includes("unsafe")) {
    nivel = "alto";
    if (!razoes.some((r) => r.titulo.includes("perigosa"))) {
      razoes.push({
        titulo: "Análise externa indica risco",
        descricao: "Classificações externas apontam para um maior nível de atenção nesta carteira."
      });
    }
  }

  // Se nenhum risco foi encontrado
  if (razoes.length === 0) {
    razoes.push({
      titulo: "Nenhum sinal de perigo encontrado",
      descricao: "Com base nos dados disponíveis, não foram encontrados indícios que justifiquem precaução extra."
    });
  }

  const mensagens = {
    baixo: {
      titulo: "Baixo risco",
      explicacao: "Esta carteira aparenta não apresentar sinais de perigo."
    },
    atencao: {
      titulo: "Atenção",
      explicacao: "Foram identificados sinais moderados que merecem verificação adicional antes de interagir."
    },
    alto: {
      titulo: "Alto risco",
      explicacao: "Foram encontrados sinais que sugerem risco. Evite interagir sem verificação adicional."
    }
  };

  return {
    nivel,
    titulo: mensagens[nivel].titulo,
    explicacao: mensagens[nivel].explicacao,
    razoes
  };
}
