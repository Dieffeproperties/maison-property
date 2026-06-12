/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MonthlyData {
  month: string;
  revenue_min: number;
  revenue_max: number;
  occupancy_rate: number;
  adr: number;
}

export interface EstimateResult {
  executive_summary: string;
  property_analysis: string;
  location_market_analysis: string;
  revenue_projections: {
    annual_revenue_min: number;
    annual_revenue_max: number;
    annual_revenue_realistic: number;
    occupancy_rate_annual: number;
    adr: number;
    revpar: number;
    monthly_breakdown: MonthlyData[];
  };
  seasonality_analysis: string;
  comparable_properties: string;
  growth_projections: string;
  key_success_factors: string;
  risks_and_mitigation: string;
  recommended_pricing_strategy: string;
}

export interface PropertyInputs {
  propertyName: string;
  location: string;
  propertyType: string;
  sizeSqm: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  distanceFromCenter: number;
  seasonalityType: string;
  amenities: string[];
  specialFeatures: string;
  targetMarket: string;
  currentADR?: number;
}

export interface CompanySettings {
  name: string;
  tagline: string;
  logoUrl: string;
  description: string;
  services: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  accentColor: string;
}

export interface PDFProps {
  data: EstimateResult;
  inputs: PropertyInputs;
  company: CompanySettings;
  language: string;
}

// ─── Labels ───────────────────────────────────────────────────────────────────

