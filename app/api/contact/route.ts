import { NextRequest, NextResponse } from 'next/server';
import { globalLeads, type Lead } from '@/lib/leads-store';
import { getSupabase } from '@/lib/supabase';
import { audit } from '@/lib/audit';

export async function POST(request: NextRequest) {
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
    return NextResponse.json(
      { error: 'I campi nome e email sono obbligatori.' },
      { status: 400 }
    );
  }

  // Basic email format guard
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Indirizzo email non valido.' },
      { status: 400 }
    );
  }

  let lead: Lead;

  const db = getSupabase();
  if (db) {
    // ── Supabase path ──────────────────────────────────────────────────────
    const { data, error } = await db
      .from('leads')
      .insert({ name, email, phone: phone || null, property: property || null, message: message || null, source: 'web' })
      .select()
      .single();

    if (error || !data) {
      console.error('[contact] Supabase insert error:', error?.message);
      return NextResponse.json({ error: 'Errore nel salvataggio.' }, { status: 500 });
    }

    lead = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone ?? '',
      property: data.property ?? '',
      message: data.message ?? '',
      status: 'new',
      createdAt: data.created_at,
    };

    // Audit log (fire-and-forget)
    audit({ action: 'lead_created', tableName: 'leads', recordId: data.id, newData: lead, request });
  } else {
    // ── In-memory fallback ─────────────────────────────────────────────────
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
