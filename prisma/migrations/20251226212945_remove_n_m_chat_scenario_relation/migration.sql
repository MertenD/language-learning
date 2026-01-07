/*
  Warnings:

  - You are about to drop the `chat_scenario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "chat_scenario" DROP CONSTRAINT "chat_scenario_chatId_fkey";

-- DropForeignKey
ALTER TABLE "chat_scenario" DROP CONSTRAINT "chat_scenario_scenarioId_fkey";

-- AlterTable
ALTER TABLE "chat" ADD COLUMN     "completedTargets" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "scenarioId" TEXT;

-- DropTable
DROP TABLE "chat_scenario";

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
