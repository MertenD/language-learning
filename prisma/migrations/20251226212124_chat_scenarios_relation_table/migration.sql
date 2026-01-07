/*
  Warnings:

  - You are about to drop the column `scenarioId` on the `chat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "chat" DROP CONSTRAINT "chat_scenarioId_fkey";

-- AlterTable
ALTER TABLE "chat" DROP COLUMN "scenarioId";

-- CreateTable
CREATE TABLE "chat_scenario" (
    "chatId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "completedTargets" INTEGER[],
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_scenario_pkey" PRIMARY KEY ("chatId","scenarioId")
);

-- AddForeignKey
ALTER TABLE "chat_scenario" ADD CONSTRAINT "chat_scenario_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_scenario" ADD CONSTRAINT "chat_scenario_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
