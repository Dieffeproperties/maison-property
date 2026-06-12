import { getSupabase } from './supabase';
import type { NextRequest } from 'next/server';

// ─── Audit logger ─────────────────────────────────────────────────────────────
// Tracks every significant action with IP, user-agent and contextual data.
// Fire-and-forget: never blocks the HTTP response.

export type AuditAction =
  | 'lead_created'
  | 'lead_updated'
  | 'lead_deleted'
  | 'estimate_created'
  | 'admin_login_success'   // successful auth — ip + user-agent tracked
  | 'admin_login_failed'    // failed auth — used by rate-limiting logic
  | 'pdf_downloaded';

interface AuditParams {
  action: AuditAction;
  tableName?: string;
  recordId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  request?: NextRequest;
  metadata?: Record<string, unknown>;
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export function audit(params: AuditParams): void {
  const db = getSupabase();
  if (!db) return; // Gracefully no-op when Supabase is not configured

  const ip = params.request ? getClientIP(params.request) : 'server';
  const ua = params.request?.headers.get('user-agent') ?? 'server';

  // Fire and forget — never await this, never block the response
  void db.from('audit_log')
    .insert({
      action: params.action,
      table_name: params.tableName ?? null,
      record_id: params.recordId ?? null,
      old_data: params.oldData ?? null,
      new_data: params.newData ?? null,
      ip_address: ip,
      user_agent: ua,
      metadata: params.metadata ?? null,
    })
    .then(() => undefined);
}
