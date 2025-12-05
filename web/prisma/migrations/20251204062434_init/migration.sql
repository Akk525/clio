-- CreateTable
CREATE TABLE "Artist" (
    "artistId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tokenAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "genre" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ArtistHolder" (
    "artistId" INTEGER NOT NULL,
    "userAddress" TEXT NOT NULL,
    "firstBuyBlock" INTEGER NOT NULL,
    "firstBuyTime" DATETIME NOT NULL,
    "isEarly50" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("artistId", "userAddress"),
    CONSTRAINT "ArtistHolder_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("artistId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArtistStats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "artistId" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "price" TEXT NOT NULL,
    "holderCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "ArtistStats_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("artistId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Badge" (
    "badgeId" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "userAddress" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "artistId" INTEGER NOT NULL DEFAULT 0,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" TEXT,

    PRIMARY KEY ("userAddress", "badgeId", "artistId"),
    CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("badgeId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserBadge_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("artistId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_tokenAddress_key" ON "Artist"("tokenAddress");
