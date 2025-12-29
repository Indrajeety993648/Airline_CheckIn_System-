import { Router } from 'express';
import { Pool } from 'pg';

export const createFlightRouter = (pool: Pool) => {
    const router = Router();

    // Basic flight info
    router.get('/', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM flights ORDER BY departure_time');
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch flights' });
        }
    });

    // Flight details with seat map
    router.get('/:id/seats', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query('SELECT * FROM seats WHERE flight_id = $1 ORDER BY seat_number', [id]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch seats' });
        }
    });

    return router;
};
