import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'de', 'fr', 'es', 'pt', 'ru', 'ko', 'hu'],
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/', '/(de|en|fr|es|pt|ru|ko|hu)/:path*']
};
