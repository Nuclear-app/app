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
