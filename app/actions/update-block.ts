'use server'

import prisma from "@/lib/prisma";
import { JSONContent } from "novel";
import { createClient } from "@/utils/supabase/server";

export async function updateBlock( content: JSONContent, blockId?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Try to find existing block
    const existingBlock = await prisma.block.findUnique({
      where: { id: blockId },
    });

    let updatedBlock;
    
    if (!existingBlock) {
      // Create new block if it doesn't exist
      updatedBlock = await prisma.block.create({
        data: {
          id: blockId,
          title: "Untitled Note", // Default title
          authorId: user.id,
          Note: content as any,
        },
      });
    } else {
      // Update existing block
      updatedBlock = await prisma.block.update({
        where: {
          id: blockId,
        },
        data: {
          Note: content as any,
        },
      });
    }

    return { success: true, data: updatedBlock };
  } catch (error) {
    console.error('Error saving block:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save block' };
  }
} 