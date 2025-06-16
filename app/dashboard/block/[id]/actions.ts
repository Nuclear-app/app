'use server'

import { fetchContext } from "@/app/modeSpecific/fileInput/actions";
import { generateExamples } from "@/lib/examplesPerplexity";
import prisma from "@/lib/prisma";
import { generateQuizzes } from "@/lib/quizGen";

export async function getNoteContent(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required " + blockId);
  }

  const block = await prisma.block.findUnique({
    where: { id: blockId },
    select: {
      note: true,
    },
  });

  if (!block) {
    throw new Error("Block not found");
  }

  // Return empty editor state if no note exists
  if (!block.note) {
    return JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    });
  }

  return block.note;
}

export async function bgFunction(blockId: string) {
  const content = await fetchContext(blockId);
  generateExamples(content, blockId)
  generateQuizzes(content, blockId)
}