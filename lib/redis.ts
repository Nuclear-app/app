
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

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});



export async function cacheAside<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    console.log(`cacheAside called with key: ${key}, ttl: ${ttlSeconds}`);
    try {
        const cached = await redis.get<T>(key)
        if (cached !== null) {
          console.log(`cacheAside: cache hit for key: ${key}`);
          return cached
        }
        console.log(`cacheAside: cache miss for key: ${key}, calling fetcher`);
        const data = await fetcher()
        await redis.set(key, data, { ex: ttlSeconds })
        console.log(`cacheAside: cached data for key: ${key}`);
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
        `filesystem:${userId}`
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
    await redis.del(`blocks:toplevel:${userId}:f2120a35-5e3f-488e-be86-f0753af42e77`);
    console.log(`invalidateRootBlocksCache: deleted key for userId: ${userId}`);
}

export async function invalidateRootFoldersCache(userId: string) {
    console.log(`invalidateRootFoldersCache called with userId: ${userId}`);
    await redis.del(`folders:toplevel:${userId}:f2120a35-5e3f-488e-be86-f0753af42e77`);
    console.log(`invalidateRootFoldersCache: deleted key for userId: ${userId}`);
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

