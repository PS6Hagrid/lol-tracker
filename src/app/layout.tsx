import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoL Tracker - League of Legends Stats",
  description:
    "Track your League of Legends stats, match history, and rankings.",
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
        <main>{children}</main>
      </body>
    </html>
  );
}
