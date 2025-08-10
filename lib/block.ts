import prisma from './prisma'
import { Block, User, Folder } from '@prisma/client'
import { createClient } from '@supabase/supabase-js';
import { invalidateBlockCache } from './redis';

const ROOT_FOLDER_ID = process.env.ROOT_FOLDER_ID ;

/**
 * Custom error class for Block operations
 */
export class BlockError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'BlockError'
  }
}

/**
 * Block model operations
 * Provides type-safe CRUD operations for the Block model
 */

// ==================== GETTERS ====================

/**
 * Get a block by its ID
 * @param id - The block's unique identifier
 * @returns Promise<Block | null> - The block object or null if not found
 */
export async function getBlockById(id: string): Promise<Block | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    const block = await prisma.block.findUnique({
      where: { id }
    })

    return block
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get block by ID: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

export async function getTopLevelBlocks(userId: string): Promise<Block[]> {
  try {
    const blocks = await prisma.block.findMany({
      where: { folderId: ROOT_FOLDER_ID, authorId: userId },
      orderBy: { createdAt: 'desc' }
    })

    return blocks
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get top level blocks: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all blocks
 * @returns Promise<Block[]> - Array of all blocks
 */
export async function getAllBlocks(): Promise<Block[]> {
  try {
    const blocks = await prisma.block.findMany()
    return blocks
  } catch (error) {
    throw new BlockError(`Failed to get all blocks: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get block count
 * @returns Promise<number> - Total number of blocks
 */
export async function getBlockCount(): Promise<number> {
  try {
    const count = await prisma.block.count()
    return count
  } catch (error) {
    throw new BlockError(`Failed to get block count: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COUNT_ERROR')
  }
}

/**
 * Get block's title
 * @param id - The block's unique identifier
 * @returns Promise<string | null> - The block's title or null if not found
 */
export async function getBlockTitle(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    const block = await prisma.block.findUnique({
      where: { id },
      select: { title: true }
    })

    return block?.title || null
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get block title: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get block's context (deprecated - use getFileContextsByBlockId from filecontext.ts instead)
 * @param id - The block's unique identifier
 * @returns Promise<string | null> - The block's context or null if not found
 * @deprecated Use getFileContextsByBlockId from filecontext.ts for new implementations
 */
export async function getBlockContext(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    // Import the new file context function
    const { getFileContextsByBlockId } = await import('./filecontext');
    const fileContexts = await getFileContextsByBlockId(id);
    
    // Combine all file contexts into one string
    const contextText = fileContexts
      .map(fc => fc.text)
      .filter(text => text && text.trim().length > 0)
      .join('\n\n');
    
    return contextText || null;
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get block context: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get block's points
 * @param id - The block's unique identifier
 * @returns Promise<number | null> - The block's points or null if not found
 */
export async function getBlockPoints(id: string): Promise<number | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    const block = await prisma.block.findUnique({
      where: { id },
      select: { points: true }
    })

    return block?.points || null
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get block points: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get block's files
 * @param id - The block's unique identifier
 * @returns Promise<string[] | null> - The block's files array or null if not found
 */
export async function getBlockFiles(id: string): Promise<string[] | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    const block = await prisma.block.findUnique({
      where: { id },
      select: { files: true }
    })

    return block?.files || null
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get block files: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get block's note
 * @param id - The block's unique identifier
 * @returns Promise<any | null> - The block object with note, or null if not found
 */
export async function getBlockNote(id: string): Promise<{note: any} | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    const block = await prisma.block.findUnique({
      where: { id },
      select: { note: true }
    })

    return block
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get block note: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get block's creation date
 * @param id - The block's unique identifier
 * @returns Promise<Date | null> - The block's creation date or null if not found
 */
export async function getBlockCreatedAt(id: string): Promise<Date | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    const block = await prisma.block.findUnique({
      where: { id },
      select: { createdAt: true }
    })

    return block?.createdAt || null
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get block creation date: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== SETTERS ====================

/**
 * Update block by ID
 * @param id - The block's unique identifier
 * @param data - Partial block data to update
 * @returns Promise<Block> - The updated block object
 */
export async function updateBlock(id: string, data: {
  title?: string
  points?: number
  files?: string[]
  note?: any
  folderId?: string | null
}): Promise<Block> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    // Validate title if provided
    if (data.title && (typeof data.title !== 'string' || data.title.trim().length === 0)) {
      throw new BlockError('Title cannot be empty', 'INVALID_TITLE')
    }

    // Validate points if provided
    if (data.points !== undefined && (typeof data.points !== 'number' || data.points < 0)) {
      throw new BlockError('Points must be a non-negative number', 'INVALID_POINTS')
    }

    const block = await prisma.block.update({
      where: { id },
      data
    })

    return block
  } catch (error) {
    if (error instanceof BlockError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new BlockError('Block not found', 'NOT_FOUND')
    }
    throw new BlockError(`Failed to update block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set block's title
 * @param id - The block's unique identifier
 * @param title - The new title
 * @returns Promise<Block> - The updated block object
 */
export async function setBlockTitle(id: string, title: string): Promise<Block> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new BlockError('Title cannot be empty', 'INVALID_TITLE')
    }

    const block = await prisma.block.update({
      where: { id },
      data: { title: title.trim() }
    })

    return block
  } catch (error) {
    if (error instanceof BlockError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new BlockError('Block not found', 'NOT_FOUND')
    }
    throw new BlockError(`Failed to set block title: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set block's context (deprecated - use createFileContext from filecontext.ts instead)
 * @param id - The block's unique identifier
 * @param context - The new context
 * @returns Promise<Block> - The updated block object
 * @deprecated Use createFileContext from filecontext.ts for new implementations
 */
export async function setBlockContext(id: string, context: string): Promise<Block> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    if (typeof context !== 'string') {
      throw new BlockError('Context must be a string', 'INVALID_CONTEXT')
    }

    // For backward compatibility, we'll create a generic file context
    const { createFileContext } = await import('./filecontext');
    await createFileContext({
      fileName: 'legacy-context.txt',
      text: context,
      blockId: id
    });

    // Return the block (we can't update the old context field anymore)
    const block = await prisma.block.findUnique({
      where: { id }
    });

    if (!block) {
      throw new BlockError('Block not found', 'NOT_FOUND')
    }

    return block;
  } catch (error) {
    if (error instanceof BlockError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new BlockError('Block not found', 'NOT_FOUND')
    }
    throw new BlockError(`Failed to set block context: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set block's points
 * @param id - The block's unique identifier
 * @param points - The new points value
 * @returns Promise<Block> - The updated block object
 */
export async function setBlockPoints(id: string, points: number): Promise<Block> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    if (typeof points !== 'number' || points < 0) {
      throw new BlockError('Points must be a non-negative number', 'INVALID_POINTS')
    }

    const block = await prisma.block.update({
      where: { id },
      data: { points }
    })

    return block
  } catch (error) {
    if (error instanceof BlockError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new BlockError('Block not found', 'NOT_FOUND')
    }
    throw new BlockError(`Failed to set block points: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set block's files
 * @param id - The block's unique identifier
 * @param files - The new files array
 * @returns Promise<Block> - The updated block object
 */
export async function setBlockFiles(id: string, files: string[]): Promise<Block> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    if (!Array.isArray(files)) {
      throw new BlockError('Files must be an array', 'INVALID_FILES')
    }

    // Validate that all files are strings
    if (!files.every(file => typeof file === 'string')) {
      throw new BlockError('All files must be strings', 'INVALID_FILES')
    }

    const block = await prisma.block.update({
      where: { id },
      data: { files }
    })

    return block
  } catch (error) {
    if (error instanceof BlockError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new BlockError('Block not found', 'NOT_FOUND')
    }
    throw new BlockError(`Failed to set block files: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Add file to block
 * @param id - The block's unique identifier
 * @param file - The file to add
 * @returns Promise<Block> - The updated block object
 */
export async function addBlockFile(id: string, file: string): Promise<Block> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    if (typeof file !== 'string') {
      throw new BlockError('File must be a string', 'INVALID_FILE')
    }

    const block = await prisma.block.update({
      where: { id },
      data: {
        files: {
          push: file
        }
      }
    })

    return block
  } catch (error) {
    if (error instanceof BlockError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new BlockError('Block not found', 'NOT_FOUND')
    }
    throw new BlockError(`Failed to add block file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Remove file from block
 * @param id - The block's unique identifier
 * @param file - The file to remove
 * @returns Promise<Block> - The updated block object
 */
export async function removeBlockFile(id: string, file: string): Promise<Block> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    if (typeof file !== 'string') {
      throw new BlockError('File must be a string', 'INVALID_FILE')
    }

    const currentBlock = await prisma.block.findUnique({
      where: { id },
      select: { files: true }
    })

    if (!currentBlock) {
      throw new BlockError('Block not found', 'NOT_FOUND')
    }

    const updatedFiles = currentBlock.files.filter(f => f !== file)

    const block = await prisma.block.update({
      where: { id },
      data: { files: updatedFiles }
    })

    return block
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to remove block file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set block's note
 * @param id - The block's unique identifier
 * @param note - The new note
 * @returns Promise<Block> - The updated block object
 */
export async function setBlockNote(id: string, note: any): Promise<Block> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    const block = await prisma.block.update({
      where: { id },
      data: { note }
    })

    return block
  } catch (error) {
    if (error instanceof BlockError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new BlockError('Block not found', 'NOT_FOUND')
    }
    throw new BlockError(`Failed to set block note: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set block's folder
 * @param id - The block's unique identifier
 * @param folderId - The new folder ID
 * @returns Promise<Block> - The updated block object
 */
export async function setBlockFolder(id: string, folderId: string | null): Promise<Block> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    if (folderId !== null && (typeof folderId !== 'string' || folderId.trim().length === 0)) {
      throw new BlockError('Invalid folder ID provided', 'INVALID_FOLDER_ID')
    }

    const block = await prisma.block.update({
      where: { id },
      data: { folderId: folderId?.trim() || null }
    })

    return block
  } catch (error) {
    if (error instanceof BlockError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new BlockError('Block not found', 'NOT_FOUND')
    }
    throw new BlockError(`Failed to set block folder: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

// ==================== RELATIONSHIPS ====================

/**
 * Get block's author
 * @param id - The block's unique identifier
 * @returns Promise<User | null> - The block's author or null if not found
 */
export async function getBlockAuthor(id: string): Promise<User | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    const block = await prisma.block.findUnique({
      where: { id },
      include: { author: true }
    })

    return block?.author || null
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get block author: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get block's folder
 * @param id - The block's unique identifier
 * @returns Promise<Folder | null> - The block's folder or null if not found
 */
export async function getBlockFolder(id: string): Promise<Folder | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    const block = await prisma.block.findUnique({
      where: { id },
      include: { folder: true }
    })

    return block?.folder || null
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get block folder: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get blocks by author
 * @param authorId - The author's unique identifier
 * @returns Promise<Block[]> - Array of blocks by the author
 */
export async function getBlocksByAuthor(authorId: string): Promise<Block[]> {
  try {
    if (!authorId || typeof authorId !== 'string') {
      throw new BlockError('Invalid author ID provided', 'INVALID_AUTHOR_ID')
    }

    const blocks = await prisma.block.findMany({
      where: { authorId }
    })

    return blocks
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get blocks by author: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get blocks by folder
 * @param folderId - The folder's unique identifier
 * @returns Promise<Block[]> - Array of blocks in the folder
 */
export async function getBlocksByFolder(folderId: string): Promise<Block[]> {
  try {
    if (!folderId || typeof folderId !== 'string') {
      throw new BlockError('Invalid folder ID provided', 'INVALID_FOLDER_ID')
    }

    const blocks = await prisma.block.findMany({
      where: { folderId }
    })

    return blocks
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get blocks by folder: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get block with all related data
 * @param id - The block's unique identifier
 * @returns Promise<Block & { author: User, folder: Folder | null }> - Block with related data
 */
export async function getBlockWithRelations(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    const block = await prisma.block.findUnique({
      where: { id },
      include: {
        author: true,
        folder: true
      }
    })

    return block
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get block with relations: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== CRUD OPERATIONS ====================

/**
 * Create a new block
 * @param data - Block data for creation
 * @returns Promise<Block> - The created block object
 */
export async function createBlock(data: {
  title: string
  authorId: string
  folderId?: string
  points?: number
  files?: string[]
  note?: any
}): Promise<Block> {
  try {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new BlockError('Title is required and cannot be empty', 'INVALID_TITLE')
    }

    if (!data.authorId || typeof data.authorId !== 'string') {
      throw new BlockError('Author ID is required', 'INVALID_AUTHOR_ID')
    }

    if (data.points !== undefined && (typeof data.points !== 'number' || data.points < 0)) {
      throw new BlockError('Points must be a non-negative number', 'INVALID_POINTS')
    }

    if (data.files && !Array.isArray(data.files)) {
      throw new BlockError('Files must be an array', 'INVALID_FILES')
    }

    const block = await prisma.block.create({
      data: {
        title: data.title.trim(),
        authorId: data.authorId,
        folderId: data.folderId,
        points: data.points || 0,
        files: data.files || [],
        note: data.note
      }
    })

    return block
  } catch (error) {
    if (error instanceof BlockError) throw error
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      throw new BlockError('Invalid author or folder ID', 'FOREIGN_KEY_ERROR')
    }
    throw new BlockError(`Failed to create block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'CREATE_ERROR')
  }
}

/**
 * Delete a block by ID
 * @param id - The block's unique identifier
 * @param userId - The user ID for authorization check
 * @returns Promise<Block> - The deleted block object
 */
export async function deleteBlock(id: string, userId?: string): Promise<{ success: boolean }> {
  try {
    if (!id || typeof id !== 'string') {
      throw new BlockError('Invalid block ID provided', 'INVALID_ID')
    }

    const block = await getBlockById(id)

    if (!block) {
      throw new BlockError('Block not found', 'NOT_FOUND')
    }

    // Check authorization if userId is provided
    if (userId && block.authorId !== userId) {
      throw new BlockError('Unauthorized to delete this block', 'UNAUTHORIZED')
    }

    // Delete all related data in a transaction
    await prisma.$transaction([
      // Delete all FillInTheBlank entries
      prisma.fillInTheBlank.deleteMany({
        where: { blockId: id }
      }),
      // Delete all Questions
      prisma.question.deleteMany({
        where: { blockId: id }
      }),
      // Delete all Quizzes
      prisma.quiz.deleteMany({
        where: { blockId: id }
      }),
      // Delete all Topics
      prisma.topic.deleteMany({
        where: { blockId: id }
      }),
      // Finally, delete the block itself
      prisma.block.delete({
        where: { id: id }
      })
    ]);

    // Clean up any uploaded files in Supabase storage
    const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: files } = await supabase
      .storage
      .from('blocks')
      .list(`${id}`);

    if (files && files.length > 0) {
      const filePaths = files.map((file: { name: string }) => `${id}/${file.name}`);
      await supabase
        .storage
        .from('blocks')
        .remove(filePaths);
    }

    return { success: true }
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to delete block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DELETE_ERROR')
  }
}

/**
 * Check if block exists
 * @param id - The block's unique identifier
 * @returns Promise<boolean> - True if block exists, false otherwise
 */
export async function blockExists(id: string): Promise<boolean> {
  try {
    if (!id || typeof id !== 'string') {
      return false
    }

    const count = await prisma.block.count({
      where: { id }
    })

    return count > 0
  } catch (error) {
    throw new BlockError(`Failed to check if block exists: ${error instanceof Error ? error.message : 'Unknown error'}`, 'EXISTS_ERROR')
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Search blocks by title (case-insensitive)
 * @param searchTerm - The search term
 * @returns Promise<Block[]> - Array of matching blocks
 */
export async function searchBlocksByTitle(searchTerm: string): Promise<Block[]> {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new BlockError('Invalid search term', 'INVALID_SEARCH')
    }

    const blocks = await prisma.block.findMany({
      where: {
        title: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    })

    return blocks
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to search blocks: ${error instanceof Error ? error.message : 'Unknown error'}`, 'SEARCH_ERROR')
  }
}

/**
 * Get blocks with points greater than a threshold
 * @param minPoints - Minimum points threshold
 * @returns Promise<Block[]> - Array of blocks with sufficient points
 */
export async function getBlocksByMinPoints(minPoints: number): Promise<Block[]> {
  try {
    if (typeof minPoints !== 'number' || minPoints < 0) {
      throw new BlockError('Minimum points must be a non-negative number', 'INVALID_POINTS')
    }

    const blocks = await prisma.block.findMany({
      where: {
        points: {
          gte: minPoints
        }
      }
    })

    return blocks
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get blocks by points: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get blocks created within a date range
 * @param startDate - Start date for the range
 * @param endDate - End date for the range
 * @returns Promise<Block[]> - Array of blocks created in the date range
 */
export async function getBlocksByDateRange(startDate: Date, endDate: Date): Promise<Block[]> {
  try {
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new BlockError('Invalid date provided', 'INVALID_DATE')
    }

    if (startDate > endDate) {
      throw new BlockError('Start date must be before end date', 'INVALID_DATE_RANGE')
    }

    const blocks = await prisma.block.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    return blocks
  } catch (error) {
    if (error instanceof BlockError) throw error
    throw new BlockError(`Failed to get blocks by date range: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
} 

/**
 * Increment block's points and create a PointsUpdate record for real-time tracking
 * @param id - The block's unique identifier
 * @param points - The points to increment (can be negative)
 * @returns Promise<{ success: boolean; newPoints: number | null; error?: string }> - Result of the operation
 */
export async function incrementBlockPoints(
  id: string, 
  points: number
): Promise<{ success: boolean; newPoints: number | null; error?: string }> {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, newPoints: null, error: 'Invalid block ID provided' }
    }

    if (typeof points !== 'number') {
      return { success: false, newPoints: null, error: 'Points must be a number' }
    }

    // Get current points
    const currentBlock = await prisma.block.findUnique({
      where: { id },
      select: { points: true }
    });

    if (!currentBlock) {
      return { success: false, newPoints: null, error: 'Block not found' };
    }

    // Update points in database
    const updatedBlock = await prisma.block.update({
      where: { id },
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
        blockId: id,
        points,
      }
    });

    // Invalidate Redis cache to ensure fresh data
    await invalidateBlockCache(id);

    return { 
      success: true, 
      newPoints: updatedBlock.points 
    };
  } catch (error: unknown) {
    console.error('Error incrementing block points:', error);
    return { 
      success: false, 
      newPoints: null, 
      error: error instanceof Error ? error.message : 'Failed to increment block points' 
    };
  }
} 