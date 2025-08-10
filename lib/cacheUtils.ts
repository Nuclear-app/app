import { 
  invalidateBlockCache, 
  invalidateUserCache, 
  invalidateFolderCache,
  invalidateQuizCache,
  invalidateQuestionCache,
  invalidateFillInTheBlankCache,
  invalidateTopicCache
} from "@/lib/redis";
import { redis } from "@/lib/redisClient";

// ==================== CACHE INVALIDATION HELPERS ====================

/**
 * Invalidate all caches related to a block
 * @param blockId - The block ID
 */
export async function invalidateAllBlockCaches(blockId: string) {
  await invalidateBlockCache(blockId);
}

/**
 * Invalidate all caches related to a user
 * @param userId - The user ID
 */
export async function invalidateAllUserCaches(userId: string) {
  await invalidateUserCache(userId);
}

/**
 * Invalidate all caches related to a folder
 * @param folderId - The folder ID
 */
export async function invalidateAllFolderCaches(folderId: string) {
  await invalidateFolderCache(folderId);
}

/**
 * Invalidate all caches related to a quiz
 * @param quizId - The quiz ID
 */
export async function invalidateAllQuizCaches(quizId: string) {
  await invalidateQuizCache(quizId);
}

/**
 * Invalidate all caches related to a question
 * @param questionId - The question ID
 */
export async function invalidateAllQuestionCaches(questionId: string) {
  await invalidateQuestionCache(questionId);
}

/**
 * Invalidate all caches related to a fill-in-the-blank
 * @param fitbId - The fill-in-the-blank ID
 */
export async function invalidateAllFillInTheBlankCaches(fitbId: string) {
  await invalidateFillInTheBlankCache(fitbId);
}

/**
 * Invalidate all caches related to a topic
 * @param topicId - The topic ID
 */
export async function invalidateAllTopicCaches(topicId: string) {
  await invalidateTopicCache(topicId);
}

// ==================== BULK CACHE INVALIDATION ====================

/**
 * Invalidate caches for multiple blocks
 * @param blockIds - Array of block IDs
 */
export async function invalidateMultipleBlockCaches(blockIds: string[]) {
  await Promise.all(blockIds.map(id => invalidateBlockCache(id)));
}

/**
 * Invalidate caches for multiple users
 * @param userIds - Array of user IDs
 */
export async function invalidateMultipleUserCaches(userIds: string[]) {
  await Promise.all(userIds.map(id => invalidateUserCache(id)));
}

/**
 * Invalidate caches for multiple folders
 * @param folderIds - Array of folder IDs
 */
export async function invalidateMultipleFolderCaches(folderIds: string[]) {
  await Promise.all(folderIds.map(id => invalidateFolderCache(id)));
}

// ==================== CACHE HEALTH CHECK ====================

/**
 * Check if Redis is connected and working
 * @returns Promise<boolean> - True if Redis is working
 */
export async function checkRedisHealth() {
  try { 
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

// ==================== CACHE STATISTICS ====================

/**
 * Get cache statistics (if supported by your Redis setup)
 * @returns Promise<object> - Cache statistics
 */
export async function getCacheStats() {
  try {
    // Use a simple ping to check if Redis is working
    await redis.ping();
    return {
      connected: true,
      message: 'Redis is connected and working'
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==================== CACHE CLEARING ====================

/**
 * Clear all caches (use with caution)
 * @returns Promise<boolean> - True if successful
 */
export async function clearAllCaches() {
  try {
    await redis.flushdb();
    return true;
  } catch (error) {
    console.error('Failed to clear all caches:', error);
    return false;
  }
}

/**
 * Clear caches by pattern
 * @param pattern - Redis pattern to match keys
 * @returns Promise<number> - Number of keys cleared
 * @warning This function uses redis.keys() which can be slow on large datasets
 */
export async function clearCachesByPattern(pattern: string) {
  try {
    // For safety, limit the pattern to prevent accidental deletion of all keys
    if (pattern === '*' || pattern === '') {
      console.warn('Pattern "*" or "" is not allowed for safety. Use clearAllCaches() instead.');
      return 0;
    }
    
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      // Delete keys in batches to avoid overwhelming Redis
      const batchSize = 100;
      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        await redis.del(...batch);
      }
    }
    return keys.length;
  } catch (error) {
    console.error('Failed to clear caches by pattern:', error);
    return 0;
  }
} 