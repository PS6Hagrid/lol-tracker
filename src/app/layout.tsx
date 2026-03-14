import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import NavSearch from "@/components/NavSearch";
import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const BASE_URL = "https://lol-one-hazel.vercel.app";

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
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <nav className="sticky top-0 z-50 border-b border-gray-700/50 bg-bg-page/80 backdrop-blur-md" role="navigation" aria-label="Main navigation">
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
                href="/multi"
                className="hidden text-xs font-medium text-gray-400 transition-colors hover:text-white sm:block"
              >
                Multi-Search
              </Link>
              <NavSearch />
            </div>
          </div>
        </nav>
        <main className="min-h-[calc(100vh-3.5rem-3rem)]">{children}</main>
        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-700/50 bg-bg-page/95 backdrop-blur-md sm:hidden" role="navigation" aria-label="Mobile navigation">
          <div className="flex items-center justify-around py-2">
            <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 transition-colors hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link href="/multi" className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 transition-colors hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <span className="text-[10px] font-medium">Multi</span>
            </Link>
          </div>
        </div>
        <ScrollToTop />
        <footer className="border-t border-gray-800/50 pb-16 pt-6 sm:pb-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-center text-xs text-gray-600">
            <p>
              Trackerino &bull; Data from{" "}
              <a
                href="https://developer.riotgames.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition-colors hover:text-gray-400"
              >
                Riot Games API
              </a>
            </p>
            <p className="max-w-2xl leading-relaxed text-gray-700">
              Trackerino isn&apos;t endorsed by Riot Games and doesn&apos;t
              reflect the views or opinions of Riot Games or anyone officially
              involved in producing or managing Riot Games properties. Riot
              Games, and all associated properties are trademarks or registered
              trademarks of Riot Games, Inc.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
