'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Lead, LeadStatus } from '@/lib/leads-store';

// ─── Constants ────────────────────────────────────────────────────────────────

const VERSION = '1.0.0';
const LS_LEADS_KEY = 'maison_leads';
const SS_AUTH_KEY = 'maison_admin_auth';

type StatusMeta = {
  label: string;
  bg: string;
  color: string;
  border: string;
};

const STATUS_META: Record<LeadStatus, StatusMeta> = {
  new: { label: 'Nuovo', bg: '#1e3a5f', color: '#60a5fa', border: '#2563eb' },
  contacted: { label: 'Contattato', bg: '#3f3310', color: '#fbbf24', border: '#d97706' },
  negotiating: { label: 'In Trattativa', bg: '#3f1f0a', color: '#f97316', border: '#ea580c' },
  proposal: { label: 'Proposta Inviata', bg: '#2e1a5e', color: '#a78bfa', border: '#7c3aed' },
  signed: { label: 'Contratto Firmato', bg: '#0f3320', color: '#4ade80', border: '#16a34a' },
  lost: { label: 'Non Qualificato', bg: '#1e1e1e', color: '#9ca3af', border: '#4b5563' },
};

const ALL_STATUSES = Object.keys(STATUS_META) as LeadStatus[];

const DEMO_LEADS: Lead[] = [
  {
    id: 'demo-1',
    name: 'Marco Ferretti',
    email: 'marco.ferretti@email.it',
    phone: '+39 333 1234567',
    property: 'Villa Côte d\'Azur',
    message: 'Sono interessato ad acquistare una villa sul mare tra Cannes e Antibes. Budget 3-5 milioni. Disponibile per una visita a luglio.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'new',
  },
  {
    id: 'demo-2',
    name: 'Sophie Blanc',
    email: 'sophie.blanc@gmail.com',
    phone: '+33 6 98 76 54 32',
    property: 'Appartement Monaco',
    message: 'Je cherche un appartement de 3 pièces à Monaco ou Cap-d\'Ail. Budget jusqu\'à 2,5 millions. Idéalement avec vue mer.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'contacted',
  },
  {
    id: 'demo-3',
    name: 'Klaus Müller',
    email: 'k.mueller@business.de',
    phone: '+49 171 9876543',
    property: 'Penthouse Milano',
    message: 'Interessiert an einem Luxus-Penthouse im Zentrum von Mailand. Investitionszweck. Budget flexibel bis 8 Millionen.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'negotiating',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function loadFromStorage(): Lead[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_LEADS_KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : null;
  } catch {
    return null;
  }
}

