-- CreateTable
CREATE TABLE "scenario_session" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "assistantName" TEXT NOT NULL DEFAULT 'Assistant',
    "assistantIcon" TEXT,
    "activeStreamId" TEXT,
    "targetsStatus" BOOLEAN[] DEFAULT ARRAY[]::BOOLEAN[],
    "scenarioId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "scenario_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scenario_session_userId_idx" ON "scenario_session"("userId");

-- CreateIndex
CREATE INDEX "scenario_session_scenarioId_idx" ON "scenario_session"("scenarioId");

-- Migrate existing scenario-linked chats to scenario_session
INSERT INTO "scenario_session" (
  "id", "title", "messages", "assistantName", "assistantIcon",
  "activeStreamId", "targetsStatus", "scenarioId", "languageId",
  "createdAt", "updatedAt", "userId"
)
SELECT
  "id", "title", "messages", "assistantName", "assistantIcon",
  "activeStreamId", "targetsStatus", "scenarioId", "languageId",
  "createdAt", "updatedAt", "userId"
FROM "chat"
WHERE "scenarioId" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "scenario_session" ADD CONSTRAINT "scenario_session_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_session" ADD CONSTRAINT "scenario_session_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_session" ADD CONSTRAINT "scenario_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
