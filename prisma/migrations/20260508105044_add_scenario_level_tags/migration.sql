-- AlterTable
ALTER TABLE "Scenario" ADD COLUMN     "level" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
