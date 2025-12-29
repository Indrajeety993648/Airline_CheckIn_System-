export interface Flight {
    id: number;
    flight_number: string;
    departure_time: Date;
    total_seats: number;
    booked_seats: number;
    overbooking_limit: number;
}

export interface Booking {
    id: number;
    pnr: string;
    flight_id: number;
    passenger_name: string;
    seat_id: number | null;
    status: 'BOOKED' | 'CHECKED_IN' | 'confirmed' | 'checked_in'; // Combined db and logic statuses
    updated_at: Date;
    // Extended fields for finding booking
    flightId: number; 
    seatId: number | null;
}

export type SeatClass = 'first' | 'business' | 'economy';
export type SeatPosition = 'window' | 'aisle' | 'middle';
export type SeatStatus = 'available' | 'booked' | 'blocked' | 'checked_in';

export interface Seat {
    id: string;
    flightId: string;
    seatNumber: string;
    class: SeatClass;
    position: SeatPosition;
    status: SeatStatus;
    price: number;
}

export interface SeatAllocationResult {
    success: boolean;
    error?: string;
    seat?: Seat;
}

// CheckIn specific types
export type BoardingGroup = 'A' | 'B' | 'C' | 'D';

export interface CheckInRequest {
    pnr: string;
    lastName: string;
    seatPreference?: {
        seatId?: string;
        class?: SeatClass;
        position?: SeatPosition;
    };
}

export interface CheckInResponse {
    checkIn: CheckIn;
    boardingPass: string;
    seat: Seat;
    flight: Flight;
}

export interface CheckIn {
    id: string;
    bookingId: string;
    seatId: string;
    boardingPass: string;
    checkInTime: Date;
    boardingGroup: BoardingGroup;
    gate: string;
}
