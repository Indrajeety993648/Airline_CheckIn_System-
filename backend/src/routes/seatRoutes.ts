import { Router } from 'express';
import pool from '../config/database'; // Using default export (Pool) usually, but database.ts exported `query`. Need to verify.
import { SeatAllocationService } from '../services/SeatAllocationService';

// Correction: database.ts in previous step only exported `query`. 
// I need `pool` instance for SeatAllocationService.
// Let's assume I will fix database.ts to export pool as default or named.
// For now, I will create a temp pool here or fix database.ts first? 
// Fix database.ts first is better practice. But for this file context:

const router = Router();
// We will need to fix database.ts to export the pool instance for the service constructor.
// Re-importing assuming fixed database.ts

const seatService = new SeatAllocationService(pool);

router.get('/flight/:flightId', async (req, res) => {
    try {
        const { flightId } = req.params;
        const { class: seatClass, position } = req.query;
        
        const seats = await seatService.getAvailableSeats(flightId, {
            class: seatClass as any,
            position: position as any
        });
        res.json(seats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch seats' });
    }
});

router.post('/allocate', async (req, res) => {
    try {
        const { flightId, seatId, bookingId } = req.body;
        // Basic validation
        if (!flightId || !seatId || !bookingId) {
             return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await seatService.allocateSeat(flightId, seatId, bookingId);
        if (!result.success) {
            return res.status(409).json(result); // 409 Conflict
        }
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Seat allocation failed' });
    }
});

router.post('/auto-assign', async (req, res) => {
    try {
        const { flightId, bookingId, preferences } = req.body;
        const result = await seatService.autoAssignSeat(flightId, bookingId, preferences);
        
        if (!result.success) {
            return res.status(409).json(result);
        }
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Auto-assignment failed' });
    }
});

export const seatRoutes = router;
