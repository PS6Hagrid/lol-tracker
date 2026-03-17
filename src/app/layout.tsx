import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import NavSearch from "@/components/NavSearch";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import TopLoadingBar from "@/components/TopLoadingBar";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { I18nProvider } from "@/i18n/context";
import { ToastProvider } from "@/components/Toast";
import LanguageToggle from "@/components/LanguageToggle";
import CookieConsent from "@/components/CookieConsent";
import WhatsNew from "@/components/WhatsNew";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const BASE_URL = "https://trackerino.gg";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Trackerino — League of Legends Stats",
    template: "%s — Trackerino",
  },
  description:
    "Track League of Legends stats, match history, ranked progress, champion mastery, and live games for any summoner.",
  keywords: ["League of Legends", "LoL", "stats", "tracker", "match history", "ranked", "Trackerino"],
  openGraph: {
    type: "website",
    siteName: "Trackerino",
    title: "Trackerino — League of Legends Stats",
    description:
      "Search any summoner to view ranked stats, match history, champion performance, and live games.",
    url: BASE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trackerino — League of Legends Stats",
    description:
      "Search any summoner to view ranked stats, match history, champion performance, and live games.",
  },
  alternates: {
    canonical: "https://trackerino.gg",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Trackerino",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e17",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://ddragon.leagueoflegends.com" />
        <link rel="dns-prefetch" href="https://ddragon.leagueoflegends.com" />
        <link rel="preconnect" href="https://raw.communitydragon.org" />
        <link rel="dns-prefetch" href="https://raw.communitydragon.org" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Trackerino",
              url: "https://trackerino.gg",
              description:
                "Search any League of Legends summoner to view ranked stats, match history, live game, and more.",
              applicationCategory: "GameApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} bg-bg-page text-text-primary overflow-x-hidden antialiased`}>
        <ThemeProvider>
        <I18nProvider>
        <ToastProvider>
        <TopLoadingBar />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
        >
          Skip to content
        </a>
        <nav className="sticky top-0 z-50 border-b border-border-theme bg-bg-page/80 backdrop-blur-md" role="navigation" aria-label="Main navigation">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80"
              aria-label="Trackerino Home"
            >
              <span className="text-xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">
                  Tracker
                </span>
                <span className="text-white">ino</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/champions"
                className="hidden text-xs font-medium text-text-secondary transition-colors hover:text-text-primary sm:block"
              >
                Champions
              </Link>
              <Link
                href="/patch-notes"
                className="hidden text-xs font-medium text-text-secondary transition-colors hover:text-text-primary sm:block"
              >
                Patch Notes
              </Link>
              <Link
                href="/builds"
                className="hidden text-xs font-medium text-text-secondary transition-colors hover:text-text-primary sm:block"
              >
                Builds
              </Link>
              <Link
                href="/runes"
                className="hidden text-xs font-medium text-text-secondary transition-colors hover:text-text-primary sm:block"
              >
                Runes
              </Link>
              <Link
                href="/leaderboard"
                className="hidden text-xs font-medium text-text-secondary transition-colors hover:text-text-primary sm:block"
              >
                Leaderboard
              </Link>
              <Link
                href="/multi"
                className="hidden text-xs font-medium text-text-secondary transition-colors hover:text-text-primary sm:block"
              >
                Multi-Search
              </Link>
              <Link
                href="/compare"
                className="hidden text-xs font-medium text-text-secondary transition-colors hover:text-text-primary sm:block"
              >
                Compare
              </Link>
              <WhatsNew />
              <Link
                href="/settings"
                className="hidden h-8 w-8 items-center justify-center rounded-full bg-bg-card-hover text-text-secondary transition-colors hover:text-text-primary sm:flex"
                aria-label="Settings"
                title="Settings"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              <LanguageToggle />
              <ThemeToggle />
              <NavSearch />
            </div>
          </div>
        </nav>
        <main id="main-content" className="min-h-[calc(100vh-3.5rem-3rem)]">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-theme bg-bg-page/95 backdrop-blur-md sm:hidden" role="navigation" aria-label="Mobile navigation">
          <div className="flex items-center justify-around py-2">
            <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1 text-text-secondary transition-colors hover:text-text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link href="/champions" className="flex flex-col items-center gap-0.5 px-3 py-1 text-text-secondary transition-colors hover:text-text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <span className="text-[10px] font-medium">Champions</span>
            </Link>
            <Link href="/builds" className="flex flex-col items-center gap-0.5 px-3 py-1 text-text-secondary transition-colors hover:text-text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.049.58.025 1.194-.14 1.743" />
              </svg>
              <span className="text-[10px] font-medium">Builds</span>
            </Link>
            <Link href="/runes" className="flex flex-col items-center gap-0.5 px-3 py-1 text-text-secondary transition-colors hover:text-text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
              <span className="text-[10px] font-medium">Runes</span>
            </Link>
            <Link href="/leaderboard" className="flex flex-col items-center gap-0.5 px-3 py-1 text-text-secondary transition-colors hover:text-text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.672 6.023 6.023 0 01-2.77-.672" />
              </svg>
              <span className="text-[10px] font-medium">Leaderboard</span>
            </Link>
            <Link href="/multi" className="flex flex-col items-center gap-0.5 px-3 py-1 text-text-secondary transition-colors hover:text-text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <span className="text-[10px] font-medium">Multi</span>
            </Link>
            <Link href="/compare" className="flex flex-col items-center gap-0.5 px-3 py-1 text-text-secondary transition-colors hover:text-text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              <span className="text-[10px] font-medium">Compare</span>
            </Link>
          </div>
        </div>
        <ScrollToTop />
        <CookieConsent />
        </ToastProvider>
        </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
