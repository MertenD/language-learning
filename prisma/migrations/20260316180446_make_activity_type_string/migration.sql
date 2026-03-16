/*
  Warnings:

  - Changed the type of `type` on the `UserLanguageActivity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "UserLanguageActivity" ALTER COLUMN "type" TYPE TEXT USING "type"::text;

-- DropEnum
DROP TYPE "ActivityType";
