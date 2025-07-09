
import prisma from './prisma'
import { Quiz, Block, Topic } from './generated/prisma'

/**
 * Custom error class for Quiz operations
 */
export class QuizError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'QuizError'
  }
}

/**
 * Quiz model operations
 * Provides type-safe CRUD operations for the Quiz model
 */

// ==================== GETTERS ====================

/**
 * Get a quiz by its ID
 * @param id - The quiz's unique identifier
 * @returns Promise<Quiz | null> - The quiz object or null if not found
 */
export async function getQuizById(id: string): Promise<Quiz | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id }
    })

    return quiz
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to get quiz by ID: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all quizzes
 * @returns Promise<Quiz[]> - Array of all quizzes
 */
export async function getAllQuizzes(): Promise<Quiz[]> {
  try {
    const quizzes = await prisma.quiz.findMany()
    return quizzes
  } catch (error) {
    throw new QuizError(`Failed to get all quizzes: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get quiz count
 * @returns Promise<number> - Total number of quizzes
 */
export async function getQuizCount(): Promise<number> {
  try {
    const count = await prisma.quiz.count()
    return count
  } catch (error) {
    throw new QuizError(`Failed to get quiz count: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COUNT_ERROR')
  }
}

/**
 * Get quiz's question
 * @param id - The quiz's unique identifier
 * @returns Promise<string | null> - The quiz's question or null if not found
 */
export async function getQuizQuestion(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: { question: true }
    })

    return quiz?.question || null
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to get quiz question: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get quiz's correct answer
 * @param id - The quiz's unique identifier
 * @returns Promise<string | null> - The quiz's correct answer or null if not found
 */
export async function getQuizCorrectAnswer(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: { correctAns: true }
    })

    return quiz?.correctAns || null
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to get quiz correct answer: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get quiz's mistake
 * @param id - The quiz's unique identifier
 * @returns Promise<string | null> - The quiz's mistake or null if not found
 */
export async function getQuizMistake(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: { mistake: true }
    })

    return quiz?.mistake || null
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to get quiz mistake: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get quiz's options
 * @param id - The quiz's unique identifier
 * @returns Promise<string[] | null> - The quiz's options array or null if not found
 */
export async function getQuizOptions(id: string): Promise<string[] | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: { options: true }
    })

    return quiz?.options || null
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to get quiz options: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get quiz's used status
 * @param id - The quiz's unique identifier
 * @returns Promise<boolean | null> - The quiz's used status or null if not found
 */
export async function getQuizUsedStatus(id: string): Promise<boolean | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: { used: true }
    })

    return quiz?.used || null
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to get quiz used status: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== SETTERS ====================

/**
 * Update quiz by ID
 * @param id - The quiz's unique identifier
 * @param data - Partial quiz data to update
 * @returns Promise<Quiz> - The updated quiz object
 */
