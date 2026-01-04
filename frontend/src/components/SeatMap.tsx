import { Loader2, Plane } from 'lucide-react';
import React, { useMemo } from 'react';
import { Flight, Seat } from '../types';

interface SeatMapProps {
  flight: Flight;
  selectedSeat: Seat | null;
  onSeatSelect: (seat: Seat) => void;
  onConfirm: () => void;
  isLoading: boolean;
  error: string;
}

const SeatMap: React.FC<SeatMapProps> = ({
  flight,
  selectedSeat,
  onSeatSelect,
  onConfirm,
  isLoading,
  error,
}) => {
  const seats = useMemo(() => {
    const seatList: Seat[] = [];
    const bookedSeats = ['1A', '1F', '2C', '5A', '5B', '8D', '12A', '12F', '15C', '20A', '20B', '20C'];

    for (let row = 1; row <= 30; row++) {
      ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col) => {
        const seatNumber = `${row}${col}`;
        const isBooked = bookedSeats.includes(seatNumber);
        const position = ['A', 'F'].includes(col) ? 'window' : ['C', 'D'].includes(col) ? 'aisle' : 'middle';
        const seatClass = row <= 3 ? 'business' : 'economy';

        seatList.push({
          id: `seat-${seatNumber}`,
          seatNumber,
          status: isBooked ? 'booked' : 'available',
          position: position as 'window' | 'middle' | 'aisle',
          class: seatClass as 'economy' | 'business',
          price: seatClass === 'business' ? 2500 : position === 'window' ? 500 : position === 'aisle' ? 300 : 0,
        });
      });
    }
    return seatList;
  }, []);

  const getSeatClass = (seat: Seat) => {
    if (seat.status === 'booked') return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    if (selectedSeat?.id === seat.id) return 'bg-green-500 text-white ring-2 ring-green-300';
    if (seat.class === 'business') return 'bg-amber-100 hover:bg-amber-200 text-amber-800';
    return 'bg-blue-100 hover:bg-blue-200 text-blue-800';
  };

  // Helper to ensure flight props are available even if API only returns partial
  const displayFlight = {
      origin: flight.origin || 'BLR',
      destination: flight.destination || 'DEL',
      flightNumber: flight.flightNumber || flight.flight_number || 'FL000',
      departureTime: flight.departureTime || flight.departure_time || new Date().toISOString()
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Plane className="w-5 h-5 text-indigo-600" />
        Select Your Seat
      </h2>

      {/* Flight Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-lg">{displayFlight.origin}</p>
            <p className="text-xs text-gray-500">Bengaluru</p>
          </div>
          <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-300 relative">
            <Plane className="w-4 h-4 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50" />
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{displayFlight.destination}</p>
            <p className="text-xs text-gray-500">New Delhi</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-2">
          {displayFlight.flightNumber} • {new Date(displayFlight.departureTime).toLocaleDateString()}
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-100 rounded" /> Economy
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-amber-100 rounded" /> Business
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 rounded" /> Booked
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded" /> Selected
        </div>
      </div>

      {/* Seat Map */}
      <div className="border rounded-lg p-3 bg-gray-50 max-h-64 overflow-y-auto">
        <div className="text-center text-xs text-gray-500 mb-2">← Front of Aircraft</div>
        <div className="flex justify-center mb-2 sticky top-0 bg-gray-50">
          <span className="w-6" />
          {['A', 'B', 'C', '', 'D', 'E', 'F'].map((col, i) => (
            <span key={i} className={`${col ? 'w-7' : 'w-8'} text-xs text-gray-400 text-center`}>
              {col}
            </span>
          ))}
        </div>
        {Array.from({ length: 30 }, (_, i) => i + 1).map((rowNum) => {
          const rowSeats = seats.filter((s) => s.seatNumber.startsWith(`${rowNum}`) && s.seatNumber.replace(/[0-9]/g, '').length === 1); 
          // Logic adjusted to match seat naming (e.g. 1A, not 10A matched by '1')
          // Improved filter logic:
          const actualRowSeats = seats.filter(s => {
              const r = parseInt(s.seatNumber.replace(/\D/g, ''));
              return r === rowNum;
          });
          
          return (
            <div key={rowNum} className="flex items-center justify-center gap-1 mb-1">
              <span className="w-6 text-xs text-gray-500 text-right">{rowNum}</span>
              {actualRowSeats.slice(0, 3).map((seat) => (
                <button
                  key={seat.id}
                  disabled={seat.status === 'booked'}
                  onClick={() => onSeatSelect(seat)}
                  className={`w-7 h-7 rounded text-xs font-medium transition-all ${getSeatClass(seat)}`}
                >
                  {seat.seatNumber.slice(-1)}
                </button>
              ))}
              <div className="w-8" />
              {actualRowSeats.slice(3, 6).map((seat) => (
                <button
                  key={seat.id}
                  disabled={seat.status === 'booked'}
                  onClick={() => onSeatSelect(seat)}
                  className={`w-7 h-7 rounded text-xs font-medium transition-all ${getSeatClass(seat)}`}
                >
                  {seat.seatNumber.slice(-1)}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* Selected Seat Info */}
      {selectedSeat && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="font-medium text-green-800">Selected: Seat {selectedSeat.seatNumber}</p>
          <p className="text-sm text-green-600">
            {selectedSeat.position} • {selectedSeat.class}
            {selectedSeat.price > 0 ? ` • +₹${selectedSeat.price}` : ' • Free'}
          </p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        onClick={onConfirm}
        disabled={isLoading || !selectedSeat}
        className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Seat'}
      </button>
    </div>
  );
};

export default SeatMap;
