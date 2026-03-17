import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/champions", label: "Champions" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/multi", label: "Multi-Search" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border-theme bg-bg-card py-8 px-4 pb-14 sm:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6">
        {/* Row 1 - Links */}
        <nav className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Row 2 - Disclaimer */}
        <p className="max-w-2xl text-center text-xs leading-relaxed text-text-muted">
          Trackerino isn&apos;t endorsed by Riot Games and doesn&apos;t reflect
          the views or opinions of Riot Games or anyone officially involved in
          producing or managing Riot Games properties. Riot Games, and all
          associated properties are trademarks or registered trademarks of Riot
          Games, Inc.
        </p>

        {/* Row 3 - Copyright + credits */}
        <p className="text-xs text-text-muted">
          &copy; 2024-2026 Trackerino. Built with Next.js.
        </p>
      </div>
    </footer>
  );
}
