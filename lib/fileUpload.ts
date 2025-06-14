"use server"

import prisma from "@/lib/prisma";

export const addFile = async (blockId: string, fileName: string) => {
  if (!blockId || !fileName) {
    throw new Error('BlockId and fileName are required');
  }

  try {
    // Check if block exists first
    const existingBlock = await prisma.block.findUnique({
      where: { id: blockId }
    });

    if (!existingBlock) {
      throw new Error('Block not found');
    }

    const block = await prisma.block.update({
      where: { id: blockId },
      data: { files: { push: fileName } },
    });
    return block;
  } catch (error) {
    console.error('Error adding file to block:', error);
    throw error;
  }
};

export const removeFile = async (blockId: string, fileName: string) => {
  if (!blockId || !fileName) {
    throw new Error('BlockId and fileName are required');
  }

  try {
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      select: { files: true }
    });

    if (!block) {
      throw new Error('Block not found');
    }

    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: {
        files: block.files.filter(file => file !== fileName)
      },
    });
    return updatedBlock;
  } catch (error) {
    console.error('Error removing file from block:', error);
    throw error;
  }
};



