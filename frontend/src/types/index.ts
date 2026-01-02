export interface Booking {
    id: number;
    pnr: string;
    flight_id: number;
    passenger_name: string;
    seat_id: number | null;
    status: string;
    flight_number: string;
    departure_time: string;
    seat_number: string | null;
    class: string | null;
}

export interface Flight {
    id: number;
    flightNumber?: string; // Mapped from flight_number or used directly
    flight_number?: string; // API response key
    origin: string; // Added for UI
    destination: string; // Added for UI
    departureTime: string; // Mapped from departure_time
    departure_time?: string; // API response key
    total_seats: number;
    booked_seats: number;
}

export interface Seat {
    id: string;
    seatNumber: string;
    class: 'first' | 'business' | 'economy';
    position: 'window' | 'aisle' | 'middle';
    status: 'available' | 'booked' | 'blocked' | 'checked_in';
    price: number;
}

export interface CheckIn {
    id: string;
    bookingId: string;
    seatId: string;
    boardingPass: string;
    checkInTime: string;
    boardingGroup: string;
    gate: string;
}

export interface LookupResponse {
    booking: Booking;
    flight: Flight;
    seat?: Seat;
    checkIn?: CheckIn;
}

export interface LogEntry {
    timestamp: string;
    action: string;
    details: string;
}

export interface CheckInState {
    step: number;
    pnr: string;
    booking: Booking | null;
    flight: Flight | null;
    selectedSeat: Seat | null;
    checkIn: CheckIn | null; // Changed from boardingPass string to full object
    logs: LogEntry[]; // Changed from string[] to LogEntry[]
    error: string | null;
    loading: boolean;
}
