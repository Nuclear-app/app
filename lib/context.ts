'use server';

import prisma from "@/lib/prisma";
import { generateHTML } from '@tiptap/html';
import { JSONContent } from '@tiptap/react';
import Link from '@tiptap/extension-link';
import { StarterKit, TextStyle } from "novel";
import { getFileContextsByBlockId } from './filecontext';

export async function getBlockContext(blockId: string) {
    try {
        // Get all file contexts for this block
        const fileContexts = await getFileContextsByBlockId(blockId);
        
        // Combine all file contexts into one string
        const contextText = fileContexts
            .map(fc => fc.text)
            .filter(text => text && text.trim().length > 0)
            .join('\n\n');
        
        return contextText || null;
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
        // Use all extensions to ensure all content types are properly converted
        const html = generateHTML(block.note as JSONContent, [StarterKit, Link, TextStyle]);
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
    return (context || '') + (note || '');
}

/**
 * Get context for a specific file within a block
 * @param blockId - The block ID
 * @param fileName - The file name
 * @returns Promise<string | null> - The context for the specific file
 */
export async function getFileSpecificContext(blockId: string, fileName: string): Promise<string | null> {
    try {
        const fileContexts = await getFileContextsByBlockId(blockId);
        const fileContext = fileContexts.find(fc => fc.fileName === fileName);
        return fileContext?.text || null;
    } catch (error) {
        console.error('Error fetching file-specific context:', error);
        return null;
    }
}

/**
 * Get all file contexts with their file names for a block
 * @param blockId - The block ID
 * @returns Promise<Array<{fileName: string, text: string}>> - Array of file contexts with names
 */
export async function getFileContextsWithNames(blockId: string): Promise<Array<{fileName: string, text: string}>> {
    try {
        const fileContexts = await getFileContextsByBlockId(blockId);
        return fileContexts.map(fc => ({
            fileName: fc.fileName,
            text: fc.text
        }));
    } catch (error) {
        console.error('Error fetching file contexts with names:', error);
        return [];
    }
}