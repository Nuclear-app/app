import prisma from './prisma'
import { FillInTheBlank, Block } from './generated/prisma'

/**
 * Custom error class for FillInTheBlank operations
 */
export class FillInTheBlankError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'FillInTheBlankError'
  }
}

/**
 * FillInTheBlank model operations
 * Provides type-safe CRUD operations for the FillInTheBlank model
 */

// ==================== GETTERS ====================

/**
 * Get a fill-in-the-blank by its ID
 * @param id - The fill-in-the-blank's unique identifier
 * @returns Promise<FillInTheBlank | null> - The fill-in-the-blank object or null if not found
 */
export async function getFillInTheBlankById(id: string): Promise<FillInTheBlank | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FillInTheBlankError('Invalid fill-in-the-blank ID provided', 'INVALID_ID')
    }

    const fillInTheBlank = await prisma.fillInTheBlank.findUnique({
      where: { id }
    })

    return fillInTheBlank
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    throw new FillInTheBlankError(`Failed to get fill-in-the-blank by ID: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all fill-in-the-blanks
 * @returns Promise<FillInTheBlank[]> - Array of all fill-in-the-blanks
 */
export async function getAllFillInTheBlanks(): Promise<FillInTheBlank[]> {
  try {
    const fillInTheBlanks = await prisma.fillInTheBlank.findMany()
    return fillInTheBlanks
  } catch (error) {
    throw new FillInTheBlankError(`Failed to get all fill-in-the-blanks: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get fill-in-the-blank count
 * @returns Promise<number> - Total number of fill-in-the-blanks
 */
export async function getFillInTheBlankCount(): Promise<number> {
  try {
    const count = await prisma.fillInTheBlank.count()
    return count
  } catch (error) {
    throw new FillInTheBlankError(`Failed to get fill-in-the-blank count: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COUNT_ERROR')
  }
}

/**
 * Get fill-in-the-blank's sentence
 * @param id - The fill-in-the-blank's unique identifier
 * @returns Promise<string | null> - The fill-in-the-blank's sentence or null if not found
 */
export async function getFillInTheBlankSentence(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FillInTheBlankError('Invalid fill-in-the-blank ID provided', 'INVALID_ID')
    }

    const fillInTheBlank = await prisma.fillInTheBlank.findUnique({
      where: { id },
      select: { sentence: true }
    })

    return fillInTheBlank?.sentence || null
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    throw new FillInTheBlankError(`Failed to get fill-in-the-blank sentence: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get fill-in-the-blank's answer
 * @param id - The fill-in-the-blank's unique identifier
 * @returns Promise<string | null> - The fill-in-the-blank's answer or null if not found
 */
export async function getFillInTheBlankAnswer(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FillInTheBlankError('Invalid fill-in-the-blank ID provided', 'INVALID_ID')
    }

    const fillInTheBlank = await prisma.fillInTheBlank.findUnique({
      where: { id },
      select: { answer: true }
    })

    return fillInTheBlank?.answer || null
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    throw new FillInTheBlankError(`Failed to get fill-in-the-blank answer: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get fill-in-the-blank's hint
 * @param id - The fill-in-the-blank's unique identifier
 * @returns Promise<string | null> - The fill-in-the-blank's hint or null if not found
 */
export async function getFillInTheBlankHint(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FillInTheBlankError('Invalid fill-in-the-blank ID provided', 'INVALID_ID')
    }

    const fillInTheBlank = await prisma.fillInTheBlank.findUnique({
      where: { id },
      select: { hint: true }
    })

    return fillInTheBlank?.hint || null
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    throw new FillInTheBlankError(`Failed to get fill-in-the-blank hint: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== SETTERS ====================

/**
 * Update fill-in-the-blank by ID
 * @param id - The fill-in-the-blank's unique identifier
 * @param data - Partial fill-in-the-blank data to update
 * @returns Promise<FillInTheBlank> - The updated fill-in-the-blank object
 */
export async function updateFillInTheBlank(id: string, data: {
  sentence?: string
  answer?: string
  hint?: string
}): Promise<FillInTheBlank> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FillInTheBlankError('Invalid fill-in-the-blank ID provided', 'INVALID_ID')
    }

    // Validate sentence if provided
    if (data.sentence && (typeof data.sentence !== 'string' || data.sentence.trim().length === 0)) {
      throw new FillInTheBlankError('Sentence cannot be empty', 'INVALID_SENTENCE')
    }

    // Validate answer if provided
    if (data.answer && (typeof data.answer !== 'string' || data.answer.trim().length === 0)) {
      throw new FillInTheBlankError('Answer cannot be empty', 'INVALID_ANSWER')
    }

    const fillInTheBlank = await prisma.fillInTheBlank.update({
      where: { id },
      data
    })

    return fillInTheBlank
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new FillInTheBlankError('Fill-in-the-blank not found', 'NOT_FOUND')
    }
    throw new FillInTheBlankError(`Failed to update fill-in-the-blank: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set fill-in-the-blank's sentence
 * @param id - The fill-in-the-blank's unique identifier
 * @param sentence - The new sentence
 * @returns Promise<FillInTheBlank> - The updated fill-in-the-blank object
 */
export async function setFillInTheBlankSentence(id: string, sentence: string): Promise<FillInTheBlank> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FillInTheBlankError('Invalid fill-in-the-blank ID provided', 'INVALID_ID')
    }

    if (typeof sentence !== 'string' || sentence.trim().length === 0) {
      throw new FillInTheBlankError('Sentence cannot be empty', 'INVALID_SENTENCE')
    }

    const fillInTheBlank = await prisma.fillInTheBlank.update({
      where: { id },
      data: { sentence: sentence.trim() }
    })

    return fillInTheBlank
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new FillInTheBlankError('Fill-in-the-blank not found', 'NOT_FOUND')
    }
    throw new FillInTheBlankError(`Failed to set fill-in-the-blank sentence: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set fill-in-the-blank's answer
 * @param id - The fill-in-the-blank's unique identifier
 * @param answer - The new answer
 * @returns Promise<FillInTheBlank> - The updated fill-in-the-blank object
 */
export async function setFillInTheBlankAnswer(id: string, answer: string): Promise<FillInTheBlank> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FillInTheBlankError('Invalid fill-in-the-blank ID provided', 'INVALID_ID')
    }

    if (typeof answer !== 'string' || answer.trim().length === 0) {
      throw new FillInTheBlankError('Answer cannot be empty', 'INVALID_ANSWER')
    }

    const fillInTheBlank = await prisma.fillInTheBlank.update({
      where: { id },
      data: { answer: answer.trim() }
    })

    return fillInTheBlank
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new FillInTheBlankError('Fill-in-the-blank not found', 'NOT_FOUND')
    }
    throw new FillInTheBlankError(`Failed to set fill-in-the-blank answer: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set fill-in-the-blank's hint
 * @param id - The fill-in-the-blank's unique identifier
 * @param hint - The new hint
 * @returns Promise<FillInTheBlank> - The updated fill-in-the-blank object
 */
export async function setFillInTheBlankHint(id: string, hint: string): Promise<FillInTheBlank> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FillInTheBlankError('Invalid fill-in-the-blank ID provided', 'INVALID_ID')
    }

    if (typeof hint !== 'string') {
      throw new FillInTheBlankError('Hint must be a string', 'INVALID_HINT')
    }

    const fillInTheBlank = await prisma.fillInTheBlank.update({
      where: { id },
      data: { hint }
    })

    return fillInTheBlank
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new FillInTheBlankError('Fill-in-the-blank not found', 'NOT_FOUND')
    }
    throw new FillInTheBlankError(`Failed to set fill-in-the-blank hint: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

// ==================== RELATIONSHIPS ====================

/**
 * Get fill-in-the-blank's block
 * @param id - The fill-in-the-blank's unique identifier
 * @returns Promise<Block | null> - The fill-in-the-blank's block or null if not found
 */
export async function getFillInTheBlankBlock(id: string): Promise<Block | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FillInTheBlankError('Invalid fill-in-the-blank ID provided', 'INVALID_ID')
    }

    const fillInTheBlank = await prisma.fillInTheBlank.findUnique({
      where: { id },
      include: { block: true }
    })

    return fillInTheBlank?.block || null
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    throw new FillInTheBlankError(`Failed to get fill-in-the-blank block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get fill-in-the-blanks by block
 * @param blockId - The block's unique identifier
 * @returns Promise<FillInTheBlank[]> - Array of fill-in-the-blanks for the block
 */
export async function getFillInTheBlanksByBlock(blockId: string): Promise<FillInTheBlank[]> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new FillInTheBlankError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const fillInTheBlanks = await prisma.fillInTheBlank.findMany({
      where: { blockId },
      orderBy: {
        id: 'asc',
      },
    })

    return fillInTheBlanks
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    throw new FillInTheBlankError(`Failed to get fill-in-the-blanks by block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get fill-in-the-blank with all related data
 * @param id - The fill-in-the-blank's unique identifier
 * @returns Promise<FillInTheBlank & { block: Block }> - Fill-in-the-blank with related data
 */
export async function getFillInTheBlankWithRelations(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      throw new FillInTheBlankError('Invalid fill-in-the-blank ID provided', 'INVALID_ID')
    }

    const fillInTheBlank = await prisma.fillInTheBlank.findUnique({
      where: { id },
      include: { block: true }
    })

    return fillInTheBlank
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    throw new FillInTheBlankError(`Failed to get fill-in-the-blank with relations: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== CRUD OPERATIONS ====================

/**
 * Create a new fill-in-the-blank
 * @param data - Fill-in-the-blank data for creation
 * @returns Promise<FillInTheBlank> - The created fill-in-the-blank object
 */
export async function createFillInTheBlank(data: {
  sentence: string
  answer: string
  hint?: string
  blockId: string
}): Promise<FillInTheBlank> {
  try {
    if (!data.sentence || typeof data.sentence !== 'string' || data.sentence.trim().length === 0) {
      throw new FillInTheBlankError('Sentence is required and cannot be empty', 'INVALID_SENTENCE')
    }

    if (!data.answer || typeof data.answer !== 'string' || data.answer.trim().length === 0) {
      throw new FillInTheBlankError('Answer is required and cannot be empty', 'INVALID_ANSWER')
    }

    if (!data.blockId || typeof data.blockId !== 'string') {
      throw new FillInTheBlankError('Block ID is required', 'INVALID_BLOCK_ID')
    }

    const fillInTheBlank = await prisma.fillInTheBlank.create({
      data: {
        sentence: data.sentence.trim(),
        answer: data.answer.trim(),
        hint: data.hint,
        blockId: data.blockId
      }
    })

    return fillInTheBlank
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      throw new FillInTheBlankError('Invalid block ID', 'FOREIGN_KEY_ERROR')
    }
    throw new FillInTheBlankError(`Failed to create fill-in-the-blank: ${error instanceof Error ? error.message : 'Unknown error'}`, 'CREATE_ERROR')
  }
}

/**
 * Delete a fill-in-the-blank by ID
 * @param id - The fill-in-the-blank's unique identifier
 * @returns Promise<FillInTheBlank> - The deleted fill-in-the-blank object
 */
export async function deleteFillInTheBlank(id: string): Promise<FillInTheBlank> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FillInTheBlankError('Invalid fill-in-the-blank ID provided', 'INVALID_ID')
    }

    const fillInTheBlank = await prisma.fillInTheBlank.delete({
      where: { id }
    })

    return fillInTheBlank
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      throw new FillInTheBlankError('Fill-in-the-blank not found', 'NOT_FOUND')
    }
    throw new FillInTheBlankError(`Failed to delete fill-in-the-blank: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DELETE_ERROR')
  }
}

export async function deleteFillInTheBlanksByBlock(blockId: string): Promise<{ success: boolean }> {
  try {
    const fillInTheBlanks = await prisma.fillInTheBlank.deleteMany({
      where: { blockId }
    })

    return { success: true }
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    throw new FillInTheBlankError(`Failed to delete fill-in-the-blanks by block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DELETE_ERROR')
  }
}

/**
 * Check if fill-in-the-blank exists
 * @param id - The fill-in-the-blank's unique identifier
 * @returns Promise<boolean> - True if fill-in-the-blank exists, false otherwise
 */
export async function fillInTheBlankExists(id: string): Promise<boolean> {
  try {
    if (!id || typeof id !== 'string') {
      return false
    }

    const count = await prisma.fillInTheBlank.count({
      where: { id }
    })

    return count > 0
  } catch (error) {
    throw new FillInTheBlankError(`Failed to check if fill-in-the-blank exists: ${error instanceof Error ? error.message : 'Unknown error'}`, 'EXISTS_ERROR')
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Search fill-in-the-blanks by sentence (case-insensitive)
 * @param searchTerm - The search term
 * @returns Promise<FillInTheBlank[]> - Array of matching fill-in-the-blanks
 */
export async function searchFillInTheBlanksBySentence(searchTerm: string): Promise<FillInTheBlank[]> {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new FillInTheBlankError('Invalid search term', 'INVALID_SEARCH')
    }

    const fillInTheBlanks = await prisma.fillInTheBlank.findMany({
      where: {
        sentence: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    })

    return fillInTheBlanks
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    throw new FillInTheBlankError(`Failed to search fill-in-the-blanks: ${error instanceof Error ? error.message : 'Unknown error'}`, 'SEARCH_ERROR')
  }
}

/**
 * Search fill-in-the-blanks by answer (case-insensitive)
 * @param searchTerm - The search term
 * @returns Promise<FillInTheBlank[]> - Array of matching fill-in-the-blanks
 */
export async function searchFillInTheBlanksByAnswer(searchTerm: string): Promise<FillInTheBlank[]> {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new FillInTheBlankError('Invalid search term', 'INVALID_SEARCH')
    }

    const fillInTheBlanks = await prisma.fillInTheBlank.findMany({
      where: {
        answer: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    })

    return fillInTheBlanks
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    throw new FillInTheBlankError(`Failed to search fill-in-the-blanks by answer: ${error instanceof Error ? error.message : 'Unknown error'}`, 'SEARCH_ERROR')
  }
}

/**
 * Get random fill-in-the-blank
 * @returns Promise<FillInTheBlank | null> - Random fill-in-the-blank or null if none available
 */
export async function getRandomFillInTheBlank(): Promise<FillInTheBlank | null> {
  try {
    const fillInTheBlanks = await prisma.fillInTheBlank.findMany()

    if (fillInTheBlanks.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * fillInTheBlanks.length)
    return fillInTheBlanks[randomIndex]
  } catch (error) {
    throw new FillInTheBlankError(`Failed to get random fill-in-the-blank: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get random fill-in-the-blank by block
 * @param blockId - The block's unique identifier
 * @returns Promise<FillInTheBlank | null> - Random fill-in-the-blank for the block or null if none available
 */
export async function getRandomFillInTheBlankByBlock(blockId: string): Promise<FillInTheBlank | null> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new FillInTheBlankError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const fillInTheBlanks = await prisma.fillInTheBlank.findMany({
      where: { blockId }
    })

    if (fillInTheBlanks.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * fillInTheBlanks.length)
    return fillInTheBlanks[randomIndex]
  } catch (error) {
    if (error instanceof FillInTheBlankError) throw error
    throw new FillInTheBlankError(`Failed to get random fill-in-the-blank by block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get fill-in-the-blanks with hints
 * @returns Promise<FillInTheBlank[]> - Array of fill-in-the-blanks that have hints
 */
export async function getFillInTheBlanksWithHints(): Promise<FillInTheBlank[]> {
  try {
    const fillInTheBlanks = await prisma.fillInTheBlank.findMany({
      where: {
        hint: {
          not: null
        }
      }
    })

    return fillInTheBlanks
  } catch (error) {
    throw new FillInTheBlankError(`Failed to get fill-in-the-blanks with hints: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
} 