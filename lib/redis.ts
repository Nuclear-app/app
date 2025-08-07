
/**
 * Redis Caching System for Application Data
 * 
 * This module provides a comprehensive caching layer using Upstash Redis to improve
 * application performance by reducing database queries and API calls.
 * 
 * ## Redis Configuration
 * 
 * ### Setup
 * The Redis client is configured using Upstash Redis REST API:
 * ```typescript
 * export const redis = new Redis({
 *   url: process.env.UPSTASH_REDIS_REST_URL!,
 *   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
 * });
 * ```
 * 
 * ## Architecture
 * 
 * The caching system uses a "cache-aside" pattern where:
 * 1. Data is fetched from cache first
 * 2. If cache miss, data is fetched from the source (database/API)
 * 3. Data is then stored in cache for future requests
 * 4. Cache entries have configurable TTL (Time To Live)
 * 
 * ## Key Components
 * 
 * ### Core Functions
 * - `cacheAside<T>()`: Generic caching function that handles cache hits/misses
 * - `redis`: Upstash Redis client instance
 * 
 * ### Cached Data Types
 * - **Blocks**: Basic block data, relations, notes, context, points, files
 * - **Users**: User data, relations, blocks, folders, names
 * - **Folders**: Folder data, relations, blocks, hierarchy
 * - **Quizzes**: Quiz data, questions, topics, usage statistics
 * - **Questions**: Question data, search functionality
 * - **Fill-in-the-Blanks**: FITB exercises and data
 * - **Topics**: Topic data and relationships
 * - **Flashcards**: Generated flashcard content
 * - **Examples**: AI-generated examples
 * - **Breadcrumbs**: Navigation breadcrumbs
 * 
 * ## CacheUtils Module (`lib/cacheUtils.ts`)
 * 
 * The `cacheUtils` module provides additional utilities for cache management:
 * 
 * ### Health Monitoring
 * ```typescript
 * import { checkRedisHealth, getCacheStats } from '@/lib/cacheUtils';
 * 
 * // Check if Redis is working
 * const isHealthy = await checkRedisHealth();
 * 
 * // Get cache statistics
 * const stats = await getCacheStats();
 * ```
 * 
 * ### Bulk Operations
 * ```typescript
 * import { 
 *   invalidateMultipleBlockCaches,
 *   invalidateMultipleUserCaches,
 *   invalidateMultipleFolderCaches 
 * } from '@/lib/cacheUtils';
 * 
 * // Invalidate multiple items at once
 * await invalidateMultipleBlockCaches(['block1', 'block2', 'block3']);
 * await invalidateMultipleUserCaches(['user1', 'user2']);
 * ```
 * 
 * ### Cache Clearing
 * ```typescript
 * import { clearAllCaches, clearCachesByPattern } from '@/lib/cacheUtils';
 * 
 * // Clear all caches (use with caution)
 * await clearAllCaches();
 * 
 * // Clear caches by pattern
 * await clearCachesByPattern('user:*'); // Clear all user caches
 * await clearCachesByPattern('block:123:*'); // Clear all block 123 caches
 * ```
 * 
 * ### Safety Features
 * - **Pattern Protection**: Prevents accidental deletion with `*` patterns
 * - **Batch Processing**: Processes large operations in batches of 100
 * - **Error Handling**: Graceful error handling with logging
 * - **Performance Monitoring**: Built-in performance checks
 * 
 * ## Rate Limiting
 * 
 * Rate limiting is implemented using Upstash Redis and the `@upstash/ratelimit` package to prevent abuse and control API usage.
 * 
 * ### How Rate Limiting Works
 * 
 * #### 1. **Sliding Window Algorithm**
 * The system uses a sliding window algorithm, which is more accurate than fixed windows:
 * - **Fixed Window**: Resets at midnight (can allow 100 requests at 11:59 PM and 100 more at 12:00 AM)
 * - **Sliding Window**: Continuously tracks requests over the last 24 hours
 * - **Example**: If a user makes 50 requests on Monday, they can't make another request until Tuesday at the same time
 * 
 * #### 2. **Per-IP Tracking**
 * Rate limiting tracks requests by IP address:
 * ```typescript
 * // Get client IP from headers (works with proxies/load balancers)
 * const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
 * ```
 * - Uses `x-forwarded-for` header for real client IP
 * - Falls back to `127.0.0.1` for local development
 * - Works with Vercel, Netlify, and other hosting platforms
 * 
 * #### 3. **Redis Storage**
 * Rate limit data is stored in Redis:
 * - **Key Format**: `ratelimit:${identifier}:${ip}`
 * - **Data Structure**: Tracks request timestamps and counts
 * - **TTL**: Automatically expires after the time window
 * - **Shared Storage**: Uses the same Redis instance as caching
 * 
 * #### 4. **Request Flow**
 * ```typescript
 * // 1. Client makes request to /api/generate
 * // 2. Server extracts IP address
 * const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
 * 
 * // 3. Check rate limit
 * const { success, limit, reset, remaining } = await ratelimit.limit(ip);
 * 
 * // 4. If rate limited, return 429
 * if (!success) {
 *   return new Response("Rate limit exceeded", { status: 429 });
 * }
 * 
 * // 5. If allowed, process request
 * // Process the AI generation request...
 * ```
 * 
 * ### Configuration
 * ```typescript
 * // In app/api/generate/route.ts
 * import { Ratelimit } from "@upstash/ratelimit";
 * import { redis } from "@/lib/redis";
 * 
 * const ratelimit = new Ratelimit({
 *   redis, // Uses the shared Redis instance
 *   limiter: Ratelimit.slidingWindow(50, "1 d"), // 50 requests per day
 * });
 * ```
 * 
 * ### How It Works
 * 1. **Sliding Window**: Uses a sliding window algorithm for rate limiting
 * 2. **Per-IP Tracking**: Tracks requests by IP address
 * 3. **Daily Limits**: Limits users to 50 requests per day
 * 4. **Headers**: Returns rate limit headers in responses
 * 
 * ### Usage in API Routes
 * ```typescript
 * export async function POST(req: Request) {
 *   // Get client IP
 *   const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
 *   
 *   // Check rate limit
 *   const { success, limit, reset, remaining } = await ratelimit.limit(ip);
 *   
 *   if (!success) {
 *     return new Response("Rate limit exceeded", {
 *       status: 429,
 *       headers: {
 *         "X-RateLimit-Limit": limit.toString(),
 *         "X-RateLimit-Remaining": remaining.toString(),
 *         "X-RateLimit-Reset": reset.toString(),
 *       },
 *     });
 *   }
 *   
 *   // Process request...
 * }
 * ```
 * 
 * ### Rate Limit Headers
 * - `X-RateLimit-Limit`: Maximum requests allowed
 * - `X-RateLimit-Remaining`: Remaining requests
 * - `X-RateLimit-Reset`: When the limit resets
 * 
 * ### Environment Dependencies
 * Rate limiting requires the same Redis environment variables:
 * - `UPSTASH_REDIS_REST_URL`
 * - `UPSTASH_REDIS_REST_TOKEN`
 * 
 * ## How to Use Existing Cached Queries
 * 
 * ### Basic Usage
 * ```typescript
 * import { getBlockWithCache } from '@/lib/redis';
 * 
 * // Get a block with 1-hour cache (default)
 * const block = await getBlockWithCache(blockId);
 * 
 * // Get a block with custom TTL (30 minutes)
 * const block = await getBlockWithCache(blockId, 1800);
 * ```
 * 
 * ### Common Patterns
 * ```typescript
 * // Get user data with relations
 * const user = await getUserWithRelationsCache(userId);
 * 
 * // Get all blocks for a user
 * const blocks = await getUserBlocksWithCache(userId);
 * 
 * // Get quizzes for a block
 * const quizzes = await getQuizzesByBlockWithCache(blockId);
 * 
 * // Get file system structure
 * const structure = await getFileSystemStructureWithCache(userId);
 * ```
 * 
 * ## How to Create New Cached Queries
 * 
 * ### Step 1: Create the Base Function
 * First, create a function that fetches data from the source (database/API):
 * ```typescript
 * // In lib/yourModule.ts
 * export async function getYourDataById(id: string) {
 *   // Your data fetching logic here
 *   return await prisma.yourModel.findUnique({ where: { id } });
 * }
 * ```
 * 
 * ### Step 2: Create the Cached Version
 * Add a new cached function following the naming convention:
 * ```typescript
 * // In this file (lib/redis.ts)
 * export async function getYourDataWithCache(id: string, ttlSeconds = 3600) {
 *   console.log(`getYourDataWithCache called with id: ${id}`);
 *   return cacheAside(
 *     `yourdata:${id}`,           // Cache key pattern
 *     ttlSeconds,                 // TTL in seconds
 *     () => getYourDataById(id)   // Data fetcher function
 *   );
 * }
 * ```
 * 
 * ### Step 3: Add Cache Invalidation
 * Create an invalidation function for when data changes:
 * ```typescript
 * export async function invalidateYourDataCache(id: string) {
 *   console.log(`invalidateYourDataCache called with id: ${id}`);
 *   await redis.del(`yourdata:${id}`);
 *   console.log(`invalidateYourDataCache: deleted key for id: ${id}`);
 * }
 * ```
 * 
 * ### Step 4: Use in Your Application
 * ```typescript
 * import { getYourDataWithCache, invalidateYourDataCache } from '@/lib/redis';
 * 
 * // Read data (cached)
 * const data = await getYourDataWithCache(id);
 * 
 * // After updating data, invalidate cache
 * await updateYourData(id, newData);
 * await invalidateYourDataCache(id);
 * ```
 * 
 * ## Cache Key Naming Convention
 * 
 * Use descriptive, hierarchical keys:
 * - `block:${blockId}` - Basic block data
 * - `block:relations:${blockId}` - Block with relations
 * - `user:blocks:${userId}` - User's blocks
 * - `quizzes:block:${blockId}` - Quizzes for a block
 * - `questions:search:${searchTerm}` - Search results
 * 
 * ## TTL Guidelines
 * 
 * Choose appropriate TTL based on data volatility:
 * - **Static data** (user names, basic info): 3600s (1 hour)
 * - **Semi-static data** (blocks, folders): 3600s (1 hour)
 * - **Dynamic data** (points, usage stats): 1800s (30 minutes)
 * - **Frequently changing** (dashboard items): 600s (10 minutes)
 * - **Generated content** (examples, flashcards): 600s (10 minutes)
 * 
 * ## Cache Invalidation
 * 
 * Cache invalidation removes cached data when the underlying data changes, ensuring users get fresh data.
 * 
 * ### How It Works
 * 
 * Each invalidation function follows this pattern:
 * ```typescript
 * export async function invalidateBlockCache(blockId: string) {
 *     // 1. Define all cache keys that need to be deleted
 *     const keys = [
 *         `block:${blockId}`,           // Basic block data
 *         `block:relations:${blockId}`, // Block with relations
 *         `block:note:${blockId}`,      // Block notes
 *         // ... more keys
 *     ];
 *     
 *     // 2. Delete all keys in parallel
 *     await Promise.all(keys.map(key => redis.del(key)));
 *     
 *     // 3. Log the operation
 *     console.log(`invalidateBlockCache: deleted ${keys.length} keys`);
 * }
 * ```
 * 
 * ### Key Naming Convention
 * 
 * Cache keys follow a hierarchical pattern for easy invalidation:
 * - `block:${blockId}` - Basic block data
 * - `block:relations:${blockId}` - Block with related data
 * - `user:${userId}` - Basic user data
 * - `user:blocks:${userId}` - User's blocks
 * - `quizzes:block:${blockId}` - Quizzes for a specific block
 * 
 * ### Comprehensive Invalidation
 * 
 * When you invalidate a block, it removes **ALL** related cached data:
 * ```typescript
 * // When you call invalidateBlockCache("block123"), it deletes:
 * const keys = [
 *     `block:block123`,              // Basic block data
 *     `block:relations:block123`,    // Block with relations
 *     `block:note:block123`,         // Block notes
 *     `block:context:block123`,      // Block context
 *     `block:points:block123`,       // Block points
 *     `block:files:block123`,        // Block files
 *     `quizzes:block:block123`,      // Quizzes for this block
 *     `questions:block:block123`,    // Questions for this block
 *     `fillintheblanks:block:block123`, // Fill-in-the-blanks
 *     `topics:block:block123`,       // Topics for this block
 *     `breadcrumb:block123`,         // Navigation breadcrumb
 *     `examples:block123`,           // AI-generated examples
 *     `flashcards:block123`          // Generated flashcards
 * ];
 * ```
 * 
 * ### Bulk Invalidation
 * 
 * For multiple items, use cacheUtils functions:
 * ```typescript
 * import { invalidateMultipleBlockCaches } from '@/lib/cacheUtils';
 * 
 * // Invalidate multiple blocks at once (runs in parallel)
 * await invalidateMultipleBlockCaches(['block1', 'block2', 'block3']);
 * ```
 * 
 * ### When to Invalidate
 * 
 * Call invalidation functions **after** data changes:
 * ```typescript
 * // Example: After updating a block
 * async function updateBlock(blockId: string, newData: any) {
 *     // 1. Update the database
 *     await prisma.block.update({
 *         where: { id: blockId },
 *         data: newData
 *     });
 *     
 *     // 2. Invalidate all related caches
 *     await invalidateBlockCache(blockId);
 * }
 * ```
 * 
 * ### Safety Features
 * 
 * - **Parallel Deletion**: Uses `Promise.all()` for efficiency
 * - **Logging**: All operations are logged for debugging
 * - **Error Handling**: If Redis fails, the operation continues (graceful degradation)
 * - **Comprehensive Coverage**: Ensures all related data is invalidated
 * 
 * ### Performance Considerations
 * 
 * - **Batch Operations**: Multiple keys are deleted in parallel
 * - **Selective Invalidation**: Only invalidates what's necessary
 * - **Efficient Key Patterns**: Uses predictable key naming for easy invalidation
 * 
 * ### Example Usage Flow
 * 
 * ```typescript
 * // 1. User updates a block
 * const updatedBlock = await updateBlockInDatabase(blockId, newData);
 * 
 * // 2. Invalidate all related caches
 * await invalidateBlockCache(blockId);
 * 
 * // 3. Next time someone requests this block, it will:
 * //    - Miss the cache (keys are deleted)
 * //    - Fetch fresh data from database
 * //    - Cache the new data
 * const freshBlock = await getBlockWithCache(blockId); // Fresh data!
 * ```
 * 
 * ## Error Handling
 * 
 * The `cacheAside` function includes error handling:
 * - If Redis fails, it falls back to direct data fetching
 * - All errors are logged for debugging
 * - Cache failures don't break the application
 * 
 * ## Performance Considerations
 * 
 * - Use appropriate TTL to balance freshness vs performance
 * - Invalidate cache when data changes
 * - Monitor cache hit rates
 * - Consider cache warming for frequently accessed data
 * 
 * ## Environment Variables Required
 * 
 * - `UPSTASH_REDIS_REST_URL`: Redis REST API URL
 * - `UPSTASH_REDIS_REST_TOKEN`: Redis REST API token
 * - `ROOT_FOLDER_ID`: Root folder ID for file structure (optional, has default)
 */

