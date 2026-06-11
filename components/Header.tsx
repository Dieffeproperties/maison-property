'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { BRAND_NAME } from '@/lib/config';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { href: '#services', label: t('services') },
    { href: '#portfolio', label: t('portfolio') },
    { href: '#europe', label: t('europe') },
    { href: '#contact', label: t('contact') },
  ];

  function scrollTo(href: string) {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const isOnDark = !scrolled;

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-40 transition-all duration-500
          ${scrolled
            ? 'bg-ivory/95 backdrop-blur-sm shadow-none border-b border-nude/40'
            : 'bg-transparent border-b border-transparent'
          }
        `}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer"
            aria-label="Back to top"
          >
            <span
              className={`
                font-display text-sm md:text-base font-light tracking-[0.28em] uppercase transition-colors duration-500
                ${isOnDark ? 'text-cream' : 'text-ink'}
              `}
            >
              {BRAND_NAME}
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-12" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => (
              <button
                key={href}
                onClick={() => scrollTo(href)}
                className={`
                  eyebrow cursor-pointer hover:opacity-60 transition-opacity duration-200
                  ${isOnDark ? 'text-cream' : 'text-ink'}
                `}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right side: language + CTA */}
          <div className="flex items-center gap-5 md:gap-6">
            <LanguageSwitcher onDark={isOnDark} />

            {/* CTA — hidden on smallest screens */}
            <button
              onClick={() => scrollTo('#contact')}
              className={`
                hidden lg:block eyebrow border px-4 py-2 cursor-pointer transition-all duration-300
                ${isOnDark
                  ? 'border-cream/30 text-cream hover:bg-cream/10'
                  : 'border-taupe/40 text-ink hover:bg-sand/60'
                }
              `}
            >
              {t('cta')}
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`md:hidden cursor-pointer flex flex-col gap-[5px] p-1 ${isOnDark ? 'text-cream' : 'text-ink'}`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span
                className={`block w-5 h-px bg-current transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`}
              />
              <span
                className={`block w-5 h-px bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`block w-5 h-px bg-current transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`
          fixed inset-0 z-30 bg-espresso flex flex-col justify-center items-center
          transition-all duration-500 ease-in-out
          ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col items-center gap-10" aria-label="Mobile navigation">
          {navLinks.map(({ href, label }, i) => (
            <button
              key={href}
              onClick={() => scrollTo(href)}
              className="font-display text-3xl font-light italic text-cream cursor-pointer hover:text-bronze transition-colors duration-200"
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : '0ms' }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-14">
          <LanguageSwitcher onDark />
        </div>
      </div>
    </>
  );
}
