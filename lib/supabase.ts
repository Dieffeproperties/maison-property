import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ─── Supabase server-side client ──────────────────────────────────────────────
// Uses the SERVICE ROLE key — never expose this to the browser.
// All DB access goes through Next.js API routes only.

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function isSupabaseReady(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// ─── Row types (mirror the SQL schema) ───────────────────────────────────────

export interface DbLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  property: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbEstimate {
  id: string;
  property_name: string | null;
  location: string | null;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
  language: string;
  pdf_language: string;
  created_at: string;
}
