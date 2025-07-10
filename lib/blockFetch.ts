"use server"

import prisma from "@/lib/prisma";
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import { JSONContent } from '@tiptap/react'
import { createInitialBlock } from "@/app/actions/create-initial-block";
import { getBlockPointsWithCache, getBlockWithCache, invalidateBlockCache } from "@/lib/redis";

export const fetchPoints = async (blockId: string) => {
  const points = await getBlockPointsWithCache(blockId);
  return points;
};

export const updatePoints = async (
  blockId: string, 
  points: number
): Promise<{ success: boolean; newPoints: number | null; error?: string }> => {
  try {
    // Get current points
    const currentBlock = await prisma.block.findUnique({
      where: { id: blockId },
      select: { points: true }
    });

    if (!currentBlock) {
      return { success: false, newPoints: null, error: 'Block not found' };
    }

    // Update points in database
    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: { 
        points: {
          increment: points
        }
      },
      select: { points: true }
    });

    // Create a PointsUpdate record for real-time tracking
    await prisma.pointsUpdate.create({
      data: {
        blockId,
        points,
      }
    });

    return { 
      success: true, 
      newPoints: updatedBlock.points 
    };
  } catch (error: unknown) {
    console.error('Error updating points:', error);
    return { 
      success: false, 
      newPoints: null, 
      error: error instanceof Error ? error.message : 'Failed to update points' 
    };
  }
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