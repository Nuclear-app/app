import prisma from './prisma'
import { FileContext, Block } from '@prisma/client'

/**
 * Custom error class for FileContext operations
 */
export class FileContextError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'FileContextError'
  }
}

/**
 * FileContext model operations
 * Provides type-safe CRUD operations for the FileContext model
 */

// ==================== GETTERS ====================

/**
 * Get a file context by ID
 * @param id - The file context's unique identifier
 * @returns Promise<FileContext | null> - The file context object or null if not found
 */
export async function getFileContextById(id: string): Promise<FileContext | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FileContextError('Invalid file context ID provided', 'INVALID_ID')
    }

    const fileContext = await prisma.fileContext.findUnique({
      where: { id }
    })

    return fileContext
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file context by ID: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all file contexts for a specific block
 * @param blockId - The block's unique identifier
 * @returns Promise<FileContext[]> - Array of file contexts for the block
 */
export async function getFileContextsByBlockId(blockId: string): Promise<FileContext[]> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new FileContextError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const fileContexts = await prisma.fileContext.findMany({
      where: { blockId },
      orderBy: { createdAt: 'desc' }
    })

    return fileContexts
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file contexts by block ID: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get file context by file name within a block
 * @param blockId - The block's unique identifier
 * @param fileName - The file name to search for
 * @returns Promise<FileContext | null> - The file context object or null if not found
 */
export async function getFileContextByFileName(blockId: string, fileName: string): Promise<FileContext | null> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new FileContextError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    if (!fileName || typeof fileName !== 'string') {
      throw new FileContextError('Invalid file name provided', 'INVALID_FILE_NAME')
    }

    const fileContext = await prisma.fileContext.findFirst({
      where: {
        blockId,
        fileName: fileName.trim()
      }
    })

    return fileContext
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file context by file name: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all file contexts
 * @returns Promise<FileContext[]> - Array of all file contexts
 */
export async function getAllFileContexts(): Promise<FileContext[]> {
  try {
    const fileContexts = await prisma.fileContext.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return fileContexts
  } catch (error) {
    throw new FileContextError(`Failed to get all file contexts: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get file context count
 * @returns Promise<number> - Total number of file contexts
 */
export async function getFileContextCount(): Promise<number> {
  try {
    const count = await prisma.fileContext.count()
    return count
  } catch (error) {
    throw new FileContextError(`Failed to get file context count: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COUNT_ERROR')
  }
}

/**
 * Get file context count for a specific block
 * @param blockId - The block's unique identifier
 * @returns Promise<number> - Number of file contexts for the block
 */
export async function getFileContextCountByBlockId(blockId: string): Promise<number> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new FileContextError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const count = await prisma.fileContext.count({
      where: { blockId }
    })
    return count
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file context count by block ID: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COUNT_ERROR')
  }
}

/**
 * Get file context's file name
 * @param id - The file context's unique identifier
 * @returns Promise<string | null> - The file name or null if not found
 */
export async function getFileContextFileName(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FileContextError('Invalid file context ID provided', 'INVALID_ID')
    }

    const fileContext = await prisma.fileContext.findUnique({
      where: { id },
      select: { fileName: true }
    })

    return fileContext?.fileName || null
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file context file name: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get file context's text content
 * @param id - The file context's unique identifier
 * @returns Promise<string | null> - The text content or null if not found
 */
export async function getFileContextText(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FileContextError('Invalid file context ID provided', 'INVALID_ID')
    }

    const fileContext = await prisma.fileContext.findUnique({
      where: { id },
      select: { text: true }
    })

    return fileContext?.text || null
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file context text: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get file context's creation date
 * @param id - The file context's unique identifier
 * @returns Promise<Date | null> - The creation date or null if not found
 */
export async function getFileContextCreatedAt(id: string): Promise<Date | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FileContextError('Invalid file context ID provided', 'INVALID_ID')
    }

    const fileContext = await prisma.fileContext.findUnique({
      where: { id },
      select: { createdAt: true }
    })

    return fileContext?.createdAt || null
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file context creation date: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get file context's last update date
 * @param id - The file context's unique identifier
 * @returns Promise<Date | null> - The last update date or null if not found
 */