import { Redis } from "@upstash/redis";
import {
  getBlockById,
  getBlockWithRelations,
  getBlockContext,
  getBlockPoints,
  getBlockFiles,
  getBlockNote,
  getBlocksByAuthor,
  getBlocksByFolder,
  getTopLevelBlocks
} from "@/lib/block";
import {
  getUserById,
  getUserWithRelations,
  getUserPosts,
  getUserFolders,
  getUserName
} from "@/lib/user";
import {
  getFolderById,
  getFolderWithRelations,
  getFoldersByAuthor,
  getTopLevelFolders,
  getFolderBlocks
} from "@/lib/folder";
import {
  getQuizById,
  getQuizzesByBlock,
  getQuizWithRelations,
  getQuizzesByTopic
} from "@/lib/quiz";
import {
  getQuestionById,
  getQuestionsByBlock,
  searchQuestionsByText
} from "@/lib/question";
import {
  getFillInTheBlankById,
  getFillInTheBlanksByBlock
} from "@/lib/fillInTheBlank";
import {
  getTopicById,
  getTopicsByBlock
} from "@/lib/topic";
import {
  getFlashcardById,
  getFlashcardsByBlock
} from "@/lib/flashcard";
import getBreadcrumb from "@/lib/blockViewNav";
import { getExamples } from "@/lib/examplesPerplexity";
import { getFlashcards } from "@/lib/flashcardGen";
import { redis } from "@/lib/redisClient";

