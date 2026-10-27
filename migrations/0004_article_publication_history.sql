-- Remember the first publication even after an article is unpublished.
-- Keeping this additive also upgrades local databases that already applied 0003.
ALTER TABLE articles ADD COLUMN published_at TEXT;
UPDATE articles SET published_at = json_extract(published_document, '$.publishedAt') WHERE published_document IS NOT NULL;
CREATE INDEX IF NOT EXISTS admin_login_limits_expiry_idx ON admin_login_limits(resets_at);
