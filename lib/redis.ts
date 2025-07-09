import { Redis } from "@upstash/redis";
import prisma from "@/lib/prisma";

export const redis = Redis.fromEnv();

// export async function cacheAside(key: string, ttlSeconds: number, fetcher: () => Promise<any>) {
//     const cached = await redis.get(key);
//     if (cached) {
//         return JSON.parse(cached as string);
//     }
//     const data = await fetcher();
//     await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
//     return data;
// }

export async function cacheAside<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await redis.get<T>(key)
    if (cached !== null) {
      return cached
    }  
    const data = await fetcher()
    await redis.set(key, data, { ex: ttlSeconds })
    return data
  }
  

export async function getBlockWithCache(blockId: string, ttlSeconds = 3600) {
    return cacheAside(
        `block:${blockId}`,
        ttlSeconds,
        () => prisma.block.findUnique({ where: { id: blockId } })
    );
}

export async function invalidateBlockCache(blockId: string) {
    await redis.del(`block:${blockId}`);
}

export async function getBlockNoteWithCache(blockId: string, ttlSeconds = 3600) {
    return cacheAside(
        `block:note:${blockId}`,
        ttlSeconds,
        async () => {
            const block = await prisma.block.findUnique({
                where: { id: blockId },
                select: { note: true }
            });
            return block?.note ?? null;
        }
    );
}

export async function invalidateBlockNoteCache(blockId: string) {
    await redis.del(`block:note:${blockId}`);
}

export async function getBlockContextWithCache(blockId: string, ttlSeconds = 3600) {
    return cacheAside(
        `block:context:${blockId}`,
        ttlSeconds,
        async () => {
            const block = await prisma.block.findUnique({
                where: { id: blockId },
                select: { context: true }
            });
            return block?.context ?? null;
        }
    );
}

export async function invalidateBlockContextCache(blockId: string) {
    await redis.del(`block:context:${blockId}`);
}

export async function getUserBlocksWithCache(userId: string, ttlSeconds = 600) {
    return cacheAside(
        `user:blocks:${userId}`,
        ttlSeconds,
        async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    posts: {
                        select: { id: true, title: true, createdAt: true, folderId: true },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
            return user?.posts ?? [];
        }
    );
}

export async function invalidateUserBlocksCache(userId: string) {
    await redis.del(`user:blocks:${userId}`);
}

export async function getUserFoldersWithCache(userId: string, ttlSeconds = 600) {
    return cacheAside(
        `user:folders:${userId}`,
        ttlSeconds,
        async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    folders: {
                        select: { id: true, name: true, icon: true, createdAt: true, parentId: true, authorId: true },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
            return user?.folders ?? [];
        }
    );
}

export async function invalidateUserFoldersCache(userId: string) {
    await redis.del(`user:folders:${userId}`);
}

export async function getRootBlocksWithCache(userId: string, rootFolderId: string, ttlSeconds = 600) {
    return cacheAside(
        `user:rootblocks:${userId}`,
        ttlSeconds,
        async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    posts: {
                        where: { folderId: rootFolderId },
                        select: { id: true, title: true, createdAt: true },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
            return user?.posts ?? [];
        }
    );
}

export async function invalidateRootBlocksCache(userId: string) {
    await redis.del(`user:rootblocks:${userId}`);
}

export async function getRootFoldersWithCache(userId: string, rootFolderId: string, ttlSeconds = 600) {
    return cacheAside(
        `user:rootfolders:${userId}`,
        ttlSeconds,
        async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    folders: {
                        where: { parentId: rootFolderId },
                        select: { id: true, name: true, icon: true, createdAt: true },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
            return user?.folders ?? [];
        }
    );
}

export async function invalidateRootFoldersCache(userId: string) {
    await redis.del(`user:rootfolders:${userId}`);
}

export async function getDashboardItemsWithCache(userId: string, ttlSeconds = 600) {
    return cacheAside(
        `user:dashboard:${userId}`,
        ttlSeconds,
        async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    posts: {
                        select: { id: true, title: true, createdAt: true, folderId: true, authorId: true },
                        orderBy: { createdAt: 'desc' }
                    },
                    folders: {
                        select: { id: true, name: true, icon: true, createdAt: true, parentId: true, authorId: true },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
            return user ?? {};
        }
    );
}

export async function invalidateDashboardItemsCache(userId: string) {
    await redis.del(`user:dashboard:${userId}`);
}

export async function getFileSystemStructureWithCache(userId: string, ttlSeconds = 600) {
    return cacheAside(
        `user:filesystem:${userId}`,
        ttlSeconds,
        async () => {
            const [blocks, folders] = await Promise.all([
                prisma.block.findMany({
                    where: { authorId: userId, NOT: { folderId: null } },
                    select: { id: true, title: true, folderId: true }
                }),
                prisma.folder.findMany({
                    where: { NOT: { parentId: null } },
                    select: { id: true, name: true, parentId: true }
                })
            ]);
            return { blocks, folders };
        }
    );
}

export async function invalidateFileSystemStructureCache(userId: string) {
    await redis.del(`user:filesystem:${userId}`);
}

export async function getUserNameWithCache(userId: string, ttlSeconds = 3600) {
    return cacheAside(
        `user:name:${userId}`,
        ttlSeconds,
        async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true }
            });
            return user?.name ?? null;
        }
    );
}

export async function invalidateUserNameCache(userId: string) {
    await redis.del(`user:name:${userId}`);
}

export async function getFillInTheBlanksWithCache(blockId: string, ttlSeconds = 600) {
    return cacheAside(
        `block:fillintheblanks:${blockId}`,
        ttlSeconds,
        async () => {
            return prisma.fillInTheBlank.findMany({
                where: { blockId },
                orderBy: { id: 'asc' }
            });
        }
    );
}

export async function invalidateFillInTheBlanksCache(blockId: string) {
    await redis.del(`block:fillintheblanks:${blockId}`);
}

export async function getQuizzesWithCache(blockId: string, ttlSeconds = 600) {
    return cacheAside(
        `block:quizzes:${blockId}`,
        ttlSeconds,
        async () => {
            return prisma.quiz.findMany({
                where: { blockId }
            });
        }
    );
}

export async function invalidateQuizzesCache(blockId: string) {
    await redis.del(`block:quizzes:${blockId}`);
}

export async function getTopicsWithCache(blockId: string, ttlSeconds = 600) {
    return cacheAside(
        `block:topics:${blockId}`,
        ttlSeconds,
        async () => {
            return prisma.topic.findMany({
                where: { blockId }
            });
        }
    );
}

export async function invalidateTopicsCache(blockId: string) {
    await redis.del(`block:topics:${blockId}`);
}
