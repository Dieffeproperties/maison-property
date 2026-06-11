import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { BRAND_NAME, LOCALES } from '@/lib/config';
import '@/app/globals.css';

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-cormorant-var',
  display: 'swap',
});

const jost = Jost({
  weight: ['300', '400', '500'],
  style: ['normal'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jost-var',
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://maisonelite.eu';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: {
      default: `${BRAND_NAME} — ${t('title')}`,
      template: `%s — ${BRAND_NAME}`,
    },
    description: t('description'),
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}`])
      ),
    },
    openGraph: {
      type: 'website',
      locale,
      siteName: BRAND_NAME,
      title: t('og_title'),
      description: t('og_description'),
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: BRAND_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('og_title'),
      description: t('og_description'),
    },
    robots: { index: true, follow: true },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${jost.variable}`}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
