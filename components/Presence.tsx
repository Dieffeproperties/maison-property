import { getTranslations } from 'next-intl/server';
import HairlineDivider from './ui/HairlineDivider';
import ScrollReveal from './ui/ScrollReveal';

export default async function Presence() {
  const t = await getTranslations('presence');

  const regions = [
    { key: 'fr', label: t('regions.fr_label'), locations: t('regions.fr_locations') },
    { key: 'it', label: t('regions.it_label'), locations: t('regions.it_locations') },
    { key: 'es', label: t('regions.es_label'), locations: t('regions.es_locations') },
    { key: 'gr', label: t('regions.gr_label'), locations: t('regions.gr_locations') },
    { key: 'pt', label: t('regions.pt_label'), locations: t('regions.pt_locations') },
    { key: 'ch', label: t('regions.ch_label'), locations: t('regions.ch_locations') },
  ] as const;

  return (
    <section id="europe" className="bg-nude py-24 md:py-36 px-6 md:px-10 lg:px-16">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Left: heading */}
          <div className="lg:col-span-5 xl:col-span-4">
            <ScrollReveal>
              <p className="eyebrow text-bronze mb-8">{t('eyebrow')}</p>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <h2
                className="font-display font-light text-ink leading-[1.1] mb-8 md:mb-10"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
              >
                {t('title_before')}{' '}
                <em className="italic">{t('title_italic')}</em>
                <br />
                {t('title_after')}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.14}>
              <HairlineDivider className="w-10 mb-8 opacity-50" />
              <p
                className="font-light text-mist leading-relaxed"
                style={{ fontSize: '0.9375rem', lineHeight: 1.85 }}
              >
                {t('intro')}
              </p>
            </ScrollReveal>
          </div>

          {/* Right: location list */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {regions.map(({ key, label, locations }, i) => (
                <ScrollReveal key={key} delay={0.07 * i}>
                  <div className="border-b border-taupe/25 py-8 sm:px-6 group">
                    <p className="eyebrow text-bronze/60 mb-3">{label}</p>
                    <p
                      className="font-display font-light text-ink group-hover:text-mocha transition-colors duration-300"
                      style={{ fontSize: 'clamp(0.9rem, 1.3vw, 1.1rem)', lineHeight: 1.6 }}
                    >
                      {locations}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
