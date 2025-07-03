import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export async function cacheAside(key: string, ttlSeconds: number, fetcher: () => Promise<any>) {
    const cached = await redis.get(key);
    if (cached) {
        return JSON.parse(cached as string);
    }
    const data = await fetcher();
    await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
    return data;
}
