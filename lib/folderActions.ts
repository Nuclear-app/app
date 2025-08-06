'use server'

import { getUserFileStructure, getRootLevelItems } from './folder'
import { getUserFileStructureWithCache } from './redis'

/**
 * Server action to get user file structure (safe for client components)
 * @param userId - The user's unique identifier
 * @returns Promise<{success: boolean, data: any[], error: string | null}>
 */
export async function getUserFileStructureAction(userId: string): Promise<{success: boolean, data: any[], error: string | null}> {
  console.log("userId", userId);
  try {
    if (!userId) {
      return { success: false, data: [], error: 'User ID is required' }
    }

    const structure = await getUserFileStructureWithCache(userId)
    return { success: true, data: structure, error: null }
  } catch (error) {
    console.error('Failed to fetch user file structure:', error)
    return { 
      success: false, 
      data: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Server action to get root-level items for sidebar (safe for client components)
 * @param userId - The user's unique identifier
 * @returns Promise<{success: boolean, data: any[], error: string | null}>
 */
export async function getRootLevelItemsAction(userId: string): Promise<{success: boolean, data: any[], error: string | null}> {
  console.log("getRootLevelItemsAction - userId:", userId);
  try {
    if (!userId) {
      return { success: false, data: [], error: 'User ID is required' }
    }

    const items = await getRootLevelItems(userId)
    return { success: true, data: items, error: null }
  } catch (error) {
    console.error('Failed to fetch root level items:', error)
    return { 
      success: false, 
      data: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
} 