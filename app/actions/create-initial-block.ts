'use server'

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Block } from "@/lib/generated/prisma";

const ROOT_FOLDER_ID = "58b06f68-4d5b-4eef-8a5a-8f83de7a0aba";

type BlockResponse = {
  success: boolean;
  data?: Block;
  error?: string;
}

export async function createInitialBlock(mode: 'sandbox' | 'campaign' | 'story'): Promise<BlockResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

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