# System Architecture

## Overview
The Airline Check-In System is designed as a distributed, high-concurrency stateless application capable of handling high load spikes during check-in windows.

## Components

### 1. API Service (Node.js/Express)
- Stateless REST API
- Horizontally scalable
- Handles business logic, validation, and orchestration

### 2. Database (PostgreSQL)
- Relational data model for flights, bookings, seats, and check-ins
- ACID compliance for critical transactions (seat allocation)
- Read replicas for heavy read operations (booking lookup, flight details)

### 3. Distributed Cache & Lock (Redis)
- **Locking**: Implements the Redlock algorithm (via `set NX PX`) to prevent double-booking of seats.
- **Caching**: Stores flight seat maps and idempotent API responses to reduce DB load.
- **Idempotency**: Usage of atomic counters or keys to track in-progress requests.

### 4. Frontend (React/Vite)
- SPA for responsive user experience
- Real-time feedback using polling (or WebSocket if enhanced)

## Data Flow
1. **Lookup**: User enters PNR -> API checks Redis -> DB -> Returns Booking.
2. **Seat Select**: API fetches Seat Map (Cached) -> User selects seat.
3. **Check-In**: 
    - API checks Idempotency Key.
    - Acquires Redis Lock for specific Seat.
    - VALIDATION: DB state checked within Transaction.
    - ALLOCATION: Seat status updated to 'checked_in'.
    - COMMIT: Transaction commits.
    - RELEASE: Lock released.
    - RESPONSE: Boarding pass returned.

## Diagram
![System Architecture](diagrams/system-architecture.png)
