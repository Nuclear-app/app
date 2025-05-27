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
    select: { note: true },
  });
  
  if (!block?.note) return null;
  
  // Cast the note to JSONContent type
  const html = generateHTML(block.note as JSONContent, [StarterKit])
  return html;
};

export const fetchNotesAsText = async (blockId: string) => {
  const block = await prisma.block.findUnique({
    where: { id: blockId },
    select: { note: true },
  });
  
  if (!block?.note) return null;
  
  const html = generateHTML(block.note as JSONContent, [StarterKit]);
  // Convert HTML to text by stripping tags
  return html.replace(/<[^>]*>/g, '');
};
