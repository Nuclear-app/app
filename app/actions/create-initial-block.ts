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

    return { success: true, data: block };
  } catch (error) {
    console.error('Error creating initial block:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create block' };
  }
} 