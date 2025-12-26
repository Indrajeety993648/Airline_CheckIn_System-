import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export { pool }; // Export pool for usage in services

    export * from './redis';

// Default config object for imports like "import config from '../config'"
const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    checkIn: {
        windowHoursBefore: 24,
        windowHoursAfter: -1, 
    },
    redis: {
        ttl: 3600
    }
};

export default config;
