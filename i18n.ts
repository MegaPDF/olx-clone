import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SUPPORTED_LOCALES } from './lib/constants';

export default getRequestConfig(async ({ locale }: { locale?: string }) => {
  // Validate that the incoming locale is valid
  if (!locale || !SUPPORTED_LOCALES.includes(locale as any)) {
    notFound();
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    locale
  };
});