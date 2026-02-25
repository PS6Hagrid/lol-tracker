-- CreateTable
CREATE TABLE "Summoner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "puuid" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "profileIconId" INTEGER NOT NULL,
    "summonerLevel" INTEGER NOT NULL,
    "lastUpdated" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RankSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summonerId" TEXT NOT NULL,
    "queueType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "lp" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RankSnapshot_summonerId_fkey" FOREIGN KEY ("summonerId") REFERENCES "Summoner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "gameMode" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "gameDuration" INTEGER NOT NULL,
    "gameCreation" DATETIME NOT NULL,
    "gameVersion" TEXT NOT NULL,
    "mapId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "MatchParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "summonerId" TEXT,
    "championId" INTEGER NOT NULL,
    "championName" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "lane" TEXT NOT NULL,
    "win" BOOLEAN NOT NULL,
    CONSTRAINT "MatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatchParticipant_summonerId_fkey" FOREIGN KEY ("summonerId") REFERENCES "Summoner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParticipantStats" (
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
    CONSTRAINT "ParticipantStats_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "MatchParticipant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParticipantItems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "item0" INTEGER NOT NULL,
    "item1" INTEGER NOT NULL,
    "item2" INTEGER NOT NULL,
    "item3" INTEGER NOT NULL,
    "item4" INTEGER NOT NULL,
    "item5" INTEGER NOT NULL,
    "item6" INTEGER NOT NULL,
    "trinket" INTEGER NOT NULL,
    CONSTRAINT "ParticipantItems_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "MatchParticipant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParticipantRunes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "primaryStyle" INTEGER NOT NULL,
    "subStyle" INTEGER NOT NULL,
    "runeSlots" TEXT NOT NULL,
    CONSTRAINT "ParticipantRunes_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "MatchParticipant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchTeam" (
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
    CONSTRAINT "MatchTeam_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchTimeline" (
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
    CONSTRAINT "MatchTimeline_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChampionMastery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summonerId" TEXT NOT NULL,
    "championId" INTEGER NOT NULL,
    "championLevel" INTEGER NOT NULL,
    "masteryPoints" INTEGER NOT NULL,
    "lastPlayTime" DATETIME NOT NULL,
    CONSTRAINT "ChampionMastery_summonerId_fkey" FOREIGN KEY ("summonerId") REFERENCES "Summoner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Summoner_puuid_key" ON "Summoner"("puuid");

-- CreateIndex
CREATE UNIQUE INDEX "Summoner_gameName_tagLine_region_key" ON "Summoner"("gameName", "tagLine", "region");

-- CreateIndex
CREATE UNIQUE INDEX "Match_matchId_key" ON "Match"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantStats_participantId_key" ON "ParticipantStats"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantItems_participantId_key" ON "ParticipantItems"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantRunes_participantId_key" ON "ParticipantRunes"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "ChampionMastery_summonerId_championId_key" ON "ChampionMastery"("summonerId", "championId");
