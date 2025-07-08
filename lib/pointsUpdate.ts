
import prisma from './prisma'
import { PointsUpdate, Block } from './generated/prisma'

/**
 * Custom error class for PointsUpdate operations
 */
export class PointsUpdateError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'PointsUpdateError'
  }
}

/**
 * PointsUpdate model operations
 * Provides type-safe CRUD operations for the PointsUpdate model
 */

// ==================== GETTERS ====================

/**
 * Get a points update by its ID
 * @param id - The points update's unique identifier
 * @returns Promise<PointsUpdate | null> - The points update object or null if not found
 */
export async function getPointsUpdateById(id: string): Promise<PointsUpdate | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new PointsUpdateError('Invalid points update ID provided', 'INVALID_ID')
    }

    const pointsUpdate = await prisma.pointsUpdate.findUnique({
      where: { id }
    })

    return pointsUpdate
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    throw new PointsUpdateError(`Failed to get points update by ID: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all points updates
 * @returns Promise<PointsUpdate[]> - Array of all points updates
 */
export async function getAllPointsUpdates(): Promise<PointsUpdate[]> {
  try {
    const pointsUpdates = await prisma.pointsUpdate.findMany()
    return pointsUpdates
  } catch (error) {
    throw new PointsUpdateError(`Failed to get all points updates: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get points update count
 * @returns Promise<number> - Total number of points updates
 */
export async function getPointsUpdateCount(): Promise<number> {
  try {
    const count = await prisma.pointsUpdate.count()
    return count
  } catch (error) {
    throw new PointsUpdateError(`Failed to get points update count: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COUNT_ERROR')
  }
}

/**
 * Get points update's points
 * @param id - The points update's unique identifier
 * @returns Promise<number | null> - The points update's points or null if not found
 */
export async function getPointsUpdatePoints(id: string): Promise<number | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new PointsUpdateError('Invalid points update ID provided', 'INVALID_ID')
    }

    const pointsUpdate = await prisma.pointsUpdate.findUnique({
      where: { id },
      select: { points: true }
    })

    return pointsUpdate?.points || null
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    throw new PointsUpdateError(`Failed to get points update points: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get points update's creation date
 * @param id - The points update's unique identifier
 * @returns Promise<Date | null> - The points update's creation date or null if not found
 */
export async function getPointsUpdateCreatedAt(id: string): Promise<Date | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new PointsUpdateError('Invalid points update ID provided', 'INVALID_ID')
    }

    const pointsUpdate = await prisma.pointsUpdate.findUnique({
      where: { id },
      select: { createdAt: true }
    })

    return pointsUpdate?.createdAt || null
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    throw new PointsUpdateError(`Failed to get points update creation date: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== SETTERS ====================

/**
 * Update points update by ID
 * @param id - The points update's unique identifier
 * @param data - Partial points update data to update
 * @returns Promise<PointsUpdate> - The updated points update object
 */
export async function updatePointsUpdate(id: string, data: {
  points?: number
}): Promise<PointsUpdate> {
  try {
    if (!id || typeof id !== 'string') {
      throw new PointsUpdateError('Invalid points update ID provided', 'INVALID_ID')
    }

    // Validate points if provided
    if (data.points !== undefined && (typeof data.points !== 'number' || data.points < 0)) {
      throw new PointsUpdateError('Points must be a non-negative number', 'INVALID_POINTS')
    }

    const pointsUpdate = await prisma.pointsUpdate.update({
      where: { id },
      data
    })

    return pointsUpdate
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new PointsUpdateError('Points update not found', 'NOT_FOUND')
    }
    throw new PointsUpdateError(`Failed to update points update: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set points update's points
 * @param id - The points update's unique identifier
 * @param points - The new points value
 * @returns Promise<PointsUpdate> - The updated points update object
 */
export async function setPointsUpdatePoints(id: string, points: number): Promise<PointsUpdate> {
  try {
    if (!id || typeof id !== 'string') {
      throw new PointsUpdateError('Invalid points update ID provided', 'INVALID_ID')
    }

    if (typeof points !== 'number' || points < 0) {
      throw new PointsUpdateError('Points must be a non-negative number', 'INVALID_POINTS')
    }

    const pointsUpdate = await prisma.pointsUpdate.update({
      where: { id },
      data: { points }
    })

    return pointsUpdate
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new PointsUpdateError('Points update not found', 'NOT_FOUND')
    }
    throw new PointsUpdateError(`Failed to set points update points: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

// ==================== RELATIONSHIPS ====================

/**
 * Get points update's block
 * @param id - The points update's unique identifier
 * @returns Promise<Block | null> - The points update's block or null if not found
 */
export async function getPointsUpdateBlock(id: string): Promise<Block | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new PointsUpdateError('Invalid points update ID provided', 'INVALID_ID')
    }

    const pointsUpdate = await prisma.pointsUpdate.findUnique({
      where: { id },
      include: { block: true }
    })

    return pointsUpdate?.block || null
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    throw new PointsUpdateError(`Failed to get points update block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get points updates by block
 * @param blockId - The block's unique identifier
 * @returns Promise<PointsUpdate[]> - Array of points updates for the block
 */
export async function getPointsUpdatesByBlock(blockId: string): Promise<PointsUpdate[]> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new PointsUpdateError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const pointsUpdates = await prisma.pointsUpdate.findMany({
      where: { blockId }
    })

    return pointsUpdates
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    throw new PointsUpdateError(`Failed to get points updates by block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get points update with all related data
 * @param id - The points update's unique identifier
 * @returns Promise<PointsUpdate & { block: Block }> - Points update with related data
 */
export async function getPointsUpdateWithRelations(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      throw new PointsUpdateError('Invalid points update ID provided', 'INVALID_ID')
    }

    const pointsUpdate = await prisma.pointsUpdate.findUnique({
      where: { id },
      include: { block: true }
    })

    return pointsUpdate
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    throw new PointsUpdateError(`Failed to get points update with relations: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== CRUD OPERATIONS ====================

/**
 * Create a new points update
 * @param data - Points update data for creation
 * @returns Promise<PointsUpdate> - The created points update object
 */
export async function createPointsUpdate(data: {
  id: string
  blockId: string
  points?: number
}): Promise<PointsUpdate> {
  try {
    if (!data.id || typeof data.id !== 'string') {
      throw new PointsUpdateError('ID is required', 'INVALID_ID')
    }

    if (!data.blockId || typeof data.blockId !== 'string') {
      throw new PointsUpdateError('Block ID is required', 'INVALID_BLOCK_ID')
    }

    if (data.points !== undefined && (typeof data.points !== 'number' || data.points < 0)) {
      throw new PointsUpdateError('Points must be a non-negative number', 'INVALID_POINTS')
    }

    const pointsUpdate = await prisma.pointsUpdate.create({
      data: {
        id: data.id,
        blockId: data.blockId,
        points: data.points || 0
      }
    })

    return pointsUpdate
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      throw new PointsUpdateError('Invalid block ID', 'FOREIGN_KEY_ERROR')
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      throw new PointsUpdateError('Points update with this ID already exists', 'ID_EXISTS')
    }
    throw new PointsUpdateError(`Failed to create points update: ${error instanceof Error ? error.message : 'Unknown error'}`, 'CREATE_ERROR')
  }
}

/**
 * Delete a points update by ID
 * @param id - The points update's unique identifier
 * @returns Promise<PointsUpdate> - The deleted points update object
 */
export async function deletePointsUpdate(id: string): Promise<PointsUpdate> {
  try {
    if (!id || typeof id !== 'string') {
      throw new PointsUpdateError('Invalid points update ID provided', 'INVALID_ID')
    }

    const pointsUpdate = await prisma.pointsUpdate.delete({
      where: { id }
    })

    return pointsUpdate
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      throw new PointsUpdateError('Points update not found', 'NOT_FOUND')
    }
    throw new PointsUpdateError(`Failed to delete points update: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DELETE_ERROR')
  }
}

/**
 * Check if points update exists
 * @param id - The points update's unique identifier
 * @returns Promise<boolean> - True if points update exists, false otherwise
 */
export async function pointsUpdateExists(id: string): Promise<boolean> {
  try {
    if (!id || typeof id !== 'string') {
      return false
    }

    const count = await prisma.pointsUpdate.count({
      where: { id }
    })

    return count > 0
  } catch (error) {
    throw new PointsUpdateError(`Failed to check if points update exists: ${error instanceof Error ? error.message : 'Unknown error'}`, 'EXISTS_ERROR')
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get total points for a block
 * @param blockId - The block's unique identifier
 * @returns Promise<number> - Total points for the block
 */
export async function getTotalPointsForBlock(blockId: string): Promise<number> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new PointsUpdateError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const result = await prisma.pointsUpdate.aggregate({
      where: { blockId },
      _sum: { points: true }
    })

    return result._sum.points || 0
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    throw new PointsUpdateError(`Failed to get total points for block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get points updates by date range
 * @param startDate - Start date for the range
 * @param endDate - End date for the range
 * @returns Promise<PointsUpdate[]> - Array of points updates in the date range
 */
export async function getPointsUpdatesByDateRange(startDate: Date, endDate: Date): Promise<PointsUpdate[]> {
  try {
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new PointsUpdateError('Invalid date provided', 'INVALID_DATE')
    }

    if (startDate > endDate) {
      throw new PointsUpdateError('Start date must be before end date', 'INVALID_DATE_RANGE')
    }

    const pointsUpdates = await prisma.pointsUpdate.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    return pointsUpdates
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    throw new PointsUpdateError(`Failed to get points updates by date range: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get points updates with minimum points
 * @param minPoints - Minimum points threshold
 * @returns Promise<PointsUpdate[]> - Array of points updates with sufficient points
 */
export async function getPointsUpdatesByMinPoints(minPoints: number): Promise<PointsUpdate[]> {
  try {
    if (typeof minPoints !== 'number' || minPoints < 0) {
      throw new PointsUpdateError('Minimum points must be a non-negative number', 'INVALID_POINTS')
    }

    const pointsUpdates = await prisma.pointsUpdate.findMany({
      where: {
        points: {
          gte: minPoints
        }
      }
    })

    return pointsUpdates
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    throw new PointsUpdateError(`Failed to get points updates by minimum points: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get latest points update for a block
 * @param blockId - The block's unique identifier
 * @returns Promise<PointsUpdate | null> - Latest points update for the block or null if none found
 */
export async function getLatestPointsUpdateForBlock(blockId: string): Promise<PointsUpdate | null> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new PointsUpdateError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const pointsUpdate = await prisma.pointsUpdate.findFirst({
      where: { blockId },
      orderBy: { createdAt: 'desc' }
    })

    return pointsUpdate
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    throw new PointsUpdateError(`Failed to get latest points update for block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get points updates for a block ordered by date
 * @param blockId - The block's unique identifier
 * @param order - Order direction ('asc' or 'desc')
 * @returns Promise<PointsUpdate[]> - Array of points updates ordered by date
 */
export async function getPointsUpdatesForBlockOrdered(blockId: string, order: 'asc' | 'desc' = 'desc'): Promise<PointsUpdate[]> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new PointsUpdateError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    if (order !== 'asc' && order !== 'desc') {
      throw new PointsUpdateError('Order must be either "asc" or "desc"', 'INVALID_ORDER')
    }

    const pointsUpdates = await prisma.pointsUpdate.findMany({
      where: { blockId },
      orderBy: { createdAt: order }
    })

    return pointsUpdates
  } catch (error) {
    if (error instanceof PointsUpdateError) throw error
    throw new PointsUpdateError(`Failed to get points updates for block ordered: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
} 