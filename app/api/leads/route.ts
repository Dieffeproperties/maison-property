import { NextRequest, NextResponse } from 'next/server';
import { globalLeads, type Lead } from '@/lib/leads-store';
import { getSupabase, type DbLead } from '@/lib/supabase';
import { audit } from '@/lib/audit';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'maison2024';

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
    status: row.status as Lead['status'],
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

// GET /api/leads — list all leads (admin only)
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    audit({ action: 'admin_login_failed', request, metadata: { endpoint: 'GET /api/leads' } });
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const db = getSupabase();
  if (db) {
    const { data, error } = await db
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[leads GET] Supabase error:', error.message);
      return NextResponse.json({ error: 'Errore nel recupero dei lead.' }, { status: 500 });
    }

    return NextResponse.json((data as DbLead[]).map(fromDb));
  }

  // Fallback: in-memory
  return NextResponse.json([...globalLeads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ));
}

// POST /api/leads — create lead manually (admin)
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    audit({ action: 'admin_login_failed', request, metadata: { endpoint: 'POST /api/leads' } });
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name     = typeof body.name     === 'string' ? body.name.trim()     : '';
  const email    = typeof body.email    === 'string' ? body.email.trim()    : '';
  const phone    = typeof body.phone    === 'string' ? body.phone.trim()    : '';
  const property = typeof body.property === 'string' ? body.property.trim() : '';
  const message  = typeof body.message  === 'string' ? body.message.trim()  : '';

  if (!name || !email) {
    return NextResponse.json({ error: 'Nome e email obbligatori.' }, { status: 400 });
  }

  let lead: Lead;
  const db = getSupabase();

  if (db) {
    const { data, error } = await db
      .from('leads')
      .insert({ name, email, phone: phone || null, property: property || null, message: message || null, source: 'admin' })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Errore nel salvataggio.' }, { status: 500 });
    }

    lead = fromDb(data as DbLead);
    audit({ action: 'lead_created', tableName: 'leads', recordId: lead.id, newData: lead, request });
  } else {
    lead = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      property,
      message,
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    globalLeads.push(lead);
  }

  return NextResponse.json(lead, { status: 201 });
}
