/*
  Warnings:

  - Added the required column `fn` to the `SerialLog` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `SerialLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SerialDirection" AS ENUM ('TX', 'RX');

-- AlterTable
ALTER TABLE "Scope" ADD COLUMN     "rootId" TEXT;

-- AlterTable
ALTER TABLE "SerialLog" ADD COLUMN     "fn" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "SerialDirection" NOT NULL;

-- DropEnum
DROP TYPE "SerialType";

-- AddForeignKey
ALTER TABLE "Scope" ADD CONSTRAINT "Scope_rootId_fkey" FOREIGN KEY ("rootId") REFERENCES "Scope"("id") ON DELETE SET NULL ON UPDATE CASCADE;