export async function cacheAside<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    console.log(`cacheAside called with key: ${key}, ttl: ${ttlSeconds}`);
    
    // Validate inputs
    if (!key || typeof key !== 'string') {
        console.warn('cacheAside: Invalid key provided, falling back to direct fetch');
        return await fetcher();
    }
    
    if (ttlSeconds <= 0 || ttlSeconds > 86400) { // Max 24 hours
        console.warn(`cacheAside: Invalid TTL ${ttlSeconds}, using default 3600`);
        ttlSeconds = 3600;
    }
    
    try {
        const cached = await redis.get<T>(key)
        if (cached !== null) {
          console.log(`cacheAside: cache hit for key: ${key}`);
          return cached
        }
        console.log(`cacheAside: cache miss for key: ${key}, calling fetcher`);
        const data = await fetcher()
        
        // Only cache if data is not null/undefined
        if (data !== null && data !== undefined) {
            await redis.set(key, data, { ex: ttlSeconds })
            console.log(`cacheAside: cached data for key: ${key}`);
        } else {
            console.log(`cacheAside: skipping cache for null/undefined data for key: ${key}`);
        }
        
        return data
    } catch (error) {
        console.warn(`Redis cache failed for key ${key}, falling back to direct fetch:`, error)
        // If Redis fails, just call the fetcher directly
        return await fetcher()
    }
}

