'use server'

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Block, Mode } from "@prisma/client";
import { updatePoints } from "@/lib/blockFetch";
import { createBlock } from "@/lib/block";

const ROOT_FOLDER_ID = process.env.ROOT_FOLDER_ID || "f2120a35-5e3f-488e-be86-f0753af42e77";

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
    
    const block = await createBlock({
      title: 'Untitled Note',
      authorId: user.id,
      note: {},
      folderId: ROOT_FOLDER_ID,
      points: 0
    });
    return { success: true, data: block };
  } catch (error) {
    console.error('Error creating initial block:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create block' };
  }
} 