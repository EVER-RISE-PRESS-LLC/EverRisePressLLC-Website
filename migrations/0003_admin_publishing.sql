CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  document TEXT NOT NULL,
  published_document TEXT,
  revision INTEGER NOT NULL DEFAULT 1,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS articles_live_idx ON articles(archived_at, updated_at);
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  data BLOB NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_login_limits (
  key TEXT PRIMARY KEY NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  resets_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_login_limits_expiry_idx ON admin_login_limits(resets_at);
