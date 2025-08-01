"use server"

import prisma from "@/lib/prisma";
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import { JSONContent } from '@tiptap/react'
import { createInitialBlock } from "@/app/actions/create-initial-block";
import { getBlockPointsWithCache, getBlockWithCache, invalidateBlockCache } from "@/lib/redis";
import { incrementBlockPoints } from "@/lib/block";

export const fetchPoints = async (blockId: string) => {
  const points = await getBlockPointsWithCache(blockId);
  return points;
};

// Server action for client components to fetch points
export async function getPointsAction(blockId: string): Promise<number> {
  try {
    const points = await getBlockPointsWithCache(blockId);
    return points || 0;
  } catch (error) {
    console.error('Error fetching points:', error);
    return 0;
  }
}

export const updatePoints = async (
  blockId: string, 
  points: number
): Promise<{ success: boolean; newPoints: number | null; error?: string }> => {
  return await incrementBlockPoints(blockId, points);
};

export const fetchNotes = async (blockId: string) => {
  const block = await getBlockWithCache(blockId);
  
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