'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { EstimateResult, PropertyInputs, CompanySettings, MonthlyData } from './EstimatePDF';

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_COMPANY_KEY = 'maison_company_settings';
const SS_AUTH_KEY = 'maison_admin_auth';

const AMENITIES = [
  'Piscina', 'Piscina riscaldata', 'Jacuzzi', 'Idromassaggio',
  'Giardino privato', 'Terrazza panoramica', 'Rooftop', 'Balcone',
  'Parking privato', 'Garage', 'WiFi fibra ottica', 'Aria condizionata',
  'Riscaldamento a pavimento', 'Cucina professionale', 'BBQ esterno',
  'Palestra privata', 'Sauna', 'Sala cinema', 'Sala biliardo',
  'Accesso diretto al mare', 'Vista mare', 'Vista montagna',
  'Servizio pulizie quotidiane', 'Concierge', 'Chef privato',
  'Servizio transfer', 'Barca inclusa', 'Pet friendly',
];

const PROPERTY_TYPES = [
  { value: 'villa', label: 'Villa' },
  { value: 'apartment', label: 'Appartamento di lusso' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'townhouse', label: 'Townhouse / Dimora storica' },
  { value: 'chalet', label: 'Chalet' },
  { value: 'masseria', label: 'Masseria / Casale' },
  { value: 'villa-estate', label: 'Villa estate / Tenuta' },
  { value: 'other', label: 'Altro' },
];

const SEASONALITY_TYPES = [
  { value: 'coastal', label: 'Costiero / Mare' },
  { value: 'mountain', label: 'Montagna / Sci' },
  { value: 'urban', label: 'Urbano / Città d\'arte' },
  { value: 'countryside', label: 'Campagna / Entroterra' },
  { value: 'lake', label: 'Lago' },
];

const TARGET_MARKETS = [
  { value: 'couples', label: 'Coppie (luxury)' },
  { value: 'families', label: 'Famiglie alto spendenti' },
  { value: 'groups', label: 'Gruppi / Celebrazioni' },
  { value: 'business', label: 'Business / Corporate' },
  { value: 'mixed', label: 'Misto (famiglie + coppie)' },
  { value: 'ultra-luxury', label: 'Ultra-luxury / HNWI' },
];

const LANGUAGES = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

type Step = 'inputs' | 'running' | 'review' | 'pdf';

// ─── Default values ───────────────────────────────────────────────────────────

const DEFAULT_INPUTS: PropertyInputs = {
  propertyName: '',
  location: '',
  propertyType: 'villa',
  sizeSqm: 200,
  bedrooms: 4,
  bathrooms: 3,
  maxGuests: 8,
  distanceFromCenter: 2,
  seasonalityType: 'coastal',
  amenities: [],
  specialFeatures: '',
  targetMarket: 'mixed',
  currentADR: undefined,
};

const DEFAULT_COMPANY: CompanySettings = {
  name: 'MAISON · ÉLITE',
  tagline: 'Luxury Short-Term Rental Management',
  logoUrl: '',
  description: '',
  services: '',
  website: '',
  phone: '',
  email: '',
  address: '',
  accentColor: '#C9A96E',
};

// ─── Style helpers ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0f1117',
  border: '1px solid #2a2f3e',
  borderRadius: 6,
  color: '#e8e8e8',
  fontSize: 13,
  padding: '10px 14px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#9ca3af',
  marginBottom: 6,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const cardStyle: React.CSSProperties = {
  background: '#1a1f2e',
  border: '1px solid #2a2f3e',
  borderRadius: 10,
  padding: '24px 28px',
  marginBottom: 20,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#c9a96e',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  marginBottom: 18,
  paddingBottom: 10,
  borderBottom: '1px solid #2a2f3e',
};

const primaryBtnStyle: React.CSSProperties = {
  background: '#c9a96e',
  color: '#0f1117',
  border: 'none',
  borderRadius: 6,
  padding: '12px 28px',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.12em',
  cursor: 'pointer',
  textTransform: 'uppercase' as const,
};

const secondaryBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#9ca3af',
  border: '1px solid #2a2f3e',
  borderRadius: 6,
  padding: '11px 24px',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.08em',
  cursor: 'pointer',
  textTransform: 'uppercase' as const,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  placeholder,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  min?: number;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      value={value ?? ''}
      min={min ?? 0}
      placeholder={placeholder}
      onChange={(e) => onChange(Number(e.target.value))}
      style={inputStyle}
    />
  );
}

function EditableTextarea({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ ...labelStyle, marginBottom: 8 }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{
          ...inputStyle,
          resize: 'vertical',
          lineHeight: 1.6,
          fontSize: 12,
        }}
      />
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'inputs', label: '1. Dati' },
    { id: 'running', label: '2. AI' },
    { id: 'review', label: '3. Revisiona' },
    { id: 'pdf', label: '4. PDF' },
  ];
  const order: Step[] = ['inputs', 'running', 'review', 'pdf'];
  const currentIdx = order.indexOf(current);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                padding: '5px 12px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: active ? '#0f1117' : done ? '#c9a96e' : '#4b5563',
                background: active ? '#c9a96e' : 'transparent',
                border: `1px solid ${active ? '#c9a96e' : done ? '#c9a96e44' : '#2a2f3e'}`,
                whiteSpace: 'nowrap',
              }}
            >
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 24, height: 1, background: i < currentIdx ? '#c9a96e44' : '#2a2f3e', margin: '0 2px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page Header ─────────────────────────────────────────────────────────────

