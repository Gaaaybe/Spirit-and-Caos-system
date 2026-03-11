-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'DEFENSIVE_EQUIPMENT', 'CONSUMABLE', 'ARTIFACT', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "WeaponRange" AS ENUM ('CORPO_A_CORPO', 'CURTO', 'MEDIO', 'LONGO');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('TRAJE', 'PROTECAO');

-- CreateEnum
CREATE TYPE "DurabilityStatus" AS ENUM ('INTACTO', 'DANIFICADO');

-- CreateEnum
CREATE TYPE "SpoilageState" AS ENUM ('PERFEITA', 'BOA', 'NORMAL', 'RUIM', 'TERRIVEL');

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tipo" "ItemType" NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "durabilidade" "DurabilityStatus" NOT NULL DEFAULT 'INTACTO',
    "domainName" "DomainName" NOT NULL,
    "domainAreaConhecimento" TEXT,
    "domainPeculiarId" TEXT,
    "custoBase" INTEGER NOT NULL,
    "nivelItem" INTEGER NOT NULL DEFAULT 1,
    "maxStack" INTEGER NOT NULL DEFAULT 1,
    "critMargin" INTEGER,
    "critMultiplier" INTEGER,
    "alcance" "WeaponRange",
    "atributoEscalonamento" TEXT,
    "upgradeLevelValue" INTEGER,
    "upgradeLevelMax" INTEGER,
    "tipoEquipamento" "EquipmentType",
    "descritorEfeito" TEXT,
    "qtdDoses" INTEGER,
    "isRefeicao" BOOLEAN,
    "spoilageState" "SpoilageState",
    "isAttuned" BOOLEAN,
    "efeitoPassivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_damages" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "dado" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "espiritual" BOOLEAN NOT NULL DEFAULT false,
    "posicao" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "item_damages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_powers" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "powerId" TEXT NOT NULL,
    "posicao" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "item_powers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "items_userId_idx" ON "items"("userId");

-- CreateIndex
CREATE INDEX "items_tipo_idx" ON "items"("tipo");

-- CreateIndex
CREATE INDEX "items_isPublic_idx" ON "items"("isPublic");

-- CreateIndex
CREATE INDEX "items_userId_isPublic_idx" ON "items"("userId", "isPublic");

-- CreateIndex
CREATE INDEX "items_domainName_idx" ON "items"("domainName");

-- CreateIndex
CREATE INDEX "item_damages_itemId_idx" ON "item_damages"("itemId");

-- CreateIndex
CREATE INDEX "item_powers_itemId_idx" ON "item_powers"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "item_powers_itemId_powerId_key" ON "item_powers"("itemId", "powerId");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_damages" ADD CONSTRAINT "item_damages_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_powers" ADD CONSTRAINT "item_powers_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
