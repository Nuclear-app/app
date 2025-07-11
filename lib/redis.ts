"use client";

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

export const redis = Redis.fromEnv();

export async function cacheAside<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await redis.get<T>(key)
    if (cached !== null) {
      return cached
    }  
    const data = await fetcher()
    await redis.set(key, data, { ex: ttlSeconds })
    return data
}

// ==================== BLOCK CACHING ====================

export async function getBlockWithCache(blockId: string, ttlSeconds = 3600) {
    return cacheAside(
        `block:${blockId}`,
        ttlSeconds,
        () => getBlockById(blockId)
    );
}

export async function getBlockWithRelationsCache(blockId: string, ttlSeconds = 3600) {
    return cacheAside(
        `block:relations:${blockId}`,
        ttlSeconds,
        () => getBlockWithRelations(blockId)
    );
}

export async function getBlockNoteWithCache(blockId: string, ttlSeconds = 3600) {
    return cacheAside(
        `block:note:${blockId}`,
        ttlSeconds,
        () => getBlockNote(blockId)
    );
}

export async function getBlockContextWithCache(blockId: string, ttlSeconds = 3600) {
    return cacheAside(
        `block:context:${blockId}`,
        ttlSeconds,
        () => getBlockContext(blockId)
    );
}

export async function getBlockPointsWithCache(blockId: string, ttlSeconds = 1800) {
    return cacheAside(
        `block:points:${blockId}`,
        ttlSeconds,
        () => getBlockPoints(blockId)
    );
}

export async function getBlockFilesWithCache(blockId: string, ttlSeconds = 3600) {
    return cacheAside(
        `block:files:${blockId}`,
        ttlSeconds,
        () => getBlockFiles(blockId)
    );
}

export async function getBlocksByAuthorWithCache(authorId: string, ttlSeconds = 600) {
    return cacheAside(
        `blocks:author:${authorId}`,
        ttlSeconds,
        () => getBlocksByAuthor(authorId)
    );
}

export async function getBlocksByFolderWithCache(folderId: string, ttlSeconds = 600) {
    return cacheAside(
        `blocks:folder:${folderId}`,
        ttlSeconds,
        () => getBlocksByFolder(folderId)
    );
}

export async function getTopLevelBlocksWithCache(userId: string, rootFolderId: string, ttlSeconds = 600) {
    return cacheAside(
        `blocks:toplevel:${userId}:${rootFolderId}`,
        ttlSeconds,
        () => getTopLevelBlocks(userId)
    );
}

// ==================== USER CACHING ====================

export async function getUserWithCache(userId: string, ttlSeconds = 3600) {
    return cacheAside(
        `user:${userId}`,
        ttlSeconds,
        () => getUserById(userId)
    );
}

export async function getUserWithRelationsCache(userId: string, ttlSeconds = 1800) {
    return cacheAside(
        `user:relations:${userId}`,
        ttlSeconds,
        () => getUserWithRelations(userId)
    );
}

export async function getUserBlocksWithCache(userId: string, ttlSeconds = 600) {
    return cacheAside(
        `user:blocks:${userId}`,
        ttlSeconds,
        () => getUserPosts(userId)
    );
}

export async function getUserFoldersWithCache(userId: string, ttlSeconds = 600) {
    return cacheAside(
        `user:folders:${userId}`,
        ttlSeconds,
        () => getUserFolders(userId)
    );
}

export async function getUserNameWithCache(userId: string, ttlSeconds = 3600) {
    return cacheAside(
        `user:name:${userId}`,
        ttlSeconds,
        () => getUserName(userId)
    );
}

export async function getDashboardItemsWithCache(userId: string, ttlSeconds = 600) {
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
    return cacheAside(
        `folder:${folderId}`,
        ttlSeconds,
        () => getFolderById(folderId)
    );
}

export async function getFolderWithRelationsCache(folderId: string, ttlSeconds = 1800) {
    return cacheAside(
        `folder:relations:${folderId}`,
        ttlSeconds,
        () => getFolderWithRelations(folderId)
    );
}

export async function getFoldersByAuthorWithCache(authorId: string, ttlSeconds = 600) {
    return cacheAside(
        `folders:author:${authorId}`,
        ttlSeconds,
        () => getFoldersByAuthor(authorId)
    );
}

export async function getTopLevelFoldersWithCache(userId: string, rootFolderId: string, ttlSeconds = 600) {
    return cacheAside(
        `folders:toplevel:${userId}:${rootFolderId}`,
        ttlSeconds,
        () => getTopLevelFolders(userId)
    );
}

export async function getFolderBlocksWithCache(folderId: string, ttlSeconds = 600) {
    return cacheAside(
        `folder:blocks:${folderId}`,
        ttlSeconds,
        () => getFolderBlocks(folderId)
    );
}

// ==================== QUIZ CACHING ====================

export async function getQuizWithCache(quizId: string, ttlSeconds = 3600) {
    return cacheAside(
        `quiz:${quizId}`,
        ttlSeconds,
        () => getQuizById(quizId)
    );
}

export async function getQuizzesByBlockWithCache(blockId: string, ttlSeconds = 600) {
    return cacheAside(
        `quizzes:block:${blockId}`,
        ttlSeconds,
        () => getQuizzesByBlock(blockId)
    );
}

