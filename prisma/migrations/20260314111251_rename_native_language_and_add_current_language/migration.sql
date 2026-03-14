/*
  Warnings:

  - Renaming column `languageId` to `nativeLanguageId` on table `user`.
  - Added the optional column `currentLanguageId` to the `user` table.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_languageId_fkey";

-- AlterTable
ALTER TABLE "user" RENAME COLUMN "languageId" TO "nativeLanguageId";
ALTER TABLE "user" ADD COLUMN "currentLanguageId" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_nativeLanguageId_fkey" FOREIGN KEY ("nativeLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_currentLanguageId_fkey" FOREIGN KEY ("currentLanguageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

