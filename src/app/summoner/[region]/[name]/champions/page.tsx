import { getDataService } from "@/lib/data-service";
import { REGIONS, getChampionNameById, getChampionIconUrl } from "@/lib/constants";
import TabNavigation from "@/components/TabNavigation";
import SummonerHeader from "@/components/SummonerHeader";
import UpdateButton from "@/components/UpdateButton";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import ChampionGrid from "@/components/ChampionGrid";
import type { ChampionStatRow } from "@/components/ChampionGrid";
import type { MatchDTO, ChampionMasteryDTO, LeagueEntryDTO } from "@/types/riot";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

/** Normalize Riot's lane/role fields into a display-friendly position name. */
function getNormalizedRole(lane: string, role: string): string {
  const l = (lane ?? "").toUpperCase();
  const r = (role ?? "").toUpperCase();
  if (l === "TOP") return "Top";
  if (l === "JUNGLE") return "Jungle";
  if (l === "MIDDLE" || l === "MID") return "Mid";
  if (l === "BOTTOM" || l === "BOT") {
    if (r === "SUPPORT" || r === "UTILITY" || r === "DUO_SUPPORT") return "Support";
    return "Bot";
  }
  return l ? l.charAt(0) + l.slice(1).toLowerCase() : "Bot";
}

function getMostPlayedRole(roleCounts: Map<string, number>): string {
  let maxRole = "";
  let maxCount = 0;
  for (const [role, count] of roleCounts) {
    if (count > maxCount) { maxCount = count; maxRole = role; }
  }
  return maxRole;
}

const MULTIKILL_LABELS: Record<number, string> = {
  5: "Penta", 4: "Quadra", 3: "Triple", 2: "Double", 0: "None",
};

/**
 * Aggregate champion stats from match data and merge mastery info.
 */
function aggregateChampionStats(
  matches: MatchDTO[],
  summonerPuuid: string,
  masteries: ChampionMasteryDTO[],
): ChampionStatRow[] {
  const masteryMap = new Map<number, number>();
  for (const m of masteries) {
    masteryMap.set(m.championId, m.championLevel);
  }

  const champMap = new Map<
    string,
    {
      championId: number;
      games: number;
      wins: number;
      totalKills: number;
      totalDeaths: number;
      totalAssists: number;
      totalCS: number;
      totalGold: number;
      totalDuration: number;
      totalDamageToChampions: number;
      totalVisionScore: number;
      roleCounts: Map<string, number>;
      bestMultikill: number;
    }
  >();

  for (const match of matches) {
    const player =
      match.info.participants.find((p) => p.puuid === summonerPuuid) ??
      match.info.participants[0];

    const key = player.championName;
    const existing = champMap.get(key) ?? {
      championId: player.championId,
      games: 0,
      wins: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      totalCS: 0,
      totalGold: 0,
      totalDuration: 0,
      totalDamageToChampions: 0,
      totalVisionScore: 0,
      roleCounts: new Map<string, number>(),
      bestMultikill: 0,
    };

    existing.games++;
    if (player.win) existing.wins++;
    existing.totalKills += player.kills;
    existing.totalDeaths += player.deaths;
    existing.totalAssists += player.assists;
    existing.totalCS += player.totalMinionsKilled + player.neutralMinionsKilled;
    existing.totalGold += player.goldEarned;
    existing.totalDuration += match.info.gameDuration;
    existing.totalDamageToChampions += player.totalDamageDealtToChampions;
    existing.totalVisionScore += player.visionScore;

    const normalizedRole = getNormalizedRole(player.lane, player.role);
    existing.roleCounts.set(normalizedRole, (existing.roleCounts.get(normalizedRole) ?? 0) + 1);

    const matchBestMulti = player.pentaKills > 0 ? 5
      : player.quadraKills > 0 ? 4
      : player.tripleKills > 0 ? 3
      : player.doubleKills > 0 ? 2
      : 0;
    if (matchBestMulti > existing.bestMultikill) existing.bestMultikill = matchBestMulti;

    champMap.set(key, existing);
  }

  const rows: ChampionStatRow[] = [];

  for (const [championName, data] of champMap.entries()) {
    const totalMinutes = data.totalDuration / 60;
    const avgKDA =
      data.totalDeaths === 0
        ? Infinity
        : (data.totalKills + data.totalAssists) / data.totalDeaths;

    rows.push({
      championName,
      championId: data.championId,
      gamesPlayed: data.games,
      wins: data.wins,
      losses: data.games - data.wins,
      winrate: data.games > 0 ? (data.wins / data.games) * 100 : 0,
      avgKills: data.games > 0 ? data.totalKills / data.games : 0,
      avgDeaths: data.games > 0 ? data.totalDeaths / data.games : 0,
      avgAssists: data.games > 0 ? data.totalAssists / data.games : 0,
      avgKDA,
      avgCSPerMin: totalMinutes > 0 ? data.totalCS / totalMinutes : 0,
      avgGoldPerMin: totalMinutes > 0 ? data.totalGold / totalMinutes : 0,
      masteryLevel: masteryMap.get(data.championId) ?? 0,
      avgDamagePerMin: totalMinutes > 0 ? data.totalDamageToChampions / totalMinutes : 0,
      avgVisionScore: data.games > 0 ? data.totalVisionScore / data.games : 0,
      mostPlayedRole: getMostPlayedRole(data.roleCounts),
      bestMultikill: MULTIKILL_LABELS[data.bestMultikill] ?? "None",
    });
  }

  // If no match-based data, use mastery data as fallback
  if (rows.length === 0) {
    for (const m of masteries) {
      const cname = getChampionNameById(m.championId);
      rows.push({
        championName: cname,
        championId: m.championId,
        gamesPlayed: 0, wins: 0, losses: 0, winrate: 0,
        avgKills: 0, avgDeaths: 0, avgAssists: 0, avgKDA: 0,
        avgCSPerMin: 0, avgGoldPerMin: 0,
        masteryLevel: m.championLevel,
        avgDamagePerMin: 0, avgVisionScore: 0, mostPlayedRole: "", bestMultikill: "None",
      });
    }
  } else {
    for (const m of masteries) {
      const existing = rows.find((r) => r.championId === m.championId);
      if (existing) existing.masteryLevel = m.championLevel;
    }
  }

  return rows;
}