export async function getQuizzesByBlockWithTopicCache(blockId: string, ttlSeconds = 600) {
    return cacheAside(
        `quizzes:block:topic:${blockId}`,
        ttlSeconds,
        () => getQuizWithRelations(blockId)
    );
}

export async function getQuizWithTopicsCache(blockId: string, ttlSeconds = 600) {
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
    return cacheAside(
        `question:${questionId}`,
        ttlSeconds,
        () => getQuestionById(questionId)
    );
}

export async function getQuestionsByBlockWithCache(blockId: string, ttlSeconds = 600) {
    return cacheAside(
        `questions:block:${blockId}`,
        ttlSeconds,
        () => getQuestionsByBlock(blockId)
    );
}

export async function searchQuestionsWithCache(searchTerm: string, ttlSeconds = 1800) {
    return cacheAside(
        `questions:search:${searchTerm}`,
        ttlSeconds,
        () => searchQuestionsByText(searchTerm)
    );
}

// ==================== FILL IN THE BLANK CACHING ====================

export async function getFillInTheBlankWithCache(fitbId: string, ttlSeconds = 3600) {
    return cacheAside(
        `fillintheblank:${fitbId}`,
        ttlSeconds,
        () => getFillInTheBlankById(fitbId)
    );
}

export async function getFillInTheBlanksByBlockWithCache(blockId: string, ttlSeconds = 600) {
    return cacheAside(
        `fillintheblanks:block:${blockId}`,
        ttlSeconds,
        () => getFillInTheBlanksByBlock(blockId)
    );
}

// ==================== TOPIC CACHING ====================

export async function getTopicWithCache(topicId: string, ttlSeconds = 3600) {
    return cacheAside(
        `topic:${topicId}`,
        ttlSeconds,
        () => getTopicById(topicId)
    );
}

export async function getTopicsByBlockWithCache(blockId: string, ttlSeconds = 600) {
    return cacheAside(
        `topics:block:${blockId}`,
        ttlSeconds,
        () => getTopicsByBlock(blockId)
    );
}

export async function getTopicIdsByBlockWithCache(blockId: string, ttlSeconds = 600) {
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
    return cacheAside(
        `filesystem:${userId}`,
        ttlSeconds,
        async () => {
            const [blocks, folders] = await Promise.all([
                getBlocksByAuthor(userId),
                getFoldersByAuthor(userId)
            ]);
            
            return {
                blocks: blocks.filter(block => block.folderId !== null),
                folders: folders.filter(folder => folder.parentId !== null)
            };
        }
    );
}

// ==================== CACHE INVALIDATION ====================

export async function invalidateBlockCache(blockId: string) {
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
        `topicids:block:${blockId}`
    ];
    await Promise.all(keys.map(key => redis.del(key)));
}

export async function invalidateUserCache(userId: string) {
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
}

export async function invalidateFolderCache(folderId: string) {
    const keys = [
        `folder:${folderId}`,
        `folder:relations:${folderId}`,
        `folder:blocks:${folderId}`
    ];
    await Promise.all(keys.map(key => redis.del(key)));
}

export async function invalidateQuizCache(quizId: string) {
    await redis.del(`quiz:${quizId}`);
}

export async function invalidateQuestionCache(questionId: string) {
    await redis.del(`question:${questionId}`);
}

export async function invalidateFillInTheBlankCache(fitbId: string) {
    await redis.del(`fillintheblank:${fitbId}`);
}

export async function invalidateTopicCache(topicId: string) {
    await redis.del(`topic:${topicId}`);
}

// Legacy functions for backward compatibility
export async function invalidateBlockNoteCache(blockId: string) {
    await redis.del(`block:note:${blockId}`);
}

export async function invalidateBlockContextCache(blockId: string) {
    await redis.del(`block:context:${blockId}`);
}

export async function invalidateUserBlocksCache(userId: string) {
    await redis.del(`user:blocks:${userId}`);
}

export async function invalidateUserFoldersCache(userId: string) {
    await redis.del(`user:folders:${userId}`);
}

export async function invalidateRootBlocksCache(userId: string) {
    await redis.del(`blocks:toplevel:${userId}:f2120a35-5e3f-488e-be86-f0753af42e77`);
}

export async function invalidateRootFoldersCache(userId: string) {
    await redis.del(`folders:toplevel:${userId}:f2120a35-5e3f-488e-be86-f0753af42e77`);
}

export async function invalidateDashboardItemsCache(userId: string) {
    await redis.del(`user:dashboard:${userId}`);
}

export async function invalidateFileSystemStructureCache(userId: string) {
    await redis.del(`filesystem:${userId}`);
}

export async function invalidateUserNameCache(userId: string) {
    await redis.del(`user:name:${userId}`);
}

export async function invalidateFillInTheBlanksCache(blockId: string) {
    await redis.del(`fillintheblanks:block:${blockId}`);
}

export async function invalidateQuizzesCache(blockId: string) {
    await redis.del(`quizzes:block:${blockId}`);
}

export async function invalidateTopicsCache(blockId: string) {
    await redis.del(`topics:block:${blockId}`);
}

