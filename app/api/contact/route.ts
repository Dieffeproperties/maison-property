import { NextRequest, NextResponse } from 'next/server';
import { globalLeads, type Lead } from '@/lib/leads-store';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const property = typeof body.property === 'string' ? body.property.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || !email) {
    return NextResponse.json(
      { error: 'I campi nome e email sono obbligatori.' },
      { status: 400 }
    );
  }

  const lead: Lead = {
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

  return NextResponse.json(lead, { status: 201 });
}
