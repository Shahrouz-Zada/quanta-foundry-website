-- CreateEnum
CREATE TYPE "DiscussionKind" AS ENUM ('TEAM', 'FILE', 'ACTIVITY');

-- CreateTable
CREATE TABLE "DiscussionThread" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "kind" "DiscussionKind" NOT NULL,
    "targetKey" TEXT NOT NULL,
    "teamId" TEXT,
    "fileId" TEXT,
    "activityId" TEXT,
    "ownerKey" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscussionThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "DiscussionMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionRead" (
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscussionRead_pkey" PRIMARY KEY ("threadId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscussionThread_targetKey_key" ON "DiscussionThread"("targetKey");

-- CreateIndex
CREATE INDEX "DiscussionThread_offeringId_kind_idx" ON "DiscussionThread"("offeringId", "kind");

-- CreateIndex
CREATE INDEX "DiscussionThread_teamId_idx" ON "DiscussionThread"("teamId");

-- CreateIndex
CREATE INDEX "DiscussionThread_fileId_idx" ON "DiscussionThread"("fileId");

-- CreateIndex
CREATE INDEX "DiscussionThread_activityId_idx" ON "DiscussionThread"("activityId");

-- CreateIndex
CREATE INDEX "DiscussionMessage_threadId_updatedAt_idx" ON "DiscussionMessage"("threadId", "updatedAt");

-- CreateIndex
CREATE INDEX "DiscussionMessage_threadId_createdAt_idx" ON "DiscussionMessage"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "DiscussionMessage_authorId_createdAt_idx" ON "DiscussionMessage"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "DiscussionRead_userId_idx" ON "DiscussionRead"("userId");

-- AddForeignKey
ALTER TABLE "DiscussionThread" ADD CONSTRAINT "DiscussionThread_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionThread" ADD CONSTRAINT "DiscussionThread_teamId_offeringId_fkey" FOREIGN KEY ("teamId", "offeringId") REFERENCES "Team"("id", "offeringId") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionThread" ADD CONSTRAINT "DiscussionThread_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "StudentFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionThread" ADD CONSTRAINT "DiscussionThread_activityId_offeringId_fkey" FOREIGN KEY ("activityId", "offeringId") REFERENCES "Activity"("id", "offeringId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionMessage" ADD CONSTRAINT "DiscussionMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "DiscussionThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionMessage" ADD CONSTRAINT "DiscussionMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionRead" ADD CONSTRAINT "DiscussionRead_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "DiscussionThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionRead" ADD CONSTRAINT "DiscussionRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
