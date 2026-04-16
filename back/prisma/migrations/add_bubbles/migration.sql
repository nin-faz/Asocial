-- CreateTable "Bubble"
CREATE TABLE "Bubble" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bubble_pkey" PRIMARY KEY ("id")
);

-- CreateTable "BubbleMessage"
CREATE TABLE "BubbleMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "bubbleId" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BubbleMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bubble_authorId_idx" ON "Bubble"("authorId");

-- CreateIndex
CREATE INDEX "Bubble_createdAt_idx" ON "Bubble"("createdAt");

-- CreateIndex
CREATE INDEX "BubbleMessage_bubbleId_idx" ON "BubbleMessage"("bubbleId");

-- CreateIndex
CREATE INDEX "BubbleMessage_authorId_idx" ON "BubbleMessage"("authorId");

-- AddForeignKey
ALTER TABLE "Bubble" ADD CONSTRAINT "Bubble_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BubbleMessage" ADD CONSTRAINT "BubbleMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BubbleMessage" ADD CONSTRAINT "BubbleMessage_bubbleId_fkey" FOREIGN KEY ("bubbleId") REFERENCES "Bubble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddColumn to Notification
ALTER TABLE "Notification" ADD COLUMN "bubbleId" TEXT;

-- Update cascade delete constraints for Notification
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_articleId_fkey";
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_commentId_fkey";

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for Notification -> Bubble with cascade
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bubbleId_fkey" FOREIGN KEY ("bubbleId") REFERENCES "Bubble"("id") ON DELETE CASCADE ON UPDATE CASCADE;
