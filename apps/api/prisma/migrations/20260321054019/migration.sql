-- CreateEnum
CREATE TYPE "SpiritualStage" AS ENUM ('NORMAL', 'DIVINE');

-- CreateEnum
CREATE TYPE "DeathState" AS ENUM ('ALIVE', 'DYING', 'DEAD');

-- CreateEnum
CREATE TYPE "DomainMasteryLevel" AS ENUM ('INICIANTE', 'PRATICANTE', 'MESTRE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ItemType" ADD VALUE 'GENERAL';
ALTER TYPE "ItemType" ADD VALUE 'UPGRADE_MATERIAL';

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "baseRD" INTEGER,
ADD COLUMN     "canStack" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "characterId" TEXT,
ADD COLUMN     "materialMaxUpgradeLimit" INTEGER,
ADD COLUMN     "materialTier" INTEGER,
ADD COLUMN     "maxStack" INTEGER NOT NULL DEFAULT 2;

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "inspiration" INTEGER NOT NULL DEFAULT 0,
    "attributes" JSONB NOT NULL,
    "narrativeProfile" JSONB NOT NULL,
    "skills" JSONB NOT NULL,
    "pdaState" JSONB NOT NULL,
    "healthState" JSONB NOT NULL,
    "energyState" JSONB NOT NULL,
    "spiritualPrinciple" JSONB NOT NULL,
    "equipmentSlots" JSONB NOT NULL,
    "inventory" JSONB NOT NULL,
    "conditions" JSONB NOT NULL,
    "deathState" "DeathState" NOT NULL DEFAULT 'ALIVE',
    "deathCounter" INTEGER NOT NULL DEFAULT 0,
    "symbol" TEXT,
    "art" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_powers" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "powerId" TEXT NOT NULL,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "finalPdaCost" INTEGER NOT NULL,
    "slotCost" INTEGER NOT NULL,
    "posicao" INTEGER NOT NULL,

    CONSTRAINT "character_powers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_power_arrays" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "powerArrayId" TEXT NOT NULL,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "finalPdaCost" INTEGER NOT NULL,
    "slotCost" INTEGER NOT NULL,
    "posicao" INTEGER NOT NULL,

    CONSTRAINT "character_power_arrays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_benefits" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degree" INTEGER NOT NULL,
    "pdaCost" INTEGER NOT NULL,
    "posicao" INTEGER NOT NULL,

    CONSTRAINT "character_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_domains" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "masteryLevel" "DomainMasteryLevel" NOT NULL,

    CONSTRAINT "character_domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "characters_userId_idx" ON "characters"("userId");

-- CreateIndex
CREATE INDEX "characters_userId_updatedAt_idx" ON "characters"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "character_powers_characterId_idx" ON "character_powers"("characterId");

-- CreateIndex
CREATE INDEX "character_powers_powerId_idx" ON "character_powers"("powerId");

-- CreateIndex
CREATE UNIQUE INDEX "character_powers_characterId_powerId_key" ON "character_powers"("characterId", "powerId");

-- CreateIndex
CREATE INDEX "character_power_arrays_characterId_idx" ON "character_power_arrays"("characterId");

-- CreateIndex
CREATE INDEX "character_power_arrays_powerArrayId_idx" ON "character_power_arrays"("powerArrayId");

-- CreateIndex
CREATE UNIQUE INDEX "character_power_arrays_characterId_powerArrayId_key" ON "character_power_arrays"("characterId", "powerArrayId");

-- CreateIndex
CREATE INDEX "character_benefits_characterId_idx" ON "character_benefits"("characterId");

-- CreateIndex
CREATE INDEX "character_benefits_name_idx" ON "character_benefits"("name");

-- CreateIndex
CREATE INDEX "character_domains_characterId_idx" ON "character_domains"("characterId");

-- CreateIndex
CREATE INDEX "character_domains_domainId_idx" ON "character_domains"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "character_domains_characterId_domainId_key" ON "character_domains"("characterId", "domainId");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_powers" ADD CONSTRAINT "character_powers_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_powers" ADD CONSTRAINT "character_powers_powerId_fkey" FOREIGN KEY ("powerId") REFERENCES "powers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_power_arrays" ADD CONSTRAINT "character_power_arrays_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_power_arrays" ADD CONSTRAINT "character_power_arrays_powerArrayId_fkey" FOREIGN KEY ("powerArrayId") REFERENCES "power_arrays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_benefits" ADD CONSTRAINT "character_benefits_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_domains" ADD CONSTRAINT "character_domains_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