const LABELS: Record<string, Record<string, any>> = {
  it: {
    docTitle: 'STIMA DI FATTURATO',
    coverSubtitle: 'Analisi Revenue & Proiezioni per Locazioni Brevi di Lusso',
    preparedBy: 'Preparata da',
    date: 'Data',
    confidential: 'Documento Riservato e Confidenziale',
    sections: {
      company: 'LA NOSTRA AZIENDA',
      executive: 'SOMMARIO ESECUTIVO',
      property: 'ANALISI IMMOBILE',
      market: 'ANALISI DI MERCATO',
      revenue: 'PROIEZIONI DI FATTURATO',
      seasonality: 'ANALISI STAGIONALE',
      strategy: 'STRATEGIA DI PRICING',
      success: 'FATTORI DI SUCCESSO & RISCHI',
      nextSteps: 'CRESCITA & PROSSIMI PASSI',
    },
    kpis: {
      annualRevenue: 'FATTURATO ANNUO',
      occupancy: 'OCCUPAZIONE MEDIA',
      adr: 'TARIFFA MEDIA (ADR)',
      revpar: 'REVPAR',
    },
    table: {
      month: 'MESE',
      minRevenue: 'REVENUE MIN',
      maxRevenue: 'REVENUE MAX',
      occupancy: 'OCCUPAZ.',
      adr: 'ADR',
    },
    property: {
      type: 'Tipologia',
      size: 'Superficie',
      bedrooms: 'Camere da letto',
      bathrooms: 'Bagni',
      guests: 'Ospiti max',
      location: 'Località',
      amenities: 'Dotazioni',
    },
    footer: { confidential: 'Documento Riservato', page: 'Pag.' },
    scenarios: { min: 'Min', realistic: 'Realistico', max: 'Max' },
    contacts: 'CONTATTI',
    services: 'I NOSTRI SERVIZI',
    disclaimer: 'Le proiezioni contenute in questo documento sono stime basate su dati di mercato e analisi comparative. I risultati effettivi possono variare in base a fattori di mercato, stagionalità e gestione operativa.',
  },
  en: {
    docTitle: 'REVENUE ESTIMATION',
    coverSubtitle: 'Revenue Analysis & Projections for Luxury Short-Term Rentals',
    preparedBy: 'Prepared by',
    date: 'Date',
    confidential: 'Confidential Document',
    sections: {
      company: 'ABOUT US',
      executive: 'EXECUTIVE SUMMARY',
      property: 'PROPERTY ANALYSIS',
      market: 'MARKET ANALYSIS',
      revenue: 'REVENUE PROJECTIONS',
      seasonality: 'SEASONAL ANALYSIS',
      strategy: 'PRICING STRATEGY',
      success: 'SUCCESS FACTORS & RISKS',
      nextSteps: 'GROWTH & NEXT STEPS',
    },
    kpis: {
      annualRevenue: 'ANNUAL REVENUE',
      occupancy: 'AVG OCCUPANCY',
      adr: 'AVERAGE DAILY RATE',
      revpar: 'REVPAR',
    },
    table: {
      month: 'MONTH',
      minRevenue: 'MIN REVENUE',
      maxRevenue: 'MAX REVENUE',
      occupancy: 'OCC.',
      adr: 'ADR',
    },
    property: {
      type: 'Type',
      size: 'Size',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      guests: 'Max Guests',
      location: 'Location',
      amenities: 'Amenities',
    },
    footer: { confidential: 'Confidential', page: 'P.' },
    scenarios: { min: 'Min', realistic: 'Realistic', max: 'Max' },
    contacts: 'CONTACTS',
    services: 'OUR SERVICES',
    disclaimer: 'The projections in this document are estimates based on market data and comparative analysis. Actual results may vary based on market conditions, seasonality, and operational management.',
  },
  fr: {
    docTitle: 'ESTIMATION DES REVENUS',
    coverSubtitle: 'Analyse des Revenus & Projections pour Locations de Courte Durée de Luxe',
    preparedBy: 'Préparé par',
    date: 'Date',
    confidential: 'Document Confidentiel',
    sections: {
      company: 'NOTRE ENTREPRISE',
      executive: 'RÉSUMÉ EXÉCUTIF',
      property: 'ANALYSE DU BIEN',
      market: 'ANALYSE DU MARCHÉ',
      revenue: 'PROJECTIONS DE REVENUS',
      seasonality: 'ANALYSE SAISONNIÈRE',
      strategy: 'STRATÉGIE DE TARIFICATION',
      success: 'FACTEURS DE SUCCÈS & RISQUES',
      nextSteps: 'CROISSANCE & PROCHAINES ÉTAPES',
    },
    kpis: {
      annualRevenue: 'REVENUS ANNUELS',
      occupancy: 'TAUX D\'OCCUPATION',
      adr: 'TARIF JOURNALIER MOYEN',
      revpar: 'REVPAR',
    },
    table: {
      month: 'MOIS',
      minRevenue: 'REVENUS MIN',
      maxRevenue: 'REVENUS MAX',
      occupancy: 'OCC.',
      adr: 'TJM',
    },
    property: {
      type: 'Type',
      size: 'Surface',
      bedrooms: 'Chambres',
      bathrooms: 'Salles de bain',
      guests: 'Hôtes max',
      location: 'Localisation',
      amenities: 'Équipements',
    },
    footer: { confidential: 'Confidentiel', page: 'P.' },
    scenarios: { min: 'Min', realistic: 'Réaliste', max: 'Max' },
    contacts: 'CONTACTS',
    services: 'NOS SERVICES',
    disclaimer: 'Les projections contenues dans ce document sont des estimations basées sur des données de marché et des analyses comparatives.',
  },
  de: {
    docTitle: 'UMSATZSCHÄTZUNG',
    coverSubtitle: 'Umsatzanalyse & Prognosen für Luxus-Kurzzeitvermietungen',
    preparedBy: 'Erstellt von',
    date: 'Datum',
    confidential: 'Vertrauliches Dokument',
    sections: {
      company: 'UNSER UNTERNEHMEN',
      executive: 'ZUSAMMENFASSUNG',
      property: 'IMMOBILIENANALYSE',
      market: 'MARKTANALYSE',
      revenue: 'UMSATZPROGNOSEN',
      seasonality: 'SAISONANALYSE',
      strategy: 'PREISSTRATEGIE',
      success: 'ERFOLGSFAKTOREN & RISIKEN',
      nextSteps: 'WACHSTUM & NÄCHSTE SCHRITTE',
    },
    kpis: {
      annualRevenue: 'JAHRESUMSATZ',
      occupancy: 'BELEGUNGSRATE',
      adr: 'DURCHSCH. TAGESSATZ',
      revpar: 'REVPAR',
    },
    table: {
      month: 'MONAT',
      minRevenue: 'UMSATZ MIN',
      maxRevenue: 'UMSATZ MAX',
      occupancy: 'BLEG.',
      adr: 'ADR',
    },
    property: {
      type: 'Typ',
      size: 'Größe',
      bedrooms: 'Schlafzimmer',
      bathrooms: 'Badezimmer',
      guests: 'Max. Gäste',
      location: 'Lage',
      amenities: 'Ausstattung',
    },
    footer: { confidential: 'Vertraulich', page: 'S.' },
    scenarios: { min: 'Min', realistic: 'Realistisch', max: 'Max' },
    contacts: 'KONTAKT',
    services: 'UNSERE LEISTUNGEN',
    disclaimer: 'Die Prognosen in diesem Dokument sind Schätzungen auf Basis von Marktdaten und vergleichenden Analysen.',
  },
  es: {
    docTitle: 'ESTIMACIÓN DE INGRESOS',
    coverSubtitle: 'Análisis de Ingresos & Proyecciones para Alquileres de Lujo a Corto Plazo',
    preparedBy: 'Preparado por',
    date: 'Fecha',
    confidential: 'Documento Confidencial',
    sections: {
      company: 'NUESTRA EMPRESA',
      executive: 'RESUMEN EJECUTIVO',
      property: 'ANÁLISIS DEL INMUEBLE',
      market: 'ANÁLISIS DE MERCADO',
      revenue: 'PROYECCIONES DE INGRESOS',
      seasonality: 'ANÁLISIS ESTACIONAL',
      strategy: 'ESTRATEGIA DE PRECIOS',
      success: 'FACTORES DE ÉXITO & RIESGOS',
      nextSteps: 'CRECIMIENTO & PRÓXIMOS PASOS',
    },
    kpis: {
      annualRevenue: 'INGRESOS ANUALES',
      occupancy: 'TASA DE OCUPACIÓN',
      adr: 'TARIFA MEDIA DIARIA',
      revpar: 'REVPAR',
    },
    table: {
      month: 'MES',
      minRevenue: 'INGRESO MIN',
      maxRevenue: 'INGRESO MAX',
      occupancy: 'OCUP.',
      adr: 'ADR',
    },
    property: {
      type: 'Tipo',
      size: 'Superficie',
      bedrooms: 'Habitaciones',
      bathrooms: 'Baños',
      guests: 'Huéspedes máx',
      location: 'Ubicación',
      amenities: 'Comodidades',
    },
    footer: { confidential: 'Confidencial', page: 'Pág.' },
    scenarios: { min: 'Mín', realistic: 'Realista', max: 'Máx' },
    contacts: 'CONTACTOS',
    services: 'NUESTROS SERVICIOS',
    disclaimer: 'Las proyecciones contenidas en este documento son estimaciones basadas en datos de mercado y análisis comparativos.',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function eur(n: number): string {
  return '€' + n.toLocaleString('it-IT');
}
function pct(n: number): string {
  return Math.round(n * 100) + '%';
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const GOLD = '#C9A96E';
const DARK = '#0f1117';
const DARK2 = '#1a1f2e';
const WHITE = '#FFFFFF';
const LIGHT_GRAY = '#F5F5F0';
const TEXT_DARK = '#1C1C2E';
const TEXT_MID = '#4A4A6A';

const styles = StyleSheet.create({
  // Cover
  coverPage: { backgroundColor: DARK, padding: 0, width: '100%', height: '100%' },
  coverInner: { padding: 50, flex: 1, display: 'flex', flexDirection: 'column' },
  coverTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  coverLogo: { width: 48, height: 48, objectFit: 'contain' },
  coverCompanyName: { fontFamily: 'Times-Roman', fontSize: 13, color: GOLD, letterSpacing: 3, textTransform: 'uppercase' },
  coverCompanyTagline: { fontFamily: 'Helvetica', fontSize: 9, color: '#8899aa', letterSpacing: 1, marginTop: 3 },
  coverGoldLine: { height: 1, backgroundColor: GOLD, marginTop: 20, marginBottom: 60 },
  coverTitleArea: { flex: 1, justifyContent: 'center' },
  coverTitle: { fontFamily: 'Times-Roman', fontSize: 38, color: WHITE, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 6 },
  coverDivider: { width: 80, height: 2, backgroundColor: GOLD, marginBottom: 20 },
  coverSubtitle: { fontFamily: 'Helvetica', fontSize: 11, color: '#aabbcc', letterSpacing: 1, lineHeight: 1.5 },
  coverPropertyName: { fontFamily: 'Times-Bold', fontSize: 22, color: GOLD, marginTop: 40, marginBottom: 6, letterSpacing: 1 },
  coverLocation: { fontFamily: 'Helvetica', fontSize: 12, color: '#ccdde8', letterSpacing: 0.5 },
  coverBottom: { borderTopWidth: 1, borderTopColor: '#2a3048', paddingTop: 16, marginTop: 40 },
  coverBottomText: { fontFamily: 'Helvetica', fontSize: 9, color: '#667788', letterSpacing: 0.5 },
  coverConfidential: { fontFamily: 'Helvetica', fontSize: 8, color: '#445566', letterSpacing: 1, textTransform: 'uppercase', marginTop: 6 },

  // Content pages
  page: { backgroundColor: WHITE, padding: 0 },
  pageHeader: { backgroundColor: DARK, paddingHorizontal: 40, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageHeaderTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: GOLD, letterSpacing: 2, textTransform: 'uppercase' },
  pageHeaderCompany: { fontFamily: 'Helvetica', fontSize: 8, color: '#667788', letterSpacing: 1 },
  goldAccentLine: { height: 2, backgroundColor: GOLD, marginHorizontal: 40 },
  pageContent: { paddingHorizontal: 40, paddingTop: 24, paddingBottom: 40, flex: 1 },
  pageFooter: { borderTopWidth: 1, borderTopColor: '#E8E8E8', marginHorizontal: 40, paddingTop: 8, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontFamily: 'Helvetica', fontSize: 7, color: '#AAAAAA', letterSpacing: 0.5 },

  // Typography
  h1: { fontFamily: 'Times-Bold', fontSize: 20, color: TEXT_DARK, marginBottom: 6, letterSpacing: 0.5 },
  h2: { fontFamily: 'Times-Bold', fontSize: 14, color: DARK2, marginBottom: 4, marginTop: 16, letterSpacing: 0.3 },
  h3: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: TEXT_MID, marginBottom: 4, marginTop: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  body: { fontFamily: 'Helvetica', fontSize: 9.5, color: TEXT_DARK, lineHeight: 1.65, marginBottom: 10 },
  bodySmall: { fontFamily: 'Helvetica', fontSize: 8.5, color: TEXT_MID, lineHeight: 1.6, marginBottom: 8 },

  // KPI boxes
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 20, marginTop: 8 },
  kpiBox: { flex: 1, backgroundColor: LIGHT_GRAY, borderRadius: 6, padding: 12, borderLeftWidth: 3, borderLeftColor: GOLD },
  kpiLabel: { fontFamily: 'Helvetica', fontSize: 7, color: TEXT_MID, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  kpiValue: { fontFamily: 'Times-Bold', fontSize: 16, color: TEXT_DARK },
  kpiSub: { fontFamily: 'Helvetica', fontSize: 7.5, color: TEXT_MID, marginTop: 3 },

  // Scenario boxes
  scenarioRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  scenarioBox: { flex: 1, borderRadius: 5, padding: 10, alignItems: 'center' },
  scenarioLabel: { fontFamily: 'Helvetica', fontSize: 7, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 },
  scenarioValue: { fontFamily: 'Times-Bold', fontSize: 13 },

  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: DARK, paddingVertical: 7, paddingHorizontal: 6, borderRadius: 3, marginBottom: 2 },
  tableHeaderCell: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: GOLD, letterSpacing: 0.8, textTransform: 'uppercase', flex: 1, textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#F0F0EC' },
  tableRowAlt: { backgroundColor: '#FAFAF8' },
  tableCell: { fontFamily: 'Helvetica', fontSize: 8, color: TEXT_DARK, flex: 1, textAlign: 'center' },
  tableCellBold: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: TEXT_DARK, flex: 1 },

  // Property detail grid
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  detailItem: { backgroundColor: LIGHT_GRAY, borderRadius: 4, padding: 8, minWidth: 100 },
  detailLabel: { fontFamily: 'Helvetica', fontSize: 7, color: TEXT_MID, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
  detailValue: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: TEXT_DARK },

  // Amenity pills
  amenityList: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 12 },
  amenityPill: { backgroundColor: DARK2, borderRadius: 3, paddingHorizontal: 7, paddingVertical: 3 },
  amenityText: { fontFamily: 'Helvetica', fontSize: 7.5, color: GOLD, letterSpacing: 0.3 },

  // Section divider
  sectionDivider: { height: 1, backgroundColor: '#E8E8E0', marginVertical: 12 },

  // Company page
  companyDescription: { fontFamily: 'Helvetica', fontSize: 10, color: TEXT_DARK, lineHeight: 1.7, marginBottom: 14 },
  companyContact: { fontFamily: 'Helvetica', fontSize: 9, color: TEXT_MID, marginBottom: 4 },
  companyContactBold: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: TEXT_DARK, marginBottom: 4 },

  // Disclaimer
  disclaimer: { fontFamily: 'Helvetica', fontSize: 7.5, color: '#999999', lineHeight: 1.5, fontStyle: 'italic', borderTopWidth: 1, borderTopColor: '#E8E8E8', paddingTop: 10, marginTop: 16 },
});

