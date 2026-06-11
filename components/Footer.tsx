import { getTranslations } from 'next-intl/server';
import HairlineDivider from './ui/HairlineDivider';
import LanguageSwitcher from './LanguageSwitcher';
import { BRAND_NAME } from '@/lib/config';

export default async function Footer() {
  const t = await getTranslations('footer');
  const tn = await getTranslations('nav');
  const year = new Date().getFullYear();

  const navLinks = [
    { href: '#services', label: tn('services') },
    { href: '#portfolio', label: tn('portfolio') },
    { href: '#europe', label: tn('europe') },
    { href: '#contact', label: tn('contact') },
  ];

  return (
    <footer className="bg-espresso py-16 md:py-20 px-6 md:px-10 lg:px-16">
      <div className="max-w-[1440px] mx-auto">
        {/* Top row: brand + nav + language */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-14 md:mb-16">
          {/* Brand */}
          <div>
            <p
              className="font-display font-light tracking-[0.28em] uppercase text-cream/90 mb-3"
              style={{ fontSize: '0.85rem' }}
            >
              {BRAND_NAME}
            </p>
            <p
              className="font-light text-cream/40"
              style={{ fontSize: '0.8125rem' }}
            >
              {t('tagline')}
            </p>
          </div>

          {/* Nav */}
          <nav aria-label={t('nav_label')} className="flex flex-wrap gap-x-7 gap-y-3">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="eyebrow text-cream/40 hover:text-cream/80 transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Language switcher */}
          <div>
            <LanguageSwitcher onDark />
          </div>
        </div>

        <HairlineDivider className="opacity-15 mb-10" />

        {/* Bottom row: copyright + legal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="eyebrow text-cream/25" style={{ letterSpacing: '0.15em' }}>
            {t('legal.copyright', { year })}
          </p>
          <div className="flex gap-6">
            <a href="#" className="eyebrow text-cream/30 hover:text-cream/60 transition-colors duration-200">
              {t('legal.privacy')}
            </a>
            <a href="#" className="eyebrow text-cream/30 hover:text-cream/60 transition-colors duration-200">
              {t('legal.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
