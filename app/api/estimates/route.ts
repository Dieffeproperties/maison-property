import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, type DbEstimate } from '@/lib/supabase';
import { audit } from '@/lib/audit';
import { authenticate } from '@/lib/auth';

export const runtime = 'nodejs';

// POST /api/estimates — save a new estimate (called from stima wizard)
export async function POST(request: NextRequest) {
  const { ok, reason } = await authenticate(request, 'POST /api/estimates');
  if (!ok) {
    return NextResponse.json(
      { error: reason === 'blocked' ? 'Troppi tentativi.' : 'Non autorizzato' },
      { status: reason === 'blocked' ? 429 : 401 }
    );
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
  const { ok, reason } = await authenticate(request, 'GET /api/estimates');
  if (!ok) {
    return NextResponse.json(
      { error: reason === 'blocked' ? 'Troppi tentativi.' : 'Non autorizzato' },
      { status: reason === 'blocked' ? 429 : 401 }
    );
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
