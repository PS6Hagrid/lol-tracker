import { prisma } from "@/lib/db";
import { getProfileIconUrl, REGIONS } from "@/lib/constants";

export default async function TrendingPlayers() {
  const summoners = await prisma.summoner.findMany({
    orderBy: { lastUpdated: "desc" },
    take: 8,
  });

  if (summoners.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12">
      <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-text-muted">
        Recently Searched
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {summoners.map((s) => {
          const href = `/summoner/${encodeURIComponent(s.region)}/${encodeURIComponent(s.gameName)}-${encodeURIComponent(s.tagLine)}`;
          const regionLabel =
            REGIONS.find((r) => r.value === s.region)?.label ?? s.region;

          return (
            <a
              key={s.id}
              href={href}
              className="flex min-w-[160px] shrink-0 items-center gap-3 rounded-xl border border-border-theme bg-bg-card px-4 py-3 transition-all duration-200 hover:border-cyan/30 hover:bg-bg-card/80"
            >
              <img
                src={getProfileIconUrl(s.profileIconId)}
                alt=""
                width={36}
                height={36}
                className="rounded-lg border border-border-theme"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {s.gameName}
                  <span className="text-text-muted">#{s.tagLine}</span>
                </p>
                <p className="text-[10px] font-medium text-cyan/70">{regionLabel}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
