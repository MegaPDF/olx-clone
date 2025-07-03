import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Providers
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { ModalProvider } from "@/providers/modal-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "OLX Clone - Buy & Sell Everything",
    template: "%s | OLX Clone",
  },
  description:
    "The best place to buy and sell everything in your local area. Find great deals on electronics, vehicles, home & garden, fashion and more.",
  keywords: [
    "buy",
    "sell",
    "marketplace",
    "classifieds",
    "electronics",
    "vehicles",
    "furniture",
    "fashion",
    "Indonesia",
  ],
  authors: [{ name: "OLX Clone Team" }],
  creator: "OLX Clone",
  publisher: "OLX Clone",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      id: "/id",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "OLX Clone - Buy & Sell Everything",
    description:
      "The best place to buy and sell everything in your local area.",
    siteName: "OLX Clone",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OLX Clone - Buy & Sell Everything",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OLX Clone - Buy & Sell Everything",
    description:
      "The best place to buy and sell everything in your local area.",
    images: ["/og-image.jpg"],
    creator: "@olxclone",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#000000",
      },
    ],
  },
  manifest: "/site.webmanifest",
  category: "marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <div id="root">
          <AuthProvider>
            <ThemeProvider defaultTheme="system">
              <QueryProvider>
                <ToastProvider>
                  <ModalProvider>
                    <div className="relative flex min-h-screen flex-col">
                      <div className="flex-1">{children}</div>
                    </div>

                    {/* Toast container */}
                    <Toaster />

                    {/* Modal container */}
                    <div id="modal-root" />
                  </ModalProvider>
                </ToastProvider>
              </QueryProvider>
            </ThemeProvider>
          </AuthProvider>
        </div>

        {/* Analytics */}
        {/* <Analytics /> */}

        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
        >
          Skip to content
        </a>
      </body>
    </html>
  );
}
