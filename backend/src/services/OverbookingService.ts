import { Pool } from 'pg';

interface OverbookingStatus {
  canBook: boolean;
  availableSlots: number;
  isOverbooked: boolean;
  overbookedBy: number;
}

export class OverbookingService {
  private db: Pool;
  
  // Historical no-show rates by route type
  private readonly noShowRates: Record<string, number> = {
    domestic: 0.05,       // 5% no-show for domestic
    international: 0.03,  // 3% for international
    holiday: 0.02,        // 2% during holidays (people more likely to show)
    business: 0.08,       // 8% for business routes (more changes)
  };

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Calculate maximum bookings allowed for a flight
   */
  calculateMaxBookings(
    totalSeats: number,
    routeType: string = 'domestic'
  ): number {
    const noShowRate = this.noShowRates[routeType] || this.noShowRates.domestic;
    const overbookingFactor = 1 + noShowRate;
    return Math.floor(totalSeats * overbookingFactor);
  }

  /**
   * Check if flight can accept more bookings
   */
  async canAcceptBooking(flightId: string): Promise<OverbookingStatus> {
    const result = await this.db.query(
      `SELECT total_seats as "totalSeats", 
              booked_seats as "bookedSeats", 
              overbooking_limit as "overbookingLimit"
       FROM flights WHERE id = $1`,
      [flightId]
    );

    if (result.rows.length === 0) {
      throw new Error('Flight not found');
    }

    const { totalSeats, bookedSeats, overbookingLimit } = result.rows[0];
    const maxBookings = Math.floor(totalSeats * (overbookingLimit || 1.05)); // Default to 5% if not set
    const availableSlots = maxBookings - bookedSeats;
    const isOverbooked = bookedSeats > totalSeats;
    const overbookedBy = Math.max(0, bookedSeats - totalSeats);

    return {
      canBook: availableSlots > 0,
      availableSlots,
      isOverbooked,
      overbookedBy,
    };
  }
}
