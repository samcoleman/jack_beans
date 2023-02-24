/*
  Warnings:

  - You are about to drop the `_KioskToScope` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_KioskToScope" DROP CONSTRAINT "_KioskToScope_A_fkey";

-- DropForeignKey
ALTER TABLE "_KioskToScope" DROP CONSTRAINT "_KioskToScope_B_fkey";

-- AlterTable
ALTER TABLE "Kiosk" ADD COLUMN     "scopeId" TEXT;

-- DropTable
DROP TABLE "_KioskToScope";

-- AddForeignKey
ALTER TABLE "Kiosk" ADD CONSTRAINT "Kiosk_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "Scope"("id") ON DELETE CASCADE ON UPDATE CASCADE;
