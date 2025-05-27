"use server"

import prisma from "@/lib/prisma";
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import { JSONContent } from '@tiptap/react'

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
      content += '\n\n' + html.replace(/<[^>]*>/g, '');
    } catch (error) {
      console.error('Error parsing note content:', error);
    }
  }
  
  return content;
};
