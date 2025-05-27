'use server'

import prisma from "@/lib/prisma";

export async function getNoteContent(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
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