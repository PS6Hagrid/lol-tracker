import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoL Tracker — League of Legends Stats",
  description:
    "Track League of Legends stats, match history, ranked progress, champion mastery, and live games for any summoner.",
  keywords: ["League of Legends", "LoL", "stats", "tracker", "match history", "ranked"],
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
          <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80"
            >
              <span className="text-xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent">
                  LoL
                </span>
                <span className="text-white"> Tracker</span>
              </span>
            </Link>
          </div>
        </nav>
        <main className="min-h-[calc(100vh-3.5rem-3rem)]">{children}</main>
        <footer className="border-t border-gray-800/50 py-4">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-1 px-4 text-xs text-gray-600">
            <p>
              Built with Next.js &bull; Data from{" "}
              <a
                href="https://developer.riotgames.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition-colors hover:text-gray-400"
              >
                Riot Games API
              </a>
            </p>
            <p>
              LoL Tracker is not endorsed by Riot Games and does not reflect the
              views or opinions of Riot Games.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
