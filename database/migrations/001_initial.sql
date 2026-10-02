CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address VARCHAR(42) NOT NULL,
    network VARCHAR(32) NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (address, network)
);

CREATE TABLE IF NOT EXISTS nonces (
    nonce VARCHAR(128) PRIMARY KEY,
    wallet_address VARCHAR(42),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_nonces_expires_at
    ON nonces (expires_at);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_wallet_id
    ON sessions (wallet_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
    ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    address VARCHAR(42) NOT NULL,
    network VARCHAR(32) NOT NULL,
    analysis_type VARCHAR(16) NOT NULL
        CHECK (analysis_type IN ('wallet', 'contract')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    endpoint VARCHAR(255),
    http_status INTEGER,
    success BOOLEAN,
    risk_score NUMERIC,
    risk_level VARCHAR(64),
    decision VARCHAR(64),
    data_quality VARCHAR(64),
    degraded BOOLEAN,
    response JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_wallet_id
    ON analyses (wallet_id);

CREATE INDEX IF NOT EXISTS idx_analyses_address_network
    ON analyses (address, network);

CREATE INDEX IF NOT EXISTS idx_analyses_created_at
    ON analyses (created_at DESC);

CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    wallet_address VARCHAR(42),
    contract_address VARCHAR(42),
    network VARCHAR(32),
    state VARCHAR(32) NOT NULL DEFAULT 'pendente',
    observation TEXT NOT NULL DEFAULT '',
    before_analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
    after_analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
    comparison JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiments_case_id
    ON experiments (case_id);

CREATE INDEX IF NOT EXISTS idx_experiments_created_at
    ON experiments (created_at DESC);

CREATE TABLE IF NOT EXISTS experiment_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    function_name VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    transaction_hash VARCHAR(128),
    block_number BIGINT,
    status VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiment_actions_experiment_id
    ON experiment_actions (experiment_id);

CREATE INDEX IF NOT EXISTS idx_experiment_actions_tx_hash
    ON experiment_actions (transaction_hash);

CREATE TABLE IF NOT EXISTS api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(16) NOT NULL,
    network VARCHAR(32),
    address VARCHAR(42),
    request_body JSONB,
    response_status INTEGER,
    response_body JSONB,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_created_at
    ON api_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_logs_address
    ON api_logs (address);
