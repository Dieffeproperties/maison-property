// Single source of truth for the brand name — replace the value below
export const BRAND_NAME = 'MAISON · ÉLITE'; // REPLACE with actual agency name
export const LOCALES = ['en', 'fr', 'it', 'de', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
