-- CreateEnum
CREATE TYPE "ActivityKind" AS ENUM ('SHORT_ANSWER', 'FORM', 'FILE', 'LINK');

-- CreateEnum
CREATE TYPE "ActivitySubmitter" AS ENUM ('TEAM', 'INDIVIDUAL');

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "sessionId" TEXT,
    "kind" "ActivityKind" NOT NULL,
    "submitter" "ActivitySubmitter" NOT NULL DEFAULT 'TEAM',
    "titleEn" TEXT NOT NULL,
    "titleFr" TEXT,
    "instructionsEn" TEXT NOT NULL DEFAULT '',
    "instructionsFr" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "opensAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "allowLate" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySubmission" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "teamId" TEXT,
    "userId" TEXT,
    "ownerKey" TEXT NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "submittedAt" TIMESTAMP(3),
    "lastSavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSavedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivitySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySubmissionVersion" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivitySubmissionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySubmissionFile" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fileVersionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivitySubmissionFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_offeringId_sessionId_order_idx" ON "Activity"("offeringId", "sessionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_id_offeringId_key" ON "Activity"("id", "offeringId");

-- CreateIndex
CREATE INDEX "ActivitySubmission_offeringId_idx" ON "ActivitySubmission"("offeringId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySubmission_activityId_ownerKey_key" ON "ActivitySubmission"("activityId", "ownerKey");

-- CreateIndex
CREATE INDEX "ActivitySubmissionVersion_submissionId_createdAt_idx" ON "ActivitySubmissionVersion"("submissionId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivitySubmissionFile_fileVersionId_idx" ON "ActivitySubmissionFile"("fileVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySubmissionFile_submissionId_fileVersionId_key" ON "ActivitySubmissionFile"("submissionId", "fileVersionId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_sessionId_offeringId_fkey" FOREIGN KEY ("sessionId", "offeringId") REFERENCES "ClassSession"("id", "offeringId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_activityId_offeringId_fkey" FOREIGN KEY ("activityId", "offeringId") REFERENCES "Activity"("id", "offeringId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_teamId_offeringId_fkey" FOREIGN KEY ("teamId", "offeringId") REFERENCES "Team"("id", "offeringId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySubmissionVersion" ADD CONSTRAINT "ActivitySubmissionVersion_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ActivitySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySubmissionVersion" ADD CONSTRAINT "ActivitySubmissionVersion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySubmissionFile" ADD CONSTRAINT "ActivitySubmissionFile_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ActivitySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySubmissionFile" ADD CONSTRAINT "ActivitySubmissionFile_fileVersionId_fkey" FOREIGN KEY ("fileVersionId") REFERENCES "StudentFileVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
