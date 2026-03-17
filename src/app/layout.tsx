import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import NavSearch from "@/components/NavSearch";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
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
            <Link href="/patch-notes" className="flex flex-col items-center gap-0.5 px-3 py-1 text-text-secondary transition-colors hover:text-text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-[10px] font-medium">Patches</span>
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
          </div>
        </div>
        <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
