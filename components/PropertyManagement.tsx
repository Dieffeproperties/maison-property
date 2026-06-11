import { getTranslations } from 'next-intl/server';
import HairlineDivider from './ui/HairlineDivider';
import ScrollReveal from './ui/ScrollReveal';

/* ── Thin-stroke SVG icons, bronze, 28×28 ───────────────────────────────── */
const ICONS = [
  /* 01 Distribution & Marketing — globe / broadcast */
  <svg key="icon-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/>
    <path d="M3.6 9h16.8M3.6 15h16.8"/>
    <path d="M12 3a14.5 14.5 0 010 18M12 3a14.5 14.5 0 000 18"/>
  </svg>,

  /* 02 Guest & Tenant Relations — two persons */
  <svg key="icon-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="7" r="3"/>
    <path d="M3 21v-1.5A4.5 4.5 0 017.5 15h3A4.5 4.5 0 0115 19.5V21"/>
    <path d="M16 3.13a4 4 0 010 7.74"/>
    <path d="M21 21v-1.5a4.5 4.5 0 00-3-4.24"/>
  </svg>,

  /* 03 Housekeeping & Maintenance — sparkle / shine */
  <svg key="icon-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l1.8 5.4L19 9l-5.2 3.8L15.6 18 12 14.8 8.4 18l1.8-5.2L5 9l5.2-1.6z"/>
    <path d="M19 19l-1.5-1.5M5 5l1.5 1.5M19 5l-1.5 1.5M5 19l1.5-1.5"/>
  </svg>,

  /* 04 Revenue Optimisation — trending up */
  <svg key="icon-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>,

  /* 05 Compliance & Administration — shield with check */
  <svg key="icon-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l7 3v5c0 5-3 8.5-7 10C8 18.5 5 15 5 10V5l7-3z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>,

  /* 06 Owner Reporting — bar chart */
  <svg key="icon-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="9"/>
    <line x1="12" y1="20" x2="12" y2="3"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
    <line x1="2"  y1="20" x2="22" y2="20"/>
  </svg>,
];

export default async function PropertyManagement() {
  const t = await getTranslations('services');

  const services = [
    { title: t('items.01_title'), desc: t('items.01_desc') },
    { title: t('items.02_title'), desc: t('items.02_desc') },
    { title: t('items.03_title'), desc: t('items.03_desc') },
    { title: t('items.04_title'), desc: t('items.04_desc') },
    { title: t('items.05_title'), desc: t('items.05_desc') },
    { title: t('items.06_title'), desc: t('items.06_desc') },
  ];

  return (
    <section id="services" className="bg-sand py-24 md:py-36 px-6 md:px-10 lg:px-16">
      <div className="max-w-[1440px] mx-auto">
        {/* Section header */}
        <div className="mb-16 md:mb-24">
          <ScrollReveal>
            <p className="eyebrow text-bronze mb-8">{t('eyebrow')}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2
              className="font-display font-light text-ink leading-[1.1]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              {t('title_before')}{' '}
              <em className="italic">{t('title_italic')}</em>
            </h2>
          </ScrollReveal>
        </div>

        <HairlineDivider className="mb-16 md:mb-20 opacity-40" />

        {/* Services grid — equal-height rows via grid + h-full */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const isLastCol  = (i + 1) % 3 === 0;
            const isLastRow  = i >= 3;
            const isMdLastCol = (i + 1) % 2 === 0;
            const isMdLastRow = i >= 4;

            return (
              <ScrollReveal key={i} delay={0.06 * i} className="h-full">
                <div
                  className={[
                    'h-full flex flex-col py-10 md:px-8 lg:px-10',
                    /* right border: all except last column */
                    !isLastCol  ? 'lg:border-r border-nude/50' : '',
                    !isMdLastCol ? 'md:border-r border-nude/50' : '',
                    /* bottom border: all except last row */
                    !isLastRow  ? 'border-b border-nude/50' : '',
                    /* on md, override bottom for last md-row */
                    isMdLastRow ? 'md:border-b-0' : '',
                  ].join(' ')}
                >
                  {/* Icon */}
                  <div className="w-7 h-7 text-bronze/70 mb-6 flex-shrink-0">
                    {ICONS[i]}
                  </div>

                  {/* Title */}
                  <h3
                    className="font-display font-light text-ink mb-4 leading-snug"
                    style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)' }}
                  >
                    {service.title}
                  </h3>

                  {/* Description — pushes icon to top, text fills remaining space */}
                  <p
                    className="font-light text-mist leading-relaxed mt-auto pt-1"
                    style={{ fontSize: '0.875rem', lineHeight: 1.85 }}
                  >
                    {service.desc}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
