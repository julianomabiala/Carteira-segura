import { banco } from "../infraestrutura/banco.js";

export type DadosExperimento = {
  caseId: string;
  title: string;
  description: string;
  walletAddress: string | null;
  contractAddress: string | null;
  network: string | null;
  state: string;
  observation: string;
  beforeAnalysisId: string | null;
  afterAnalysisId: string | null;
  comparison: unknown;
  action: {
    functionName: string;
    timestamp: string;
    transactionHash: string | null;
    blockNumber: number | null;
  } | null;
};

export async function guardarExperimento(
  walletId: string,
  dados: DadosExperimento,
  diferencas: unknown
): Promise<string> {
  const cliente = await banco.connect();

  try {
    await cliente.query("BEGIN");

    const comparison = JSON.stringify({
      diferencas,
      before:
        dados.comparison &&
        typeof dados.comparison === "object"
          ? (dados.comparison as { before?: unknown }).before ?? null
          : null,
      after:
        dados.comparison &&
        typeof dados.comparison === "object"
          ? (dados.comparison as { after?: unknown }).after ?? null
          : null
    });

    const inserido = await cliente.query<{ id: string }>(
      `
        INSERT INTO experiments (
          case_id,
          title,
          description,
          wallet_id,
          wallet_address,
          contract_address,
          network,
          state,
          observation,
          before_analysis_id,
          after_analysis_id,
          comparison
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12::jsonb
        )
        RETURNING id
      `,
      [
        dados.caseId,
        dados.title,
        dados.description,
        walletId,
        dados.walletAddress,
        dados.contractAddress,
        dados.network,
        dados.state,
        dados.observation,
        dados.beforeAnalysisId,
        dados.afterAnalysisId,
        comparison
      ]
    );
    const experimentId = inserido.rows[0].id;

    if (dados.action) {
      await cliente.query(
        `
          INSERT INTO experiment_actions (
            experiment_id,
            function_name,
            timestamp,
            transaction_hash,
            block_number,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          experimentId,
          dados.action.functionName,
          dados.action.timestamp,
          dados.action.transactionHash,
          dados.action.blockNumber,
          dados.action.transactionHash
            ? "confirmed"
            : "unknown"
        ]
      );
    }

    await cliente.query("COMMIT");

    return experimentId;
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
  }
}

export async function listarExperimentos(
  walletId: string
) {
  const resultado = await banco.query<any>(
    `
      SELECT
        e.id AS "runId",
        e.case_id AS "caseId",
        e.title,
        e.description,
        e.wallet_address AS "walletAddress",
        e.contract_address AS "contractAddress",
        e.network,
        e.state,
        e.observation,
        e.comparison,
        e.created_at AS "createdAt",
        e.updated_at AS "updatedAt",
        a.function_name AS "functionName",
        a.timestamp AS "actionTimestamp",
        a.transaction_hash AS "transactionHash",
        a.block_number AS "blockNumber"
      FROM experiments e
      LEFT JOIN experiment_actions a
        ON a.experiment_id = e.id
      WHERE e.wallet_id = $1
      ORDER BY e.created_at DESC, a.created_at DESC
    `,
    [walletId]
  );

  return resultado.rows.map((row) => {
    const comparison =
      row.comparison &&
      typeof row.comparison === "object"
        ? row.comparison
        : {};

    return {
      id: row.caseId,
      runId: row.runId,
      titulo: row.title,
      descricao: row.description,
      wallet: row.walletAddress,
      network: row.network,
      contract: row.contractAddress,
      estado: row.state,
      before: comparison.before ?? null,
      action: row.functionName
        ? {
            functionName: row.functionName,
            timestamp: new Date(
              row.actionTimestamp
            ).toISOString(),
            transactionHash:
              row.transactionHash,
            blockNumber:
              row.blockNumber === null
                ? null
                : Number(row.blockNumber)
          }
        : null,
      after: comparison.after ?? null,
      observacao: row.observation,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      diferencas: comparison.diferencas ?? []
    };
  });
}
