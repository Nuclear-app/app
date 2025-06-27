import prisma from './prisma'
import { Question, Block } from './generated/prisma'

/**
 * Custom error class for Question operations
 */
export class QuestionError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'QuestionError'
  }
}

/**
 * Question model operations
 * Provides type-safe CRUD operations for the Question model
 */

// ==================== GETTERS ====================

/**
 * Get a question by its ID
 * @param id - The question's unique identifier
 * @returns Promise<Question | null> - The question object or null if not found
 */
export async function getQuestionById(id: string): Promise<Question | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuestionError('Invalid question ID provided', 'INVALID_ID')
    }

    const question = await prisma.question.findUnique({
      where: { id }
    })

    return question
  } catch (error) {
    if (error instanceof QuestionError) throw error
    throw new QuestionError(`Failed to get question by ID: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all questions
 * @returns Promise<Question[]> - Array of all questions
 */
export async function getAllQuestions(): Promise<Question[]> {
  try {
    const questions = await prisma.question.findMany()
    return questions
  } catch (error) {
    throw new QuestionError(`Failed to get all questions: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get question count
 * @returns Promise<number> - Total number of questions
 */
export async function getQuestionCount(): Promise<number> {
  try {
    const count = await prisma.question.count()
    return count
  } catch (error) {
    throw new QuestionError(`Failed to get question count: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COUNT_ERROR')
  }
}

/**
 * Get question's question text
 * @param id - The question's unique identifier
 * @returns Promise<string | null> - The question text or null if not found
 */
export async function getQuestionText(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuestionError('Invalid question ID provided', 'INVALID_ID')
    }

    const question = await prisma.question.findUnique({
      where: { id },
      select: { question: true }
    })

    return question?.question || null
  } catch (error) {
    if (error instanceof QuestionError) throw error
    throw new QuestionError(`Failed to get question text: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get question's answer
 * @param id - The question's unique identifier
 * @returns Promise<string | null> - The question's answer or null if not found
 */
export async function getQuestionAnswer(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuestionError('Invalid question ID provided', 'INVALID_ID')
    }

    const question = await prisma.question.findUnique({
      where: { id },
      select: { answer: true }
    })

    return question?.answer || null
  } catch (error) {
    if (error instanceof QuestionError) throw error
    throw new QuestionError(`Failed to get question answer: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== SETTERS ====================

/**
 * Update question by ID
 * @param id - The question's unique identifier
 * @param data - Partial question data to update
 * @returns Promise<Question> - The updated question object
 */
export async function updateQuestion(id: string, data: {
  question?: string
  answer?: string
}): Promise<Question> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuestionError('Invalid question ID provided', 'INVALID_ID')
    }

    // Validate question if provided
    if (data.question && (typeof data.question !== 'string' || data.question.trim().length === 0)) {
      throw new QuestionError('Question cannot be empty', 'INVALID_QUESTION')
    }

    // Validate answer if provided
    if (data.answer && (typeof data.answer !== 'string' || data.answer.trim().length === 0)) {
      throw new QuestionError('Answer cannot be empty', 'INVALID_ANSWER')
    }

    const question = await prisma.question.update({
      where: { id },
      data
    })

    return question
  } catch (error) {
    if (error instanceof QuestionError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new QuestionError('Question not found', 'NOT_FOUND')
    }
    throw new QuestionError(`Failed to update question: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set question's question text
 * @param id - The question's unique identifier
 * @param questionText - The new question text
 * @returns Promise<Question> - The updated question object
 */
export async function setQuestionText(id: string, questionText: string): Promise<Question> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuestionError('Invalid question ID provided', 'INVALID_ID')
    }

    if (typeof questionText !== 'string' || questionText.trim().length === 0) {
      throw new QuestionError('Question cannot be empty', 'INVALID_QUESTION')
    }

    const question = await prisma.question.update({
      where: { id },
      data: { question: questionText.trim() }
    })

    return question
  } catch (error) {
    if (error instanceof QuestionError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new QuestionError('Question not found', 'NOT_FOUND')
    }
    throw new QuestionError(`Failed to set question text: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set question's answer
 * @param id - The question's unique identifier
 * @param answer - The new answer
 * @returns Promise<Question> - The updated question object
 */
export async function setQuestionAnswer(id: string, answer: string): Promise<Question> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuestionError('Invalid question ID provided', 'INVALID_ID')
    }

    if (typeof answer !== 'string' || answer.trim().length === 0) {
      throw new QuestionError('Answer cannot be empty', 'INVALID_ANSWER')
    }

    const question = await prisma.question.update({
      where: { id },
      data: { answer: answer.trim() }
    })

    return question
  } catch (error) {
    if (error instanceof QuestionError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new QuestionError('Question not found', 'NOT_FOUND')
    }
    throw new QuestionError(`Failed to set question answer: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

// ==================== RELATIONSHIPS ====================

/**
 * Get question's block
 * @param id - The question's unique identifier
 * @returns Promise<Block | null> - The question's block or null if not found
 */
export async function getQuestionBlock(id: string): Promise<Block | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuestionError('Invalid question ID provided', 'INVALID_ID')
    }

    const question = await prisma.question.findUnique({
      where: { id },
      include: { block: true }
    })

    return question?.block || null
  } catch (error) {
    if (error instanceof QuestionError) throw error
    throw new QuestionError(`Failed to get question block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get questions by block
 * @param blockId - The block's unique identifier
 * @returns Promise<Question[]> - Array of questions for the block
 */
export async function getQuestionsByBlock(blockId: string): Promise<Question[]> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new QuestionError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const questions = await prisma.question.findMany({
      where: { blockId }
    })

    return questions
  } catch (error) {
    if (error instanceof QuestionError) throw error
    throw new QuestionError(`Failed to get questions by block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get question with all related data
 * @param id - The question's unique identifier
 * @returns Promise<Question & { block: Block }> - Question with related data
 */
export async function getQuestionWithRelations(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuestionError('Invalid question ID provided', 'INVALID_ID')
    }

    const question = await prisma.question.findUnique({
      where: { id },
      include: { block: true }
    })

    return question
  } catch (error) {
    if (error instanceof QuestionError) throw error
    throw new QuestionError(`Failed to get question with relations: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== CRUD OPERATIONS ====================

/**
 * Create a new question
 * @param data - Question data for creation
 * @returns Promise<Question> - The created question object
 */
export async function createQuestion(data: {
  question: string
  answer: string
  blockId: string
}): Promise<Question> {
  try {
    if (!data.question || typeof data.question !== 'string' || data.question.trim().length === 0) {
      throw new QuestionError('Question is required and cannot be empty', 'INVALID_QUESTION')
    }

    if (!data.answer || typeof data.answer !== 'string' || data.answer.trim().length === 0) {
      throw new QuestionError('Answer is required and cannot be empty', 'INVALID_ANSWER')
    }

    if (!data.blockId || typeof data.blockId !== 'string') {
      throw new QuestionError('Block ID is required', 'INVALID_BLOCK_ID')
    }

    const question = await prisma.question.create({
      data: {
        question: data.question.trim(),
        answer: data.answer.trim(),
        blockId: data.blockId
      }
    })

    return question
  } catch (error) {
    if (error instanceof QuestionError) throw error
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      throw new QuestionError('Invalid block ID', 'FOREIGN_KEY_ERROR')
    }
    throw new QuestionError(`Failed to create question: ${error instanceof Error ? error.message : 'Unknown error'}`, 'CREATE_ERROR')
  }
}

/**
 * Delete a question by ID
 * @param id - The question's unique identifier
 * @returns Promise<Question> - The deleted question object
 */
export async function deleteQuestion(id: string): Promise<Question> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuestionError('Invalid question ID provided', 'INVALID_ID')
    }

    const question = await prisma.question.delete({
      where: { id }
    })

    return question
  } catch (error) {
    if (error instanceof QuestionError) throw error
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      throw new QuestionError('Question not found', 'NOT_FOUND')
    }
    throw new QuestionError(`Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DELETE_ERROR')
  }
}

/**
 * Check if question exists
 * @param id - The question's unique identifier
 * @returns Promise<boolean> - True if question exists, false otherwise
 */
export async function questionExists(id: string): Promise<boolean> {
  try {
    if (!id || typeof id !== 'string') {
      return false
    }

    const count = await prisma.question.count({
      where: { id }
    })

    return count > 0
  } catch (error) {
    throw new QuestionError(`Failed to check if question exists: ${error instanceof Error ? error.message : 'Unknown error'}`, 'EXISTS_ERROR')
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Search questions by question text (case-insensitive)
 * @param searchTerm - The search term
 * @returns Promise<Question[]> - Array of matching questions
 */
export async function searchQuestionsByText(searchTerm: string): Promise<Question[]> {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new QuestionError('Invalid search term', 'INVALID_SEARCH')
    }

    const questions = await prisma.question.findMany({
      where: {
        question: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    })

    return questions
  } catch (error) {
    if (error instanceof QuestionError) throw error
    throw new QuestionError(`Failed to search questions: ${error instanceof Error ? error.message : 'Unknown error'}`, 'SEARCH_ERROR')
  }
}

/**
 * Search questions by answer (case-insensitive)
 * @param searchTerm - The search term
 * @returns Promise<Question[]> - Array of matching questions
 */
export async function searchQuestionsByAnswer(searchTerm: string): Promise<Question[]> {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new QuestionError('Invalid search term', 'INVALID_SEARCH')
    }

    const questions = await prisma.question.findMany({
      where: {
        answer: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    })

    return questions
  } catch (error) {
    if (error instanceof QuestionError) throw error
    throw new QuestionError(`Failed to search questions by answer: ${error instanceof Error ? error.message : 'Unknown error'}`, 'SEARCH_ERROR')
  }
}

/**
 * Get random question
 * @returns Promise<Question | null> - Random question or null if none available
 */
export async function getRandomQuestion(): Promise<Question | null> {
  try {
    const questions = await prisma.question.findMany()

    if (questions.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * questions.length)
    return questions[randomIndex]
  } catch (error) {
    throw new QuestionError(`Failed to get random question: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get random question by block
 * @param blockId - The block's unique identifier
 * @returns Promise<Question | null> - Random question for the block or null if none available
 */
export async function getRandomQuestionByBlock(blockId: string): Promise<Question | null> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new QuestionError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const questions = await prisma.question.findMany({
      where: { blockId }
    })

    if (questions.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * questions.length)
    return questions[randomIndex]
  } catch (error) {
    if (error instanceof QuestionError) throw error
    throw new QuestionError(`Failed to get random question by block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
} 