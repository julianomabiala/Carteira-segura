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
