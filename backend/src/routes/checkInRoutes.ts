import { Router } from 'express';
import { CheckInService } from '../services/CheckInService';

export const createCheckInRouter = (checkInService: CheckInService) => {
    const router = Router();

    // Booking Lookup
    router.post('/lookup', async (req, res) => {
        try {
            const { pnr, lastName } = req.body;
            const result = await checkInService.lookupBooking(pnr, lastName);
            
            if (!result) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Lookup failed' });
        }
    });

    // Perform Check-In
    router.post('/', async (req, res) => {
        try {
            const idempotencyKey = req.headers['idempotency-key'] as string;
            const result = await checkInService.checkIn(req.body, idempotencyKey);
            
            if (!result.success) {
                // Determine status code based on error type roughly
                const status = result.error?.includes('not found') ? 404 : 400;
                return res.status(status).json(result);
            }
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Check-in failed' });
        }
    });

    return router;
};
