import { getTranslations } from 'next-intl/server';
import HairlineDivider from './ui/HairlineDivider';
import ScrollReveal from './ui/ScrollReveal';

export default async function Manifesto() {
  const t = await getTranslations('manifesto');

  return (
    <section className="bg-ivory py-24 md:py-36 px-6 md:px-10 lg:px-16">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left column: eyebrow + divider */}
          <div className="lg:col-span-3 xl:col-span-2">
            <ScrollReveal>
              <p className="eyebrow text-bronze mb-6">{t('eyebrow')}</p>
              <HairlineDivider className="w-12 opacity-60" />
            </ScrollReveal>
          </div>

          {/* Right column: text */}
          <div className="lg:col-span-9 xl:col-span-10">
            <ScrollReveal delay={0.1}>
              <p
                className="font-display font-light text-ink leading-[1.55] mb-10 md:mb-12"
                style={{ fontSize: 'clamp(1.35rem, 2.4vw, 2rem)' }}
              >
                {t('text')}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p
                className="font-display italic text-bronze"
                style={{ fontSize: 'clamp(1rem, 1.6vw, 1.35rem)' }}
              >
                {t('closing')}
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
