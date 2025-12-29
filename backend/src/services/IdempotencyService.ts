
export class IdempotencyService {
  private redisClient: any;

  constructor(redisClient: any) {
      this.redisClient = redisClient;
  }

  async getExistingResponse(key: string): Promise<any | null> {
    const data = await this.redisClient.get(`idempotency:${key}`);
    return data ? JSON.parse(data) : null;
  }

  async markInProgress(key: string): Promise<boolean> {
    const result = await this.redisClient.set(`idempotency:${key}:processing`, 'true', {
        NX: true,
        EX: 60 // Lock for 60 seconds processing time
    });
    return result === 'OK';
  }

  async storeResponse(key: string, statusCode: number, body: any): Promise<void> {
      const payload = JSON.stringify({ statusCode, body });
    await this.redisClient.set(`idempotency:${key}`, payload, {
        EX: 24 * 3600 // Cache for 24 hours
    });
  }
  
  async clearInProgress(key: string): Promise<void> {
    await this.redisClient.del(`idempotency:${key}:processing`);
  }
}
