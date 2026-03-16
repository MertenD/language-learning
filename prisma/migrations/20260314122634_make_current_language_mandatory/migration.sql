/*
  Warnings:

  - Made the column `currentLanguageId` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_currentLanguageId_fkey";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "currentLanguageId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_currentLanguageId_fkey" FOREIGN KEY ("currentLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