export async function updateQuiz(id: string, data: {
  question?: string
  correctAns?: string
  mistake?: string
  options?: string[]
  used?: boolean
}): Promise<Quiz> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    // Validate question if provided
    if (data.question && (typeof data.question !== 'string' || data.question.trim().length === 0)) {
      throw new QuizError('Question cannot be empty', 'INVALID_QUESTION')
    }

    // Validate correct answer if provided
    if (data.correctAns && (typeof data.correctAns !== 'string' || data.correctAns.trim().length === 0)) {
      throw new QuizError('Correct answer cannot be empty', 'INVALID_CORRECT_ANSWER')
    }

    // Validate options if provided
    if (data.options && (!Array.isArray(data.options) || data.options.length === 0)) {
      throw new QuizError('Options must be a non-empty array', 'INVALID_OPTIONS')
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data
    })

    return quiz
  } catch (error) {
    if (error instanceof QuizError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new QuizError('Quiz not found', 'NOT_FOUND')
    }
    throw new QuizError(`Failed to update quiz: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set quiz's question
 * @param id - The quiz's unique identifier
 * @param question - The new question
 * @returns Promise<Quiz> - The updated quiz object
 */
export async function setQuizQuestion(id: string, question: string): Promise<Quiz> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    if (typeof question !== 'string' || question.trim().length === 0) {
      throw new QuizError('Question cannot be empty', 'INVALID_QUESTION')
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: { question: question.trim() }
    })

    return quiz
  } catch (error) {
    if (error instanceof QuizError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new QuizError('Quiz not found', 'NOT_FOUND')
    }
    throw new QuizError(`Failed to set quiz question: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set quiz's correct answer
 * @param id - The quiz's unique identifier
 * @param correctAns - The new correct answer
 * @returns Promise<Quiz> - The updated quiz object
 */
export async function setQuizCorrectAnswer(id: string, correctAns: string): Promise<Quiz> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    if (typeof correctAns !== 'string' || correctAns.trim().length === 0) {
      throw new QuizError('Correct answer cannot be empty', 'INVALID_CORRECT_ANSWER')
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: { correctAns: correctAns.trim() }
    })

    return quiz
  } catch (error) {
    if (error instanceof QuizError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new QuizError('Quiz not found', 'NOT_FOUND')
    }
    throw new QuizError(`Failed to set quiz correct answer: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set quiz's mistake
 * @param id - The quiz's unique identifier
 * @param mistake - The new mistake
 * @returns Promise<Quiz> - The updated quiz object
 */
export async function setQuizMistake(id: string, mistake: string): Promise<Quiz> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    if (typeof mistake !== 'string') {
      throw new QuizError('Mistake must be a string', 'INVALID_MISTAKE')
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: { mistake }
    })

    return quiz
  } catch (error) {
    if (error instanceof QuizError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new QuizError('Quiz not found', 'NOT_FOUND')
    }
    throw new QuizError(`Failed to set quiz mistake: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set quiz's options
 * @param id - The quiz's unique identifier
 * @param options - The new options array
 * @returns Promise<Quiz> - The updated quiz object
 */
export async function setQuizOptions(id: string, options: string[]): Promise<Quiz> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    if (!Array.isArray(options) || options.length === 0) {
      throw new QuizError('Options must be a non-empty array', 'INVALID_OPTIONS')
    }

    // Validate that all options are strings
    if (!options.every(option => typeof option === 'string' && option.trim().length > 0)) {
      throw new QuizError('All options must be non-empty strings', 'INVALID_OPTIONS')
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: { options: options.map(option => option.trim()) }
    })

    return quiz
  } catch (error) {
    if (error instanceof QuizError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new QuizError('Quiz not found', 'NOT_FOUND')
    }
    throw new QuizError(`Failed to set quiz options: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set quiz's used status
 * @param id - The quiz's unique identifier
 * @param used - The new used status
 * @returns Promise<Quiz> - The updated quiz object
 */
export async function setQuizUsedStatus(id: string, used: boolean): Promise<Quiz> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    if (typeof used !== 'boolean') {
      throw new QuizError('Used status must be a boolean', 'INVALID_USED_STATUS')
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: { used }
    })

    return quiz
  } catch (error) {
    if (error instanceof QuizError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new QuizError('Quiz not found', 'NOT_FOUND')
    }
    throw new QuizError(`Failed to set quiz used status: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Mark quiz as used
 * @param id - The quiz's unique identifier
 * @returns Promise<Quiz> - The updated quiz object
 */
export async function markQuizAsUsed(id: string): Promise<Quiz> {
  return setQuizUsedStatus(id, true)
}

/**
 * Mark quiz as unused
 * @param id - The quiz's unique identifier
 * @returns Promise<Quiz> - The updated quiz object
 */
export async function markQuizAsUnused(id: string): Promise<Quiz> {
  return setQuizUsedStatus(id, false)
}

// ==================== RELATIONSHIPS ====================

/**
 * Get quiz's block
 * @param id - The quiz's unique identifier
 * @returns Promise<Block | null> - The quiz's block or null if not found
 */
export async function getQuizBlock(id: string): Promise<Block | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { block: true }
    })

    return quiz?.block || null
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to get quiz block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get quiz's topic
 * @param id - The quiz's unique identifier
 * @returns Promise<Topic | null> - The quiz's topic or null if not found
 */
export async function getQuizTopic(id: string): Promise<Topic | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { topic: true }
    })

    return quiz?.topic || null
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to get quiz topic: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get quizzes by block
 * @param blockId - The block's unique identifier
 * @returns Promise<Quiz[]> - Array of quizzes for the block
 */
export async function getQuizzesByBlock(blockId: string): Promise<Quiz[]> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new QuizError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const quizzes = await prisma.quiz.findMany({
      where: { blockId }
    })

    return quizzes
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to get quizzes by block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get quizzes by topic
 * @param topicId - The topic's unique identifier
 * @returns Promise<Quiz[]> - Array of quizzes for the topic
 */
export async function getQuizzesByTopic(topicId: string): Promise<Quiz[]> {
  try {
    if (!topicId || typeof topicId !== 'string') {
      throw new QuizError('Invalid topic ID provided', 'INVALID_TOPIC_ID')
    }

    const quizzes = await prisma.quiz.findMany({
      where: { topicId }
    })

    return quizzes
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to get quizzes by topic: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get quiz with all related data
 * @param id - The quiz's unique identifier
 * @returns Promise<Quiz & { block: Block, topic: Topic }> - Quiz with related data
 */
export async function getQuizWithRelations(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        block: true,
        topic: true
      }
    })

    return quiz
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to get quiz with relations: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== CRUD OPERATIONS ====================

/**
 * Create a new quiz
 * @param data - Quiz data for creation
 * @returns Promise<Quiz> - The created quiz object
 */
