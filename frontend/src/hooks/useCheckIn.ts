import { useState } from 'react';
import { api } from '../services/api';
import { CheckInState, LogEntry, LookupResponse, Seat } from '../types';

export const useCheckIn = () => {
    const [state, setState] = useState<CheckInState>({
        step: 1,
        pnr: '',
        booking: null,
        flight: null,
        selectedSeat: null,
        checkIn: null, // Initialized
        logs: [],
        error: null,
        loading: false
    });

    const addLog = (action: string, details: string) => {
        const entry: LogEntry = {
            timestamp: new Date().toLocaleTimeString(),
            action,
            details
        };
        setState(prev => ({ ...prev, logs: [...prev.logs, entry] }));
    };

    const updatePnr = (pnr: string) => setState(prev => ({ ...prev, pnr, error: null }));
    
    const lookupBooking = async (pnr: string, lastName: string) => {
        setState(prev => ({ ...prev, loading: true, error: null, pnr }));
        addLog('App', `Looking up booking for PNR: ${pnr}`);
        
        try {
            // Emulate Backend Logs locally for demo (in real app, logs would come from WebSocket/SSE)
            addLog('API', `POST /check-in/lookup`);
            addLog('PostgreSQL', `SELECT * FROM bookings WHERE pnr = '${pnr}'`);
            
            const response: LookupResponse = await api.lookupBooking(pnr, lastName);
            addLog('Service', 'Booking found successfully');
            
            setState(prev => ({ 
                ...prev, 
                booking: response.booking,
                flight: response.flight,
                selectedSeat: response.seat || null, 
                step: 2, 
                loading: false 
            }));
        } catch (err) {
            addLog('API', 'Lookup failed (404/500)');
            setState(prev => ({ ...prev, error: (err as Error).message, loading: false }));
        }
    };

    const selectSeat = (seat: Seat) => {
        setState(prev => ({ ...prev, selectedSeat: seat }));
        addLog('UI', `User selected seat ${seat.seatNumber}`);
    };

    const completeCheckIn = async () => {
        if (!state.booking) return;
        setState(prev => ({ ...prev, loading: true, error: null }));
        addLog('App', 'Initiating check-in sequence...');
        addLog('Idempotency', `Checking key for PNR ${state.booking.pnr}`);
        
        try {
            addLog('API', `POST /check-in`);
            addLog('Redis', `Acquiring lock for Seat ${state.selectedSeat?.id}`);
            
            const lastName = state.booking.passenger_name.split(' ').pop() || '';
            const result = await api.checkIn(state.booking.pnr, lastName, state.selectedSeat?.id);
            
            addLog('PostgreSQL', 'BEGIN TRANSACTION');
            addLog('PostgreSQL', 'UPDATE seats SET status = \'booked\'');
            addLog('PostgreSQL', 'INSERT INTO check_ins ...');
            addLog('PostgreSQL', 'COMMIT');
            addLog('Redis', 'Releasing lock');
            addLog('Service', 'Boarding pass generated');

            setState(prev => ({
                ...prev,
                step: 4, 
                checkIn: result.data.checkIn, // Store full object
                loading: false
            }));
        } catch (err) {
            addLog('API', 'Check-in failed');
            setState(prev => ({ ...prev, error: (err as Error).message, loading: false }));
        }
    };
    
    const reset = () => {
        setState({
            step: 1,
            pnr: '',
            booking: null,
            flight: null,
            selectedSeat: null,
            checkIn: null,
            logs: [],
            error: null,
            loading: false
        });
        addLog('App', 'System reset');
    };

    return {
        state,
        updatePnr,
        lookupBooking,
        selectSeat,
        completeCheckIn,
        reset
    };
};
