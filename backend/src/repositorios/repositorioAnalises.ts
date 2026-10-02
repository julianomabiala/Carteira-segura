import { banco } from "../infraestrutura/banco.js";

export type TipoAnalise = "wallet" | "contract";

export type DadosPersistenciaAnalise = {
  walletId?: string | null;
  address: string;
  network: string;
  type: TipoAnalise;
  endpoint: string;
  httpStatus: number;
  success: boolean;
  riskScore: number | null;
  riskLevel: string | null;
  decision: string | null;
  dataQuality: string | null;
  degraded: boolean | null;
  response: unknown;
  requestedAt: Date;
  completedAt: Date;
};

export async function guardarAnalise(
  dados: DadosPersistenciaAnalise
): Promise<string> {
  const resultado = await banco.query<{ id: string }>(
    `
      INSERT INTO analyses (
        wallet_id,
        address,
        network,
        analysis_type,
        requested_at,
        completed_at,
        endpoint,
        http_status,
        success,
        risk_score,
        risk_level,
        decision,
        data_quality,
        degraded,
        response
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15::jsonb
      )
      RETURNING id
    `,
    [
      dados.walletId ?? null,
      dados.address.toLowerCase(),
      dados.network,
      dados.type,
      dados.requestedAt,
      dados.completedAt,
      dados.endpoint,
      dados.httpStatus,
      dados.success,
      dados.riskScore,
      dados.riskLevel,
      dados.decision,
      dados.dataQuality,
      dados.degraded,
      JSON.stringify(dados.response)
    ]
  );

  return resultado.rows[0].id;
}
