-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "WordCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "WordCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordCategory" ADD CONSTRAINT "WordCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WordCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordCategory" ADD CONSTRAINT "WordCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
