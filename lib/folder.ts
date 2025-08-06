import prisma from './prisma'
import { Folder, User, Block } from '@prisma/client'
import { createClient } from '@/utils/supabase/server';

const ROOT_FOLDER_ID = process.env.ROOT_FOLDER_ID ;


/**
 * Custom error class for Folder operations
 */
export class FolderError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'FolderError'
  }
}

/**
 * Folder model operations
 * Provides type-safe CRUD operations for the Folder model
 */

// ==================== GETTERS ====================

/**
 * Get a folder by its ID
 * @param id - The folder's unique identifier
 * @returns Promise<Folder | null> - The folder object or null if not found
 */
export async function getFolderById(id: string): Promise<Folder | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    const folder = await prisma.folder.findUnique({
      where: { id }
    })

    return folder
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get folder by ID: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all folders
 * @returns Promise<Folder[]> - Array of all folders
 */
export async function getAllFolders(): Promise<Folder[]> {
  try {
    const folders = await prisma.folder.findMany()
    return folders
  } catch (error) {
    throw new FolderError(`Failed to get all folders: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get folder count
 * @returns Promise<number> - Total number of folders
 */
export async function getFolderCount(): Promise<number> {
  try {
    const count = await prisma.folder.count()
    return count
  } catch (error) {
    throw new FolderError(`Failed to get folder count: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COUNT_ERROR')
  }
}


export async function getTopLevelFolders(userId: string): Promise<Folder[]> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new FolderError('Invalid user ID provided', 'INVALID_USER_ID')
    }

    const folders = await prisma.folder.findMany({
      where: {
        parentId: ROOT_FOLDER_ID,
        authorId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return folders
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get top level folders: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get folder's name
 * @param id - The folder's unique identifier
 * @returns Promise<string | null> - The folder's name or null if not found
 */
export async function getFolderName(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    const folder = await prisma.folder.findUnique({
      where: { id },
      select: { name: true }
    })

    return folder?.name || null
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get folder name: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get folder's icon
 * @param id - The folder's unique identifier
 * @returns Promise<string | null> - The folder's icon or null if not found
 */
export async function getFolderIcon(id: string): Promise<string | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    const folder = await prisma.folder.findUnique({
      where: { id },
      select: { icon: true }
    })

    return folder?.icon || null
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get folder icon: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get folder's creation date
 * @param id - The folder's unique identifier
 * @returns Promise<Date | null> - The folder's creation date or null if not found
 */
export async function getFolderCreatedAt(id: string): Promise<Date | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    const folder = await prisma.folder.findUnique({
      where: { id },
      select: { createdAt: true }
    })

    return folder?.createdAt || null
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get folder creation date: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get folder's update date
 * @param id - The folder's unique identifier
 * @returns Promise<Date | null> - The folder's update date or null if not found
 */
export async function getFolderUpdatedAt(id: string): Promise<Date | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    const folder = await prisma.folder.findUnique({
      where: { id },
      select: { updatedAt: true }
    })

    return folder?.updatedAt || null
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get folder update date: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== SETTERS ====================

/**
 * Update folder by ID
 * @param id - The folder's unique identifier
 * @param data - Partial folder data to update
 * @returns Promise<Folder> - The updated folder object
 */
export async function updateFolder(id: string, data: {
  name?: string
  icon?: string
  parentId?: string | null
}): Promise<Folder> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    // Validate name if provided
    if (data.name && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
      throw new FolderError('Name cannot be empty', 'INVALID_NAME')
    }

    // Validate parentId if provided
    if (data.parentId !== undefined && data.parentId !== null && (typeof data.parentId !== 'string' || data.parentId.trim().length === 0)) {
      throw new FolderError('Invalid parent ID provided', 'INVALID_PARENT_ID')
    }

    const folder = await prisma.folder.update({
      where: { id },
      data
    })

    return folder
  } catch (error) {
    if (error instanceof FolderError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new FolderError('Folder not found', 'NOT_FOUND')
    }
    throw new FolderError(`Failed to update folder: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set folder's name
 * @param id - The folder's unique identifier
 * @param name - The new name
 * @returns Promise<Folder> - The updated folder object
 */
export async function setFolderName(id: string, name: string): Promise<Folder> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new FolderError('Name cannot be empty', 'INVALID_NAME')
    }

    const folder = await prisma.folder.update({
      where: { id },
      data: { name: name.trim() }
    })

    return folder
  } catch (error) {
    if (error instanceof FolderError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new FolderError('Folder not found', 'NOT_FOUND')
    }
    throw new FolderError(`Failed to set folder name: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set folder's icon
 * @param id - The folder's unique identifier
 * @param icon - The new icon
 * @returns Promise<Folder> - The updated folder object
 */
export async function setFolderIcon(id: string, icon: string): Promise<Folder> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    if (typeof icon !== 'string') {
      throw new FolderError('Icon must be a string', 'INVALID_ICON')
    }

    const folder = await prisma.folder.update({
      where: { id },
      data: { icon }
    })

    return folder
  } catch (error) {
    if (error instanceof FolderError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new FolderError('Folder not found', 'NOT_FOUND')
    }
    throw new FolderError(`Failed to set folder icon: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

/**
 * Set folder's parent
 * @param id - The folder's unique identifier
 * @param parentId - The new parent ID
 * @returns Promise<Folder> - The updated folder object
 */
export async function setFolderParent(id: string, parentId: string | null): Promise<Folder> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    if (parentId !== null && (typeof parentId !== 'string' || parentId.trim().length === 0)) {
      throw new FolderError('Invalid parent ID provided', 'INVALID_PARENT_ID')
    }

    const folder = await prisma.folder.update({
      where: { id },
      data: { parentId: parentId?.trim() || null }
    })

    return folder
  } catch (error) {
    if (error instanceof FolderError) throw error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      throw new FolderError('Folder not found', 'NOT_FOUND')
    }
    throw new FolderError(`Failed to set folder parent: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
}

// ==================== RELATIONSHIPS ====================

/**
 * Get folder's author
 * @param id - The folder's unique identifier
 * @returns Promise<User | null> - The folder's author or null if not found
 */
export async function getFolderAuthor(id: string): Promise<User | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    const folder = await prisma.folder.findUnique({
      where: { id },
      include: { author: true }
    })

    return folder?.author || null
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get folder author: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get folder's parent
 * @param id - The folder's unique identifier
 * @returns Promise<Folder | null> - The folder's parent or null if not found
 */
export async function getFolderParent(id: string): Promise<Folder | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    const folder = await prisma.folder.findUnique({
      where: { id },
      include: { parent: true }
    })

    return folder?.parent || null
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get folder parent: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get folder's children
 * @param id - The folder's unique identifier
 * @returns Promise<Folder[]> - Array of folder's children
 */
export async function getFolderChildren(id: string): Promise<Folder[]> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    const folder = await prisma.folder.findUnique({
      where: { id },
      include: { children: true }
    })

    return folder?.children || []
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get folder children: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get folder's blocks
 * @param id - The folder's unique identifier
 * @returns Promise<Block[]> - Array of folder's blocks
 */
export async function getFolderBlocks(id: string): Promise<Block[]> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    const folder = await prisma.folder.findUnique({
      where: { id },
      include: { blocks: true }
    })

    return folder?.blocks || []
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get folder blocks: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get folders by author
 * @param authorId - The author's unique identifier
 * @returns Promise<Folder[]> - Array of folders by the author
 */
export async function getFoldersByAuthor(authorId: string): Promise<Folder[]> {
  try {
    if (!authorId || typeof authorId !== 'string') {
      throw new FolderError('Invalid author ID provided', 'INVALID_AUTHOR_ID')
    }

    const folders = await prisma.folder.findMany({
      where: { authorId }
    })

    return folders
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get folders by author: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}



/**
 * Get folder with all related data
 * @param id - The folder's unique identifier
 * @returns Promise<Folder & { author: User | null, parent: Folder | null, children: Folder[], blocks: Block[] }> - Folder with related data
 */
export async function getFolderWithRelations(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        author: true,
        parent: true,
        children: true,
        blocks: true
      }
    })

    return folder
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get folder with relations: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

// ==================== CRUD OPERATIONS ====================

/**
 * Create a new folder
 * @param data - Folder data for creation
 * @returns Promise<Folder> - The created folder object
 */
export async function createFolder(data: {
  name: string
  authorId?: string
  parentId?: string
  icon?: string
}): Promise<Folder> {
  try {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new FolderError('Name is required and cannot be empty', 'INVALID_NAME')
    }

    if (data.parentId && (typeof data.parentId !== 'string' || data.parentId.trim().length === 0)) {
      throw new FolderError('Invalid parent ID provided', 'INVALID_PARENT_ID')
    }

    const folder = await prisma.folder.create({
      data: {
        name: data.name.trim(),
        authorId: data.authorId,
        parentId: data.parentId?.trim(),
        icon: data.icon
      }
    })

    return folder
  } catch (error) {
    if (error instanceof FolderError) throw error
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      throw new FolderError('Invalid author or parent ID', 'FOREIGN_KEY_ERROR')
    }
    throw new FolderError(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`, 'CREATE_ERROR')
  }
}

/**
 * Delete a folder by ID
 * @param id - The folder's unique identifier
 * @returns Promise<Folder> - The deleted folder object
 */
export async function deleteFolder(id: string, userId?: string): Promise<{ success: boolean }> {
  try {
    const crate = await prisma.folder.findUnique({
      where: { id: id },
      select: { 
          authorId: true,
          blocks: {
              select: {
                  id: true
              }
          },
          children: {
              select: {
                  id: true
              }
          }
      }
  });

  if (!crate || crate.authorId !== userId) {
      throw new Error("Unauthorized to delete this crate");
  }

  // Delete all related data in a transaction
  await prisma.$transaction(async (tx) => {
      // First, recursively delete all child crates and their contents
      for (const child of crate.children) {
          await deleteFolder(child.id, userId);
      }

      // Delete all blocks in this crate
      for (const block of crate.blocks) {
          // Delete all FillInTheBlank entries
          await tx.fillInTheBlank.deleteMany({
              where: { blockId: block.id }
          });
          // Delete all Questions
          await tx.question.deleteMany({
              where: { blockId: block.id }
          });
          // Delete all Quizzes
          await tx.quiz.deleteMany({
              where: { blockId: block.id }
          });
          // Delete all Topics
          await tx.topic.deleteMany({
              where: { blockId: block.id }
          });
          // Delete the block itself
          await tx.block.delete({
              where: { id: block.id }
          });

          // Clean up any uploaded files in Supabase storage for this block
          const supabase = await createClient();
          const { data: files } = await supabase
              .storage
              .from('blocks')
              .list(`${block.id}`);

          if (files && files.length > 0) {
              const filePaths = files.map((file: { name: string }) => `${block.id}/${file.name}`);
              await supabase
                  .storage
                  .from('blocks')
                  .remove(filePaths);
          }
      }

      // Finally, delete the crate itself
      await tx.folder.delete({
          where: { id: id }
      });
  });

  return { success: true };
} catch (error) {
  console.error("Failed to delete crate:", error);
  throw error;
}
}

/**
 * Check if folder exists
 * @param id - The folder's unique identifier
 * @returns Promise<boolean> - True if folder exists, false otherwise
 */
export async function folderExists(id: string): Promise<boolean> {
  try {
    if (!id || typeof id !== 'string') {
      return false
    }

    const count = await prisma.folder.count({
      where: { id }
    })

    return count > 0
  } catch (error) {
    throw new FolderError(`Failed to check if folder exists: ${error instanceof Error ? error.message : 'Unknown error'}`, 'EXISTS_ERROR')
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Search folders by name (case-insensitive)
 * @param searchTerm - The search term
 * @returns Promise<Folder[]> - Array of matching folders
 */
export async function searchFoldersByName(searchTerm: string): Promise<Folder[]> {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new FolderError('Invalid search term', 'INVALID_SEARCH')
    }

    const folders = await prisma.folder.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    })

    return folders
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to search folders: ${error instanceof Error ? error.message : 'Unknown error'}`, 'SEARCH_ERROR')
  }
}

/**
 * Get folder hierarchy (breadcrumb path)
 * @param id - The folder's unique identifier
 * @returns Promise<Folder[]> - Array of folders from root to current folder
 */
export async function getFolderHierarchy(id: string): Promise<Folder[]> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    const hierarchy: Folder[] = []
    let currentFolder = await getFolderById(id)

    if (!currentFolder) {
      throw new FolderError('Folder not found', 'NOT_FOUND')
    }

    // Build hierarchy from current folder up to root
    while (currentFolder) {
      hierarchy.unshift(currentFolder)
      
      if (currentFolder.parentId) {
        currentFolder = await getFolderById(currentFolder.parentId)
      } else {
        currentFolder = null
      }
    }

    return hierarchy
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get folder hierarchy: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get all subfolders recursively
 * @param id - The folder's unique identifier
 * @returns Promise<Folder[]> - Array of all subfolders
 */
export async function getAllSubfolders(id: string): Promise<Folder[]> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    const subfolders: Folder[] = []
    
    const collectSubfolders = async (folderId: string) => {
      const children = await prisma.folder.findMany({
        where: { parentId: folderId }
      })
      
      for (const child of children) {
        subfolders.push(child)
        await collectSubfolders(child.id)
      }
    }

    await collectSubfolders(id)
    return subfolders
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get all subfolders: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Move folder to new parent
 * @param id - The folder's unique identifier
 * @param newParentId - The new parent's unique identifier
 * @returns Promise<Folder> - The updated folder object
 */
export async function moveFolder(id: string, newParentId: string | null): Promise<Folder> {
  try {
    if (!id || typeof id !== 'string') {
      throw new FolderError('Invalid folder ID provided', 'INVALID_ID')
    }

    if (newParentId !== null && (typeof newParentId !== 'string' || newParentId.trim().length === 0)) {
      throw new FolderError('Invalid new parent ID provided', 'INVALID_PARENT_ID')
    }

    // Prevent circular reference
    if (newParentId === id) {
      throw new FolderError('Cannot move folder to itself', 'CIRCULAR_REFERENCE')
    }

    // Check if new parent is a descendant of current folder
    if (newParentId) {
      const descendants = await getAllSubfolders(id)
      if (descendants.some(folder => folder.id === newParentId)) {
        throw new FolderError('Cannot move folder to its descendant', 'CIRCULAR_REFERENCE')
      }
    }

    const folder = await prisma.folder.update({
      where: { id },
      data: { parentId: newParentId?.trim() || null }
    })

    return folder
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to move folder: ${error instanceof Error ? error.message : 'Unknown error'}`, 'UPDATE_ERROR')
  }
} 

/**
 * Get complete file structure for a user
 * @param userId - The user's unique identifier
 * @returns Promise<Array> - Array of folder structure objects for Magic UI Tree
 */
export async function getUserFileStructure(userId: string): Promise<any[]> {
  try {
    console.log("userId", userId);
    if (!userId || typeof userId !== 'string') {
      throw new FolderError('Invalid user ID provided', 'INVALID_USER_ID')
    }

    // Get all folders for the user
    const folders = await prisma.folder.findMany({
      where: { authorId: userId },
      include: {
        children: true,
        blocks: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get all blocks for the user (including those not in folders)
    const allBlocks = await prisma.block.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        folderId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log("folders", folders);
    console.log("allBlocks", allBlocks);

    // Build the tree structure
    const buildTree = (parentId: string | null = null): any[] => {
      const children = folders.filter(folder => folder.parentId === parentId)
      
      return children.map(folder => {
        const folderChildren = buildTree(folder.id)
        const blockFiles = folder.blocks.map(block => ({
          element: block.title || 'Untitled Block',
          value: block.id,
          type: 'file'
        }))

        return {
          element: folder.name,
          value: folder.id,
          type: 'folder',
          children: [...folderChildren, ...blockFiles]
        }
      })
    }

    // Start building from root folders (those with parentId = ROOT_FOLDER_ID)
    const rootFolders = folders.filter(folder => 
      folder.parentId === ROOT_FOLDER_ID
    )

    const treeStructure = rootFolders.map(folder => {
      const folderChildren = buildTree(folder.id)
      const blockFiles = folder.blocks.map(block => ({
        element: block.title || 'Untitled Block',
        value: block.id,
        type: 'file'
      }))

      return {
        element: folder.name,
        value: folder.id,
        type: 'folder',
        children: [...folderChildren, ...blockFiles]
      }
    })

    // Add root-level blocks (blocks that are in ROOT_FOLDER_ID or have no folderId)
    const rootLevelBlocks = allBlocks.filter(block => 
      block.folderId === ROOT_FOLDER_ID || !block.folderId
    )

    const rootBlockFiles = rootLevelBlocks.map(block => ({
      element: block.title || 'Untitled Block',
      value: block.id,
      type: 'file'
    }))

    // Combine folders and root-level blocks
    return [...treeStructure, ...rootBlockFiles]
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get user file structure: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
}

/**
 * Get root-level items for sidebar display
 * @param userId - The user's unique identifier
 * @returns Promise<Array> - Array of root-level items (folders and blocks)
 */
export async function getRootLevelItems(userId: string): Promise<any[]> {
  try {
    console.log("getRootLevelItems - userId:", userId);
    if (!userId || typeof userId !== 'string') {
      throw new FolderError('Invalid user ID provided', 'INVALID_USER_ID')
    }

    // Get root-level folders (those with parentId = ROOT_FOLDER_ID)
    const rootFolders = await prisma.folder.findMany({
      where: { 
        authorId: userId,
        parentId: ROOT_FOLDER_ID
      },
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get root-level blocks (those with folderId = ROOT_FOLDER_ID or null)
    const rootBlocks = await prisma.block.findMany({
      where: { 
        authorId: userId,
        OR: [
          { folderId: ROOT_FOLDER_ID },
          { folderId: null }
        ]
      },
      select: {
        id: true,
        title: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log("getRootLevelItems - rootFolders:", rootFolders);
    console.log("getRootLevelItems - rootBlocks:", rootBlocks);

    // Convert to the expected format
    const folders = rootFolders.map(folder => ({
      element: folder.name,
      value: folder.id,
      type: 'folder'
    }))

    const blocks = rootBlocks.map(block => ({
      element: block.title || 'Untitled Block',
      value: block.id,
      type: 'file'
    }))

    // Combine and return
    return [...folders, ...blocks]
  } catch (error) {
    if (error instanceof FolderError) throw error
    throw new FolderError(`Failed to get root level items: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GET_ERROR')
  }
} 