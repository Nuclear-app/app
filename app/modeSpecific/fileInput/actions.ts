"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { generateHTML } from '@tiptap/html'
import { StarterKit } from "@tiptap/starter-kit"
import { generateNotes } from "@/lib/generateNotes"
import { getBlockContext, getBlockNote, setBlockNote, updateBlock } from "@/lib/block"
import { createFileContext, getFileContextsByBlockId } from "@/lib/filecontext"

export async function updateContext(data: { blockId: string, context: string }) {  
  // Create a new file context instead of updating the old context field
  await createFileContext({
    fileName: 'generated-context.txt',
    text: data.context,
    blockId: data.blockId
  });
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

    // Get file contexts and add them to content
    const fileContexts = await getFileContextsByBlockId(blockId);
    const contextText = fileContexts
      .map(fc => fc.text)
      .filter(text => text && text.trim().length > 0)
      .join('\n\n');
    
    if (contextText) {
      content += contextText;
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

console.log(fetchContext("4ef58849-f01e-4651-acae-53042d9c26e0"))