// ==================== BREADCRUMB CACHING ====================

export async function getBreadcrumbWithCache(blockId: string, ttlSeconds = 1800) {
    console.log(`getBreadcrumbWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `breadcrumb:${blockId}`,
        ttlSeconds,
        () => getBreadcrumb(blockId)
    );
}

export async function getExamplesWithCache(blockId: string, ttlSeconds = 600) {
    console.log(`getExamplesWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `examples:${blockId}`,
        ttlSeconds,
        () => getExamples(blockId)
    );
}

export async function getFlashcardsWithCache(blockId: string, ttlSeconds = 600) {
    console.log(`getFlashcardsWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `flashcards:${blockId}`,
        ttlSeconds,
        () => getFlashcards(blockId)
    );
}

// ==================== BLOCK CACHING ====================

export async function getBlockWithCache(blockId: string, ttlSeconds = 3600) {
    console.log(`getBlockWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `block:${blockId}`,
        ttlSeconds,
        () => getBlockById(blockId)
    );
}

export async function getBlockWithRelationsCache(blockId: string, ttlSeconds = 3600) {
    console.log(`getBlockWithRelationsCache called with blockId: ${blockId}`);
    return cacheAside(
        `block:relations:${blockId}`,
        ttlSeconds,
        () => getBlockWithRelations(blockId)
    );
}

export async function getBlockNoteWithCache(blockId: string, ttlSeconds = 3600) {
    console.log(`getBlockNoteWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `block:note:${blockId}`,
        ttlSeconds,
        () => getBlockNote(blockId)
    );
}

export async function getBlockContextWithCache(blockId: string, ttlSeconds = 3600) {
    console.log(`getBlockContextWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `block:context:${blockId}`,
        ttlSeconds,
        () => getBlockContext(blockId)
    );
}

export async function getFileContextsWithCache(blockId: string, ttlSeconds = 3600) {
    console.log(`getFileContextsWithCache called with blockId: ${blockId}`);
    const { getFileContextsByBlockId } = await import('./filecontext');
    return cacheAside(
        `block:filecontexts:${blockId}`,
        ttlSeconds,
        () => getFileContextsByBlockId(blockId)
    );
}

