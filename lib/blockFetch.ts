"use server"

import prisma from "@/lib/prisma";
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import { JSONContent } from '@tiptap/react'
import { createInitialBlock } from "@/app/actions/create-initial-block";

export const fetchPoints = async (blockId: string) => {
  const block = await prisma.block.findUnique({
    where: { id: blockId },
    select: { points: true },
  });
  return block?.points ?? 0;
};

export const fetchNotes = async (blockId: string) => {
  const block = await prisma.block.findUnique({
    where: { id: blockId },
    select: { 
      note: true,
      context: true 
    },
  });
  
  if (!block) return null;
  
  let content = '';
  
  // Add context if it exists
  if (block.context) {
    content += block.context;
  }
  
  // Add note content if it exists and is valid JSONContent
  if (block.note) {
    try {
      const html = generateHTML(block.note as JSONContent, [StarterKit]);
      content += '\n\n' + html;
    } catch (error) {
      console.error('Error parsing note content:', error);
    }
  }
  
  return content;
};

export const fetchNotesAsText = async (blockId: string) => {
  const block = await prisma.block.findUnique({
    where: { id: blockId },
    select: { 
      note: true
    },
  });
  
  if (!block || !block.note) return null;
  
  try {
    const html = generateHTML(block.note as JSONContent, [StarterKit]);
    return html.replace(/<[^>]*>/g, '');
  } catch (error) {
    console.error('Error parsing note content:', error);
    return null;
  }
};

export async function getBlockFiles(blockId: string) {
  try {
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      select: { uploadedFiles: true }
    })

    if (!block) {
      throw new Error('Block not found')
    }

    return block.uploadedFiles || []
  } catch (error) {
    console.error('Error fetching block files:', error)
    throw error
  }
}

export async function updateBlockFiles(blockId: string, filePaths: string[]) {
  try {
    // Get the current block to check existing files
    const currentBlock = await prisma.block.findUnique({
      where: { id: blockId },
      select: { uploadedFiles: true }
    })

    if (!currentBlock) {
      throw new Error('Block not found')
    }

    // Combine existing files with new files, removing duplicates
    const existingFiles = currentBlock.uploadedFiles || []
    const updatedFiles = Array.from(new Set([...existingFiles, ...filePaths]))

    // Update the block with the combined file paths
    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: {
        uploadedFiles: updatedFiles
      }
    })

    return updatedBlock
  } catch (error) {
    console.error('Error updating block files:', error)
    throw error
  }
} 