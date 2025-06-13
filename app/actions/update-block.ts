'use server'

import prisma from "@/lib/prisma";
import { JSONContent } from "novel";
import { createClient } from "@/utils/supabase/server";

export async function updateBlock(content: JSONContent, blockId?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Ensure content is properly serialized
    const serializedContent = JSON.parse(JSON.stringify(content));

    // Try to find existing block
    const existingBlock = blockId ? await prisma.block.findUnique({
      where: { id: blockId },
    }) : null;

    let updatedBlock;
    
    if (!existingBlock) {
      // Create new block if it doesn't exist
      updatedBlock = await prisma.block.create({
        data: {
          title: "Untitled Note", // Default title
          authorId: user.id,
          note: serializedContent,
        },
      });
      return { success: true, data: updatedBlock, isNewBlock: true };
    } else {
      // Update existing block
      updatedBlock = await prisma.block.update({
        where: {
          id: blockId,
        },
        data: {
          note: serializedContent,
        },
      });
      return { success: true, data: updatedBlock, isNewBlock: false, id: updatedBlock.id };
    }
  } catch (error) {
    console.error('Error saving block:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save block' };
  }
} 