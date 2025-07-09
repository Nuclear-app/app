"use server"

import { revalidatePath } from "next/cache";
import { JSONContent } from "novel";
import { createClient } from "@/utils/supabase/server";
import { createBlock, getBlockById, updateBlock as updateBlockLib } from "@/lib/block";


export async function updateBlock(content: JSONContent, blockId?: string) {
  try {
    console.log("updateBlock");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Ensure content is properly serialized
    const serializedContent = JSON.parse(JSON.stringify(content));

    // Try to find existing block
    const existingBlock = blockId ? await getBlockById(blockId) : null;

    if (!blockId) {
      // Create new block
      const newBlock = await createBlock({
        title: "Untitled Note",
        authorId: user.id,
        note: serializedContent,
      })

      revalidatePath("/");
      return {
        success: true,
        isNewBlock: true,
        data: {
          note: serializedContent,
        },
      };
    }

    // Update existing block
    const updatedBlock = await updateBlockLib(blockId, { note: serializedContent });
    revalidatePath("/");
    return {
      success: true,
      isNewBlock: false,
      data: {
        id: updatedBlock.id,
        title: updatedBlock.title,
        note: updatedBlock.note,
      },
    };
  } catch (error) {
    // Ensure we only return a string for the error
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
} 