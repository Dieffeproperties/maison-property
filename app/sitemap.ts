import { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/config';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://maisonelite.eu';

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: locale === 'en' ? 1.0 : 0.9,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}`])
      ),
    },
  }));
}
