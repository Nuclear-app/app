"use server"

import prisma from './prisma'
import { Topic, Block, Quiz } from './generated/prisma'

/**
 * Custom error class for Topic operations
 */
export class TopicError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'TopicError'
  }
}

/**
 * Topic model operations
 * Provides type-safe CRUD operations for the Topic model
 */

// ==================== GETTERS ====================

/**
 * Get a topic by its ID
 * @param id - The topic's unique identifier
 * @returns Promise<Topic | null> - The topic object or null if not found
 */
export async function getTopicById(id: string): Promise<Topic | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new TopicError('Invalid topic ID provided', 'INVALID_ID')
    }

    const topic = await prisma.topic.findUnique({
      where: { id }
    })

    return topic
  } catch (error) {
    if (error instanceof TopicError) throw error
    throw new TopicError(`Failed to get topic by ID: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all topics
 * @returns Promise<Topic[]> - Array of all topics
 */
export async function getAllTopics(): Promise<Topic[]> {
  try {
    const topics = await prisma.topic.findMany()
    return topics
  } catch (error) {
    throw new TopicError(`Failed to get all topics: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get topic count
 * @returns Promise<number> - Total number of topics
 */
export async function getTopicCount(): Promise<number> {
  try {
    const count = await prisma.topic.count()
    return count
  } catch (error) {
    throw new TopicError(`Failed to get topic count: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COUNT_ERROR')
  }
}

/**
 * Get topic's name
 * @param id - The topic's unique identifier
 * @returns Promise<string | null> - The topic's name or null if not found
 */
export async function getTopicName(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new TopicError('Invalid topic ID provided', 'INVALID_ID')
    }

    const topic = await prisma.topic.findUnique({
      where: { id },
      select: { name: true }
    })

    return topic?.name || null
  } catch (error) {
    if (error instanceof TopicError) throw error
    throw new TopicError(`Failed to get topic name: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get topic's examples
 * @param id - The topic's unique identifier
 * @returns Promise<string[] | null> - The topic's examples array or null if not found
 */
export async function getTopicExamples(id: string): Promise<string[] | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new TopicError('Invalid topic ID provided', 'INVALID_ID')
    }

    const topic = await prisma.topic.findUnique({
      where: { id },
      select: { examples: true }
    })

    return topic?.examples || null
  } catch (error) {
    if (error instanceof TopicError) throw error
    throw new TopicError(`Failed to get topic examples: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== SETTERS ====================

/**
 * Update topic by ID
 * @param id - The topic's unique identifier
 * @param data - Partial topic data to update
 * @returns Promise<Topic> - The updated topic object
 */
export async function updateTopic(id: string, data: {
  name?: string
  examples?: string[]
}): Promise<Topic> {
  try {
    if (!id || typeof id !== 'string') {
      throw new TopicError('Invalid topic ID provided', 'INVALID_ID')
    }

    // Validate name if provided
    if (data.name && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
      throw new TopicError('Name cannot be empty', 'INVALID_NAME')
    }

    // Validate examples if provided
    if (data.examples && !Array.isArray(data.examples)) {
      throw new TopicError('Examples must be an array', 'INVALID_EXAMPLES')
    }

    const topic = await prisma.topic.update({
      where: { id },
      data
    })

    return topic
  } catch (error) {
    if (error instanceof TopicError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new TopicError('Topic not found', 'NOT_FOUND')
    }
    throw new TopicError(`Failed to update topic: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set topic's name
 * @param id - The topic's unique identifier
 * @param name - The new name
 * @returns Promise<Topic> - The updated topic object
 */
export async function setTopicName(id: string, name: string): Promise<Topic> {
  try {
    if (!id || typeof id !== 'string') {
      throw new TopicError('Invalid topic ID provided', 'INVALID_ID')
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new TopicError('Name cannot be empty', 'INVALID_NAME')
    }

    const topic = await prisma.topic.update({
      where: { id },
      data: { name: name.trim() }
    })

    return topic
  } catch (error) {
    if (error instanceof TopicError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new TopicError('Topic not found', 'NOT_FOUND')
    }
    throw new TopicError(`Failed to set topic name: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set topic's examples
 * @param id - The topic's unique identifier
 * @param examples - The new examples array
 * @returns Promise<Topic> - The updated topic object
 */
export async function setTopicExamples(id: string, examples: string[]): Promise<Topic> {
  try {
    if (!id || typeof id !== 'string') {
      throw new TopicError('Invalid topic ID provided', 'INVALID_ID')
    }

    if (!Array.isArray(examples)) {
      throw new TopicError('Examples must be an array', 'INVALID_EXAMPLES')
    }

    // Validate that all examples are strings
    if (!examples.every(example => typeof example === 'string')) {
      throw new TopicError('All examples must be strings', 'INVALID_EXAMPLES')
    }

    const topic = await prisma.topic.update({
      where: { id },
      data: { examples }
    })

    return topic
  } catch (error) {
    if (error instanceof TopicError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new TopicError('Topic not found', 'NOT_FOUND')
    }
    throw new TopicError(`Failed to set topic examples: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Add example to topic
 * @param id - The topic's unique identifier
 * @param example - The example to add
 * @returns Promise<Topic> - The updated topic object
 */
export async function addTopicExample(id: string, example: string): Promise<Topic> {
  try {
    if (!id || typeof id !== 'string') {
      throw new TopicError('Invalid topic ID provided', 'INVALID_ID')
    }

    if (typeof example !== 'string') {
      throw new TopicError('Example must be a string', 'INVALID_EXAMPLE')
    }

    const topic = await prisma.topic.update({
      where: { id },
      data: {
        examples: {
          push: example
        }
      }
    })

    return topic
  } catch (error) {
    if (error instanceof TopicError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new TopicError('Topic not found', 'NOT_FOUND')
    }
    throw new TopicError(`Failed to add topic example: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Remove example from topic
 * @param id - The topic's unique identifier
 * @param example - The example to remove
 * @returns Promise<Topic> - The updated topic object
 */
export async function removeTopicExample(id: string, example: string): Promise<Topic> {
  try {
    if (!id || typeof id !== 'string') {
      throw new TopicError('Invalid topic ID provided', 'INVALID_ID')
    }

    if (typeof example !== 'string') {
      throw new TopicError('Example must be a string', 'INVALID_EXAMPLE')
    }

    const currentTopic = await prisma.topic.findUnique({
      where: { id },
      select: { examples: true }
    })

    if (!currentTopic) {
      throw new TopicError('Topic not found', 'NOT_FOUND')
    }

    const updatedExamples = currentTopic.examples.filter(ex => ex !== example)

    const topic = await prisma.topic.update({
      where: { id },
      data: { examples: updatedExamples }
    })

    return topic
  } catch (error) {
    if (error instanceof TopicError) throw error
    throw new TopicError(`Failed to remove topic example: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

// ==================== RELATIONSHIPS ====================

/**
 * Get topic's block
 * @param id - The topic's unique identifier
 * @returns Promise<Block | null> - The topic's block or null if not found
 */
export async function getTopicBlock(id: string): Promise<Block | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new TopicError('Invalid topic ID provided', 'INVALID_ID')
    }

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: { block: true }
    })

    return topic?.block || null
  } catch (error) {
    if (error instanceof TopicError) throw error
    throw new TopicError(`Failed to get topic block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get topic's quizzes
 * @param id - The topic's unique identifier
 * @returns Promise<Quiz[]> - Array of quizzes for the topic
 */
export async function getTopicQuizzes(id: string): Promise<Quiz[]> {
  try {
    if (!id || typeof id !== 'string') {
      throw new TopicError('Invalid topic ID provided', 'INVALID_ID')
    }

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: { quizzes: true }
    })

    return topic?.quizzes || []
  } catch (error) {
    if (error instanceof TopicError) throw error
    throw new TopicError(`Failed to get topic quizzes: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get topics by block
 * @param blockId - The block's unique identifier
 * @returns Promise<Topic[]> - Array of topics for the block
 */
export async function getTopicsByBlock(blockId: string): Promise<Topic[]> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new TopicError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const topics = await prisma.topic.findMany({
      where: { blockId }
    })

    return topics
  } catch (error) {
    if (error instanceof TopicError) throw error
    throw new TopicError(`Failed to get topics by block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get topic with all related data
 * @param id - The topic's unique identifier
 * @returns Promise<Topic & { block: Block; quizzes: Quiz[] }> - Topic with related data
 */
export async function getTopicWithRelations(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      throw new TopicError('Invalid topic ID provided', 'INVALID_ID')
    }

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: { block: true, quizzes: true }
    })

    return topic
  } catch (error) {
    if (error instanceof TopicError) throw error
    throw new TopicError(`Failed to get topic with relations: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== CRUD OPERATIONS ====================

/**
 * Create a new topic
 * @param data - Topic data for creation
 * @returns Promise<Topic> - The created topic object
 */
export async function createTopic(data: {
  name: string
  blockId: string
  examples?: string[]
}): Promise<Topic> {
  try {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new TopicError('Name is required and cannot be empty', 'INVALID_NAME')
    }

    if (!data.blockId || typeof data.blockId !== 'string') {
      throw new TopicError('Block ID is required', 'INVALID_BLOCK_ID')
    }

    if (data.examples && !Array.isArray(data.examples)) {
      throw new TopicError('Examples must be an array', 'INVALID_EXAMPLES')
    }

    const topic = await prisma.topic.create({
      data: {
        name: data.name.trim(),
        blockId: data.blockId,
        examples: data.examples || []
      }
    })

    return topic
  } catch (error) {
    if (error instanceof TopicError) throw error
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      throw new TopicError('Invalid block ID', 'FOREIGN_KEY_ERROR')
    }
    throw new TopicError(`Failed to create topic: ${error instanceof Error ? error.message : 'Unknown error'}`, 'CREATE_ERROR')
  }
}

/**
 * Delete a topic by ID
 * @param id - The topic's unique identifier
 * @returns Promise<Topic> - The deleted topic object
 */
export async function deleteTopic(id: string): Promise<Topic> {
  try {
    if (!id || typeof id !== 'string') {
      throw new TopicError('Invalid topic ID provided', 'INVALID_ID')
    }

    const topic = await prisma.topic.delete({
      where: { id }
    })

    return topic
  } catch (error) {
    if (error instanceof TopicError) throw error
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      throw new TopicError('Topic not found', 'NOT_FOUND')
    }
    throw new TopicError(`Failed to delete topic: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DELETE_ERROR')
  }
}

/**
 * Check if topic exists
 * @param id - The topic's unique identifier
 * @returns Promise<boolean> - True if topic exists, false otherwise
 */
export async function topicExists(id: string): Promise<boolean> {
  try {
    if (!id || typeof id !== 'string') {
      return false
    }

    const count = await prisma.topic.count({
      where: { id }
    })

    return count > 0
  } catch (error) {
    throw new TopicError(`Failed to check if topic exists: ${error instanceof Error ? error.message : 'Unknown error'}`, 'EXISTS_ERROR')
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Search topics by name (case-insensitive)
 * @param searchTerm - The search term
 * @returns Promise<Topic[]> - Array of matching topics
 */
export async function searchTopicsByName(searchTerm: string): Promise<Topic[]> {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new TopicError('Invalid search term', 'INVALID_SEARCH')
    }

    const topics = await prisma.topic.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    })

    return topics
  } catch (error) {
    if (error instanceof TopicError) throw error
    throw new TopicError(`Failed to search topics: ${error instanceof Error ? error.message : 'Unknown error'}`, 'SEARCH_ERROR')
  }
}

/**
 * Get topics with examples
 * @returns Promise<Topic[]> - Array of topics that have examples
 */
export async function getTopicsWithExamples(): Promise<Topic[]> {
  try {
    const topics = await prisma.topic.findMany({
      where: {
        examples: {
          isEmpty: false
        }
      }
    })

    return topics
  } catch (error) {
    throw new TopicError(`Failed to get topics with examples: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get random topic
 * @returns Promise<Topic | null> - Random topic or null if none available
 */
export async function getRandomTopic(): Promise<Topic | null> {
  try {
    const topics = await prisma.topic.findMany()

    if (topics.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * topics.length)
    return topics[randomIndex]
  } catch (error) {
    throw new TopicError(`Failed to get random topic: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get random topic by block
 * @param blockId - The block's unique identifier
 * @returns Promise<Topic | null> - Random topic for the block or null if none available
 */
export async function getRandomTopicByBlock(blockId: string): Promise<Topic | null> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new TopicError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const topics = await prisma.topic.findMany({
      where: { blockId }
    })

    if (topics.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * topics.length)
    return topics[randomIndex]
  } catch (error) {
    if (error instanceof TopicError) throw error
    throw new TopicError(`Failed to get random topic by block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get topics with quizzes
 * @returns Promise<Topic[]> - Array of topics that have quizzes
 */
export async function getTopicsWithQuizzes(): Promise<Topic[]> {
  try {
    const topics = await prisma.topic.findMany({
      where: {
        quizzes: {
          some: {}
        }
      },
      include: {
        quizzes: true
      }
    })

    return topics
  } catch (error) {
    throw new TopicError(`Failed to get topics with quizzes: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
} 