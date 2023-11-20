import { Redis } from "@upstash/redis";

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

export default redisClient;
