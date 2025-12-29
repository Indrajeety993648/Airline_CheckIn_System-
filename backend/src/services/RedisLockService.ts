import logger from '../config/logger';

export class RedisLockService {
    private redisClient: any; // Using any to avoid complex RedisClientType generics matching

    constructor(redisClient: any) {
        this.redisClient = redisClient;
    }

    /**
     * Acquire a distributed lock with retry mechanism
     */
    async acquireLockWithRetry(
        key: string, 
        ttlMs: number, 
        retries: number, 
        retryDelayMs: number
    ): Promise<string | null> {
        const value = Math.random().toString(36).substring(2);
        
        for (let i = 0; i <= retries; i++) {
            try {
                // NX: Set only if not exists, PX: Set expiry effectively
                const result = await this.redisClient.set(key, value, { PX: ttlMs, NX: true });
                
                if (result === 'OK') {
                    return value;
                }
            } catch (error) {
                logger.error('Redis lock acquisition error', { key, error });
            }

            if (i < retries) {
                await new Promise(resolve => setTimeout(resolve, retryDelayMs));
            }
        }
        
        return null;
    }

    /**
     * Release the lock if the value matches
     */
    async releaseLock(key: string, value: string): Promise<void> {
        const script = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
        `;
        
        try {
            await this.redisClient.eval(script, {
                keys: [key],
                arguments: [value]
            });
        } catch (error) {
            logger.error('Redis lock release error', { key, error });
        }
    }
}
