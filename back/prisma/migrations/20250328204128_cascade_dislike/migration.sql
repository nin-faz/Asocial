-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dislike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "articleId" TEXT,
    "commentId" TEXT,
    CONSTRAINT "Dislike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Dislike_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Dislike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Dislike" ("articleId", "commentId", "id", "userId") SELECT "articleId", "commentId", "id", "userId" FROM "Dislike";
DROP TABLE "Dislike";
ALTER TABLE "new_Dislike" RENAME TO "Dislike";
CREATE UNIQUE INDEX "Dislike_id_key" ON "Dislike"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
