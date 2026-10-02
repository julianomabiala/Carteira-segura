import { Pool } from "pg";

let pool: Pool | null = null;

function obterPool(): Pool {
  if (pool) {
    return pool;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL não definida. Configure a variável de ambiente antes de executar uma operação de persistência."
    );
  }

  const ssl =
    process.env.PGSSL === "true"
      ? { rejectUnauthorized: false }
      : undefined;

  pool = new Pool({
    connectionString: databaseUrl,
    ssl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
  });

  pool.on("error", (erro) => {
    console.error("Erro inesperado no pool PostgreSQL:", erro);
  });

  return pool;
}

export const banco = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: unknown[]
  ) {
    return obterPool().query<T>(text, values);
  },

  connect() {
    return obterPool().connect();
  }
};

export async function verificarBanco(): Promise<void> {
  const cliente = await obterPool().connect();

  try {
    await cliente.query("SELECT 1");
  } finally {
    cliente.release();
  }
}

export async function fecharBanco(): Promise<void> {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
}


export async function inicializarBanco(): Promise<void> {
  const cliente = await obterPool().connect();

  try {
    await cliente.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        address TEXT NOT NULL,
        network TEXT NOT NULL DEFAULT 'evm',
        first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (address, network)
      );

      CREATE TABLE IF NOT EXISTS nonces (
        nonce TEXT PRIMARY KEY,
        wallet_address TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token_hash TEXT NOT NULL UNIQUE,
        wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_nonces_expires_at
        ON nonces (expires_at);

      CREATE INDEX IF NOT EXISTS idx_sessions_token_hash
        ON sessions (token_hash);

      CREATE INDEX IF NOT EXISTS idx_sessions_wallet_id
        ON sessions (wallet_id);
    `);
  } finally {
    cliente.release();
  }
}
