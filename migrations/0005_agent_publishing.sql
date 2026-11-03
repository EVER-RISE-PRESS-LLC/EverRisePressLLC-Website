-- Dedicated machine credentials, separate from staff passwords and sessions.
CREATE TABLE agent_credentials (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  scopes TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  last_used_at TEXT,
  rate_window INTEGER NOT NULL DEFAULT 0,
  rate_count INTEGER NOT NULL DEFAULT 0
);

-- Only request metadata is retained, never credentials or article bodies.
CREATE TABLE agent_audit_log (
  request_id TEXT PRIMARY KEY NOT NULL,
  credential_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_id TEXT,
  status INTEGER,
  created_at TEXT NOT NULL,
  completed_at TEXT
);
CREATE INDEX agent_audit_created_idx ON agent_audit_log(created_at);

-- Agent uploads can safely reuse identical bytes, including concurrent retries.
-- Legacy/staff uploads leave this NULL and retain their existing behavior.
ALTER TABLE media ADD COLUMN upload_hash TEXT;
CREATE UNIQUE INDEX media_upload_hash_idx ON media(upload_hash);
