/*
  Warnings:

  - The primary key for the `UserBadge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `UserBadge` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserBadge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userAddress" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "artistId" INTEGER,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" TEXT,
    CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("badgeId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserBadge_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("artistId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserBadge" ("artistId", "awardedAt", "badgeId", "meta", "userAddress") SELECT "artistId", "awardedAt", "badgeId", "meta", "userAddress" FROM "UserBadge";
DROP TABLE "UserBadge";
ALTER TABLE "new_UserBadge" RENAME TO "UserBadge";
CREATE UNIQUE INDEX "UserBadge_userAddress_badgeId_artistId_key" ON "UserBadge"("userAddress", "badgeId", "artistId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
