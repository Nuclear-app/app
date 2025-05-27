'use server';

import prisma from "@/lib/prisma";
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { JSONContent } from '@tiptap/react';

export async function getBlockContext(blockId: string) {
    try {
        const block = await prisma.block.findUnique({
            where: { id: blockId },
            select: {
                context: true,
                note: true
            }
        });

        if (!block) return null;

        let content = '';

        // Add context if it exists
        if (block.context) {
            content += block.context;
        }

        return content;
    } catch (error) {
        console.error('Error fetching block context:', error);
        throw new Error('Failed to fetch block context');
    }
} 