import { createClient } from 'redis';
import logger from './logger';

export const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => logger.error('Redis Client Error', err));

(async () => {
    if (!redis.isOpen) {
        await redis.connect();
    }
})();

export const testRedisConnection = async (): Promise<boolean> => {
    try {
        await redis.ping();
        return true;
    } catch (error) {
        logger.error('Redis connection test failed', { error });
        return false;
    }
};

export default redis;
