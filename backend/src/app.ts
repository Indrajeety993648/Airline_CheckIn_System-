import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';

// Config
import config from './config';
import { pool, testConnection } from './config/database';
import logger from './config/logger';
import { redis, testRedisConnection } from './config/redis';

// Services
import { CheckInService } from './services/CheckInService';
import { IdempotencyService } from './services/IdempotencyService';
import { RedisLockService } from './services/RedisLockService';
import { SeatAllocationService } from './services/SeatAllocationService';

// Routes
import { createCheckInRouter } from './routes/checkInRoutes';
import { createFlightRouter } from './routes/flightRoutes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

async function createApp(): Promise<Application> {
  const app = express();

  // ==========================================
  // Middleware
  // ==========================================
  
  // Security headers
  app.use(helmet());
  
  // CORS
  app.use(cors({
    origin: config.env === 'development' 
      ? ['http://localhost:5173', 'http://localhost:3000']
      : process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
  }));
  
  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));
  
  // Request logging
  app.use(requestLogger);

  // ==========================================
  // Initialize Services
  // ==========================================
  
  const lockService = new RedisLockService(redis);
  const idempotencyService = new IdempotencyService(redis);
  const seatService = new SeatAllocationService(pool, lockService);
  const checkInService = new CheckInService(pool, seatService, idempotencyService);

  // ==========================================
  // Routes
  // ==========================================
  
  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const dbHealthy = await testConnection();
      const redisHealthy = await testRedisConnection();

      const status = dbHealthy && redisHealthy ? 'healthy' : 'degraded';
      const statusCode = status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        status,
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealthy ? 'up' : 'down',
          redis: redisHealthy ? 'up' : 'down',
        },
        uptime: process.uptime(),
      });
    } catch (err) {
      res.status(503).json({
        status: 'unhealthy',
        error: (err as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // API routes
  app.use('/api/check-in', createCheckInRouter(checkInService));
  app.use('/api/flights', createFlightRouter(pool));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

// ==========================================
// Server Startup
// ==========================================

async function startServer() {
  try {
    logger.info('Starting Airline Check-In Service...');

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Test Redis connection
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      throw new Error('Redis connection failed');
    }

    // Create and start app
    const app = await createApp();
    
    const server = app.listen(config.port, () => {
      logger.info(`🛫 Airline Check-In Service running on port ${config.port}`);
      logger.info(`   Environment: ${config.env}`);
      logger.info(`   Health: http://localhost:${config.port}/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await pool.end();
          logger.info('Database pool closed');

          await redis.quit(); // Changed from disconnect to quit for graceful
          logger.info('Redis disconnected');

          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown', { error: (err as Error).message });
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('Failed to start server', { error: (err as Error).message });
    process.exit(1);
  }
}

// Start server
if (require.main === module) {
    startServer();
}

export { createApp };
