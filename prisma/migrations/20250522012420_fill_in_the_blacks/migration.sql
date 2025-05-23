/*
  Warnings:

  - You are about to drop the column `Note` on the `Block` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Block" DROP COLUMN "Note",
ADD COLUMN     "note" JSONB;

-- CreateTable
CREATE TABLE "FillInTheBlank" (
    "id" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "hint" TEXT,
    "blockId" TEXT NOT NULL,

    CONSTRAINT "FillInTheBlank_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FillInTheBlank" ADD CONSTRAINT "FillInTheBlank_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
