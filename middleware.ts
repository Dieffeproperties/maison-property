import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

const COUNTRY_TO_LOCALE: Record<string, string> = {
  FR: 'fr',
  MC: 'fr',
  IT: 'it',
  DE: 'de',
  AT: 'de',
  CH: 'de',
  ES: 'es',
};

export default function middleware(request: NextRequest) {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

  if (!cookieLocale) {
    const country = request.headers.get('x-vercel-ip-country');
    if (country) {
      const geoLocale = COUNTRY_TO_LOCALE[country];
      if (geoLocale) {
        const modifiedHeaders = new Headers(request.headers);
        const existing = request.headers.get('accept-language') || 'en';
        modifiedHeaders.set('accept-language', `${geoLocale};q=1.0,${existing}`);
        const modifiedRequest = new Request(request.url, {
          headers: modifiedHeaders,
          method: request.method,
          body: request.body ?? undefined,
        });
        return intlMiddleware(modifiedRequest as NextRequest);
      }
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
