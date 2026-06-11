'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { LOCALES, type Locale } from '@/lib/config';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
  it: 'IT',
  de: 'DE',
  es: 'ES',
};

interface LanguageSwitcherProps {
  onDark?: boolean;
}

export default function LanguageSwitcher({ onDark = false }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(next: Locale) {
    setOpen(false);
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        router.push(pathname, { locale: next });
      });
    } else {
      router.push(pathname, { locale: next });
    }
  }

  const textColor = onDark ? 'text-cream' : 'text-ink';
  const borderColor = onDark ? 'border-cream/20' : 'border-taupe/30';
  const dropdownBg = onDark ? 'bg-espresso border-cream/10' : 'bg-ivory border-nude';
  const hoverBg = onDark ? 'hover:bg-mocha' : 'hover:bg-sand';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`eyebrow ${textColor} flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity duration-200 py-1 px-0.5`}
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {LOCALE_LABELS[locale]}
        <svg
          className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Language options"
          className={`absolute right-0 top-full mt-2 border rounded-none shadow-sm ${dropdownBg} overflow-hidden z-50 min-w-[4rem]`}
        >
          {LOCALES.filter((l) => l !== locale).map((l) => (
            <button
              key={l}
              role="option"
              aria-selected={false}
              onClick={() => switchLocale(l)}
              className={`eyebrow ${textColor} block w-full text-center py-2 px-3 ${hoverBg} transition-colors duration-150 cursor-pointer`}
            >
              {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
