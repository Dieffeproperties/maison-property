import { NextRequest, NextResponse } from 'next/server';
import { globalLeads, type LeadStatus } from '@/lib/leads-store';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'maison2024';

const VALID_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'negotiating',
  'proposal',
  'signed',
  'lost',
];

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization');
  if (!auth) return false;
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  return token === ADMIN_PASSWORD;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const { id } = await params;

  const index = globalLeads.findIndex((l) => l.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status as LeadStatus)) {
      return NextResponse.json({ error: 'Stato non valido' }, { status: 400 });
    }
    globalLeads[index].status = body.status as LeadStatus;
  }

  if (body.notes !== undefined) {
    globalLeads[index].notes =
      typeof body.notes === 'string' ? body.notes : undefined;
  }

  return NextResponse.json(globalLeads[index]);
}
