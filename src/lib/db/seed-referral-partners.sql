-- Referral partner seeds for Milestone 7 (Podcast Referral Engine)
-- Idempotent: safe to re-run against local or remote D1.

INSERT INTO referral_partners (id, name, slug, contact_email, custom_utm, is_active, created_at)
VALUES (
  '9f1d2c3e-0001-4a11-8b22-000000000001',
  'Growth Mindset Podcast',
  'growth-mindset-podcast',
  'partners@everrisepress.com',
  NULL,
  1,
  CURRENT_TIMESTAMP
)
ON CONFLICT(slug) DO NOTHING;

INSERT INTO referral_partners (id, name, slug, contact_email, custom_utm, is_active, created_at)
VALUES (
  '9f1d2c3e-0002-4a11-8b22-000000000002',
  'Test Partner',
  'test-partner',
  'test@everrisepress.com',
  NULL,
  1,
  CURRENT_TIMESTAMP
)
ON CONFLICT(slug) DO NOTHING;
