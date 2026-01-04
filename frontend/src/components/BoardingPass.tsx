import { CheckCircle, Plane } from 'lucide-react';
import React from 'react';
import { CheckIn, Flight, Seat } from '../types';

interface BoardingPassProps {
  checkIn: CheckIn;
  seat: Seat;
  flight: Flight;
  passengerName: string;
  pnr: string;
  onReset: () => void;
}

const BoardingPass: React.FC<BoardingPassProps> = ({
  checkIn,
  seat,
  flight,
  passengerName,
  pnr,
  onReset,
}) => {
    
  // Helper to ensure flight props are valid
  const displayFlight = {
      origin: flight.origin || 'BLR',
      destination: flight.destination || 'DEL',
      flightNumber: flight.flightNumber || flight.flight_number || 'FL000',
  };

  return (
    <div>
      <div className="text-center mb-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
        <h2 className="text-xl font-semibold text-green-700">Check-In Complete!</h2>
        <p className="text-sm text-gray-500">Your boarding pass is ready</p>
      </div>

      {/* Boarding Pass Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs opacity-75 uppercase tracking-wide">Boarding Pass</p>
            <p className="font-bold text-lg">{passengerName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75">PNR</p>
            <p className="font-mono font-bold text-lg">{pnr}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-3xl font-bold">{displayFlight.origin}</p>
            <p className="text-xs opacity-75">Bengaluru</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="border-t-2 border-dashed border-white/30 flex-1 mx-2" />
            <Plane className="w-6 h-6 rotate-90" />
            <div className="border-t-2 border-dashed border-white/30 flex-1 mx-2" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{displayFlight.destination}</p>
            <p className="text-xs opacity-75">New Delhi</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center bg-white/10 rounded-lg p-3">
          <div>
            <p className="text-xs opacity-75">FLIGHT</p>
            <p className="font-bold">{displayFlight.flightNumber}</p>
          </div>
          <div>
            <p className="text-xs opacity-75">GATE</p>
            <p className="font-bold">{checkIn.gate}</p>
          </div>
          <div>
            <p className="text-xs opacity-75">SEAT</p>
            <p className="font-bold">{seat.seatNumber}</p>
          </div>
          <div>
            <p className="text-xs opacity-75">GROUP</p>
            <p className="font-bold">{checkIn.boardingGroup}</p>
          </div>
        </div>

        {/* Barcode */}
        <div className="mt-4 bg-white rounded p-3">
          <div className="flex flex-col items-center">
            <div className="flex gap-px mb-1">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-black"
                  style={{
                    width: Math.random() > 0.5 ? '2px' : '1px',
                    height: '30px',
                  }}
                />
              ))}
            </div>
            <p className="text-black font-mono text-xs">{checkIn.boardingPass}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Start New Check-In
      </button>
    </div>
  );
};

export default BoardingPass;
