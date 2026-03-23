-- AlterTable
ALTER TABLE "power_arrays" ADD COLUMN     "characterId" TEXT;

-- AlterTable
ALTER TABLE "powers" ADD COLUMN     "characterId" TEXT;

-- CreateIndex
CREATE INDEX "power_arrays_characterId_idx" ON "power_arrays"("characterId");

-- CreateIndex
CREATE INDEX "powers_characterId_idx" ON "powers"("characterId");

-- AddForeignKey
ALTER TABLE "powers" ADD CONSTRAINT "powers_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "power_arrays" ADD CONSTRAINT "power_arrays_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