export async function getBlockPointsWithCache(blockId: string, ttlSeconds = 1800) {
    console.log(`getBlockPointsWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `block:points:${blockId}`,
        ttlSeconds,
        () => getBlockPoints(blockId)
    );
}

export async function getBlockFilesWithCache(blockId: string, ttlSeconds = 3600) {
    console.log(`getBlockFilesWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `block:files:${blockId}`,
        ttlSeconds,
        () => getBlockFiles(blockId)
    );
}

export async function getBlocksByAuthorWithCache(authorId: string, ttlSeconds = 600) {
    console.log(`getBlocksByAuthorWithCache called with authorId: ${authorId}`);
    return cacheAside(
        `blocks:author:${authorId}`,
        ttlSeconds,
        () => getBlocksByAuthor(authorId)
    );
}

export async function getBlocksByFolderWithCache(folderId: string, ttlSeconds = 600) {
    console.log(`getBlocksByFolderWithCache called with folderId: ${folderId}`);
    return cacheAside(
        `blocks:folder:${folderId}`,
        ttlSeconds,
        () => getBlocksByFolder(folderId)
    );
}

export async function getTopLevelBlocksWithCache(userId: string, rootFolderId: string, ttlSeconds = 600) {
    console.log(`getTopLevelBlocksWithCache called with userId: ${userId}, rootFolderId: ${rootFolderId}`);
    return cacheAside(
        `blocks:toplevel:${userId}:${rootFolderId}`,
        ttlSeconds,
        () => getTopLevelBlocks(userId)
    );
}

// ==================== USER CACHING ====================

export async function getUserWithCache(userId: string, ttlSeconds = 3600) {
    console.log(`getUserWithCache called with userId: ${userId}`);
    return cacheAside(
        `user:${userId}`,
        ttlSeconds,
        () => getUserById(userId)
    );
}

export async function getUserWithRelationsCache(userId: string, ttlSeconds = 1800) {
    console.log(`getUserWithRelationsCache called with userId: ${userId}`);
    return cacheAside(
        `user:relations:${userId}`,
        ttlSeconds,
        () => getUserWithRelations(userId)
    );
}

export async function getUserBlocksWithCache(userId: string, ttlSeconds = 600) {
    console.log(`getUserBlocksWithCache called with userId: ${userId}`);
    return cacheAside(
        `user:blocks:${userId}`,
        ttlSeconds,
        () => getUserPosts(userId)
    );
}

export async function getUserFoldersWithCache(userId: string, ttlSeconds = 600) {
    console.log(`getUserFoldersWithCache called with userId: ${userId}`);
    return cacheAside(
        `user:folders:${userId}`,
        ttlSeconds,
        () => getUserFolders(userId)
    );
}

export async function getUserNameWithCache(userId: string, ttlSeconds = 3600) {
    console.log(`getUserNameWithCache called with userId: ${userId}`);
    return cacheAside(
        `user:name:${userId}`,
        ttlSeconds,
        () => getUserName(userId)
    );
}

export async function getDashboardItemsWithCache(userId: string, ttlSeconds = 600) {
    console.log(`getDashboardItemsWithCache called with userId: ${userId}`);
    return cacheAside(
        `user:dashboard:${userId}`,
        ttlSeconds,
        async () => {
            const [posts, folders] = await Promise.all([
                getUserPosts(userId),
                getUserFolders(userId)
            ]);
            return { posts, folders };
        }
    );
}

// ==================== FOLDER CACHING ====================

export async function getFolderWithCache(folderId: string, ttlSeconds = 3600) {
    console.log(`getFolderWithCache called with folderId: ${folderId}`);
    return cacheAside(
        `folder:${folderId}`,
        ttlSeconds,
        () => getFolderById(folderId)
    );
}

export async function getFolderWithRelationsCache(folderId: string, ttlSeconds = 1800) {
    console.log(`getFolderWithRelationsCache called with folderId: ${folderId}`);
    return cacheAside(
        `folder:relations:${folderId}`,
        ttlSeconds,
        () => getFolderWithRelations(folderId)
    );
}

export async function getFoldersByAuthorWithCache(authorId: string, ttlSeconds = 600) {
    console.log(`getFoldersByAuthorWithCache called with authorId: ${authorId}`);
    return cacheAside(
        `folders:author:${authorId}`,
        ttlSeconds,
        () => getFoldersByAuthor(authorId)
    );
}

export async function getTopLevelFoldersWithCache(userId: string, rootFolderId: string, ttlSeconds = 600) {
    console.log(`getTopLevelFoldersWithCache called with userId: ${userId}, rootFolderId: ${rootFolderId}`);
    return cacheAside(
        `folders:toplevel:${userId}:${rootFolderId}`,
        ttlSeconds,
        () => getTopLevelFolders(userId)
    );
}

export async function getFolderBlocksWithCache(folderId: string, ttlSeconds = 600) {
    console.log(`getFolderBlocksWithCache called with folderId: ${folderId}`);
    return cacheAside(
        `folder:blocks:${folderId}`,
        ttlSeconds,
        () => getFolderBlocks(folderId)
    );
}

