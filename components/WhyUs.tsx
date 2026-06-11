import { getTranslations } from 'next-intl/server';
import HairlineDivider from './ui/HairlineDivider';
import ScrollReveal from './ui/ScrollReveal';

export default async function WhyUs() {
  const t = await getTranslations('whyus');

  const pillars = [
    { key: '01', title: t('items.01_title'), desc: t('items.01_desc') },
    { key: '02', title: t('items.02_title'), desc: t('items.02_desc') },
    { key: '03', title: t('items.03_title'), desc: t('items.03_desc') },
    { key: '04', title: t('items.04_title'), desc: t('items.04_desc') },
  ] as const;

  return (
    <section className="bg-sand py-24 md:py-36 px-6 md:px-10 lg:px-16">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-14 md:mb-20 max-w-2xl">
          <ScrollReveal>
            <p className="eyebrow text-bronze mb-8">{t('eyebrow')}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2
              className="font-display font-light text-ink leading-[1.1]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              {t('title_before')}{' '}
              <em className="italic">{t('title_italic')}</em>{' '}
              {t('title_after')}
            </h2>
          </ScrollReveal>
        </div>

        <HairlineDivider className="mb-14 md:mb-20 opacity-40" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {pillars.map(({ key, title, desc }, i) => (
            <ScrollReveal key={key} delay={0.08 * i}>
              <div className="border-b border-nude/50 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:border-r lg:last:border-r-0 border-nude/50 py-10 sm:py-0 sm:pr-8 lg:pr-10 sm:pl-8 lg:pl-10 first:sm:pl-0 lg:first:pl-0 mb-0">
                <p className="font-display italic text-bronze/40 mb-4" style={{ fontSize: '2.5rem', fontWeight: 300 }}>
                  {key}
                </p>
                <h3
                  className="font-display font-light text-ink mb-4 leading-snug"
                  style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.35rem)' }}
                >
                  {title}
                </h3>
                <HairlineDivider className="w-6 mb-5 opacity-60" />
                <p
                  className="font-light text-mist leading-relaxed"
                  style={{ fontSize: '0.875rem', lineHeight: 1.85 }}
                >
                  {desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
