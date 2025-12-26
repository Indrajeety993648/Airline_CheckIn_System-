import { Pool } from 'pg';
import logger from './logger';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const testConnection = async (): Promise<boolean> => {
    try {
        await pool.query('SELECT 1');
        return true;
    } catch (error) {
        logger.error('Database connection test failed', { error });
        return false;
    }
};

export default pool;
