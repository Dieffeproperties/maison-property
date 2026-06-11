import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import HeroClient from './HeroClient';

export default async function Hero() {
  const t = await getTranslations('hero');

  return (
    <section className="relative w-full h-[100dvh] min-h-[600px] flex items-center overflow-hidden">
      {/* Background image — REPLACE with a licensed hero property image */}
      <Image
        src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2400&q=85"
        alt="Luxury villa with infinity pool overlooking the Mediterranean"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Vertical overlay — depth from top to bottom */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(32, 26, 20, 0.52) 0%,
            rgba(32, 26, 20, 0.48) 45%,
            rgba(32, 26, 20, 0.68) 78%,
            rgba(28, 22, 16, 0.88) 100%
          )`,
        }}
        aria-hidden="true"
      />
      {/* Horizontal overlay — extra depth on the left where text sits */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(
            to right,
            rgba(28, 22, 16, 0.38) 0%,
            rgba(28, 22, 16, 0.18) 40%,
            rgba(28, 22, 16, 0.00) 65%
          )`,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 pt-20">
        <HeroClient
          eyebrow={t('eyebrow')}
          titleBefore={t('title_before')}
          titleItalic={t('title_italic')}
          titleAfter={t('title_after')}
          subtitle={t('subtitle')}
          cta={t('cta')}
          scrollLabel={t('scroll_label')}
        />
      </div>
    </section>
  );
}
