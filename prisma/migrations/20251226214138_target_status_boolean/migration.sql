/*
  Warnings:

  - You are about to drop the column `completedTargets` on the `chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat" DROP COLUMN "completedTargets",
ADD COLUMN     "targetsStatus" BOOLEAN[] DEFAULT ARRAY[]::BOOLEAN[];
