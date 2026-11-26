-- AlterTable
ALTER TABLE "Offering" ADD COLUMN     "dataDeleteAfter" TIMESTAMP(3),
ADD COLUMN     "dataDeletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Offering_dataDeleteAfter_idx" ON "Offering"("dataDeleteAfter");
