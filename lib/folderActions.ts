'use server'

import { getUserFileStructure } from './folder'

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

    const structure = await getUserFileStructure(userId)
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