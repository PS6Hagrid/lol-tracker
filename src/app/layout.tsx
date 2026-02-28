import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import NavSearch from "@/components/NavSearch";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <nav className="sticky top-0 z-50 border-b border-gray-700/50 bg-bg-page/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80"
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
        <footer className="border-t border-gray-800/50 py-6">
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
