/*
  Warnings:

  - A unique constraint covering the columns `[userId,articleId]` on the table `Dislike` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- CreateIndex
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt");

-- CreateIndex
CREATE INDEX "Article_authorId_createdAt_idx" ON "Article"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_articleId_idx" ON "Comment"("articleId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Dislike_articleId_idx" ON "Dislike"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "Dislike_userId_articleId_key" ON "Dislike"("userId", "articleId");
