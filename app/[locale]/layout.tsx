import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// Components
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { I18nProvider } from "@/providers/i18n-provider";

// Utils
import { getLocalizedMetadata } from "@/lib/utils/i18n";
import type { Locale } from "@/lib/types";

const inter = Inter({ subsets: ["latin"] });

// Valid locales
const locales: Locale[] = ["en", "id"];

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

// Generate metadata for each locale
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale as Locale;

  if (!locales.includes(locale)) {
    notFound();
  }

  const metadata = getLocalizedMetadata(locale);

  return {
    title: {
      default: metadata.title,
      template: `%s | ${metadata.siteName}`,
    },
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      locale: locale === "en" ? "en_US" : "id_ID",
      alternateLocale: locale === "en" ? "id_ID" : "en_US",
      url: `/${locale}`,
      siteName: metadata.siteName,
      type: "website",
      images: [
        {
          url: `/og-image-${locale}.jpg`,
          width: 1200,
          height: 630,
          alt: metadata.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      images: [`/og-image-${locale}.jpg`],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        id: "/id",
        "x-default": "/en",
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale = params.locale as Locale;

  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="alternate" hrefLang="en" href="/en" />
        <link rel="alternate" hrefLang="id" href="/id" />
        <link rel="alternate" hrefLang="x-default" href="/en" />
      </head>
      <body className={inter.className}>
        <I18nProvider locale={locale}>
          <div className="relative flex min-h-screen flex-col">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main id="main-content" className="flex-1">
              {children}
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}

// Revalidate page data every hour for dynamic content
export const revalidate = 3600;