export async function getFoldersWithRelationsWithCache(userId: string, ttlSeconds = 600) {
    console.log(`getFoldersWithRelationsWithCache called with userId: ${userId}`);
    return cacheAside(
        `folders:relations:${userId}`,
        ttlSeconds,
        async () => {
            // Import prisma to avoid circular dependencies
            const prisma = (await import('./prisma')).default;
            
            const folders = await prisma.folder.findMany({
                where: { authorId: userId },
                include: {
                    children: true,
                    blocks: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            
            return folders;
        }
    );
}

// ==================== QUIZ CACHING ====================

export async function getQuizWithCache(quizId: string, ttlSeconds = 3600) {
    console.log(`getQuizWithCache called with quizId: ${quizId}`);
    return cacheAside(
        `quiz:${quizId}`,
        ttlSeconds,
        () => getQuizById(quizId)
    );
}

export async function getQuizzesByBlockWithCache(blockId: string, ttlSeconds = 600) {
    console.log(`getQuizzesByBlockWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `quizzes:block:${blockId}`,
        ttlSeconds,
        () => getQuizzesByBlock(blockId)
    );
}

export async function getQuizzesByBlockWithTopicCache(blockId: string, ttlSeconds = 600) {
    console.log(`getQuizzesByBlockWithTopicCache called with blockId: ${blockId}`);
    return cacheAside(
        `quizzes:block:topic:${blockId}`,
        ttlSeconds,
        () => getQuizWithRelations(blockId)
    );
}

export async function getQuizWithTopicsCache(blockId: string, ttlSeconds = 600) {
    console.log(`getQuizWithTopicsCache called with blockId: ${blockId}`);
    return cacheAside(
        `quiz:topics:${blockId}`,
        ttlSeconds,
        async () => {
            const topics = await getTopicsByBlock(blockId);
            if (!topics.length) {
                return { unusedQuizzes: [], mistakeQuizzes: [] };
            }

            const topicIds = topics.map(t => t.id);

            // Get unused quizzes for all topics
            const allUnusedQuizzes = await Promise.all(
                topicIds.map(topicId => getQuizzesByTopic(topicId))
            );
            const unusedQuizzes = allUnusedQuizzes
                .flat()
                .filter(quiz => !quiz.used)
                .slice(0, 10);

            // Get quizzes with mistakes for all topics
            const allQuizzes = await Promise.all(
                topicIds.map(topicId => getQuizzesByTopic(topicId))
            );
            const mistakeQuizzes = allQuizzes
                .flat()
                .filter(quiz => quiz.mistake !== null);

            return { unusedQuizzes, mistakeQuizzes };
        }
    );
}

// ==================== QUESTION CACHING ====================

export async function getQuestionWithCache(questionId: string, ttlSeconds = 3600) {
    console.log(`getQuestionWithCache called with questionId: ${questionId}`);
    return cacheAside(
        `question:${questionId}`,
        ttlSeconds,
        () => getQuestionById(questionId)
    );
}

export async function getQuestionsByBlockWithCache(blockId: string, ttlSeconds = 600) {
    console.log(`getQuestionsByBlockWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `questions:block:${blockId}`,
        ttlSeconds,
        () => getQuestionsByBlock(blockId)
    );
}

export async function searchQuestionsWithCache(searchTerm: string, ttlSeconds = 1800) {
    console.log(`searchQuestionsWithCache called with searchTerm: ${searchTerm}`);
    return cacheAside(
        `questions:search:${searchTerm}`,
        ttlSeconds,
        () => searchQuestionsByText(searchTerm)
    );
}

// ==================== FILL IN THE BLANK CACHING ====================

export async function getFillInTheBlankWithCache(fitbId: string, ttlSeconds = 3600) {
    console.log(`getFillInTheBlankWithCache called with fitbId: ${fitbId}`);
    return cacheAside(
        `fillintheblank:${fitbId}`,
        ttlSeconds,
        () => getFillInTheBlankById(fitbId)
    );
}

export async function getFillInTheBlanksByBlockWithCache(blockId: string, ttlSeconds = 600) {
    console.log(`getFillInTheBlanksByBlockWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `fillintheblanks:block:${blockId}`,
        ttlSeconds,
        () => getFillInTheBlanksByBlock(blockId)
    );
}

// ==================== TOPIC CACHING ====================

export async function getTopicWithCache(topicId: string, ttlSeconds = 3600) {
    console.log(`getTopicWithCache called with topicId: ${topicId}`);
    return cacheAside(
        `topic:${topicId}`,
        ttlSeconds,
        () => getTopicById(topicId)
    );
}

export async function getTopicsByBlockWithCache(blockId: string, ttlSeconds = 600) {
    console.log(`getTopicsByBlockWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `topics:block:${blockId}`,
        ttlSeconds,
        () => getTopicsByBlock(blockId)
    );
}

export async function getTopicIdsByBlockWithCache(blockId: string, ttlSeconds = 600) {
    console.log(`getTopicIdsByBlockWithCache called with blockId: ${blockId}`);
    return cacheAside(
        `topicids:block:${blockId}`,
        ttlSeconds,
        async () => {
            const topics = await getTopicsByBlock(blockId);
            return topics.map(t => ({ id: t.id }));
        }
    );
}

// ==================== COMPOSITE CACHING ====================

export async function getFileSystemStructureWithCache(userId: string, ttlSeconds = 600) {
    console.log(`getFileSystemStructureWithCache called with userId: ${userId}`);
    return cacheAside(
        `filesystem:${userId}`,
        ttlSeconds,
        async () => {
            const [blocks, folders] = await Promise.all([
                getUserPosts(userId),
                getUserFolders(userId)
            ]);
            return { blocks, folders };
        }
    );
}

export async function getUserFileStructureWithCache(userId: string, ttlSeconds = 600) {
    console.log(`getUserFileStructureWithCache called with userId: ${userId}`);
    return cacheAside(
        `filestructure:${userId}`,
        ttlSeconds,
        async () => {
            // Import the function dynamically to avoid circular dependencies
            const { getUserFileStructure } = await import('./folder');
            return await getUserFileStructure(userId);
        }
    );
}

// ==================== CACHE INVALIDATION ====================

export async function invalidateBlockCache(blockId: string) {
    console.log(`invalidateBlockCache called with blockId: ${blockId}`);
    const keys = [
        `block:${blockId}`,
        `block:relations:${blockId}`,
        `block:note:${blockId}`,
        `block:context:${blockId}`,
        `block:points:${blockId}`,
        `block:files:${blockId}`,
        `quizzes:block:${blockId}`,
        `quizzes:block:topic:${blockId}`,
        `quiz:topics:${blockId}`,
        `questions:block:${blockId}`,
        `fillintheblanks:block:${blockId}`,
        `topics:block:${blockId}`,
        `topicids:block:${blockId}`,
        `breadcrumb:${blockId}`,
        `examples:${blockId}`,
        `flashcards:${blockId}`
    ];
    await Promise.all(keys.map(key => redis.del(key)));
    console.log(`invalidateBlockCache: deleted ${keys.length} keys for blockId: ${blockId}`);
}

export async function invalidateUserCache(userId: string) {
    console.log(`invalidateUserCache called with userId: ${userId}`);
    const keys = [
        `user:${userId}`,
        `user:relations:${userId}`,
        `user:blocks:${userId}`,
        `user:folders:${userId}`,
        `user:name:${userId}`,
        `user:dashboard:${userId}`,
        `filesystem:${userId}`,
        `filestructure:${userId}`
    ];
    await Promise.all(keys.map(key => redis.del(key)));
    console.log(`invalidateUserCache: deleted ${keys.length} keys for userId: ${userId}`);
}

export async function invalidateFolderCache(folderId: string) {
    console.log(`invalidateFolderCache called with folderId: ${folderId}`);
    const keys = [
        `folder:${folderId}`,
        `folder:relations:${folderId}`,
        `folder:blocks:${folderId}`
    ];
    await Promise.all(keys.map(key => redis.del(key)));
    console.log(`invalidateFolderCache: deleted ${keys.length} keys for folderId: ${folderId}`);
}

export async function invalidateQuizCache(quizId: string) {
    console.log(`invalidateQuizCache called with quizId: ${quizId}`);
    await redis.del(`quiz:${quizId}`);
    console.log(`invalidateQuizCache: deleted key for quizId: ${quizId}`);
}

export async function invalidateQuestionCache(questionId: string) {
    console.log(`invalidateQuestionCache called with questionId: ${questionId}`);
    await redis.del(`question:${questionId}`);
    console.log(`invalidateQuestionCache: deleted key for questionId: ${questionId}`);
}

export async function invalidateFillInTheBlankCache(fitbId: string) {
    console.log(`invalidateFillInTheBlankCache called with fitbId: ${fitbId}`);
    await redis.del(`fillintheblank:${fitbId}`);
    console.log(`invalidateFillInTheBlankCache: deleted key for fitbId: ${fitbId}`);
}

export async function invalidateTopicCache(topicId: string) {
    console.log(`invalidateTopicCache called with topicId: ${topicId}`);
    await redis.del(`topic:${topicId}`);
    console.log(`invalidateTopicCache: deleted key for topicId: ${topicId}`);
}

export async function invalidateFlashcardsCache(blockId: string) {
    console.log(`invalidateFlashcardsCache called with blockId: ${blockId}`);
    await redis.del(`flashcards:${blockId}`);
    console.log(`invalidateFlashcardsCache: deleted key for blockId: ${blockId}`);
}

// Legacy functions for backward compatibility
export async function invalidateBlockNoteCache(blockId: string) {
    console.log(`invalidateBlockNoteCache called with blockId: ${blockId}`);
    await redis.del(`block:note:${blockId}`);
    console.log(`invalidateBlockNoteCache: deleted key for blockId: ${blockId}`);
}

export async function invalidateBlockContextCache(blockId: string) {
    console.log(`invalidateBlockContextCache called with blockId: ${blockId}`);
    await redis.del(`block:context:${blockId}`);
    console.log(`invalidateBlockContextCache: deleted key for blockId: ${blockId}`);
}

export async function invalidateFileContextsCache(blockId: string) {
    console.log(`invalidateFileContextsCache called with blockId: ${blockId}`);
    await redis.del(`block:filecontexts:${blockId}`);
    console.log(`invalidateFileContextsCache: deleted key for blockId: ${blockId}`);
}

export async function invalidateUserBlocksCache(userId: string) {
    console.log(`invalidateUserBlocksCache called with userId: ${userId}`);
    await redis.del(`user:blocks:${userId}`);
    console.log(`invalidateUserBlocksCache: deleted key for userId: ${userId}`);
}

export async function invalidateUserFoldersCache(userId: string) {
    console.log(`invalidateUserFoldersCache called with userId: ${userId}`);
    await redis.del(`user:folders:${userId}`);
    console.log(`invalidateUserFoldersCache: deleted key for userId: ${userId}`);
}

export async function invalidateRootBlocksCache(userId: string) {
    console.log(`invalidateRootBlocksCache called with userId: ${userId}`);
    const ROOT_FOLDER_ID = process.env.ROOT_FOLDER_ID || "f2120a35-5e3f-488e-be86-f0753af42e77";
    await redis.del(`blocks:toplevel:${userId}:${ROOT_FOLDER_ID}`);
    console.log(`invalidateRootBlocksCache: deleted key for userId: ${userId}`);
}

export async function invalidateRootFoldersCache(userId: string) {
    console.log(`invalidateRootFoldersCache called with userId: ${userId}`);
    const ROOT_FOLDER_ID = process.env.ROOT_FOLDER_ID || "f2120a35-5e3f-488e-be86-f0753af42e77";
    await redis.del(`folders:toplevel:${userId}:${ROOT_FOLDER_ID}`);
    console.log(`invalidateRootFoldersCache: deleted key for userId: ${userId}`);
}

// ==================== CACHE UTILITY FUNCTIONS ====================

/**
 * Get the root folder ID from environment or use default
 * @returns string - The root folder ID
 */
export function getRootFolderId(): string {
    return process.env.ROOT_FOLDER_ID || "f2120a35-5e3f-488e-be86-f0753af42e77";
}

/**
 * Invalidate all caches for a specific user (comprehensive)
 * @param userId - The user ID
 */
export async function invalidateAllUserCaches(userId: string) {
    console.log(`invalidateAllUserCaches called with userId: ${userId}`);
    const ROOT_FOLDER_ID = getRootFolderId();
    
    const keys = [
        `user:${userId}`,
        `user:relations:${userId}`,
        `user:blocks:${userId}`,
        `user:folders:${userId}`,
        `user:name:${userId}`,
        `user:dashboard:${userId}`,
        `filesystem:${userId}`,
        `filestructure:${userId}`,
        `blocks:toplevel:${userId}:${ROOT_FOLDER_ID}`,
        `folders:toplevel:${userId}:${ROOT_FOLDER_ID}`
    ];
    
    await Promise.all(keys.map(key => redis.del(key)));
    console.log(`invalidateAllUserCaches: deleted ${keys.length} keys for userId: ${userId}`);
}

export async function invalidateDashboardItemsCache(userId: string) {
    console.log(`invalidateDashboardItemsCache called with userId: ${userId}`);
    await redis.del(`user:dashboard:${userId}`);
    console.log(`invalidateDashboardItemsCache: deleted key for userId: ${userId}`);
}

export async function invalidateFileSystemStructureCache(userId: string) {
    console.log(`invalidateFileSystemStructureCache called with userId: ${userId}`);
    await redis.del(`filesystem:${userId}`);
    console.log(`invalidateFileSystemStructureCache: deleted key for userId: ${userId}`);
}

export async function invalidateUserNameCache(userId: string) {
    console.log(`invalidateUserNameCache called with userId: ${userId}`);
    await redis.del(`user:name:${userId}`);
    console.log(`invalidateUserNameCache: deleted key for userId: ${userId}`);
}

export async function invalidateFillInTheBlanksCache(blockId: string) {
    console.log(`invalidateFillInTheBlanksCache called with blockId: ${blockId}`);
    await redis.del(`fillintheblanks:block:${blockId}`);
    console.log(`invalidateFillInTheBlanksCache: deleted key for blockId: ${blockId}`);
}

export async function invalidateQuizzesCache(blockId: string) {
    console.log(`invalidateQuizzesCache called with blockId: ${blockId}`);
    await redis.del(`quizzes:block:${blockId}`);
    console.log(`invalidateQuizzesCache: deleted key for blockId: ${blockId}`);
}

export async function invalidateTopicsCache(blockId: string) {
    console.log(`invalidateTopicsCache called with blockId: ${blockId}`);
    await redis.del(`topics:block:${blockId}`);
    console.log(`invalidateTopicsCache: deleted key for blockId: ${blockId}`);
}

export async function invalidateBreadcrumbCache(blockId: string) {
    console.log(`invalidateBreadcrumbCache called with blockId: ${blockId}`);
    await redis.del(`breadcrumb:${blockId}`);
    console.log(`invalidateBreadcrumbCache: deleted key for blockId: ${blockId}`);
}

export async function invalidateExamplesCache(blockId: string) {
    console.log(`invalidateExamplesCache called with blockId: ${blockId}`);
    await redis.del(`examples:${blockId}`);
    console.log(`invalidateExamplesCache: deleted key for blockId: ${blockId}`);
}

