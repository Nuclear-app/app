import { Redis } from "@upstash/redis";

// Validate Redis environment variables
if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.warn('UPSTASH_REDIS_REST_URL environment variable is not set. Redis caching will be disabled.');
  }
  
  if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('UPSTASH_REDIS_REST_TOKEN environment variable is not set. Redis caching will be disabled.');
  }
  
  export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });