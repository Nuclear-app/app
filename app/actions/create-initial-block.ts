'use server'

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Block, Mode } from "@/lib/generated/prisma";
import { updatePoints } from "@/lib/blockFetch";

const ROOT_FOLDER_ID = "f2120a35-5e3f-488e-be86-f0753af42e77";

type BlockResponse = {
  success: boolean;
  data?: Block;
  error?: string;
}

export async function createInitialBlock(mode?: Mode): Promise<BlockResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    console.log("This code is touched");
    const block = await prisma.block.create({
      data: {
        title: 'Untitled Note',
        authorId: user.id,
        note: {},
        folderId: ROOT_FOLDER_ID,
        context: null,
        points: 0
      }
    });

    // Set initial points based on mode
    switch (mode) {
      case Mode.EASY:
        // Easy mode starts with 0 points
        break;
      case Mode.MEDIUM:
        // Medium mode starts with 10 points (after fill in blanks)
        await updatePoints(block.id, 10);
        break;
      case Mode.HARD:
        console.log("Hard mode chosen, why isn't this working?");
        // Hard mode starts with 20 points
        await updatePoints(block.id, 20);
        break;
      default:
        // Default to 0 points if no mode specified
        break;
    }

    return { success: true, data: block };
  } catch (error) {
    console.error('Error creating initial block:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create block' };
  }
} 