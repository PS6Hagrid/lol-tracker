/*
  Warnings:

  - You are about to drop the column `trinket` on the `ParticipantItems` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChampionMastery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summonerId" TEXT NOT NULL,
    "championId" INTEGER NOT NULL,
    "championLevel" INTEGER NOT NULL,
    "masteryPoints" INTEGER NOT NULL,
    "lastPlayTime" DATETIME NOT NULL,
    CONSTRAINT "ChampionMastery_summonerId_fkey" FOREIGN KEY ("summonerId") REFERENCES "Summoner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChampionMastery" ("championId", "championLevel", "id", "lastPlayTime", "masteryPoints", "summonerId") SELECT "championId", "championLevel", "id", "lastPlayTime", "masteryPoints", "summonerId" FROM "ChampionMastery";
DROP TABLE "ChampionMastery";
ALTER TABLE "new_ChampionMastery" RENAME TO "ChampionMastery";
CREATE INDEX "ChampionMastery_summonerId_idx" ON "ChampionMastery"("summonerId");
CREATE UNIQUE INDEX "ChampionMastery_summonerId_championId_key" ON "ChampionMastery"("summonerId", "championId");
CREATE TABLE "new_MatchParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "summonerId" TEXT,
    "championId" INTEGER NOT NULL,
    "championName" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "lane" TEXT NOT NULL,
    "win" BOOLEAN NOT NULL,
    CONSTRAINT "MatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchParticipant_summonerId_fkey" FOREIGN KEY ("summonerId") REFERENCES "Summoner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MatchParticipant" ("championId", "championName", "id", "lane", "matchId", "role", "summonerId", "teamId", "win") SELECT "championId", "championName", "id", "lane", "matchId", "role", "summonerId", "teamId", "win" FROM "MatchParticipant";
DROP TABLE "MatchParticipant";
ALTER TABLE "new_MatchParticipant" RENAME TO "MatchParticipant";
CREATE INDEX "MatchParticipant_matchId_idx" ON "MatchParticipant"("matchId");
CREATE INDEX "MatchParticipant_summonerId_idx" ON "MatchParticipant"("summonerId");
CREATE INDEX "MatchParticipant_championId_idx" ON "MatchParticipant"("championId");
CREATE TABLE "new_MatchTeam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "win" BOOLEAN NOT NULL,
    "baronKills" INTEGER NOT NULL,
    "dragonKills" INTEGER NOT NULL,
    "riftHeraldKills" INTEGER NOT NULL,
    "towerKills" INTEGER NOT NULL,
    "inhibitorKills" INTEGER NOT NULL,
    "bans" TEXT NOT NULL,
    CONSTRAINT "MatchTeam_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MatchTeam" ("bans", "baronKills", "dragonKills", "id", "inhibitorKills", "matchId", "riftHeraldKills", "teamId", "towerKills", "win") SELECT "bans", "baronKills", "dragonKills", "id", "inhibitorKills", "matchId", "riftHeraldKills", "teamId", "towerKills", "win" FROM "MatchTeam";
DROP TABLE "MatchTeam";
ALTER TABLE "new_MatchTeam" RENAME TO "MatchTeam";
CREATE INDEX "MatchTeam_matchId_idx" ON "MatchTeam"("matchId");
CREATE TABLE "new_MatchTimeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "participantId" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "gold" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "cs" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,
    CONSTRAINT "MatchTimeline_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MatchTimeline" ("cs", "gold", "id", "level", "matchId", "participantId", "positionX", "positionY", "timestamp", "xp") SELECT "cs", "gold", "id", "level", "matchId", "participantId", "positionX", "positionY", "timestamp", "xp" FROM "MatchTimeline";
DROP TABLE "MatchTimeline";
ALTER TABLE "new_MatchTimeline" RENAME TO "MatchTimeline";
CREATE INDEX "MatchTimeline_matchId_idx" ON "MatchTimeline"("matchId");
CREATE INDEX "MatchTimeline_matchId_participantId_idx" ON "MatchTimeline"("matchId", "participantId");
CREATE TABLE "new_ParticipantItems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "item0" INTEGER NOT NULL,
    "item1" INTEGER NOT NULL,
    "item2" INTEGER NOT NULL,
    "item3" INTEGER NOT NULL,
    "item4" INTEGER NOT NULL,
    "item5" INTEGER NOT NULL,
    "item6" INTEGER NOT NULL,
    CONSTRAINT "ParticipantItems_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "MatchParticipant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ParticipantItems" ("id", "item0", "item1", "item2", "item3", "item4", "item5", "item6", "participantId") SELECT "id", "item0", "item1", "item2", "item3", "item4", "item5", "item6", "participantId" FROM "ParticipantItems";
DROP TABLE "ParticipantItems";
ALTER TABLE "new_ParticipantItems" RENAME TO "ParticipantItems";
CREATE UNIQUE INDEX "ParticipantItems_participantId_key" ON "ParticipantItems"("participantId");
CREATE TABLE "new_ParticipantRunes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "primaryStyle" INTEGER NOT NULL,
    "subStyle" INTEGER NOT NULL,
    "runeSlots" TEXT NOT NULL,
    CONSTRAINT "ParticipantRunes_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "MatchParticipant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ParticipantRunes" ("id", "participantId", "primaryStyle", "runeSlots", "subStyle") SELECT "id", "participantId", "primaryStyle", "runeSlots", "subStyle" FROM "ParticipantRunes";
DROP TABLE "ParticipantRunes";
ALTER TABLE "new_ParticipantRunes" RENAME TO "ParticipantRunes";
CREATE UNIQUE INDEX "ParticipantRunes_participantId_key" ON "ParticipantRunes"("participantId");
CREATE TABLE "new_ParticipantStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "cs" INTEGER NOT NULL,
    "goldEarned" INTEGER NOT NULL,
    "visionScore" INTEGER NOT NULL,
    "wardsPlaced" INTEGER NOT NULL,
    "wardsKilled" INTEGER NOT NULL,
    "totalDamageDealt" INTEGER NOT NULL,
    "totalDamageToChampions" INTEGER NOT NULL,
    "physicalDamage" INTEGER NOT NULL,
    "magicDamage" INTEGER NOT NULL,
    "trueDamage" INTEGER NOT NULL,
    "damageTaken" INTEGER NOT NULL,
    "totalHeal" INTEGER NOT NULL,
    "turretDamage" INTEGER NOT NULL,
    "objectiveDamage" INTEGER NOT NULL,
    "doubleKills" INTEGER NOT NULL,
    "tripleKills" INTEGER NOT NULL,
    "quadraKills" INTEGER NOT NULL,
    "pentaKills" INTEGER NOT NULL,
    "firstBlood" BOOLEAN NOT NULL,
    "longestTimeSpentLiving" INTEGER NOT NULL,
    CONSTRAINT "ParticipantStats_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "MatchParticipant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ParticipantStats" ("assists", "cs", "damageTaken", "deaths", "doubleKills", "firstBlood", "goldEarned", "id", "kills", "longestTimeSpentLiving", "magicDamage", "objectiveDamage", "participantId", "pentaKills", "physicalDamage", "quadraKills", "totalDamageDealt", "totalDamageToChampions", "totalHeal", "tripleKills", "trueDamage", "turretDamage", "visionScore", "wardsKilled", "wardsPlaced") SELECT "assists", "cs", "damageTaken", "deaths", "doubleKills", "firstBlood", "goldEarned", "id", "kills", "longestTimeSpentLiving", "magicDamage", "objectiveDamage", "participantId", "pentaKills", "physicalDamage", "quadraKills", "totalDamageDealt", "totalDamageToChampions", "totalHeal", "tripleKills", "trueDamage", "turretDamage", "visionScore", "wardsKilled", "wardsPlaced" FROM "ParticipantStats";
DROP TABLE "ParticipantStats";
ALTER TABLE "new_ParticipantStats" RENAME TO "ParticipantStats";
CREATE UNIQUE INDEX "ParticipantStats_participantId_key" ON "ParticipantStats"("participantId");
CREATE TABLE "new_RankSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summonerId" TEXT NOT NULL,
    "queueType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "lp" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RankSnapshot_summonerId_fkey" FOREIGN KEY ("summonerId") REFERENCES "Summoner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RankSnapshot" ("id", "losses", "lp", "queueType", "rank", "summonerId", "tier", "timestamp", "wins") SELECT "id", "losses", "lp", "queueType", "rank", "summonerId", "tier", "timestamp", "wins" FROM "RankSnapshot";
DROP TABLE "RankSnapshot";
ALTER TABLE "new_RankSnapshot" RENAME TO "RankSnapshot";
CREATE INDEX "RankSnapshot_summonerId_idx" ON "RankSnapshot"("summonerId");
CREATE INDEX "RankSnapshot_timestamp_idx" ON "RankSnapshot"("timestamp");
CREATE TABLE "new_Summoner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "puuid" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "profileIconId" INTEGER NOT NULL,
    "summonerLevel" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" DATETIME NOT NULL
);
INSERT INTO "new_Summoner" ("gameName", "id", "lastUpdated", "profileIconId", "puuid", "region", "summonerLevel", "tagLine") SELECT "gameName", "id", "lastUpdated", "profileIconId", "puuid", "region", "summonerLevel", "tagLine" FROM "Summoner";
DROP TABLE "Summoner";
ALTER TABLE "new_Summoner" RENAME TO "Summoner";
CREATE UNIQUE INDEX "Summoner_puuid_key" ON "Summoner"("puuid");
CREATE UNIQUE INDEX "Summoner_gameName_tagLine_region_key" ON "Summoner"("gameName", "tagLine", "region");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
