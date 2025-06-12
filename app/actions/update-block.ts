"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { JSONContent } from "novel";
import { createClient } from "@/utils/supabase/server";

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

    console.log(content);

    if (!blockId) {
      // Create new block
      const newBlock = await prisma.block.create({
        data: {
          title: "Untitled Note",
          authorId: user.id,
          note: content as any,
        },
      });
      revalidatePath("/");
      return {
        success: true,
        isNewBlock: true,
        data: {
          id: newBlock.id,
          title: newBlock.title,
          note: newBlock.note,
        },
      };
    }

    // Update existing block
    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: { note: content as any },
    });
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