import { Pool } from 'pg';
import logger from '../config/logger';
import { Seat, SeatAllocationResult, SeatClass, SeatPosition } from '../types';
import { RedisLockService } from './RedisLockService';

export class SeatAllocationService {
  private db: Pool;
  private lockService: RedisLockService;

  constructor(db: Pool, lockService: RedisLockService) {
    this.db = db;
    this.lockService = lockService;
  }

  /**
   * Get available seats for a flight with optional filters
   */
  async getAvailableSeats(
    flightId: string,
    filters?: {
      class?: SeatClass;
      position?: SeatPosition;
    }
  ): Promise<Seat[]> {
    let query = `
      SELECT id, flight_id as "flightId", seat_number as "seatNumber", 
             class, position, status, price
      FROM seats 
      WHERE flight_id = $1 AND status = 'available'
    `;
    const params: any[] = [flightId];

    if (filters?.class) {
      params.push(filters.class);
      query += ` AND class = $${params.length}`;
    }

    if (filters?.position) {
      params.push(filters.position);
      query += ` AND position = $${params.length}`;
    }

    query += ` ORDER BY 
      CASE class WHEN 'first' THEN 1 WHEN 'business' THEN 2 ELSE 3 END,
      seat_number`;

    const result = await this.db.query(query, params);
    return result.rows;
  }

  /**
   * Get a specific seat by ID
   */
  async getSeatById(seatId: string): Promise<Seat | null> {
    const result = await this.db.query(
      `SELECT id, flight_id as "flightId", seat_number as "seatNumber", 
              class, position, status, price
       FROM seats WHERE id = $1`,
      [seatId]
    );
    return result.rows[0] || null;
  }

  /**
   * Allocate a specific seat with distributed locking
   */
  async allocateSeat(
    flightId: string,
    seatId: string,
    bookingId: string
  ): Promise<SeatAllocationResult> {
    const lockKey = `seat:${flightId}:${seatId}`;
    
    // Use instance method instead of static
    const lockValue = await this.lockService.acquireLockWithRetry(lockKey, 10000, 3, 100);
    
    if (!lockValue) {
      logger.warn('Failed to acquire seat lock', { flightId, seatId, bookingId });
      return {
        success: false,
        error: 'Seat is being processed by another request. Please try again.',
      };
    }

    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      const seatCheck = await client.query(
        'SELECT id, status, seat_number as "seatNumber", class, position, price FROM seats WHERE id = $1 FOR UPDATE',
        [seatId]
      );

      if (seatCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, error: 'Seat not found' };
      }

      const seat = seatCheck.rows[0];

      if (seat.status !== 'available') {
        await client.query('ROLLBACK');
        return { success: false, error: `Seat ${seat.seatNumber} is no longer available` };
      }

      await client.query(
        'UPDATE seats SET status = $1 WHERE id = $2',
        ['booked', seatId]
      );

      await client.query(
        'UPDATE bookings SET seat_id = $1, updated_at = NOW() WHERE id = $2',
        [seatId, bookingId]
      );

      await client.query(
        'UPDATE flights SET booked_seats = booked_seats + 1, updated_at = NOW() WHERE id = $1',
        [flightId]
      );

      await client.query('COMMIT');

      logger.info('Seat allocated successfully', { flightId, seatId, bookingId, seatNumber: seat.seatNumber });

      return {
        success: true,
        seat: {
          id: seat.id,
          flightId,
          seatNumber: seat.seatNumber,
          class: seat.class,
          position: seat.position,
          status: 'booked',
          price: seat.price,
        },
      };

    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Seat allocation failed', { flightId, seatId, bookingId, error: (err as Error).message });
      throw err;
    } finally {
      client.release();
      await this.lockService.releaseLock(lockKey, lockValue);
    }
  }

  /**
   * Auto-assign seat
   */
  async autoAssignSeat(
    flightId: string,
    bookingId: string,
    preferences?: { class?: SeatClass; position?: SeatPosition }
  ): Promise<SeatAllocationResult> {
    let seats = await this.getAvailableSeats(flightId, preferences);

    if (seats.length === 0 && preferences) {
      logger.info('No seats matching preferences, trying any available', { flightId, preferences });
      seats = await this.getAvailableSeats(flightId);
    }

    if (seats.length === 0) {
      return { success: false, error: 'No seats available on this flight' };
    }

    for (const seat of seats) {
      const result = await this.allocateSeat(flightId, seat.id, bookingId);
      if (result.success) {
        return result;
      }
      logger.debug('Seat allocation failed, trying next', { seatId: seat.id });
    }

    return { success: false, error: 'Could not allocate any seat. Please try again.' };
  }

  /**
   * Release seat
   */
  async releaseSeat(seatId: string, bookingId: string): Promise<boolean> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      const booking = await client.query(
        'SELECT flight_id FROM bookings WHERE id = $1 AND seat_id = $2',
        [bookingId, seatId]
      );

      if (booking.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      const flightId = booking.rows[0].flight_id;

      await client.query(
        'UPDATE seats SET status = $1 WHERE id = $2',
        ['available', seatId]
      );

      await client.query(
        'UPDATE bookings SET seat_id = NULL, updated_at = NOW() WHERE id = $1',
        [bookingId]
      );

      await client.query(
        'UPDATE flights SET booked_seats = booked_seats - 1, updated_at = NOW() WHERE id = $1',
        [flightId]
      );

      await client.query('COMMIT');
      logger.info('Seat released', { seatId, bookingId });
      return true;

    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Seat release failed', { seatId, bookingId, error: (err as Error).message });
      throw err;
    } finally {
      client.release();
    }
  }
}
