/*
  Warnings:

  - You are about to drop the column `efeitoPassivo` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `maxStack` on the `items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "items" DROP COLUMN "efeitoPassivo",
DROP COLUMN "maxStack";
