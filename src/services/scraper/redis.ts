import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export function createRedisClient(): RedisClientType {
  if (redisClient) return redisClient;

  const url = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
  
  redisClient = createClient({
    url,
    password: process.env.REDIS_PASSWORD || undefined,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
  });

  redisClient.on('error', (err) => console.error('Redis error:', err));
  redisClient.on('connect', () => console.log('Redis connected'));
  redisClient.on('reconnecting', () => console.log('Redis reconnecting...'));

  if (!redisClient.isOpen) {
    redisClient.connect().catch(console.error);
  }

  return redisClient;
}

export async function getRedisClient(): Promise<RedisClientType> {
  const client = createRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

export async function closeRedisClient() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}