export async function getFileContextUpdatedAt(id: string): Promise<Date | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FileContextError('Invalid file context ID provided', 'INVALID_ID')
    }

    const fileContext = await prisma.fileContext.findUnique({
      where: { id },
      select: { updatedAt: true }
    })

    return fileContext?.updatedAt || null
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file context update date: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== SETTERS ====================

/**
 * Update file context by ID
 * @param id - The file context's unique identifier
 * @param data - Partial file context data to update
 * @returns Promise<FileContext> - The updated file context object
 */
export async function updateFileContext(id: string, data: Partial<Omit<FileContext, 'id' | 'createdAt'>>): Promise<FileContext> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FileContextError('Invalid file context ID provided', 'INVALID_ID')
    }

    // Validate file name if provided
    if (data.fileName && (typeof data.fileName !== 'string' || data.fileName.trim().length === 0)) {
      throw new FileContextError('File name cannot be empty', 'INVALID_FILE_NAME')
    }

    // Validate text if provided
    if (data.text !== undefined && typeof data.text !== 'string') {
      throw new FileContextError('Text must be a string', 'INVALID_TEXT')
    }

    const fileContext = await prisma.fileContext.update({
      where: { id },
      data: {
        ...data,
        fileName: data.fileName?.trim(),
        updatedAt: new Date()
      }
    })

    return fileContext
  } catch (error) {
    if (error instanceof FileContextError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new FileContextError('File context not found', 'NOT_FOUND')
    }
    throw new FileContextError(`Failed to update file context: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set file context's file name
 * @param id - The file context's unique identifier
 * @param fileName - The new file name
 * @returns Promise<FileContext> - The updated file context object
 */
export async function setFileContextFileName(id: string, fileName: string): Promise<FileContext> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FileContextError('Invalid file context ID provided', 'INVALID_ID')
    }

    if (typeof fileName !== 'string' || fileName.trim().length === 0) {
      throw new FileContextError('File name cannot be empty', 'INVALID_FILE_NAME')
    }

    const fileContext = await prisma.fileContext.update({
      where: { id },
      data: { 
        fileName: fileName.trim(),
        updatedAt: new Date()
      }
    })

    return fileContext
  } catch (error) {
    if (error instanceof FileContextError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new FileContextError('File context not found', 'NOT_FOUND')
    }
    throw new FileContextError(`Failed to set file context file name: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set file context's text content
 * @param id - The file context's unique identifier
 * @param text - The new text content
 * @returns Promise<FileContext> - The updated file context object
 */
export async function setFileContextText(id: string, text: string): Promise<FileContext> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FileContextError('Invalid file context ID provided', 'INVALID_ID')
    }

    if (typeof text !== 'string') {
      throw new FileContextError('Text must be a string', 'INVALID_TEXT')
    }

    const fileContext = await prisma.fileContext.update({
      where: { id },
      data: { 
        text,
        updatedAt: new Date()
      }
    })

    return fileContext
  } catch (error) {
    if (error instanceof FileContextError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new FileContextError('File context not found', 'NOT_FOUND')
    }
    throw new FileContextError(`Failed to set file context text: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

// ==================== RELATIONSHIPS ====================

/**
 * Get file context with its block
 * @param id - The file context's unique identifier
 * @returns Promise<FileContext & { block: Block } | null> - File context with block or null if not found
 */
export async function getFileContextWithBlock(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      throw new FileContextError('Invalid file context ID provided', 'INVALID_ID')
    }

    const fileContext = await prisma.fileContext.findUnique({
      where: { id },
      include: {
        block: true
      }
    })

    return fileContext
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file context with block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all file contexts for a block with block information
 * @param blockId - The block's unique identifier
 * @returns Promise<(FileContext & { block: Block })[]> - Array of file contexts with block information
 */
export async function getFileContextsWithBlockByBlockId(blockId: string) {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new FileContextError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const fileContexts = await prisma.fileContext.findMany({
      where: { blockId },
      include: {
        block: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return fileContexts
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file contexts with block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== CRUD OPERATIONS ====================

/**
 * Create a new file context
 * @param data - File context data for creation
 * @returns Promise<FileContext> - The created file context object
 */
export async function createFileContext(data: {
  fileName: string
  text: string
  blockId: string
}): Promise<FileContext> {
  try {
    if (!data.fileName || typeof data.fileName !== 'string' || data.fileName.trim().length === 0) {
      throw new FileContextError('Valid file name is required', 'INVALID_FILE_NAME')
    }

    if (typeof data.text !== 'string') {
      throw new FileContextError('Text content is required', 'INVALID_TEXT')
    }

    if (!data.blockId || typeof data.blockId !== 'string') {
      throw new FileContextError('Valid block ID is required', 'INVALID_BLOCK_ID')
    }

    // Check if block exists
    const blockExists = await prisma.block.findUnique({
      where: { id: data.blockId },
      select: { id: true }
    })

    if (!blockExists) {
      throw new FileContextError('Block not found', 'BLOCK_NOT_FOUND')
    }

    const fileContext = await prisma.fileContext.create({
      data: {
        fileName: data.fileName.trim(),
        text: data.text,
        blockId: data.blockId
      }
    })

    return fileContext
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to create file context: ${error instanceof Error ? error.message : 'Unknown error'}`, 'CREATE_ERROR')
  }
}

