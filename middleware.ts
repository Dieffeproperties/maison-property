import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

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
    if (country && COUNTRY_TO_LOCALE[country]) {
      const geoLocale = COUNTRY_TO_LOCALE[country];
      const url = request.nextUrl.clone();
      // Redirect to geo-detected locale path if at root
      if (url.pathname === '/' || url.pathname === '') {
        url.pathname = `/${geoLocale}`;
        const response = NextResponse.redirect(url);
        response.cookies.set('NEXT_LOCALE', geoLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
        return response;
      }
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!admin-immobiliare|api|_next|_vercel|.*\\..*).*)'],
};
