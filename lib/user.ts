import prisma from './prisma'
import { User, Mode } from './generated/prisma'

/**
 * Custom error class for User operations
 */
export class UserError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'UserError'
  }
}

/**
 * User model operations
 * Provides type-safe CRUD operations for the User model
 */

// ==================== GETTERS ====================

/**
 * Get a user by their ID
 * @param id - The user's unique identifier
 * @returns Promise<User | null> - The user object or null if not found
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    const user = await prisma.user.findUnique({
      where: { id }
    })

    return user
  } catch (error) {
    if (error instanceof UserError) throw error
    throw new UserError(`Failed to get user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get a user by their email
 * @param email - The user's email address
 * @returns Promise<User | null> - The user object or null if not found
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    if (!email || typeof email !== 'string') {
      throw new UserError('Invalid email provided', 'INVALID_EMAIL')
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    return user
  } catch (error) {
    if (error instanceof UserError) throw error
    throw new UserError(`Failed to get user by email: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all users
 * @returns Promise<User[]> - Array of all users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany()
    return users
  } catch (error) {
    throw new UserError(`Failed to get all users: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get user count
 * @returns Promise<number> - Total number of users
 */
export async function getUserCount(): Promise<number> {
  try {
    const count = await prisma.user.count()
    return count
  } catch (error) {
    throw new UserError(`Failed to get user count: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COUNT_ERROR')
  }
}

/**
 * Get user's name
 * @param id - The user's unique identifier
 * @returns Promise<string | null> - The user's name or null if not found
 */
export async function getUserName(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true }
    })

    return user?.name || null
  } catch (error) {
    if (error instanceof UserError) throw error
    throw new UserError(`Failed to get user name: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get user's email
 * @param id - The user's unique identifier
 * @returns Promise<string | null> - The user's email or null if not found
 */
export async function getUserEmail(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true }
    })

    return user?.email || null
  } catch (error) {
    if (error instanceof UserError) throw error
    throw new UserError(`Failed to get user email: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get user's mode
 * @param id - The user's unique identifier
 * @returns Promise<Mode | null> - The user's mode or null if not found
 */
export async function getUserMode(id: string): Promise<Mode | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { mode: true }
    })

    return user?.mode || null
  } catch (error) {
    if (error instanceof UserError) throw error
    throw new UserError(`Failed to get user mode: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== SETTERS ====================

/**
 * Update user by ID
 * @param id - The user's unique identifier
 * @param data - Partial user data to update
 * @returns Promise<User> - The updated user object
 */
export async function updateUser(id: string, data: Partial<Omit<User, 'id'>>): Promise<User> {
  try {
    if (!id || typeof id !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    // Validate email format if provided
    if (data.email && !isValidEmail(data.email)) {
      throw new UserError('Invalid email format', 'INVALID_EMAIL')
    }

    const user = await prisma.user.update({
      where: { id },
      data
    })

    return user
  } catch (error) {
    if (error instanceof UserError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new UserError('User not found', 'NOT_FOUND')
    }
    throw new UserError(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set user's name
 * @param id - The user's unique identifier
 * @param name - The new name
 * @returns Promise<User> - The updated user object
 */
export async function setUserName(id: string, name: string): Promise<User> {
  try {
    if (!id || typeof id !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new UserError('Name cannot be empty', 'INVALID_NAME')
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name: name.trim() }
    })

    return user
  } catch (error) {
    if (error instanceof UserError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new UserError('User not found', 'NOT_FOUND')
    }
    throw new UserError(`Failed to set user name: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set user's email
 * @param id - The user's unique identifier
 * @param email - The new email
 * @returns Promise<User> - The updated user object
 */
export async function setUserEmail(id: string, email: string): Promise<User> {
  try {
    if (!id || typeof id !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    if (!isValidEmail(email)) {
      throw new UserError('Invalid email format', 'INVALID_EMAIL')
    }

    const user = await prisma.user.update({
      where: { id },
      data: { email: email.toLowerCase().trim() }
    })

    return user
  } catch (error) {
    if (error instanceof UserError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new UserError('User not found', 'NOT_FOUND')
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      throw new UserError('Email already exists', 'EMAIL_EXISTS')
    }
    throw new UserError(`Failed to set user email: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set user's mode
 * @param id - The user's unique identifier
 * @param mode - The new mode
 * @returns Promise<User> - The updated user object
 */
export async function setUserMode(id: string, mode: Mode): Promise<User> {
  try {
    if (!id || typeof id !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    if (!Object.values(Mode).includes(mode)) {
      throw new UserError('Invalid mode value', 'INVALID_MODE')
    }

    const user = await prisma.user.update({
      where: { id },
      data: { mode }
    })

    return user
  } catch (error) {
    if (error instanceof UserError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new UserError('User not found', 'NOT_FOUND')
    }
    throw new UserError(`Failed to set user mode: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

// ==================== RELATIONSHIPS ====================

/**
 * Get all posts (blocks) by user
 * @param userId - The user's unique identifier
 * @returns Promise<Block[]> - Array of user's posts
 */
export async function getUserPosts(userId: string) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    const posts = await prisma.block.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        folderId: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return posts
  } catch (error) {
    if (error instanceof UserError) throw error
    throw new UserError(`Failed to get user posts: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all folders by user
 * @param userId - The user's unique identifier
 * @returns Promise<Folder[]> - Array of user's folders
 */
export async function getUserFolders(userId: string) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    const folders = await prisma.folder.findMany({
      where: { authorId: userId }, 
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true,
        parentId: true,
        authorId: true  // Add this to check if folders are properly linked
    },
    orderBy: {
        createdAt: 'desc'
    }

    })

    return folders
  } catch (error) {
    if (error instanceof UserError) throw error
    throw new UserError(`Failed to get user folders: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

export async function getUserCrates(userId: string) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    const crates = await prisma.folder.findMany({
      where: {
        parentId: null,
        authorId: userId
      },
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true
      }
    })
    return crates;
  } catch (error) {
    console.error("Failed to fetch crates:", error);
    throw new Error("Failed to fetch crates");
  }
}

/**
 * Get user with all related data
 * @param id - The user's unique identifier
 * @returns Promise<User & { posts: Block[], folders: Folder[] }> - User with related data
 */
export async function getUserWithRelations(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: true,
        folders: true
      }
    })

    return user
  } catch (error) {
    if (error instanceof UserError) throw error
    throw new UserError(`Failed to get user with relations: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== CRUD OPERATIONS ====================

/**
 * Create a new user
 * @param data - User data for creation
 * @returns Promise<User> - The created user object
 */
export async function createUser(data: {
  email: string
  name?: string
  mode?: Mode
}): Promise<User> {
  try {
    if (!data.email || !isValidEmail(data.email)) {
      throw new UserError('Valid email is required', 'INVALID_EMAIL')
    }

    if (data.name && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
      throw new UserError('Name cannot be empty if provided', 'INVALID_NAME')
    }

    if (data.mode && !Object.values(Mode).includes(data.mode)) {
      throw new UserError('Invalid mode value', 'INVALID_MODE')
    }

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name?.trim(),
        mode: data.mode
      }
    })

    return user
  } catch (error) {
    if (error instanceof UserError) throw error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      throw new UserError('Email already exists', 'EMAIL_EXISTS')
    }
    throw new UserError(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`, 'CREATE_ERROR')
  }
}

/**
 * Delete a user by ID
 * @param id - The user's unique identifier
 * @returns Promise<User> - The deleted user object
 */
export async function deleteUser(id: string): Promise<User> {
  try {
    if (!id || typeof id !== 'string') {
      throw new UserError('Invalid user ID provided', 'INVALID_ID')
    }

    const user = await prisma.user.delete({
      where: { id }
    })

    return user
  } catch (error) {
    if (error instanceof UserError) throw error
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      throw new UserError('User not found', 'NOT_FOUND')
    }
    throw new UserError(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DELETE_ERROR')
  }
}

/**
 * Check if user exists
 * @param id - The user's unique identifier
 * @returns Promise<boolean> - True if user exists, false otherwise
 */
export async function userExists(id: string): Promise<boolean> {
  try {
    if (!id || typeof id !== 'string') {
      return false
    }

    const count = await prisma.user.count({
      where: { id }
    })

    return count > 0
  } catch (error) {
    throw new UserError(`Failed to check if user exists: ${error instanceof Error ? error.message : 'Unknown error'}`, 'EXISTS_ERROR')
  }
}

/**
 * Check if email exists
 * @param email - The email to check
 * @returns Promise<boolean> - True if email exists, false otherwise
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    if (!email || !isValidEmail(email)) {
      return false
    }

    const count = await prisma.user.count({
      where: { email: email.toLowerCase().trim() }
    })

    return count > 0
  } catch (error) {
    throw new UserError(`Failed to check if email exists: ${error instanceof Error ? error.message : 'Unknown error'}`, 'EXISTS_ERROR')
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Validate email format
 * @param email - Email to validate
 * @returns boolean - True if valid, false otherwise
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Get users by mode
 * @param mode - The mode to filter by
 * @returns Promise<User[]> - Array of users with the specified mode
 */
export async function getUsersByMode(mode: Mode): Promise<User[]> {
  try {
    if (!Object.values(Mode).includes(mode)) {
      throw new UserError('Invalid mode value', 'INVALID_MODE')
    }

    const users = await prisma.user.findMany({
      where: { mode }
    })

    return users
  } catch (error) {
    if (error instanceof UserError) throw error
    throw new UserError(`Failed to get users by mode: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Search users by name (case-insensitive)
 * @param searchTerm - The search term
 * @returns Promise<User[]> - Array of matching users
 */
export async function searchUsersByName(searchTerm: string): Promise<User[]> {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new UserError('Invalid search term', 'INVALID_SEARCH')
    }

    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    })

    return users
  } catch (error) {
    if (error instanceof UserError) throw error
    throw new UserError(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`, 'SEARCH_ERROR')
  }
} 