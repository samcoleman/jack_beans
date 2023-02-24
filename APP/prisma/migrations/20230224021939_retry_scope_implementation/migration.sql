/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_ScopeToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `scopeId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ScopeToUser" DROP CONSTRAINT "_ScopeToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ScopeToUser" DROP CONSTRAINT "_ScopeToUser_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "scopeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_ScopeToUser";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "Scope"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
