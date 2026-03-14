/*
  Warnings:

  - You are about to drop the column `statsId` on the `UserLanguage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userLanguageId]` on the table `UserLanguageStats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userLanguageId` to the `UserLanguageStats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserLanguage" DROP CONSTRAINT "UserLanguage_statsId_fkey";

-- AlterTable
ALTER TABLE "UserLanguage" DROP COLUMN "statsId";

-- AlterTable
ALTER TABLE "UserLanguageStats" ADD COLUMN     "userLanguageId" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "UserLanguageStats_userLanguageId_key" ON "UserLanguageStats"("userLanguageId");

-- AddForeignKey
ALTER TABLE "UserLanguageStats" ADD CONSTRAINT "UserLanguageStats_userLanguageId_fkey" FOREIGN KEY ("userLanguageId") REFERENCES "UserLanguage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
