import type {
  DiferencaAnalise,
  SnapshotAnalise
} from "./tipos";

export function compararAnalises(
  antes: SnapshotAnalise | null,
  depois: SnapshotAnalise | null
): DiferencaAnalise[] {
  if (!antes || !depois) {
    return [];
  }

  return [
    {
      campo: "Risk Score",
      antes: antes.riskScore,
      depois: depois.riskScore,
      alterou: antes.riskScore !== depois.riskScore
    },
    {
      campo: "Risk Level",
      antes: antes.riskLevel,
      depois: depois.riskLevel,
      alterou: antes.riskLevel !== depois.riskLevel
    },
    {
      campo: "Decision",
      antes: antes.decision,
      depois: depois.decision,
      alterou: antes.decision !== depois.decision
    },
    {
      campo: "Transactions Analyzed",
      antes: antes.transactionsAnalyzed,
      depois: depois.transactionsAnalyzed,
      alterou:
        antes.transactionsAnalyzed !==
        depois.transactionsAnalyzed
    },
    {
      campo: "Active Approvals",
      antes: antes.activeApprovals,
      depois: depois.activeApprovals,
      alterou:
        antes.activeApprovals !==
        depois.activeApprovals
    },
    {
      campo: "Actionable Approvals",
      antes: antes.actionableApprovals,
      depois: depois.actionableApprovals,
      alterou:
        antes.actionableApprovals !==
        depois.actionableApprovals
    },
    {
      campo: "Data Quality",
      antes: antes.dataQuality,
      depois: depois.dataQuality,
      alterou: antes.dataQuality !== depois.dataQuality
    },
    {
      campo: "Degraded",
      antes: antes.degraded,
      depois: depois.degraded,
      alterou: antes.degraded !== depois.degraded
    }
  ];
}
