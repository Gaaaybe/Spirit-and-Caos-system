-- AlterTable
ALTER TABLE "items" ADD COLUMN     "icone" TEXT;

-- AlterTable
ALTER TABLE "peculiarities" ADD COLUMN     "icone" TEXT;

-- AlterTable
ALTER TABLE "power_arrays" ADD COLUMN     "icone" TEXT;

-- AlterTable
ALTER TABLE "powers" ADD COLUMN     "icone" TEXT;

-- CreateTable
CREATE TABLE "item_power_arrays" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "powerArrayId" TEXT NOT NULL,
    "posicao" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "item_power_arrays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "item_power_arrays_itemId_idx" ON "item_power_arrays"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "item_power_arrays_itemId_powerArrayId_key" ON "item_power_arrays"("itemId", "powerArrayId");

-- AddForeignKey
ALTER TABLE "item_power_arrays" ADD CONSTRAINT "item_power_arrays_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_power_arrays" ADD CONSTRAINT "item_power_arrays_powerArrayId_fkey" FOREIGN KEY ("powerArrayId") REFERENCES "power_arrays"("id") ON DELETE CASCADE ON UPDATE CASCADE;
