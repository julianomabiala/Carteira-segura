import type { RedeSuportada } from "../tipos/analise";

export type EstadoCasoTeste =
  | "pendente"
  | "em_execucao"
  | "passou"
  | "falhou"
  | "investigar";

export type AcaoExperimento =
  | "analyzeOnly"
  | "normalAction"
  | "approveToken"
  | "revokeApproval"
  | "suspiciousAction"
  | "highImpactSimulation";

export interface MetadadosAnalise {
  analysisId: string | null;
  endpoint: string;
  httpStatus: number | null;
  requestedAt: string;
  completedAt: string | null;
}

export interface SnapshotAnalise {
  timestamp: string;
  analysisId: string | null;
  endpoint: string;
  httpStatus: number | null;
  riskScore: number | null;
  riskLevel: string | null;
  decision: string | null;
  transactionsAnalyzed: number | null;
  activeApprovals: number | null;
  actionableApprovals: number | null;
  dataQuality: string | null;
  degraded: boolean | null;
  resposta: unknown;
}

export interface AcaoOnChain {
  functionName: AcaoExperimento;
  timestamp: string;
  transactionHash: string | null;
  blockNumber: number | null;
}

export interface EvidenciaCasoTeste {
  id: string;
  runId?: string;
  titulo: string;
  descricao: string;
  wallet: string | null;
  network: RedeSuportada | null;
  contract: string | null;
  estado: EstadoCasoTeste;
  before: SnapshotAnalise | null;
  action: AcaoOnChain | null;
  after: SnapshotAnalise | null;
  observacao: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiferencaAnalise {
  campo: string;
  antes: string | number | boolean | null;
  depois: string | number | boolean | null;
  alterou: boolean;
}

export interface DadosPersistenciaExperimento {
  evidencia: EvidenciaCasoTeste;
  diferencas: DiferencaAnalise[];
}

export interface RespostaPedidoAnalise {
  dados: unknown;
  metadados: MetadadosAnalise;
}
