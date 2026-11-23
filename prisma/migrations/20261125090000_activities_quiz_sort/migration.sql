-- AlterEnum
ALTER TYPE "ActivityKind" ADD VALUE 'QUIZ';
ALTER TYPE "ActivityKind" ADD VALUE 'CARD_SORT';

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN "modelMaterialId" TEXT,
ADD COLUMN "resultsRevealedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_modelMaterialId_fkey" FOREIGN KEY ("modelMaterialId") REFERENCES "ClassMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
