'use client';

import Script from 'next/script';
import { useTranslations } from 'next-intl';
import HairlineDivider from './ui/HairlineDivider';
import ScrollReveal from './ui/ScrollReveal';

const LISTINGS = [
  { id: '1092498631414887208' },
  { id: '1206484359694037707' },
  { id: '1206452186243523560' },
  { id: '1386395758265468386' },
  { id: '1434014330440414479' },
  { id: '1450786724696352168' },
  { id: '1639066798271388145' },
  { id: '1652189617006140336' },
] as const;

const TRACK = [...LISTINGS, ...LISTINGS];

export default function Portfolio() {
  const t = useTranslations('portfolio');

  return (
    <section id="portfolio" className="bg-white py-24 md:py-36" style={{ overflowX: 'hidden' }}>
      {/* Section header */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
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
            <br />
            {t('title_after')}
          </h2>
        </ScrollReveal>
        <HairlineDivider className="mt-12 mb-14 md:mb-18 opacity-40" />
      </div>

      {/* Marquee — mask-gradient fades edges, overflow-x clips horizontal */}
      <div className="marquee-container" style={{ overflowX: 'hidden', overflowY: 'visible' }}>
        <div
          className="marquee-track flex gap-5 items-start"
          style={{ width: 'max-content' }}
        >
          {TRACK.map(({ id }, i) => (
            <div
              key={`${id}-${i}`}
              className="embed-wrapper flex-shrink-0"
              style={{ width: '320px', height: '368px' }}
            >
              <div
                className="airbnb-embed-frame"
                data-id={id}
                data-view="home"
                data-hide-price="true"
                data-hide-reviews="true"
                style={{ width: '320px', height: '368px' }}
              />
            </div>
          ))}
        </div>
      </div>

      <Script
        src="https://www.airbnb.it/embeddable/airbnb_jssdk"
        strategy="afterInteractive"
      />
    </section>
  );
}
