'use server'; // Temporarily commented out for testing

import prisma from "@/lib/prisma";
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { JSONContent } from '@tiptap/react';

export async function getBlockContext(blockId: string) {
    try {
        const block = await prisma.block.findUnique({
            where: { id: blockId },
            select: {
                context: true
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

export async function getNoteContent(blockId: string): Promise<string> {
    try {
        const block = await prisma.block.findUnique({
            where: { id: blockId },
            select: { note: true }
        });

        if (!block || !block.note) {
            return '';
        }

        // Convert JSON note content to HTML and then to plain text
        const html = generateHTML(block.note as JSONContent, [StarterKit, Link]);
        const plainText = html.replace(/<[^>]*>/g, '');
        
        return plainText;
    } catch (error) {
        console.error('Error fetching note content:', error);
        return '';
    }
}

export async function getFullContext(blockId: string) {
    const context = await getBlockContext(blockId);
    const note = await getNoteContent(blockId);
    return context + note;
}

// // Test function - you can call this from a client component or API route
// async function testGetFullContext(blockId: string) {
//     try {
//         const result = await getFullContext(blockId);
//         console.log('Context:', await getBlockContext(blockId));
//         console.log('Note:', await getNoteContent(blockId));
//         console.log('Full result:', result);
//         return result;
//     } catch (error) {
//         console.error('Test failed:', error);
//         throw error;
//     }
// }

// // Simple test call
// testGetFullContext("4ef58849-f01e-4651-acae-53042d9c26e0").then(result => {
//     console.log("Test completed successfully:", result);
// }).catch(error => {
//     console.log("Test failed:", error);
// });