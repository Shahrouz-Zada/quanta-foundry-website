-- CreateTable
CREATE TABLE "TeamAudit" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "auditorTeamId" TEXT NOT NULL,
    "auditedTeamId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamAudit_pkey" PRIMARY KEY ("id")
);

-- A team never audits itself (not expressible in the Prisma schema).
ALTER TABLE "TeamAudit" ADD CONSTRAINT "TeamAudit_not_self_check" CHECK ("auditorTeamId" <> "auditedTeamId");

-- CreateIndex
CREATE INDEX "TeamAudit_auditedTeamId_idx" ON "TeamAudit"("auditedTeamId");

-- CreateIndex
CREATE INDEX "TeamAudit_offeringId_idx" ON "TeamAudit"("offeringId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamAudit_auditorTeamId_auditedTeamId_key" ON "TeamAudit"("auditorTeamId", "auditedTeamId");

-- AddForeignKey
ALTER TABLE "TeamAudit" ADD CONSTRAINT "TeamAudit_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAudit" ADD CONSTRAINT "TeamAudit_auditorTeamId_offeringId_fkey" FOREIGN KEY ("auditorTeamId", "offeringId") REFERENCES "Team"("id", "offeringId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAudit" ADD CONSTRAINT "TeamAudit_auditedTeamId_offeringId_fkey" FOREIGN KEY ("auditedTeamId", "offeringId") REFERENCES "Team"("id", "offeringId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAudit" ADD CONSTRAINT "TeamAudit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
