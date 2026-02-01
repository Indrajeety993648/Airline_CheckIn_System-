# ✈️ Airline Check-In System

A robust, high-concurrency airline check-in system featuring distributed seat locking, idempotency, and overbooking handling. Built with Node.js, TypeScript, PostgreSQL, Redis, and React.

<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/132a4506-adc4-4332-89bc-70cb1bc5d5ea" />


## 🚀 Complete Setup Guide

### 1. Prerequisites
- Docker & Docker Compose
- Node.js v18+ (for local dev)
- `make` (optional, for convenience)
- `k6` (for load testing)

### 2. Quick Start (Docker)

The easiest way to run the entire system is using Docker Compose.

```bash
# Start all services (DB, Redis, API, Frontend)
make dev

# OR manually
docker-compose -f docker/docker-compose.dev.yml up --build -d
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000/api](http://localhost:3000/api)
- **Health Check:** [http://localhost:3000/health](http://localhost:3000/health)

### 3. Project Structure

```
├── backend/                # Node.js/Express API
│   ├── src/
│   │   ├── config/         # DB & Redis config
│   │   ├── services/       # Business logic (SeatAllocation, CheckIn)
│   │   ├── routes/         # API endpoints
│   │   └── types/          # TypeScript definitions
│   └── tests/              # Unit & Integration tests
├── frontend/               # React + Vite App
│   ├── src/
│   │   ├── components/     # React components (SeatMap, BoardingPass)
│   │   └── hooks/          # Custom hooks (useCheckIn)
├── docker/                 # Docker config & Init SQL
├── load-tests/             # k6 Load Testing scripts
└── docs/                   # Architecture documentation
```

### 4. Load Testing

Install `k6` and run performance tests to verify system stability.

```bash
# Install k6
brew install k6  # Mac
# sudo apt install k6  # Linux
# choco install k6  # Windows

# Run Load Test (Normal Load)
make load-test
# or
k6 run load-tests/check-in-load-test.js

# Stress Test
make load-test-stress

# Spike Test
make load-test-spike
```

### 5. Architectural Highlights

- **Distributed Locking:** Uses Redis (Redlock pattern) to prevent double-booking of seats during concurrent requests.
- **Idempotency:** Ensures check-in requests are processed exactly once, protecting against network retries.
- **Overbooking Engine:** Configurable limits to allow controlled overbooking based on historical data.
- **Optimistic Concurrency:** Database-level locking (`FOR UPDATE`) acts as a final safeguard.

### 6. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/check-in/lookup` | Look up a booking by PNR and Last Name |
| POST | `/api/check-in` | Perform check-in (requires `Idempotency-Key` header) |
| GET | `/api/flights` | List all flights |
| GET | `/api/flights/:id/seats` | Get seat map for a flight |

### 7. Deployment

For production, use the standard `docker-compose.yml`:
```bash
make prod
# or
docker-compose -f docker/docker-compose.yml up -d
```

---
**Author:** Indrajeet
**License:** MIT
