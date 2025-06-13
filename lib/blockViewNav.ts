"use server"

import prisma from "./prisma"

interface BreadcrumbItem {
  id: string
  name: string
  type: 'block' | 'folder'
}

export const getBlockPoints = async (blockId: string): Promise<number> => {
  try {
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      select: { points: true }
    })

    if (!block) {
      console.warn(`Block with ID ${blockId} not found`)
      return 0
    }

    return block.points ?? 0
  } catch (error) {
    console.error('Error fetching block points:', error)
    return 0
  }
}

export default async function getBreadcrumb(blockId: string): Promise<BreadcrumbItem[]> {
  try {
  const result: BreadcrumbItem[] = []
  
  // First, get the block
  const block = await prisma.block.findUnique({
    where: { id: blockId },
    select: {
      id: true,
      title: true,
      folderId: true
    }
  })

  if (!block) {
    throw new Error('Block not found')
  }

    // If the block has a folder, traverse up the folder hierarchy first
  let currentFolderId = block.folderId
    const folders: BreadcrumbItem[] = []

  while (currentFolderId) {
    const folder = await prisma.folder.findUnique({
      where: { id: currentFolderId },
      select: {
        id: true,
        name: true,
        parentId: true
      }
    })

    if (!folder) {
      break
    }

      // Add the folder to the folders array
      folders.unshift({
      id: folder.id,
      name: folder.name,
      type: 'folder'
    })

    // Move up to the parent folder
    currentFolderId = folder.parentId

    // Check if we've reached the root folder
    if (currentFolderId === process.env.ROOT_FOLDER_ID) {
      // Add the root folder
      const rootFolder = await prisma.folder.findUnique({
        where: { id: currentFolderId },
        select: {
          id: true,
          name: true
        }
      })

      if (rootFolder) {
          folders.unshift({
          id: rootFolder.id,
          name: rootFolder.name,
          type: 'folder'
        })
      }
      break
    }
  }

    // Combine folders and block in the correct order
    return [...folders, {
      id: block.id,
      name: block.title,
      type: 'block'
    }]
  } catch (error) {
    console.error('Error in getBreadcrumb:', error)
    throw error
  }
}