/**
 * Delete a file context by ID
 * @param id - The file context's unique identifier
 * @returns Promise<FileContext> - The deleted file context object
 */
export async function deleteFileContext(id: string): Promise<FileContext> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FileContextError('Invalid file context ID provided', 'INVALID_ID')
    }

    const fileContext = await prisma.fileContext.delete({
      where: { id }
    })

    return fileContext
  } catch (error) {
    if (error instanceof FileContextError) throw error
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      throw new FileContextError('File context not found', 'NOT_FOUND')
    }
    throw new FileContextError(`Failed to delete file context: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DELETE_ERROR')
  }
}

/**
 * Delete all file contexts for a block
 * @param blockId - The block's unique identifier
 * @returns Promise<number> - Number of deleted file contexts
 */
export async function deleteFileContextsByBlockId(blockId: string): Promise<number> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new FileContextError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    const result = await prisma.fileContext.deleteMany({
      where: { blockId }
    })

    return result.count
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to delete file contexts by block ID: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DELETE_ERROR')
  }
}

/**
 * Check if file context exists
 * @param id - The file context's unique identifier
 * @returns Promise<boolean> - True if file context exists, false otherwise
 */
export async function fileContextExists(id: string): Promise<boolean> {
  try {
    if (!id || typeof id !== 'string') {
      return false
    }

    const count = await prisma.fileContext.count({
      where: { id }
    })

    return count > 0
  } catch (error) {
    throw new FileContextError(`Failed to check if file context exists: ${error instanceof Error ? error.message : 'Unknown error'}`, 'EXISTS_ERROR')
  }
}

/**
 * Check if file name exists within a block
 * @param blockId - The block's unique identifier
 * @param fileName - The file name to check
 * @returns Promise<boolean> - True if file name exists, false otherwise
 */
export async function fileNameExistsInBlock(blockId: string, fileName: string): Promise<boolean> {
  try {
    if (!blockId || typeof blockId !== 'string') {
      return false
    }

    if (!fileName || typeof fileName !== 'string') {
      return false
    }

    const count = await prisma.fileContext.count({
      where: {
        blockId,
        fileName: fileName.trim()
      }
    })

    return count > 0
  } catch (error) {
    throw new FileContextError(`Failed to check if file name exists in block: ${error instanceof Error ? error.message : 'Unknown error'}`, 'EXISTS_ERROR')
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Search file contexts by file name (case-insensitive)
 * @param searchTerm - The search term
 * @returns Promise<FileContext[]> - Array of matching file contexts
 */
export async function searchFileContextsByFileName(searchTerm: string): Promise<FileContext[]> {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new FileContextError('Invalid search term', 'INVALID_SEARCH')
    }

    const fileContexts = await prisma.fileContext.findMany({
      where: {
        fileName: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return fileContexts
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to search file contexts: ${error instanceof Error ? error.message : 'Unknown error'}`, 'SEARCH_ERROR')
  }
}

