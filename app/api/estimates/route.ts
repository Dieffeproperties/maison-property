import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, type DbEstimate } from '@/lib/supabase';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'maison2024';

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization');
  if (!auth) return false;
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  return token === ADMIN_PASSWORD;
}

// POST /api/estimates — save a new estimate (called from stima wizard)
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    audit({ action: 'admin_login_failed', request, metadata: { endpoint: 'POST /api/estimates' } });
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { inputs, result, language = 'it', pdfLanguage = 'it' } = body as {
    inputs: Record<string, unknown>;
    result: Record<string, unknown>;
    language: string;
    pdfLanguage: string;
  };

  if (!inputs || !result) {
    return NextResponse.json({ error: 'inputs e result obbligatori' }, { status: 400 });
  }

  const db = getSupabase();
  if (!db) {
    // Supabase not configured — acknowledge but don't persist
    return NextResponse.json({ saved: false, message: 'Supabase non configurato' });
  }

  const { data, error } = await db
    .from('estimates')
    .insert({
      property_name: (inputs.propertyName as string) ?? null,
      location: (inputs.location as string) ?? null,
      inputs,
      result,
      language,
      pdf_language: pdfLanguage,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('[estimates POST] Supabase error:', error?.message);
    return NextResponse.json({ error: 'Errore nel salvataggio della stima.' }, { status: 500 });
  }

  audit({
    action: 'estimate_created',
    tableName: 'estimates',
    recordId: data.id,
    newData: {
      property_name: data.property_name,
      location: data.location,
      language: data.language,
    },
    request,
  });

  return NextResponse.json({ saved: true, id: data.id }, { status: 201 });
}

// GET /api/estimates — list recent estimates (admin only)
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const db = getSupabase();
  if (!db) {
    return NextResponse.json([]);
  }

  const { data, error } = await db
    .from('estimates')
    .select('id, property_name, location, language, pdf_language, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: 'Errore nel recupero.' }, { status: 500 });
  }

  return NextResponse.json(data as Partial<DbEstimate>[]);
}
