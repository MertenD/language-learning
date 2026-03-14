/*
  Warnings:

  - You are about to drop the column `german` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `germanInfo` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `serbian` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `serbianInfo` on the `Word` table. All the data in the column will be lost.
  - Added the required column `language` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondary` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `WordCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nativeLanguage` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('GERMAN', 'SERBIAN', 'ENGLISH', 'HUNGARIAN');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('VOCABULARY_ADDED', 'VOCABULARY_MASTERED', 'NEW_VOCABULARY_LEARNED', 'PRACTICE_COMPLETED', 'CHAT_INITIATED', 'SCENARIO_STARTED', 'SCENARIO_COMPLETED', 'GRAMMAR_ADDED', 'LEVEL_UP', 'WORD_CATEGORY_CREATED');

-- AlterTable
ALTER TABLE "Scenario" ADD COLUMN     "language" "Language" NOT NULL;

-- AlterTable
ALTER TABLE "Word" DROP COLUMN "german",
DROP COLUMN "germanInfo",
DROP COLUMN "serbian",
DROP COLUMN "serbianInfo",
ADD COLUMN     "examples" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "language" "Language" NOT NULL,
ADD COLUMN     "primary" TEXT NOT NULL,
ADD COLUMN     "primaryInfo" TEXT,
ADD COLUMN     "secondary" TEXT NOT NULL,
ADD COLUMN     "secondaryInfo" TEXT,
ADD COLUMN     "userLanguageId" TEXT;

-- AlterTable
ALTER TABLE "WordCategory" ADD COLUMN     "language" "Language" NOT NULL;

-- AlterTable
ALTER TABLE "chat" ADD COLUMN     "language" "Language" NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "nativeLanguage" "Language" NOT NULL;

-- CreateTable
CREATE TABLE "UserLanguage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "statsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLanguageStats" (
    "id" TEXT NOT NULL,
    "streakStartedAt" TIMESTAMP(3) NOT NULL,
    "lastActivityAt" TIMESTAMP(3) NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLanguageStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLanguageActivity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userLanguageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLanguageActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordProgress" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "repititions" INTEGER NOT NULL DEFAULT 0,
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,
    "totalIncorrect" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLanguage_userId_language_key" ON "UserLanguage"("userId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "WordProgress_wordId_key" ON "WordProgress"("wordId");

-- AddForeignKey
ALTER TABLE "UserLanguage" ADD CONSTRAINT "UserLanguage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguage" ADD CONSTRAINT "UserLanguage_statsId_fkey" FOREIGN KEY ("statsId") REFERENCES "UserLanguageStats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguageActivity" ADD CONSTRAINT "UserLanguageActivity_userLanguageId_fkey" FOREIGN KEY ("userLanguageId") REFERENCES "UserLanguage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_userLanguageId_fkey" FOREIGN KEY ("userLanguageId") REFERENCES "UserLanguage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordProgress" ADD CONSTRAINT "WordProgress_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
