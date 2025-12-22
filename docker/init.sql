CREATE TABLE IF NOT EXISTS flights (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(10) NOT NULL UNIQUE,
    departure_time TIMESTAMP NOT NULL,
    total_seats INTEGER NOT NULL,
    booked_seats INTEGER DEFAULT 0,
    overbooking_limit DECIMAL(3, 2) DEFAULT 1.05,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    flight_id INTEGER REFERENCES flights(id),
    seat_number VARCHAR(5) NOT NULL,
    class VARCHAR(20) NOT NULL, -- first, business, economy
    position VARCHAR(20) NOT NULL, -- window, aisle, middle
    status VARCHAR(20) DEFAULT 'available', -- available, booked, blocked
    price DECIMAL(10, 2) NOT NULL,
    UNIQUE(flight_id, seat_number)
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    pnr VARCHAR(6) NOT NULL UNIQUE,
    flight_id INTEGER REFERENCES flights(id),
    passenger_name VARCHAR(100) NOT NULL,
    seat_id INTEGER REFERENCES seats(id),
    status VARCHAR(20) DEFAULT 'BOOKED', -- BOOKED, CHECKED_IN
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data for Flights
INSERT INTO flights (flight_number, departure_time, total_seats, booked_seats) VALUES
('AI-101', NOW() + INTERVAL '2 hours', 120, 0),
('BA-202', NOW() + INTERVAL '5 hours', 150, 0);

-- Function to seed seats for a flight
CREATE OR REPLACE FUNCTION seed_seats(flight_id INT, total_rows INT) RETURNS VOID AS $$
DECLARE
    r INT;
    c CHAR;
    seat_class VARCHAR;
    price DECIMAL;
BEGIN
    FOR r IN 1..total_rows LOOP
        IF r <= 2 THEN
            seat_class := 'first';
            price := 500.00;
        ELSIF r <= 5 THEN
            seat_class := 'business';
            price := 250.00;
        ELSE
            seat_class := 'economy';
            price := 100.00;
        END IF;

        FOR c IN 65..70 LOOP -- A to F
            INSERT INTO seats (flight_id, seat_number, class, position, price)
            VALUES (
                flight_id, 
                r || chr(c), 
                seat_class, 
                CASE WHEN chr(c) IN ('A', 'F') THEN 'window' WHEN chr(c) IN ('C', 'D') THEN 'aisle' ELSE 'middle' END,
                price
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Seed Seats only if empty
DO $$
DECLARE count_seats INT;
BEGIN
    SELECT COUNT(*) INTO count_seats FROM seats;
    IF count_seats = 0 THEN
        PERFORM seed_seats(1, 20); -- 120 seats
        PERFORM seed_seats(2, 25); -- 150 seats
    END IF;
END $$;