function PageHeader({ currentStep }: { currentStep: Step }) {
  return (
    <header
      style={{
        background: '#1a1f2e',
        borderBottom: '1px solid #2a2f3e',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link
          href="/admin-immobiliare"
          style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← Admin
        </Link>
        <span style={{ color: '#2a2f3e' }}>|</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#c9a96e', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Stima di Fatturato
        </span>
      </div>
      <StepIndicator current={currentStep} />
    </header>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StimaPage() {
  const [step, setStep] = useState<Step>('inputs');
  const [language, setLanguage] = useState('it');
  const [inputs, setInputs] = useState<PropertyInputs>(DEFAULT_INPUTS);
  const [streamingText, setStreamingText] = useState('');
  const [streamStarted, setStreamStarted] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [edited, setEdited] = useState<EstimateResult | null>(null);
  const [company, setCompany] = useState<CompanySettings>(DEFAULT_COMPANY);
  const [pdfLanguage, setPdfLanguage] = useState('it');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const streamRef = useRef<AbortController | null>(null);

  // Auth check + load company settings
  useEffect(() => {
    const isAuth = sessionStorage.getItem(SS_AUTH_KEY) === 'true';
    if (!isAuth) {
      window.location.href = '/admin-immobiliare';
      return;
    }
    setAuthed(true);

    const stored = localStorage.getItem(LS_COMPANY_KEY);
    if (stored) {
      try {
        setCompany(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  const saveCompany = useCallback((c: CompanySettings) => {
    setCompany(c);
    localStorage.setItem(LS_COMPANY_KEY, JSON.stringify(c));
  }, []);

  const updateInput = <K extends keyof PropertyInputs>(key: K, value: PropertyInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (a: string) => {
    setInputs((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  async function runEstimation() {
    setError('');
    setStreamingText('');
    setStreamStarted(false);
    setStep('running');

    const controller = new AbortController();
    streamRef.current = controller;

    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, language }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }));
        throw new Error(errData.error ?? `HTTP ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        if (!streamStarted && fullText.includes('{')) setStreamStarted(true);
        setStreamingText(fullText);
      }

      // Parse result JSON
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Risposta AI non valida. Riprova.');

      const parsed = JSON.parse(jsonMatch[0]) as EstimateResult & { __error?: string };
      if (parsed.__error) throw new Error(String(parsed.__error));

      setResult(parsed);
      setEdited(JSON.parse(JSON.stringify(parsed)));

      // Save to Supabase (fire-and-forget — never block the user)
      const pw = sessionStorage.getItem('maison_admin_pw') ?? 'maison2024';
      fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
        body: JSON.stringify({ inputs, result: parsed, language, pdfLanguage: language }),
      }).catch(() => {});

      setStep('review');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message ?? 'Errore durante l\'analisi');
      setStep('inputs');
    }
  }

  function cancelStream() {
    streamRef.current?.abort();
    setStep('inputs');
  }

  function updateEdited<K extends keyof EstimateResult>(key: K, value: EstimateResult[K]) {
    setEdited((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function updateRevProj<K extends keyof EstimateResult['revenue_projections']>(
    key: K,
    value: EstimateResult['revenue_projections'][K]
  ) {
    setEdited((prev) =>
      prev
        ? { ...prev, revenue_projections: { ...prev.revenue_projections, [key]: value } }
        : prev
    );
  }

  function updateMonthly(index: number, field: keyof MonthlyData, value: number) {
    setEdited((prev) => {
      if (!prev) return prev;
      const mb = [...prev.revenue_projections.monthly_breakdown];
      mb[index] = { ...mb[index], [field]: value };
      return { ...prev, revenue_projections: { ...prev.revenue_projections, monthly_breakdown: mb } };
    });
  }

  async function downloadPDF() {
    if (!edited) return;
    setPdfLoading(true);
    try {
      const React = (await import('react')).default;
      const { pdf } = await import('@react-pdf/renderer');
      const { default: EstimatePDFDoc } = await import('./EstimatePDF');
      const element = React.createElement(EstimatePDFDoc, {
        data: edited,
        inputs,
        company,
        language: pdfLanguage,
      });
      const blob = await pdf(element).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `stima-${(inputs.propertyName || 'proprietà').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Errore nella generazione del PDF. Controlla che tutte le immagini siano accessibili pubblicamente.');
    } finally {
      setPdfLoading(false);
    }
  }

  if (!authed) {
    return <div style={{ minHeight: '100vh', background: '#0f1117' }} />;
  }

  // ─── STEP 1: Inputs ───────────────────────────────────────────────────────

  if (step === 'inputs') {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1117' }}>
        <PageHeader currentStep="inputs" />
        <main style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
          {error && (
            <div
              style={{
                background: '#1f0a0a',
                border: '1px solid #7f1d1d',
                borderRadius: 8,
                padding: '14px 18px',
                marginBottom: 20,
                color: '#f87171',
                fontSize: 13,
              }}
            >
              <strong>Errore:</strong> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* LEFT COLUMN */}
            <div>
              {/* Property basics */}
              <div style={cardStyle}>
                <p style={sectionTitleStyle}>Dati Principali Immobile</p>
                <FormField label="Nome proprietà">
                  <input
                    type="text"
                    value={inputs.propertyName}
                    onChange={(e) => updateInput('propertyName', e.target.value)}
                    placeholder="es. Villa Azzurra"
                    style={inputStyle}
                  />
                </FormField>
                <FormField label="Località">
                  <input
                    type="text"
                    value={inputs.location}
                    onChange={(e) => updateInput('location', e.target.value)}
                    placeholder="es. Positano, Costiera Amalfitana"
                    style={inputStyle}
                  />
                </FormField>
                <FormField label="Tipologia">
                  <select
                    value={inputs.propertyType}
                    onChange={(e) => updateInput('propertyType', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Tipo di stagionalità">
                  <select
                    value={inputs.seasonalityType}
                    onChange={(e) => updateInput('seasonalityType', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {SEASONALITY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Dimensions */}
              <div style={cardStyle}>
                <p style={sectionTitleStyle}>Dimensioni & Capacità</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <FormField label="Superficie (m²)">
                    <NumberInput value={inputs.sizeSqm} onChange={(v) => updateInput('sizeSqm', v)} min={20} />
                  </FormField>
                  <FormField label="Camere da letto">
                    <NumberInput value={inputs.bedrooms} onChange={(v) => updateInput('bedrooms', v)} min={1} />
                  </FormField>
                  <FormField label="Bagni">
                    <NumberInput value={inputs.bathrooms} onChange={(v) => updateInput('bathrooms', v)} min={1} />
                  </FormField>
                  <FormField label="Ospiti max">
                    <NumberInput value={inputs.maxGuests} onChange={(v) => updateInput('maxGuests', v)} min={1} />
                  </FormField>
                  <FormField label="Distanza dal centro (km)">
                    <NumberInput value={inputs.distanceFromCenter} onChange={(v) => updateInput('distanceFromCenter', v)} min={0} placeholder="es. 2" />
                  </FormField>
                  <FormField label="ADR attuale (€/notte, opz.)">
                    <NumberInput value={inputs.currentADR} onChange={(v) => updateInput('currentADR', v)} min={0} placeholder="es. 350" />
                  </FormField>
                </div>
              </div>

              {/* Target & features */}
              <div style={cardStyle}>
                <p style={sectionTitleStyle}>Mercato & Caratteristiche</p>
                <FormField label="Mercato target">
                  <select
                    value={inputs.targetMarket}
                    onChange={(e) => updateInput('targetMarket', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {TARGET_MARKETS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Caratteristiche speciali">
                  <textarea
                    value={inputs.specialFeatures}
                    onChange={(e) => updateInput('specialFeatures', e.target.value)}
                    rows={3}
                    placeholder="es. Vista panoramica sul mare, piscina a sfioro, elipad..."
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                  />
                </FormField>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div>
              {/* Amenities */}
              <div style={cardStyle}>
                <p style={sectionTitleStyle}>Dotazioni & Servizi</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {AMENITIES.map((a) => {
                    const active = inputs.amenities.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        style={{
                          background: active ? '#c9a96e22' : '#0f1117',
                          border: `1px solid ${active ? '#c9a96e' : '#2a2f3e'}`,
                          borderRadius: 4,
                          color: active ? '#c9a96e' : '#9ca3af',
                          fontSize: 11,
                          padding: '5px 10px',
                          cursor: 'pointer',
                          fontWeight: active ? 600 : 400,
                          transition: 'all 0.15s',
                        }}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
                {inputs.amenities.length > 0 && (
                  <p style={{ marginTop: 12, marginBottom: 0, fontSize: 11, color: '#c9a96e' }}>
                    {inputs.amenities.length} dotazioni selezionate
                  </p>
                )}
              </div>

              {/* Language selection */}
              <div style={cardStyle}>
                <p style={sectionTitleStyle}>Lingua del Report AI</p>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14, marginTop: -4 }}>
                  L&apos;agente AI genererà tutte le analisi e i testi nella lingua selezionata.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLanguage(l.code)}
                      style={{
                        background: language === l.code ? '#c9a96e' : '#0f1117',
                        border: `1px solid ${language === l.code ? '#c9a96e' : '#2a2f3e'}`,
                        borderRadius: 6,
                        color: language === l.code ? '#0f1117' : '#9ca3af',
                        fontSize: 13,
                        fontWeight: 600,
                        padding: '8px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ ...cardStyle, background: '#131720', border: '1px solid #c9a96e33' }}>
                <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 20, marginTop: 0 }}>
                  L&apos;agente AI <strong style={{ color: '#e8e8e8' }}>claude-opus-4-8</strong> con <em>adaptive thinking</em> analizzerà la proprietà e genererà proiezioni di fatturato, analisi stagionale, RevPAR, ADR e molto altro.
                </p>
                <button
                  onClick={runEstimation}
                  disabled={!inputs.propertyName || !inputs.location}
                  style={{
                    ...primaryBtnStyle,
                    width: '100%',
                    padding: '15px',
                    fontSize: 13,
                    opacity: !inputs.propertyName || !inputs.location ? 0.5 : 1,
                    cursor: !inputs.propertyName || !inputs.location ? 'not-allowed' : 'pointer',
                  }}
                >
                  Genera Stima AI →
                </button>
                {(!inputs.propertyName || !inputs.location) && (
                  <p style={{ fontSize: 11, color: '#6b7280', marginTop: 10, marginBottom: 0, textAlign: 'center' }}>
                    Inserisci nome proprietà e località per procedere
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── STEP 2: AI Running ───────────────────────────────────────────────────

  if (step === 'running') {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1117' }}>
        <PageHeader currentStep="running" />
        <main
          style={{
            minHeight: 'calc(100vh - 60px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
          }}
        >
          {/* Spinner */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: '2px solid #2a2f3e',
                borderTop: '2px solid #c9a96e',
                animation: 'spin 1s linear infinite',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>

          <p style={{ fontSize: 11, color: '#c9a96e', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
            {!streamStarted ? 'Analisi in corso...' : 'Generazione report...'}
          </p>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 32, textAlign: 'center', maxWidth: 480 }}>
            {!streamStarted
              ? 'L\'agente AI sta elaborando i dati della proprietà e analizzando il mercato di riferimento.'
              : 'Strutturazione dei dati e proiezioni finanziarie in corso.'}
          </p>

          {/* Streaming preview */}
          {streamingText.length > 0 && (
            <div
              style={{
                background: '#131720',
                border: '1px solid #2a2f3e',
                borderRadius: 8,
                padding: '14px 18px',
                width: '100%',
                maxWidth: 680,
                maxHeight: 200,
                overflow: 'hidden',
                marginBottom: 24,
                position: 'relative',
              }}
            >
              <p style={{ fontSize: 11, color: '#c9a96e', letterSpacing: '0.1em', marginBottom: 8 }}>OUTPUT AI</p>
              <pre
                style={{
                  fontFamily: 'monospace',
                  fontSize: 10,
                  color: '#6b7280',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  maxHeight: 140,
                  overflow: 'hidden',
                }}
              >
                {streamingText.slice(-600)}
              </pre>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  background: 'linear-gradient(transparent, #131720)',
                  borderRadius: '0 0 8px 8px',
                }}
              />
            </div>
          )}

          <button onClick={cancelStream} style={secondaryBtnStyle}>
            Annulla
          </button>
        </main>
      </div>
    );
  }

  // ─── STEP 3: Review & Edit ────────────────────────────────────────────────

  if (step === 'review' && edited) {
    const rp = edited.revenue_projections;

    return (
      <div style={{ minHeight: '100vh', background: '#0f1117' }}>
        <PageHeader currentStep="review" />
        <main style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 18, color: '#e8e8e8', margin: 0, fontWeight: 300 }}>
                Revisiona e Modifica il Report
              </h2>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6, marginBottom: 0 }}>
                Puoi modificare qualsiasi sezione prima di generare il PDF.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('inputs')} style={secondaryBtnStyle}>
                ← Rimodifica Dati
              </button>
              <button onClick={() => setStep('pdf')} style={primaryBtnStyle}>
                Procedi: PDF →
              </button>
            </div>
          </div>

          {/* Testi AI */}
          <div style={cardStyle}>
            <p style={sectionTitleStyle}>Testi del Report</p>
            <EditableTextarea
              label="Sommario Esecutivo"
              value={edited.executive_summary}
              onChange={(v) => updateEdited('executive_summary', v)}
              rows={6}
            />
            <EditableTextarea
              label="Analisi Immobile"
              value={edited.property_analysis}
              onChange={(v) => updateEdited('property_analysis', v)}
              rows={5}
            />
            <EditableTextarea
              label="Analisi di Mercato & Località"
              value={edited.location_market_analysis}
              onChange={(v) => updateEdited('location_market_analysis', v)}
              rows={5}
            />
            <EditableTextarea
              label="Analisi Stagionale"
              value={edited.seasonality_analysis}
              onChange={(v) => updateEdited('seasonality_analysis', v)}
              rows={4}
            />
            <EditableTextarea
              label="Proprietà Comparabili"
              value={edited.comparable_properties}
              onChange={(v) => updateEdited('comparable_properties', v)}
              rows={4}
            />
            <EditableTextarea
              label="Strategia di Pricing Consigliata"
              value={edited.recommended_pricing_strategy}
              onChange={(v) => updateEdited('recommended_pricing_strategy', v)}
              rows={4}
            />
            <EditableTextarea
              label="Fattori di Successo"
              value={edited.key_success_factors}
              onChange={(v) => updateEdited('key_success_factors', v)}
              rows={4}
            />
            <EditableTextarea
              label="Rischi & Mitigazione"
              value={edited.risks_and_mitigation}
              onChange={(v) => updateEdited('risks_and_mitigation', v)}
              rows={4}
            />
            <EditableTextarea
              label="Proiezioni di Crescita (Y1, Y2, Y3)"
              value={edited.growth_projections}
              onChange={(v) => updateEdited('growth_projections', v)}
              rows={4}
            />
          </div>

          {/* Revenue metrics */}
          <div style={cardStyle}>
            <p style={sectionTitleStyle}>Metriche di Fatturato</p>

            {/* Annual scenarios */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
              {([
                { key: 'annual_revenue_min', label: 'Scenario Minimo (€)' },
                { key: 'annual_revenue_realistic', label: 'Scenario Realistico (€)' },
                { key: 'annual_revenue_max', label: 'Scenario Massimo (€)' },
              ] as { key: keyof typeof rp; label: string }[]).map(({ key, label }) => (
                <FormField key={key} label={label}>
                  <input
                    type="number"
                    value={rp[key] as number}
                    onChange={(e) => updateRevProj(key, Number(e.target.value))}
                    style={{ ...inputStyle, fontWeight: 600, fontSize: 15 }}
                  />
                </FormField>
              ))}
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
              <FormField label="Occupazione annua (0-1)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={rp.occupancy_rate_annual}
                  onChange={(e) => updateRevProj('occupancy_rate_annual', Number(e.target.value))}
                  style={inputStyle}
                />
              </FormField>
              <FormField label="ADR - Tariffa media (€/notte)">
                <input
                  type="number"
                  value={rp.adr}
                  onChange={(e) => updateRevProj('adr', Number(e.target.value))}
                  style={inputStyle}
                />
              </FormField>
              <FormField label="RevPAR (€/notte disponibile)">
                <input
                  type="number"
                  value={rp.revpar}
                  onChange={(e) => updateRevProj('revpar', Number(e.target.value))}
                  style={inputStyle}
                />
              </FormField>
            </div>

            {/* Monthly table */}
            <p style={{ ...labelStyle, marginBottom: 12 }}>Dettaglio Mensile</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#131720' }}>
                    {['Mese', 'Rev. Min (€)', 'Rev. Max (€)', 'Occupaz.', 'ADR (€)'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          fontSize: 10,
                          color: '#9ca3af',
                          fontWeight: 600,
                          letterSpacing: '0.06em',
                          borderBottom: '1px solid #2a2f3e',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rp.monthly_breakdown.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #2a2f3e' }}>
                      <td style={{ padding: '6px 10px', color: '#c9a96e', fontWeight: 600, fontSize: 12 }}>
                        {row.month}
                      </td>
                      {(
                        [
                          { field: 'revenue_min' as keyof MonthlyData },
                          { field: 'revenue_max' as keyof MonthlyData },
                          { field: 'occupancy_rate' as keyof MonthlyData },
                          { field: 'adr' as keyof MonthlyData },
                        ]
                      ).map(({ field }) => (
                        <td key={field} style={{ padding: '4px 6px' }}>
                          <input
                            type="number"
                            step={field === 'occupancy_rate' ? '0.01' : '1'}
                            min={0}
                            max={field === 'occupancy_rate' ? 1 : undefined}
                            value={row[field] as number}
                            onChange={(e) => updateMonthly(i, field, Number(e.target.value))}
                            style={{
                              background: '#0f1117',
                              border: '1px solid #2a2f3e',
                              borderRadius: 4,
                              color: '#e8e8e8',
                              fontSize: 11,
                              padding: '5px 8px',
                              width: '100%',
                              outline: 'none',
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={() => setStep('inputs')} style={secondaryBtnStyle}>
              ← Rimodifica Dati
            </button>
            <button onClick={() => setStep('pdf')} style={primaryBtnStyle}>
              Procedi: Branding & PDF →
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── STEP 4: Branding & PDF ───────────────────────────────────────────────

  if (step === 'pdf' && edited) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1117' }}>
        <PageHeader currentStep="pdf" />
        <main style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 18, color: '#e8e8e8', margin: 0, fontWeight: 300 }}>
                Branding & Generazione PDF
              </h2>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6, marginBottom: 0 }}>
                Configura l&apos;azienda e scarica il report professionale.
              </p>
            </div>
            <button onClick={() => setStep('review')} style={secondaryBtnStyle}>
              ← Torna alla Revisione
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Company settings */}
            <div style={cardStyle}>
              <p style={sectionTitleStyle}>Impostazioni Azienda</p>
              <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 16, marginTop: -6 }}>
                Salvate automaticamente in questo browser.
              </p>
              <FormField label="Nome Azienda">
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => saveCompany({ ...company, name: e.target.value })}
                  placeholder="es. MAISON ÉLITE"
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Tagline">
                <input
                  type="text"
                  value={company.tagline}
                  onChange={(e) => saveCompany({ ...company, tagline: e.target.value })}
                  placeholder="es. Luxury Short-Term Rental Management"
                  style={inputStyle}
                />
              </FormField>
              <FormField label="URL Logo (immagine pubblica)">
                <input
                  type="url"
                  value={company.logoUrl}
                  onChange={(e) => saveCompany({ ...company, logoUrl: e.target.value })}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Descrizione Azienda">
                <textarea
                  value={company.description}
                  onChange={(e) => saveCompany({ ...company, description: e.target.value })}
                  rows={4}
                  placeholder="Descrizione dell'azienda, anni di esperienza, mercati serviti..."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                />
              </FormField>
              <FormField label="Servizi Offerti">
                <textarea
                  value={company.services}
                  onChange={(e) => saveCompany({ ...company, services: e.target.value })}
                  rows={3}
                  placeholder="Gestione completa, revenue management, listing ottimizzato..."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                />
              </FormField>
            </div>

            {/* Contacts + Language + Download */}
            <div>
              <div style={cardStyle}>
                <p style={sectionTitleStyle}>Contatti Azienda</p>
                <FormField label="Sito Web">
                  <input
                    type="text"
                    value={company.website}
                    onChange={(e) => saveCompany({ ...company, website: e.target.value })}
                    placeholder="www.maison-elite.com"
                    style={inputStyle}
                  />
                </FormField>
                <FormField label="Email">
                  <input
                    type="email"
                    value={company.email}
                    onChange={(e) => saveCompany({ ...company, email: e.target.value })}
                    placeholder="info@maison-elite.com"
                    style={inputStyle}
                  />
                </FormField>
                <FormField label="Telefono">
                  <input
                    type="text"
                    value={company.phone}
                    onChange={(e) => saveCompany({ ...company, phone: e.target.value })}
                    placeholder="+39 02 1234567"
                    style={inputStyle}
                  />
                </FormField>
                <FormField label="Indirizzo">
                  <input
                    type="text"
                    value={company.address}
                    onChange={(e) => saveCompany({ ...company, address: e.target.value })}
                    placeholder="Via Montenapoleone 1, 20121 Milano"
                    style={inputStyle}
                  />
                </FormField>
              </div>

              {/* Language for PDF */}
              <div style={cardStyle}>
                <p style={sectionTitleStyle}>Lingua del PDF</p>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: -6, marginBottom: 14 }}>
                  Seleziona la lingua per le etichette del PDF (le sezioni di testo già generate dall&apos;AI mantengono la loro lingua).
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setPdfLanguage(l.code)}
                      style={{
                        background: pdfLanguage === l.code ? '#c9a96e' : '#0f1117',
                        border: `1px solid ${pdfLanguage === l.code ? '#c9a96e' : '#2a2f3e'}`,
                        borderRadius: 6,
                        color: pdfLanguage === l.code ? '#0f1117' : '#9ca3af',
                        fontSize: 13,
                        fontWeight: 600,
                        padding: '8px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Download */}
              <div
                style={{
                  ...cardStyle,
                  background: '#131720',
                  border: '1px solid #c9a96e44',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: 14, color: '#e8e8e8', marginBottom: 6, fontWeight: 300 }}>
                  Pronto per il download
                </p>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
                  {inputs.propertyName || 'Proprietà'} — {inputs.location}
                </p>
                <button
                  onClick={downloadPDF}
                  disabled={pdfLoading}
                  style={{
                    ...primaryBtnStyle,
                    width: '100%',
                    padding: '15px',
                    fontSize: 13,
                    opacity: pdfLoading ? 0.7 : 1,
                    cursor: pdfLoading ? 'wait' : 'pointer',
                  }}
                >
                  {pdfLoading ? 'Generazione PDF...' : '⬇ Scarica PDF Professionale'}
                </button>
                <p style={{ fontSize: 10, color: '#4b5563', marginTop: 12, marginBottom: 0 }}>
                  PDF generato localmente — nessun dato inviato a terzi
                </p>
              </div>

              {/* Re-run */}
              <div style={{ textAlign: 'center', marginTop: 4 }}>
                <button
                  onClick={() => setStep('inputs')}
                  style={{ ...secondaryBtnStyle, fontSize: 11 }}
                >
                  Nuova Analisi per un&apos;Altra Proprietà
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
