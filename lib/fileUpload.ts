"use server"

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { getBlockFilesWithCache, invalidateBlockCache } from "@/lib/redis";

export const addFile = async (blockId: string, fileName: string) => {
  try {
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      select: { files: true },
    });

    if (!block) {
      throw new Error('Block not found');
    }

    const updatedFiles = [...block.files, fileName];

    await prisma.block.update({
      where: { id: blockId },
      data: { files: updatedFiles },
    });

    // Invalidate cache after update
    await invalidateBlockCache(blockId);

    return updatedFiles;
  } catch (error) {
    console.error('Error adding file:', error);
    throw error;
  }
};

export const fetchFiles = async (blockId: string) => {
  if (!blockId) {
    throw new Error('BlockId is required');
  }

  try {
    const files = await getBlockFilesWithCache(blockId);
    return files;
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
};

export const removeFile = async (blockId: string, fileName: string) => {
  try {
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      select: { files: true },
    });

    if (!block) {
      throw new Error('Block not found');
    }

    const updatedFiles = block.files.filter((file: string) => file !== fileName);

    await prisma.block.update({
      where: { id: blockId },
      data: { files: updatedFiles },
    });

    // Invalidate cache after update
    await invalidateBlockCache(blockId);

    return updatedFiles;
  } catch (error) {
    console.error('Error removing file:', error);
    throw error;
  }
};