/**
 * Search file contexts by text content (case-insensitive)
 * @param searchTerm - The search term
 * @returns Promise<FileContext[]> - Array of matching file contexts
 */
export async function searchFileContextsByText(searchTerm: string): Promise<FileContext[]> {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new FileContextError('Invalid search term', 'INVALID_SEARCH')
    }

    const fileContexts = await prisma.fileContext.findMany({
      where: {
        text: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return fileContexts
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to search file contexts by text: ${error instanceof Error ? error.message : 'Unknown error'}`, 'SEARCH_ERROR')
  }
}

/**
 * Get file contexts created within a date range
 * @param startDate - Start date for the range
 * @param endDate - End date for the range
 * @returns Promise<FileContext[]> - Array of file contexts in the date range
 */
export async function getFileContextsByDateRange(startDate: Date, endDate: Date): Promise<FileContext[]> {
  try {
    if (!startDate || !endDate) {
      throw new FileContextError('Both start and end dates are required', 'INVALID_DATE_RANGE')
    }

    if (startDate > endDate) {
      throw new FileContextError('Start date must be before end date', 'INVALID_DATE_RANGE')
    }

    const fileContexts = await prisma.fileContext.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return fileContexts
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file contexts by date range: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get file contexts updated within a date range
 * @param startDate - Start date for the range
 * @param endDate - End date for the range
 * @returns Promise<FileContext[]> - Array of file contexts updated in the date range
 */
export async function getFileContextsByUpdateDateRange(startDate: Date, endDate: Date): Promise<FileContext[]> {
  try {
    if (!startDate || !endDate) {
      throw new FileContextError('Both start and end dates are required', 'INVALID_DATE_RANGE')
    }

    if (startDate > endDate) {
      throw new FileContextError('Start date must be before end date', 'INVALID_DATE_RANGE')
    }

    const fileContexts = await prisma.fileContext.findMany({
      where: {
        updatedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return fileContexts
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file contexts by update date range: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get file contexts by block ID with pagination
 * @param blockId - The block's unique identifier
 * @param page - Page number (1-based)
 * @param limit - Number of items per page
 * @returns Promise<{ fileContexts: FileContext[], total: number, page: number, totalPages: number }> - Paginated results
 */
export async function getFileContextsByBlockIdPaginated(
  blockId: string, 
  page: number = 1, 
  limit: number = 10
) {
  try {
    if (!blockId || typeof blockId !== 'string') {
      throw new FileContextError('Invalid block ID provided', 'INVALID_BLOCK_ID')
    }

    if (page < 1) {
      throw new FileContextError('Page must be at least 1', 'INVALID_PAGE')
    }

    if (limit < 1 || limit > 100) {
      throw new FileContextError('Limit must be between 1 and 100', 'INVALID_LIMIT')
    }

    const skip = (page - 1) * limit

    const [fileContexts, total] = await Promise.all([
      prisma.fileContext.findMany({
        where: { blockId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.fileContext.count({
        where: { blockId }
      })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      fileContexts,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get paginated file contexts: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get file contexts with text longer than specified length
 * @param minLength - Minimum text length
 * @returns Promise<FileContext[]> - Array of file contexts with text longer than minLength
 */
export async function getFileContextsWithLongText(minLength: number): Promise<FileContext[]> {
  try {
    if (minLength < 0) {
      throw new FileContextError('Minimum length must be non-negative', 'INVALID_LENGTH')
    }

    const fileContexts = await prisma.fileContext.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return fileContexts.filter(context => context.text.length > minLength)
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file contexts with long text: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get file contexts with text shorter than specified length
 * @param maxLength - Maximum text length
 * @returns Promise<FileContext[]> - Array of file contexts with text shorter than maxLength
 */
export async function getFileContextsWithShortText(maxLength: number): Promise<FileContext[]> {
  try {
    if (maxLength < 0) {
      throw new FileContextError('Maximum length must be non-negative', 'INVALID_LENGTH')
    }

    const fileContexts = await prisma.fileContext.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return fileContexts.filter(context => context.text.length < maxLength)
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file contexts with short text: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get unique file extensions from file contexts
 * @returns Promise<string[]> - Array of unique file extensions
 */
export async function getUniqueFileExtensions(): Promise<string[]> {
  try {
    const fileContexts = await prisma.fileContext.findMany({
      select: { fileName: true }
    })

    const extensions = fileContexts
      .map(context => {
        const parts = context.fileName.split('.')
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : null
      })
      // The original code used `.filter(ext => ext !== null) as string[]` to remove nulls and then cast the result to string[].
      // This is unsafe because TypeScript can't guarantee that all non-null values are strings.
      // The improved code uses a type predicate: `.filter((ext): ext is string => ext !== null)`.
      // This tells TypeScript that after filtering, the array contains only strings, so no type assertion is needed.
      // Also, `Array.from(new Set(extensions))` is used instead of `[...new Set(extensions)]` for clarity, but both are equivalent.
      .filter((ext): ext is string => ext !== null)

    return Array.from(new Set(extensions))
  } catch (error) {
    throw new FileContextError(`Failed to get unique file extensions: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get file contexts by file extension
 * @param extension - The file extension to filter by
 * @returns Promise<FileContext[]> - Array of file contexts with the specified extension
 */
export async function getFileContextsByExtension(extension: string): Promise<FileContext[]> {
  try {
    if (!extension || typeof extension !== 'string') {
      throw new FileContextError('Valid extension is required', 'INVALID_EXTENSION')
    }

    const fileContexts = await prisma.fileContext.findMany({
      where: {
        fileName: {
          endsWith: `.${extension.toLowerCase()}`
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return fileContexts
  } catch (error) {
    if (error instanceof FileContextError) throw error
    throw new FileContextError(`Failed to get file contexts by extension: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get statistics about file contexts
 * @returns Promise<{ total: number, totalTextLength: number, averageTextLength: number, uniqueBlocks: number }> - Statistics
 */
export async function getFileContextStats() {
  try {
    const [total, fileContexts] = await Promise.all([
      prisma.fileContext.count(),
      prisma.fileContext.findMany({
        select: { text: true, blockId: true }
      })
    ])

    const totalTextLength = fileContexts.reduce((sum, context) => sum + context.text.length, 0)
    const averageTextLength = total > 0 ? totalTextLength / total : 0
    const uniqueBlocks = new Set(fileContexts.map(context => context.blockId)).size

    return {
      total,
      totalTextLength,
      averageTextLength: Math.round(averageTextLength),
      uniqueBlocks
    }
  } catch (error) {
    throw new FileContextError(`Failed to get file context stats: ${error instanceof Error ? error.message : 'Unknown error'}`, 'STATS_ERROR')
  }
}

/**
 * Get filenames from FileContext for a specific block
 * @param blockId - The block ID
 * @returns Promise<string[]> - Array of filenames
 */
export async function getFileNamesByBlockId(blockId: string): Promise<string[]> {
  try {
    const fileContexts = await prisma.fileContext.findMany({
      where: { blockId },
      select: { fileName: true }
    });
    
    return fileContexts.map(fc => fc.fileName);
  } catch (error) {
    console.error('Error getting file names by block ID:', error);
    return [];
  }
}

/**
 * Delete a specific file from FileContext
 * @param blockId - The block ID
 * @param fileName - The filename to delete
 * @returns Promise<boolean> - Success status
 */
export async function deleteFileFromContext(blockId: string, fileName: string): Promise<boolean> {
  try {
    await prisma.fileContext.deleteMany({
      where: {
        blockId: blockId,
        fileName: fileName
      }
    });
    return true;
  } catch (error) {
    console.error('Error deleting file from context:', error);
    return false;
  }
} 