// ─── Page helpers ─────────────────────────────────────────────────────────────

function ContentPage({
  children,
  sectionTitle,
  company,
  pageNum,
  totalPages,
  labels,
}: {
  children: React.ReactNode;
  sectionTitle: string;
  company: CompanySettings;
  pageNum: number;
  totalPages: number;
  labels: Record<string, any>;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>{sectionTitle}</Text>
        <Text style={styles.pageHeaderCompany}>{company.name}</Text>
      </View>
      <View style={styles.goldAccentLine} />
      <View style={styles.pageContent}>{children}</View>
      <View style={styles.pageFooter}>
        <Text style={styles.footerText}>{labels.footer.confidential}</Text>
        <Text style={styles.footerText}>{company.name}</Text>
        <Text style={styles.footerText}>
          {labels.footer.page} {pageNum}/{totalPages}
        </Text>
      </View>
    </Page>
  );
}

// ─── Main PDF Document ────────────────────────────────────────────────────────

export default function EstimatePDF({ data, inputs, company, language }: PDFProps) {
  const lb = LABELS[language] ?? LABELS.it;
  const today = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const rp = data.revenue_projections;
  const totalPages = 9;

  return (
    <Document
      title={`${lb.docTitle} — ${inputs.propertyName}`}
      author={company.name}
      subject={lb.coverSubtitle}
      creator="MAISON · ÉLITE Admin"
    >
      {/* ── PAGE 1: COVER ── */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverInner}>
          {/* Header */}
          <View style={styles.coverTopBar}>
            <View>
              <Text style={styles.coverCompanyName}>{company.name}</Text>
              {company.tagline ? (
                <Text style={styles.coverCompanyTagline}>{company.tagline}</Text>
              ) : null}
            </View>
            {company.logoUrl && company.logoUrl.startsWith('http') ? (
              <Image src={company.logoUrl} style={styles.coverLogo} />
            ) : null}
          </View>

          <View style={styles.coverGoldLine} />

          {/* Title */}
          <View style={styles.coverTitleArea}>
            <Text style={styles.coverTitle}>{lb.docTitle}</Text>
            <View style={styles.coverDivider} />
            <Text style={styles.coverSubtitle}>{lb.coverSubtitle}</Text>

            <Text style={styles.coverPropertyName}>{inputs.propertyName || '—'}</Text>
            <Text style={styles.coverLocation}>{inputs.location}</Text>
          </View>

          {/* Bottom */}
          <View style={styles.coverBottom}>
            <Text style={styles.coverBottomText}>
              {lb.preparedBy}: {company.name}
            </Text>
            <Text style={styles.coverBottomText}>
              {lb.date}: {today}
            </Text>
            <Text style={styles.coverConfidential}>{lb.confidential}</Text>
          </View>
        </View>
      </Page>

      {/* ── PAGE 2: COMPANY PRESENTATION ── */}
      <ContentPage sectionTitle={lb.sections.company} company={company} pageNum={2} totalPages={totalPages} labels={lb}>
        {company.logoUrl && company.logoUrl.startsWith('http') ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 14 }}>
            <Image src={company.logoUrl} style={{ width: 56, height: 56, objectFit: 'contain' }} />
            <View>
              <Text style={{ fontFamily: 'Times-Bold', fontSize: 18, color: TEXT_DARK }}>{company.name}</Text>
              {company.tagline ? <Text style={{ fontFamily: 'Helvetica', fontSize: 10, color: GOLD, marginTop: 3 }}>{company.tagline}</Text> : null}
            </View>
          </View>
        ) : (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontFamily: 'Times-Bold', fontSize: 22, color: TEXT_DARK }}>{company.name}</Text>
            {company.tagline ? <Text style={{ fontFamily: 'Helvetica', fontSize: 10, color: GOLD, marginTop: 4 }}>{company.tagline}</Text> : null}
          </View>
        )}

        <View style={styles.sectionDivider} />

        {company.description ? (
          <Text style={styles.companyDescription}>{company.description}</Text>
        ) : null}

        {company.services ? (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.h3}>{lb.services}</Text>
            <Text style={styles.body}>{company.services}</Text>
          </View>
        ) : null}

        <View style={styles.sectionDivider} />

        <Text style={styles.h3}>{lb.contacts}</Text>
        {company.website ? <Text style={styles.companyContact}>{company.website}</Text> : null}
        {company.email ? <Text style={styles.companyContact}>{company.email}</Text> : null}
        {company.phone ? <Text style={styles.companyContact}>{company.phone}</Text> : null}
        {company.address ? <Text style={styles.companyContact}>{company.address}</Text> : null}
      </ContentPage>

      {/* ── PAGE 3: EXECUTIVE SUMMARY ── */}
      <ContentPage sectionTitle={lb.sections.executive} company={company} pageNum={3} totalPages={totalPages} labels={lb}>
        <Text style={styles.body}>{data.executive_summary}</Text>
      </ContentPage>

      {/* ── PAGE 4: PROPERTY ANALYSIS ── */}
      <ContentPage sectionTitle={lb.sections.property} company={company} pageNum={4} totalPages={totalPages} labels={lb}>
        {/* Details grid */}
        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{lb.property.type}</Text>
            <Text style={styles.detailValue}>{inputs.propertyType}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{lb.property.size}</Text>
            <Text style={styles.detailValue}>{inputs.sizeSqm} m²</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{lb.property.bedrooms}</Text>
            <Text style={styles.detailValue}>{inputs.bedrooms}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{lb.property.bathrooms}</Text>
            <Text style={styles.detailValue}>{inputs.bathrooms}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{lb.property.guests}</Text>
            <Text style={styles.detailValue}>{inputs.maxGuests}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{lb.property.location}</Text>
            <Text style={styles.detailValue}>{inputs.location}</Text>
          </View>
        </View>

        {inputs.amenities && inputs.amenities.length > 0 ? (
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.h3}>{lb.property.amenities}</Text>
            <View style={styles.amenityList}>
              {inputs.amenities.map((a, i) => (
                <View key={i} style={styles.amenityPill}>
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.sectionDivider} />
        <Text style={styles.body}>{data.property_analysis}</Text>
      </ContentPage>

      {/* ── PAGE 5: MARKET ANALYSIS ── */}
      <ContentPage sectionTitle={lb.sections.market} company={company} pageNum={5} totalPages={totalPages} labels={lb}>
        <Text style={styles.body}>{data.location_market_analysis}</Text>
        <View style={styles.sectionDivider} />
        <Text style={styles.h3}>{lb.sections.market} — Comparabili</Text>
        <Text style={styles.body}>{data.comparable_properties}</Text>
      </ContentPage>

      {/* ── PAGE 6: REVENUE PROJECTIONS ── */}
      <ContentPage sectionTitle={lb.sections.revenue} company={company} pageNum={6} totalPages={totalPages} labels={lb}>
        {/* Scenario boxes */}
        <View style={styles.scenarioRow}>
          <View style={[styles.scenarioBox, { backgroundColor: '#F5F5F0', borderWidth: 1, borderColor: '#E0E0D8' }]}>
            <Text style={[styles.scenarioLabel, { color: TEXT_MID }]}>{lb.scenarios.min}</Text>
            <Text style={[styles.scenarioValue, { color: TEXT_MID }]}>{eur(rp.annual_revenue_min)}</Text>
          </View>
          <View style={[styles.scenarioBox, { backgroundColor: DARK, borderWidth: 1, borderColor: GOLD }]}>
            <Text style={[styles.scenarioLabel, { color: GOLD }]}>{lb.scenarios.realistic}</Text>
            <Text style={[styles.scenarioValue, { color: WHITE }]}>{eur(rp.annual_revenue_realistic)}</Text>
          </View>
          <View style={[styles.scenarioBox, { backgroundColor: '#F5F5F0', borderWidth: 1, borderColor: '#E0E0D8' }]}>
            <Text style={[styles.scenarioLabel, { color: TEXT_MID }]}>{lb.scenarios.max}</Text>
            <Text style={[styles.scenarioValue, { color: TEXT_MID }]}>{eur(rp.annual_revenue_max)}</Text>
          </View>
        </View>

        {/* KPI boxes */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>{lb.kpis.occupancy}</Text>
            <Text style={styles.kpiValue}>{pct(rp.occupancy_rate_annual)}</Text>
            <Text style={styles.kpiSub}>Annuale</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>{lb.kpis.adr}</Text>
            <Text style={styles.kpiValue}>{eur(rp.adr)}</Text>
            <Text style={styles.kpiSub}>/ notte</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>{lb.kpis.revpar}</Text>
            <Text style={styles.kpiValue}>{eur(rp.revpar)}</Text>
            <Text style={styles.kpiSub}>/ notte disponibile</Text>
          </View>
        </View>

        {/* Monthly table */}
        {rp.monthly_breakdown && rp.monthly_breakdown.length > 0 ? (
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'left' }]}>{lb.table.month}</Text>
              <Text style={styles.tableHeaderCell}>{lb.table.minRevenue}</Text>
              <Text style={styles.tableHeaderCell}>{lb.table.maxRevenue}</Text>
              <Text style={styles.tableHeaderCell}>{lb.table.occupancy}</Text>
              <Text style={styles.tableHeaderCell}>{lb.table.adr}</Text>
            </View>
            {rp.monthly_breakdown.map((row, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.tableCellBold, { flex: 1.5 }]}>{row.month}</Text>
                <Text style={styles.tableCell}>{eur(row.revenue_min)}</Text>
                <Text style={styles.tableCell}>{eur(row.revenue_max)}</Text>
                <Text style={styles.tableCell}>{pct(row.occupancy_rate)}</Text>
                <Text style={styles.tableCell}>{eur(row.adr)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ContentPage>

      {/* ── PAGE 7: SEASONALITY ── */}
      <ContentPage sectionTitle={lb.sections.seasonality} company={company} pageNum={7} totalPages={totalPages} labels={lb}>
        <Text style={styles.body}>{data.seasonality_analysis}</Text>
      </ContentPage>

      {/* ── PAGE 8: STRATEGY & SUCCESS ── */}
      <ContentPage sectionTitle={lb.sections.strategy} company={company} pageNum={8} totalPages={totalPages} labels={lb}>
        <Text style={styles.body}>{data.recommended_pricing_strategy}</Text>
        <View style={styles.sectionDivider} />
        <Text style={styles.h3}>{lb.sections.success}</Text>
        <Text style={styles.body}>{data.key_success_factors}</Text>
        <View style={styles.sectionDivider} />
        <Text style={styles.body}>{data.risks_and_mitigation}</Text>
      </ContentPage>

      {/* ── PAGE 9: GROWTH & NEXT STEPS ── */}
      <ContentPage sectionTitle={lb.sections.nextSteps} company={company} pageNum={9} totalPages={totalPages} labels={lb}>
        <Text style={styles.body}>{data.growth_projections}</Text>
        <View style={styles.sectionDivider} />
        <Text style={styles.disclaimer}>{lb.disclaimer}</Text>
      </ContentPage>
    </Document>
  );
}
