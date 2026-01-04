import { AlertCircle, Loader2, User } from 'lucide-react';
import React from 'react';

interface BookingLookupProps {
  pnr: string;
  lastName: string;
  onPnrChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onLookup: () => void;
  isLoading: boolean;
  error: string;
}

const BookingLookup: React.FC<BookingLookupProps> = ({
  pnr,
  lastName,
  onPnrChange,
  onLastNameChange,
  onLookup,
  isLoading,
  error,
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-indigo-600" />
        Find Your Booking
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PNR / Booking Reference
          </label>
          <input
            type="text"
            value={pnr}
            onChange={(e) => onPnrChange(e.target.value.toUpperCase())}
            maxLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase font-mono text-lg"
            placeholder="e.g., ABC123"
          />
          <p className="text-xs text-gray-500 mt-1">Enter 6-character booking reference</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter passenger last name"
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        <button
          onClick={onLookup}
          disabled={isLoading || !pnr || !lastName}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            'Find Booking'
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingLookup;
