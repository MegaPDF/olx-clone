import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'id'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/pathnames': {
      id: '/pfadnamen'
    }
  }
});