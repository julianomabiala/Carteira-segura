import crypto from "node:crypto";
import { banco } from "../infraestrutura/banco.js";

const NETWORK_AUTH = "evm";

export type WalletPersistida = {
  id: string;
  address: string;
  network: string;
};

export async function obterOuCriarWallet(
  address: string,
  network: string = NETWORK_AUTH
): Promise<WalletPersistida> {
  const endereco = address.toLowerCase();
  const rede = network.toLowerCase();

  const resultado = await banco.query<WalletPersistida>(
    `
      INSERT INTO wallets (
        address,
        network,
        first_seen_at,
        last_seen_at
      )
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (address, network)
      DO UPDATE SET last_seen_at = NOW()
      RETURNING id, address, network
    `,
    [endereco, rede]
  );

  return resultado.rows[0];
}

export async function guardarNonce(
  nonce: string,
  expiresAt: Date,
  walletAddress: string | null = null
): Promise<void> {
  await banco.query(
    `
      INSERT INTO nonces (
        nonce,
        wallet_address,
        created_at,
        expires_at
      )
      VALUES ($1, $2, NOW(), $3)
    `,
    [
      nonce,
      walletAddress ? walletAddress.toLowerCase() : null,
      expiresAt
    ]
  );
}

export async function consumirNonce(nonce: string): Promise<boolean> {
  const resultado = await banco.query<{ nonce: string }>(
    `
      UPDATE nonces
      SET used_at = NOW()
      WHERE nonce = $1
        AND used_at IS NULL
        AND expires_at > NOW()
      RETURNING nonce
    `,
    [nonce]
  );

  return resultado.rowCount === 1;
}

export async function apagarNonce(nonce: string): Promise<void> {
  await banco.query(
    `DELETE FROM nonces WHERE nonce = $1`,
    [nonce]
  );
}

export async function limparNoncesExpirados(): Promise<void> {
  await banco.query(
    `
      DELETE FROM nonces
      WHERE expires_at <= NOW()
         OR used_at IS NOT NULL
    `
  );
}

export function gerarHashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function criarSessao(
  walletId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  await banco.query(
    `
      INSERT INTO sessions (
        token_hash,
        wallet_id,
        created_at,
        expires_at
      )
      VALUES ($1, $2, NOW(), $3)
    `,
    [tokenHash, walletId, expiresAt]
  );
}

export async function obterSessaoPorToken(
  tokenHash: string
): Promise<{
  id: string;
  wallet: string;
  expiresAt: Date;
} | null> {
  const resultado = await banco.query<{
    id: string;
    walletId: string;
    wallet: string;
    expiresAt: Date;
  }>(
    `
      SELECT
        s.id,
        s.wallet_id AS "walletId",
        w.address AS wallet,
        s.expires_at AS "expiresAt"
      FROM sessions s
      INNER JOIN wallets w ON w.id = s.wallet_id
      WHERE s.token_hash = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return resultado.rows[0] ?? null;
}

export async function revogarSessao(
  tokenHash: string
): Promise<void> {
  await banco.query(
    `
      UPDATE sessions
      SET revoked_at = NOW()
      WHERE token_hash = $1
        AND revoked_at IS NULL
    `,
    [tokenHash]
  );
}

export async function limparSessoesExpiradas(): Promise<void> {
  await banco.query(
    `
      DELETE FROM sessions
      WHERE expires_at <= NOW()
         OR revoked_at IS NOT NULL
    `
  );
}
