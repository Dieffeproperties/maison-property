import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import HairlineDivider from './ui/HairlineDivider';
import ScrollReveal from './ui/ScrollReveal';

export default async function Accessories() {
  const t = await getTranslations('accessories');

  const items = [
    { key: '01', title: t('items.01_title'), desc: t('items.01_desc') },
    { key: '02', title: t('items.02_title'), desc: t('items.02_desc') },
    { key: '03', title: t('items.03_title'), desc: t('items.03_desc') },
    { key: '04', title: t('items.04_title'), desc: t('items.04_desc') },
    { key: '05', title: t('items.05_title'), desc: t('items.05_desc') },
  ] as const;

  return (
    <section className="bg-mocha py-24 md:py-36 px-6 md:px-10 lg:px-16 overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          {/* Left: text content */}
          <div className="lg:col-span-6 xl:col-span-5">
            <ScrollReveal>
              <p className="eyebrow text-bronze mb-8">{t('eyebrow')}</p>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <h2
                className="font-display font-light text-cream leading-[1.1] mb-6 md:mb-8"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
              >
                {t('title_before')}{' '}
                <em className="italic">{t('title_italic')}</em>
                <br />
                {t('title_after')}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.14}>
              <p
                className="font-light text-cream/60 leading-relaxed mb-14 md:mb-16"
                style={{ fontSize: '0.9375rem' }}
              >
                {t('subtitle')}
              </p>
            </ScrollReveal>

            <HairlineDivider className="mb-12 md:mb-14 opacity-25" />

            <div className="space-y-0">
              {items.map(({ key, title, desc }, i) => (
                <ScrollReveal key={key} delay={0.1 + i * 0.07}>
                  <div className="border-b border-cream/10 py-8 group">
                    <div className="flex items-start gap-5">
                      <span className="eyebrow text-bronze/50 mt-1 flex-shrink-0">{key}</span>
                      <div>
                        <h3
                          className="font-display font-light text-cream mb-2.5 group-hover:text-bronze transition-colors duration-300"
                          style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.25rem)' }}
                        >
                          {title}
                        </h3>
                        <p
                          className="font-light text-cream/50 leading-relaxed"
                          style={{ fontSize: '0.85rem', lineHeight: 1.85 }}
                        >
                          {desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Right: image */}
          <div className="lg:col-span-6 xl:col-span-7 relative">
            <ScrollReveal delay={0.2} direction="fade">
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                {/* REPLACE with a licensed luxury interior image */}
                <Image
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=85"
                  alt="Luxury villa interior with refined furnishings"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-center"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(74,63,53,0.5) 0%, transparent 60%)' }}
                  aria-hidden="true"
                />
              </div>
              <div
                className="absolute -bottom-4 -right-4 w-24 h-24 border border-bronze/25 pointer-events-none"
                aria-hidden="true"
              />
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
