-- ═══════════════════════════════════════════════════════════════════════════════
-- MAISON · ÉLITE — Supabase Schema Setup
-- Run this entire script in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── leads ────────────────────────────────────────────────────────────────────
CREATE TABLE public.leads (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  phone       TEXT,
  property    TEXT,
  message     TEXT,
  status      TEXT        NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new','contacted','negotiating','proposal','signed','lost')),
  notes       TEXT,
  source      TEXT        DEFAULT 'web',         -- 'web' | 'admin' | 'import'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.leads IS 'Contact form submissions and manually added leads';
COMMENT ON COLUMN public.leads.status IS 'CRM pipeline stage';
COMMENT ON COLUMN public.leads.source IS 'Origin channel of the lead';

-- ─── estimates ────────────────────────────────────────────────────────────────
CREATE TABLE public.estimates (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_name  TEXT,
  location       TEXT,
  inputs         JSONB       NOT NULL,   -- PropertyInputs object
  result         JSONB       NOT NULL,   -- EstimateResult object from AI
  language       TEXT        NOT NULL DEFAULT 'it',
  pdf_language   TEXT        NOT NULL DEFAULT 'it',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.estimates IS 'AI-generated revenue estimation reports';
COMMENT ON COLUMN public.estimates.inputs IS 'Raw property inputs sent to the AI';
COMMENT ON COLUMN public.estimates.result IS 'Full AI response including projections';

-- ─── audit_log ────────────────────────────────────────────────────────────────
CREATE TABLE public.audit_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action       TEXT        NOT NULL,  -- see AuditAction type in lib/audit.ts
  table_name   TEXT,
  record_id    UUID,
  old_data     JSONB,
  new_data     JSONB,
  ip_address   TEXT,
  user_agent   TEXT,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.audit_log IS 'Immutable security audit trail — do not delete rows';

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── Performance indexes ──────────────────────────────────────────────────────
CREATE INDEX leads_created_at_idx  ON public.leads      (created_at DESC);
CREATE INDEX leads_status_idx      ON public.leads      (status);
CREATE INDEX leads_email_idx       ON public.leads      (email);
CREATE INDEX est_created_at_idx    ON public.estimates  (created_at DESC);
CREATE INDEX audit_created_at_idx  ON public.audit_log  (created_at DESC);
CREATE INDEX audit_action_idx      ON public.audit_log  (action);
CREATE INDEX audit_record_id_idx   ON public.audit_log  (record_id);

-- ─── Row Level Security (defense-in-depth) ────────────────────────────────────
-- The app uses the service_role key (which bypasses RLS), but RLS is enabled
-- to block any accidental anon/authenticated client-side access.

ALTER TABLE public.leads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log  ENABLE ROW LEVEL SECURITY;

-- Deny everything from the public internet (service_role bypasses this)
CREATE POLICY "deny_public_leads"     ON public.leads      FOR ALL TO anon, authenticated USING (false);
CREATE POLICY "deny_public_estimates" ON public.estimates  FOR ALL TO anon, authenticated USING (false);
CREATE POLICY "deny_public_audit"     ON public.audit_log  FOR ALL TO anon, authenticated USING (false);

-- ═══════════════════════════════════════════════════════════════════════════════
-- Done! Copy SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from:
-- Supabase Dashboard → Project Settings → API
-- Add them as environment variables in Vercel.
-- ═══════════════════════════════════════════════════════════════════════════════