function saveToStorage(leads: Lead[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_LEADS_KEY, JSON.stringify(leads));
  } catch {
    // storage quota exceeded — ignore
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LeadStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      style={{
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border}`,
        borderRadius: 4,
        padding: '2px 8px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}
    >
      {meta.label}
    </span>
  );
}

function StatsCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: '#1a1f2e',
        border: '1px solid #2a2f3e',
        borderRadius: 8,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <span style={{ fontSize: 12, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: accent ? '#c9a96e' : '#e8e8e8',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Login Gate ───────────────────────────────────────────────────────────────

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Small artificial delay for UX
    await new Promise((r) => setTimeout(r, 400));

    const adminPw = 'maison2024'; // client-side check (env default)
    if (password === adminPw || password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '')) {
      sessionStorage.setItem(SS_AUTH_KEY, 'true');
      onAuth();
    } else {
      // Verify via API
      const res = await fetch('/api/leads', {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        sessionStorage.setItem(SS_AUTH_KEY, 'true');
        onAuth();
      } else {
        setError('Password non corretta. Riprova.');
      }
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f1117',
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#1a1f2e',
          border: '1px solid #2a2f3e',
          borderRadius: 12,
          padding: '48px 40px',
          width: '100%',
          maxWidth: 400,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.25em',
              color: '#c9a96e',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            MAISON · ÉLITE
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: '#e8e8e8', margin: 0 }}>
            Area Amministrativa
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="admin-pw"
              style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 8, letterSpacing: '0.06em' }}
            >
              PASSWORD
            </label>
            <input
              id="admin-pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                background: '#0f1117',
                border: '1px solid #2a2f3e',
                borderRadius: 6,
                color: '#e8e8e8',
                fontSize: 15,
                padding: '12px 14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16, margin: '0 0 16px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#c9a96e',
              color: '#0f1117',
              border: 'none',
              borderRadius: 6,
              padding: '13px 0',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {loading ? 'ACCESSO...' : 'ACCEDI'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function Dashboard({
  leads,
  onLeadsChange,
  onLogout,
  password,
}: {
  leads: Lead[];
  onLeadsChange: (leads: Lead[]) => void;
  onLogout: () => void;
  password: string;
}) {
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Stats
  const total = leads.length;
  const nuovi = leads.filter((l) => l.status === 'new').length;
  const trattativa = leads.filter((l) => l.status === 'negotiating').length;
  const firmati = leads.filter((l) => l.status === 'signed').length;

  const filtered =
    filterStatus === 'all' ? leads : leads.filter((l) => l.status === filterStatus);

  async function updateStatus(id: string, status: LeadStatus) {
    setUpdatingId(id);

    // Optimistic update
    const updated = leads.map((l) => (l.id === id ? { ...l, status } : l));
    onLeadsChange(updated);

    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ status }),
      });
    } catch {
      // API failure — state is already updated locally, which is fine
    }

    setUpdatingId(null);
  }

  const cellStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: 13,
    color: '#e8e8e8',
    borderBottom: '1px solid #2a2f3e',
    verticalAlign: 'middle',
  };

  const headCellStyle: React.CSSProperties = {
    padding: '10px 16px',
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    borderBottom: '1px solid #2a2f3e',
    textAlign: 'left',
    background: '#131720',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>
      {/* Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#c9a96e',
              textTransform: 'uppercase',
            }}
          >
            MAISON · ÉLITE
          </span>
          <span style={{ color: '#2a2f3e', fontSize: 16 }}>—</span>
          <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 300 }}>Admin</span>
          <span
            style={{
              background: '#0f1117',
              border: '1px solid #2a2f3e',
              borderRadius: 4,
              padding: '2px 7px',
              fontSize: 10,
              color: '#9ca3af',
              letterSpacing: '0.06em',
            }}
          >
            v{VERSION}
          </span>
        </div>

        <button
          onClick={onLogout}
          style={{
            background: 'transparent',
            border: '1px solid #2a2f3e',
            borderRadius: 6,
            color: '#9ca3af',
            fontSize: 12,
            padding: '6px 14px',
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}
        >
          LOGOUT
        </button>
      </header>

      {/* Content */}
      <main style={{ padding: '32px 24px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <StatsCard label="Totale Lead" value={total} accent />
          <StatsCard label="Nuovi" value={nuovi} />
          <StatsCard label="In Trattativa" value={trattativa} />
          <StatsCard label="Contratti Firmati" value={firmati} />
        </div>

        {/* Filter bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 12, color: '#9ca3af', marginRight: 4 }}>Filtra:</span>
          {(['all', ...ALL_STATUSES] as const).map((s) => {
            const isActive = filterStatus === s;
            const meta = s !== 'all' ? STATUS_META[s] : null;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  background: isActive
                    ? s === 'all'
                      ? '#c9a96e'
                      : meta?.bg ?? '#1a1f2e'
                    : 'transparent',
                  color: isActive
                    ? s === 'all'
                      ? '#0f1117'
                      : meta?.color ?? '#e8e8e8'
                    : '#9ca3af',
                  border: `1px solid ${isActive ? (s === 'all' ? '#c9a96e' : meta?.border ?? '#2a2f3e') : '#2a2f3e'}`,
                  borderRadius: 4,
                  padding: '5px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {s === 'all' ? 'Tutti' : STATUS_META[s].label}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div
          style={{
            background: '#1a1f2e',
            border: '1px solid #2a2f3e',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              Nessun lead trovato.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={headCellStyle}>Nome</th>
                    <th style={headCellStyle}>Email</th>
                    <th style={headCellStyle}>Telefono</th>
                    <th style={headCellStyle}>Proprietà</th>
                    <th style={headCellStyle}>Data</th>
                    <th style={headCellStyle}>Stato</th>
                    <th style={headCellStyle}>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, idx) => {
                    const isExpanded = expandedId === lead.id;
                    const isZebra = idx % 2 === 1;
                    const rowBg = isZebra ? '#141927' : '#1a1f2e';

                    return (
                      <>
                        <tr
                          key={lead.id}
                          style={{
                            background: rowBg,
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLTableRowElement).style.background = '#1f2535')
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLTableRowElement).style.background = rowBg)
                          }
                        >
                          <td style={{ ...cellStyle, fontWeight: 500 }}>{lead.name}</td>
                          <td style={{ ...cellStyle, color: '#c9a96e' }}>
                            <a href={`mailto:${lead.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {lead.email}
                            </a>
                          </td>
                          <td style={{ ...cellStyle, color: '#9ca3af' }}>{lead.phone || '—'}</td>
                          <td style={{ ...cellStyle, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lead.property || '—'}
                          </td>
                          <td style={{ ...cellStyle, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                            {formatDate(lead.createdAt)}
                          </td>
                          <td style={cellStyle}>
                            <StatusBadge status={lead.status} />
                          </td>
                          <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <select
                                value={lead.status}
                                disabled={updatingId === lead.id}
                                onChange={(e) =>
                                  updateStatus(lead.id, e.target.value as LeadStatus)
                                }
                                style={{
                                  background: '#0f1117',
                                  border: '1px solid #2a2f3e',
                                  borderRadius: 4,
                                  color: '#e8e8e8',
                                  fontSize: 11,
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                  outline: 'none',
                                }}
                              >
                                {ALL_STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {STATUS_META[s].label}
                                  </option>
                                ))}
                              </select>

                              <button
                                onClick={() =>
                                  setExpandedId(isExpanded ? null : lead.id)
                                }
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #2a2f3e',
                                  borderRadius: 4,
                                  color: '#9ca3af',
                                  fontSize: 11,
                                  padding: '4px 10px',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {isExpanded ? 'Chiudi' : 'Espandi'}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr key={`${lead.id}-expanded`} style={{ background: '#131720' }}>
                            <td colSpan={7} style={{ padding: '16px 20px', borderBottom: '1px solid #2a2f3e' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: '#9ca3af',
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  Messaggio completo
                                </span>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    color: '#d1d5db',
                                    lineHeight: 1.7,
                                    maxWidth: 700,
                                    background: '#0f1117',
                                    border: '1px solid #2a2f3e',
                                    borderRadius: 6,
                                    padding: '12px 16px',
                                  }}
                                >
                                  {lead.message || (
                                    <em style={{ color: '#9ca3af' }}>Nessun messaggio.</em>
                                  )}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: '#4b5563' }}>
          MAISON · ÉLITE Admin — {total} lead totali
        </p>
      </main>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Password used during this session (stored for API calls)
  const [sessionPassword, setSessionPassword] = useState('maison2024');

  // Hydrate from sessionStorage + localStorage
  useEffect(() => {
    const isAuth = sessionStorage.getItem(SS_AUTH_KEY) === 'true';
    setAuthed(isAuth);

    const stored = loadFromStorage();
    if (stored && stored.length > 0) {
      setLeads(stored);
    } else {
      setLeads(DEMO_LEADS);
      saveToStorage(DEMO_LEADS);
    }

    setHydrated(true);
  }, []);

  // Fetch from API after auth
  useEffect(() => {
    if (!authed) return;

    const pw =
      typeof sessionStorage !== 'undefined'
        ? (sessionStorage.getItem('maison_admin_pw') ?? 'maison2024')
        : 'maison2024';

    fetch('/api/leads', {
      headers: { Authorization: `Bearer ${pw}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Lead[] | null) => {
        if (data && Array.isArray(data) && data.length > 0) {
          // Merge API data with localStorage (API data wins for same IDs)
          setLeads((prev) => {
            const map = new Map(prev.map((l) => [l.id, l]));
            data.forEach((l) => map.set(l.id, l));
            const merged = Array.from(map.values()).sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            saveToStorage(merged);
            return merged;
          });
        }
      })
      .catch(() => {
        // API unavailable — use localStorage data
      });
  }, [authed]);

  const handleLeadsChange = useCallback((updated: Lead[]) => {
    setLeads(updated);
    saveToStorage(updated);
  }, []);

  const handleAuth = useCallback(() => {
    setAuthed(true);
    // Try to detect password from input (we pass it via session storage)
    const pw = sessionStorage.getItem('maison_admin_pw') ?? 'maison2024';
    setSessionPassword(pw);
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem(SS_AUTH_KEY);
    setAuthed(false);
  }, []);

  if (!hydrated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0f1117',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: 13,
        }}
      >
        Caricamento...
      </div>
    );
  }

  if (!authed) {
    return (
      <LoginGate
        onAuth={() => {
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <Dashboard
      leads={leads}
      onLeadsChange={handleLeadsChange}
      onLogout={handleLogout}
      password={sessionPassword}
    />
  );
}
