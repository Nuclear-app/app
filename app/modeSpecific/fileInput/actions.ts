"use server"

import prisma from "@/lib/prisma"
import { generateHTML } from '@tiptap/html'
import { StarterKit } from "@tiptap/starter-kit"
import { generateNotes } from "@/lib/generateNotes"

export async function updateContext(data: { blockId: string, context: string }) {  
  await prisma.block.update({
    where: { id: data.blockId },
    data: { context: data.context }
  })
} 

export async function fetchContext(blockId: string): Promise<string> {
  const block = await prisma.block.findUnique({
    where: { id: blockId },
    select: { context: true }
  });
  return block?.context || '';
}

export async function fetchNotes(blockId: string): Promise<string> {
  try {
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      select: {
        note: true,
        context: true,
      }
    });

    if (!block) {
      return '';
    }

    let content = '';

    // Convert note JSON to HTML if it exists
    if (block.note) {
      const html = generateHTML(block.note as any, [StarterKit]);
      // Strip HTML tags to get plain text
      content += html.replace(/<[^>]*>/g, '') + '\n\n';
    }

    // Add context if it exists
    if (block.context) {
      content += block.context;
    }

    return content.trim();
  } catch (error) {
    console.error('Error fetching notes:', error);
    return '';
  }
}

export async function saveGeneratedNotes(blockId: string) {
  try {
    // Generate notes using the context
    const notes = await generateNotes(blockId);

    // Update the block with the generated notes
    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: { note: notes },
    });

    return { success: true, data: updatedBlock };
  } catch (error) {
    console.error('Error saving generated notes:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save generated notes' 
    };
  }
}

// const blockId = "3dcebc5d-4087-4b14-8cd2-6e074b0baf2b"
// const context = "This is a test context"

// updateContext({ blockId, context })

console.log(fetchContext("4ef58849-f01e-4651-acae-53042d9c26e0"))
