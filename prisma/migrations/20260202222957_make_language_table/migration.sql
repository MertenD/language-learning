/*
  Warnings:

  - You are about to drop the column `language` on the `Scenario` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `UserLanguage` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `WordCategory` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `nativeLanguage` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,languageId]` on the table `UserLanguage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `languageId` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageId` to the `UserLanguage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageId` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageId` to the `WordCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageId` to the `chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageId` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserLanguage_userId_language_key";

-- AlterTable
ALTER TABLE "Scenario" DROP COLUMN "language",
ADD COLUMN     "languageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserLanguage" DROP COLUMN "language",
ADD COLUMN     "languageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Word" DROP COLUMN "language",
ADD COLUMN     "languageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WordCategory" DROP COLUMN "language",
ADD COLUMN     "languageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "chat" DROP COLUMN "language",
ADD COLUMN     "languageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "nativeLanguage",
ADD COLUMN     "languageId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Language";

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flagEmoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserLanguage_userId_languageId_key" ON "UserLanguage"("userId", "languageId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguage" ADD CONSTRAINT "UserLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordCategory" ADD CONSTRAINT "WordCategory_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
