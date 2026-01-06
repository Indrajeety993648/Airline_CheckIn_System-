# API Documentation

## Base URL
`http://localhost:3000/api`

## Endpoints

### Check-In

#### `POST /check-in`
Performs the check-in operation.
- **Body**: `{ "pnr": "ABC123", "lastName": "Doe", "seatPreference": { "seatId": "1A" } }`
- **Headers**: `Idempotency-Key: <uuid>` (Optional but recommended)
- **Response**: `200 OK` with Boarding Pass and Seat info.

#### `POST /check-in/lookup`
Retrieves booking details.
- **Body**: `{ "pnr": "ABC123", "lastName": "Doe" }`
- **Response**: booking details.

### Flights

#### `GET /flights`
List all flights.

#### `GET /flights/:id/seats`
Get seat map for a flight.

### Seats

#### `POST /seats/allocate`
Direct seat allocation (internal/admin use or specialized flow).
- **Body**: `{ "flightId": 1, "seatId": 5, "bookingId": 10 }`

#### `POST /seats/auto-assign`
Auto-assigns a seat based on preferences.