function HighlightCards({ champions }: { champions: ChampionStatRow[] }) {
  const withGames = champions.filter((c) => c.gamesPlayed > 0);
  const minGames = withGames.filter((c) => c.gamesPlayed >= 3);
  if (withGames.length === 0) return null;

  const mostPlayed = withGames.reduce((a, b) => (a.gamesPlayed > b.gamesPlayed ? a : b));
  const bestWR = minGames.length > 0
    ? minGames.reduce((a, b) => (a.winrate > b.winrate ? a : b))
    : null;
  const bestKDA = minGames.length > 0
    ? minGames.reduce((a, b) => {
        const aK = a.avgKDA === Infinity ? 999 : a.avgKDA;
        const bK = b.avgKDA === Infinity ? 999 : b.avgKDA;
        return aK > bK ? a : b;
      })
    : null;

  const cards: { label: string; champ: ChampionStatRow; stat: React.ReactNode; hoverClass: string }[] = [
    {
      label: "Most Played",
      champ: mostPlayed,
      stat: (
        <>
          <span className="text-gray-400">{mostPlayed.gamesPlayed} games</span>
          <span className="font-medium" style={{ color: mostPlayed.winrate >= 50 ? "var(--color-win)" : "var(--color-loss)" }}>
            {mostPlayed.winrate.toFixed(0)}% WR
          </span>
        </>
      ),
      hoverClass: "hover:border-cyan/30 hover:shadow-cyan/5",
    },
  ];
  if (bestWR) {
    cards.push({
      label: "Best Winrate",
      champ: bestWR,
      stat: (
        <>
          <span className="font-medium" style={{ color: "var(--color-win)" }}>{bestWR.winrate.toFixed(0)}% WR</span>
          <span className="text-gray-400">{bestWR.gamesPlayed} games</span>
        </>
      ),
      hoverClass: "hover:border-green-500/30 hover:shadow-green-500/5",
    });
  }
  if (bestKDA) {
    cards.push({
      label: "Best KDA",
      champ: bestKDA,
      stat: (
        <>
          <span className="font-bold text-amber-400">
            {bestKDA.avgKDA === Infinity ? "Perfect" : `${bestKDA.avgKDA.toFixed(2)} KDA`}
          </span>
          <span className="text-gray-500">
            {bestKDA.avgKills.toFixed(1)}/{bestKDA.avgDeaths.toFixed(1)}/{bestKDA.avgAssists.toFixed(1)}
          </span>
        </>
      ),
      hoverClass: "hover:border-amber-400/30 hover:shadow-amber-400/5",
    });
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-white">Highlights</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`flex items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${card.hoverClass}`}
          >
            <img
              src={getChampionIconUrl(card.champ.championName)}
              alt={card.champ.championName}
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {card.label}
              </p>
              <p className="truncate text-sm font-medium text-white">
                {card.champ.championName}
              </p>
              <div className="flex items-center gap-2 text-xs">
                {card.stat}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ChampionsPage({ params }: PageProps) {
  const { region, name } = await params;

  // Parse name
  const lastHyphen = name.lastIndexOf("-");
  if (lastHyphen === -1 || lastHyphen === 0 || lastHyphen === name.length - 1) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-8 text-center backdrop-blur-sm">
          <h2 className="text-xl font-bold text-loss">Invalid Summoner Name</h2>
          <p className="mt-2 text-gray-400">
            Expected format: GameName-TagLine (e.g. Faker-KR1)
          </p>
        </div>
      </div>
    );
  }

  const gameName = decodeURIComponent(name.slice(0, lastHyphen));
  const tagLine = decodeURIComponent(name.slice(lastHyphen + 1));

  const dataService = await getDataService();

  let summoner;
  let championRows: ChampionStatRow[] = [];
  let rankedStats: LeagueEntryDTO[] = [];

  try {
    summoner = await dataService.getSummoner(region, gameName, tagLine);

    // Fetch match history, champion masteries, and ranked stats in parallel
    const [matchIds, masteries, ranked] = await Promise.all([
      dataService.getMatchHistory(region, summoner.puuid, 20),
      dataService.getChampionMasteries(region, summoner.puuid),
      dataService.getRankedStats(region, summoner.puuid),
    ]);

    rankedStats = ranked;

    // Fetch match details — uses DB cache for known matches, API for new ones
    const matches: MatchDTO[] = dataService.getMatchDetailsBatch
      ? await dataService.getMatchDetailsBatch(region, matchIds)
      : await Promise.all(matchIds.map((id) => dataService.getMatchDetails(region, id)));

    championRows = aggregateChampionStats(matches, summoner.puuid, masteries);
  } catch (error) {
    console.error("Error fetching summoner data:", error);
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-8 text-center backdrop-blur-sm">
          <h2 className="text-xl font-bold text-loss">Summoner Not Found</h2>
          <p className="mt-2 text-gray-400">
            Could not find &quot;{gameName}#{tagLine}&quot; in{" "}
            {REGIONS.find((r) => r.value === region)?.label ?? region}
          </p>
        </div>
      </div>
    );
  }

  const regionLabel = REGIONS.find((r) => r.value === region)?.label ?? region;
  const basePath = `/summoner/${region}/${name}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Summoner Header */}
      <SummonerHeader
        summoner={summoner}
        regionLabel={regionLabel}
        rankedStats={rankedStats}
        actions={
          <div className="flex items-center gap-1.5">
            <UpdateButton region={region} name={name} />
            <FavoriteButton gameName={summoner.gameName} tagLine={summoner.tagLine} region={region} profileIconId={summoner.profileIconId} />
            <ShareButton />
          </div>
        }
      />

      {/* Tab Navigation */}
      <TabNavigation basePath={basePath} />

      {/* Champions Content */}
      <div className="animate-stagger mt-6 space-y-6">
        {/* Highlight Cards */}
        <HighlightCards champions={championRows} />

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Champion Performance
          </h2>
          <p className="mb-4 text-sm text-gray-400">
            Stats aggregated from recent {championRows.length > 0 ? "matches" : "data"}.
            Click column headers to sort.
          </p>
          <ChampionGrid champions={championRows} />
        </section>
      </div>
    </div>
  );
}
