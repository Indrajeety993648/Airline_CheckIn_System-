const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
    lookupBooking: async (pnr: string, lastName: string) => {
        const response = await fetch(`${API_URL}/check-in/lookup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pnr, lastName })
        });
        if (!response.ok) throw new Error('Booking lookup failed');
        return response.json();
    },

    getSeats: async (flightId: number) => {
        const response = await fetch(`${API_URL}/flights/${flightId}/seats`);
        if (!response.ok) throw new Error('Failed to fetch seats');
        return response.json();
    },

    checkIn: async (pnr: string, lastName: string, seatId?: string) => {
        const response = await fetch(`${API_URL}/check-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                pnr, 
                lastName, 
                seatPreference: seatId ? { seatId } : undefined 
            })
        });
        if (!response.ok) throw new Error('Check-in failed');
        return response.json();
    }
};
