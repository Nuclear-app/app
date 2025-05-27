"use server"

import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'

export async function updateContext(data: { blockId: string, context: string }) {  
  await prisma.block.update({
    where: { id: data.blockId },
    data: { context: data.context }
  })
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

// const blockId = "3dcebc5d-4087-4b14-8cd2-6e074b0baf2b"
// const context = "This is a test context"

// updateContext({ blockId, context })

console.log(fetchNotes("bf41b6db-315e-470c-a142-41bbce71dfac"))