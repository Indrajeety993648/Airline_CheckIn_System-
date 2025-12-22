-- Insert sample bookings
INSERT INTO bookings (pnr, flight_id, passenger_name, status) VALUES
('AB1234', 1, 'John Doe', 'BOOKED'),
('ORD567', 1, 'Jane Smith', 'BOOKED'),
('XY9876', 2, 'Alice Johnson', 'BOOKED'),
('TEST01', 1, 'Test User', 'BOOKED')
ON CONFLICT (pnr) DO NOTHING;
