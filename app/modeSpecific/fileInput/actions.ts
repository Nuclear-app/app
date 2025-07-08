"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { generateHTML } from '@tiptap/html'
import { generateExamples } from "@/lib/examplesPerplexity"
import { generateQuizzes } from "@/lib/quizGen"
import { StarterKit } from "@tiptap/starter-kit"
import { generateNotes } from "@/lib/generateNotes"
import { getBlockContext, getBlockNote, setBlockNote, updateBlock } from "@/lib/block"

export async function updateContext(data: { blockId: string, context: string }) {  
  await updateBlock(data.blockId, { context: data.context })
} 

export async function fetchContext(blockId: string): Promise<string> {
  const context = await getBlockContext(blockId)
  return context || '';
}

export async function fetchNotes(blockId: string): Promise<string> {
  try {
    const block = await getBlockNote(blockId)

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
    const updatedBlock = await setBlockNote(blockId, notes)

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
