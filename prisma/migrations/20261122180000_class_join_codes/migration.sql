-- AlterTable: pass code per class (null = joining is off)
ALTER TABLE "Offering" ADD COLUMN "joinCode" TEXT,
ADD COLUMN "joinCodeExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "JoinAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JoinAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Offering_joinCode_key" ON "Offering"("joinCode");

-- CreateIndex
CREATE INDEX "JoinAttempt_userId_createdAt_idx" ON "JoinAttempt"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "JoinAttempt" ADD CONSTRAINT "JoinAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
