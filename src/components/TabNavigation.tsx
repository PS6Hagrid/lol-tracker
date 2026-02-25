"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  label: string;
  href: string;
}

interface TabNavigationProps {
  basePath: string; // e.g. "/summoner/kr/Faker-KR1"
}

export default function TabNavigation({ basePath }: TabNavigationProps) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    { label: "Overview", href: basePath },
    { label: "Matches", href: `${basePath}/matches` },
    { label: "Champions", href: `${basePath}/champions` },
    { label: "Live Game", href: `${basePath}/live` },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-gray-700/50">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href === basePath && pathname === basePath + "/");

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "border-cyan text-cyan"
                : "border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