export async function createQuiz(data: {
  question: string
  correctAns: string
  mistake?: string
  blockId: string
  options: string[]
  topicId: string
  used?: boolean
}): Promise<Quiz> {
  try {
    if (!data.question || typeof data.question !== 'string' || data.question.trim().length === 0) {
      throw new QuizError('Question is required and cannot be empty', 'INVALID_QUESTION')
    }

    if (!data.correctAns || typeof data.correctAns !== 'string' || data.correctAns.trim().length === 0) {
      throw new QuizError('Correct answer is required and cannot be empty', 'INVALID_CORRECT_ANSWER')
    }

    if (!data.blockId || typeof data.blockId !== 'string') {
      throw new QuizError('Block ID is required', 'INVALID_BLOCK_ID')
    }

    if (!data.topicId || typeof data.topicId !== 'string') {
      throw new QuizError('Topic ID is required', 'INVALID_TOPIC_ID')
    }

    if (!Array.isArray(data.options) || data.options.length === 0) {
      throw new QuizError('Options must be a non-empty array', 'INVALID_OPTIONS')
    }

    // Validate that all options are strings
    if (!data.options.every(option => typeof option === 'string' && option.trim().length > 0)) {
      throw new QuizError('All options must be non-empty strings', 'INVALID_OPTIONS')
    }

    const quiz = await prisma.quiz.create({
      data: {
        question: data.question.trim(),
        correctAns: data.correctAns.trim(),
        mistake: data.mistake,
        blockId: data.blockId,
        options: data.options.map(option => option.trim()),
        topicId: data.topicId,
        used: data.used || false
      }
    })

    return quiz
  } catch (error) {
    if (error instanceof QuizError) throw error
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      throw new QuizError('Invalid block or topic ID', 'FOREIGN_KEY_ERROR')
    }
    throw new QuizError(`Failed to create quiz: ${error instanceof Error ? error.message : 'Unknown error'}`, 'CREATE_ERROR')
  }
}

/**
 * Delete a quiz by ID
 * @param id - The quiz's unique identifier
 * @returns Promise<Quiz> - The deleted quiz object
 */
export async function deleteQuiz(id: string): Promise<Quiz> {
  try {
    if (!id || typeof id !== 'string') {
      throw new QuizError('Invalid quiz ID provided', 'INVALID_ID')
    }

    const quiz = await prisma.quiz.delete({
      where: { id }
    })

    return quiz
  } catch (error) {
    if (error instanceof QuizError) throw error
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      throw new QuizError('Quiz not found', 'NOT_FOUND')
    }
    throw new QuizError(`Failed to delete quiz: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DELETE_ERROR')
  }
}

/**
 * Check if quiz exists
 * @param id - The quiz's unique identifier
 * @returns Promise<boolean> - True if quiz exists, false otherwise
 */
export async function quizExists(id: string): Promise<boolean> {
  try {
    if (!id || typeof id !== 'string') {
      return false
    }

    const count = await prisma.quiz.count({
      where: { id }
    })

    return count > 0
  } catch (error) {
    throw new QuizError(`Failed to check if quiz exists: ${error instanceof Error ? error.message : 'Unknown error'}`, 'EXISTS_ERROR')
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get unused quizzes
 * @returns Promise<Quiz[]> - Array of unused quizzes
 */
export async function getUnusedQuizzes(): Promise<Quiz[]> {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { used: false }
    })

    return quizzes
  } catch (error) {
    throw new QuizError(`Failed to get unused quizzes: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get used quizzes
 * @returns Promise<Quiz[]> - Array of used quizzes
 */
export async function getUsedQuizzes(): Promise<Quiz[]> {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { used: true }
    })

    return quizzes
  } catch (error) {
    throw new QuizError(`Failed to get used quizzes: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Search quizzes by question (case-insensitive)
 * @param searchTerm - The search term
 * @returns Promise<Quiz[]> - Array of matching quizzes
 */
export async function searchQuizzesByQuestion(searchTerm: string): Promise<Quiz[]> {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new QuizError('Invalid search term', 'INVALID_SEARCH')
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        question: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    })

    return quizzes
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to search quizzes: ${error instanceof Error ? error.message : 'Unknown error'}`, 'SEARCH_ERROR')
  }
}

/**
 * Get random unused quiz
 * @returns Promise<Quiz | null> - Random unused quiz or null if none available
 */
export async function getRandomUnusedQuiz(): Promise<Quiz | null> {
  try {
    const unusedQuizzes = await prisma.quiz.findMany({
      where: { used: false }
    })

    if (unusedQuizzes.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * unusedQuizzes.length)
    return unusedQuizzes[randomIndex]
  } catch (error) {
    throw new QuizError(`Failed to get random unused quiz: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get random unused quiz by topic
 * @param topicId - The topic's unique identifier
 * @returns Promise<Quiz | null> - Random unused quiz for the topic or null if none available
 */
export async function getRandomUnusedQuizByTopic(topicId: string): Promise<Quiz | null> {
  try {
    if (!topicId || typeof topicId !== 'string') {
      throw new QuizError('Invalid topic ID provided', 'INVALID_TOPIC_ID')
    }

    const unusedQuizzes = await prisma.quiz.findMany({
      where: { 
        topicId,
        used: false 
      }
    })

    if (unusedQuizzes.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * unusedQuizzes.length)
    return unusedQuizzes[randomIndex]
  } catch (error) {
    if (error instanceof QuizError) throw error
    throw new QuizError(`Failed to get random unused quiz by topic: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
} 