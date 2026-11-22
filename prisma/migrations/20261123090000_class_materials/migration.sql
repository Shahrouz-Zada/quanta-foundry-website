-- CreateEnum
CREATE TYPE "MaterialKind" AS ENUM ('DECK', 'PREREAD', 'NOTEBOOK', 'DATASET', 'DOCUMENT', 'LINK');

-- CreateEnum
CREATE TYPE "MaterialLanguage" AS ENUM ('EN', 'FR', 'BOTH');

-- CreateEnum
CREATE TYPE "MaterialAudience" AS ENUM ('STUDENTS', 'STAFF');

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleFr" TEXT,
    "startsAt" TIMESTAMP(3),
    "room" TEXT,
    "materialsReleaseAt" TIMESTAMP(3),
    "offeringSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassMaterial" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "sessionId" TEXT,
    "kind" "MaterialKind" NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleFr" TEXT,
    "language" "MaterialLanguage" NOT NULL DEFAULT 'BOTH',
    "audience" "MaterialAudience" NOT NULL DEFAULT 'STUDENTS',
    "releaseAt" TIMESTAMP(3),
    "downloadable" BOOLEAN NOT NULL DEFAULT true,
    "externalUrl" TEXT,
    "githubUrl" TEXT,
    "publicToken" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassMaterialVersion" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "blobPathname" TEXT NOT NULL,
    "contentType" TEXT,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassMaterialVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassTool" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassTool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassSession_offeringId_number_idx" ON "ClassSession"("offeringId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSession_id_offeringId_key" ON "ClassSession"("id", "offeringId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassMaterial_publicToken_key" ON "ClassMaterial"("publicToken");

-- CreateIndex
CREATE INDEX "ClassMaterial_offeringId_sessionId_order_idx" ON "ClassMaterial"("offeringId", "sessionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ClassMaterialVersion_blobPathname_key" ON "ClassMaterialVersion"("blobPathname");

-- CreateIndex
CREATE INDEX "ClassMaterialVersion_materialId_createdAt_idx" ON "ClassMaterialVersion"("materialId", "createdAt");

-- CreateIndex
CREATE INDEX "ClassTool_offeringId_order_idx" ON "ClassTool"("offeringId", "order");

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_offeringSessionId_fkey" FOREIGN KEY ("offeringSessionId") REFERENCES "OfferingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMaterial" ADD CONSTRAINT "ClassMaterial_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMaterial" ADD CONSTRAINT "ClassMaterial_sessionId_offeringId_fkey" FOREIGN KEY ("sessionId", "offeringId") REFERENCES "ClassSession"("id", "offeringId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMaterialVersion" ADD CONSTRAINT "ClassMaterialVersion_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "ClassMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMaterialVersion" ADD CONSTRAINT "ClassMaterialVersion_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTool" ADD CONSTRAINT "ClassTool_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;
