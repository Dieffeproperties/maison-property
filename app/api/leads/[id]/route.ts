import { NextRequest, NextResponse } from 'next/server';
import { globalLeads, type Lead, type LeadStatus } from '@/lib/leads-store';
import { getSupabase, type DbLead } from '@/lib/supabase';
import { audit } from '@/lib/audit';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'maison2024';

const VALID_STATUSES: LeadStatus[] = [
  'new', 'contacted', 'negotiating', 'proposal', 'signed', 'lost',
];

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization');
  if (!auth) return false;
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  return token === ADMIN_PASSWORD;
}

function fromDb(row: DbLead): Lead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    property: row.property ?? '',
    message: row.message ?? '',
    status: row.status as LeadStatus,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

// PATCH /api/leads/[id] — update status and/or notes
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    audit({ action: 'admin_login_failed', request, metadata: { endpoint: 'PATCH /api/leads/[id]' } });
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status as LeadStatus)) {
      return NextResponse.json({ error: 'Stato non valido' }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (body.notes !== undefined) {
    updates.notes = typeof body.notes === 'string' ? body.notes : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 });
  }

  const db = getSupabase();

  if (db) {
    // Fetch existing record for audit diff
    const { data: existing } = await db.from('leads').select('*').eq('id', id).single();

    const { data, error } = await db
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // PGRST116 = no rows matched (demo lead ID or truly missing)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 });
      }
      console.error('[leads PATCH] Supabase error:', error.message);
      return NextResponse.json({ error: 'Errore aggiornamento.' }, { status: 500 });
    }

    const updated = fromDb(data as DbLead);

    audit({
      action: 'lead_updated',
      tableName: 'leads',
      recordId: id,
      oldData: existing ? (fromDb(existing as DbLead) as unknown as Record<string, unknown>) : undefined,
      newData: updated as unknown as Record<string, unknown>,
      request,
    });

    return NextResponse.json(updated);
  }

  // ── In-memory fallback ──────────────────────────────────────────────────────
  const index = globalLeads.findIndex((l) => l.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 });
  }

  if (updates.status) globalLeads[index].status = updates.status as LeadStatus;
  if ('notes' in updates) {
    globalLeads[index].notes = updates.notes as string | undefined;
  }

  return NextResponse.json(globalLeads[index]);
}
