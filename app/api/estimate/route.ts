import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const LANGUAGE_NAMES: Record<string, string> = {
  it: 'Italian',
  en: 'English',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
};

const MONTH_NAMES: Record<string, string[]> = {
  it: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
  es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
};

function buildPrompt(inputs: Record<string, unknown>, langName: string, months: string[]): string {
  const amenities = Array.isArray(inputs.amenities) ? (inputs.amenities as string[]).join(', ') : 'Not specified';
  const monthList = months.map((m) => `"${m}"`).join(', ');

  return `You are a senior luxury short-term rental (STR) revenue analyst with 15 years of experience in the European luxury real estate market (Italy, French Riviera, Spanish coast, Switzerland, Austria).

Analyze the property below and produce a rigorous, data-driven revenue estimation report. Base your analysis on current European luxury STR market benchmarks (Airbnb Luxe, Vrbo Premium, direct bookings).

PROPERTY DATA:
- Name: ${inputs.propertyName ?? 'N/A'}
- Location: ${inputs.location ?? 'N/A'}
- Type: ${inputs.propertyType ?? 'N/A'}
- Size: ${inputs.sizeSqm ?? 'N/A'} m²
- Bedrooms: ${inputs.bedrooms ?? 'N/A'}
- Bathrooms: ${inputs.bathrooms ?? 'N/A'}
- Max guests: ${inputs.maxGuests ?? 'N/A'}
- Distance from center: ${inputs.distanceFromCenter ?? 'N/A'} km
- Seasonality type: ${inputs.seasonalityType ?? 'N/A'} (coastal / mountain / urban / countryside / lake)
- Amenities: ${amenities}
- Special features: ${inputs.specialFeatures ?? 'None'}
- Target market: ${inputs.targetMarket ?? 'Luxury travelers'}
- Current ADR (if known): ${inputs.currentADR ? '€' + inputs.currentADR : 'Not provided'}

RESPONSE FORMAT:
Respond ONLY with a valid JSON object. No markdown, no code fences, no preamble, no trailing text — pure raw JSON.
All text fields must be written in ${langName}.
Use these exact month names for monthly_breakdown (in this order): [${monthList}]

{
  "executive_summary": "3–4 paragraphs: key findings, top-line revenue figure, occupancy expectation, and the single most important strategic recommendation. Include specific EUR figures.",
  "property_analysis": "2–3 paragraphs on STR potential, unique competitive advantages, positioning in the luxury segment, and any physical strengths or weaknesses relative to comparable inventory.",
  "location_market_analysis": "2–3 paragraphs on the specific location, local tourism demand drivers (seasonality, events, infrastructure), STR regulatory environment, and macro-economic factors influencing this market.",
  "revenue_projections": {
    "annual_revenue_min": <integer EUR — conservative scenario>,
    "annual_revenue_max": <integer EUR — optimistic scenario>,
    "annual_revenue_realistic": <integer EUR — base case, used in all summaries>,
    "occupancy_rate_annual": <decimal 0–1, e.g. 0.72>,
    "adr": <integer EUR — blended Annual Average Daily Rate>,
    "revpar": <integer EUR — Revenue Per Available Room = ADR × occupancy_rate_annual>,
    "monthly_breakdown": [
      {
        "month": "${months[0]}",
        "revenue_min": <integer EUR>,
        "revenue_max": <integer EUR>,
        "occupancy_rate": <decimal 0–1>,
        "adr": <integer EUR>
      }
    ]
  },
  "seasonality_analysis": "2–3 paragraphs: peak months (specific dates/events driving demand), shoulder seasons, low-season management strategy, and recommended minimum-stay policies per period.",
  "comparable_properties": "Description of 3–4 real or highly representative comparable properties in the area (type, size, amenities, ADR range, occupancy). Use specific numbers.",
  "growth_projections": "Year-over-year outlook for Y1 (ramp-up), Y2 (stabilized), Y3 (optimized) — with specific revenue figures and percentage growth. Include key levers for improvement.",
  "key_success_factors": "5–7 specific, actionable success factors for this property type and location. Each factor on a new line starting with '• '.",
  "risks_and_mitigation": "Top 3–4 risks (regulatory, competitive, operational, seasonal) with specific mitigation strategies for each. Format: 'RISK: ... — MITIGATION: ...'",
  "recommended_pricing_strategy": "Detailed pricing strategy: peak/shoulder/low-season rate bands, minimum-stay rules, last-minute discount policy, platform mix (Airbnb vs Booking vs direct), and dynamic pricing tools recommendation."
}

Important constraints:
- The 12 monthly revenue_realistic values must sum approximately to annual_revenue_realistic (±5%)
- RevPAR = ADR × occupancy_rate_annual (verify this arithmetic)
- All numbers must be realistic and defensible against current market data
- Do not pad with generic advice — every sentence must be specific to this property and location`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY non configurata. Aggiungila nelle variabili d\'ambiente Vercel.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { inputs, language = 'it' } = body as { inputs: Record<string, unknown>; language: string };
  if (!inputs) {
    return new Response(JSON.stringify({ error: 'Missing inputs' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const langName = LANGUAGE_NAMES[language] ?? 'Italian';
  const months = MONTH_NAMES[language] ?? MONTH_NAMES.it;
  const prompt = buildPrompt(inputs, langName, months);

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: 'claude-opus-4-8',
          max_tokens: 16000,
          thinking: { type: 'adaptive' },
          messages: [{ role: 'user', content: prompt }],
        });

        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(`\n{"__error":"${msg}"}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Accel-Buffering': 'no',
      'Cache-Control': 'no-cache',
    },
  });
}
