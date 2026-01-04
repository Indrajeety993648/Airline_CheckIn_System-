import { useState } from 'react';
import BoardingPass from './components/BoardingPass';
import BookingLookup from './components/BookingLookup';
import ProgressSteps from './components/ProgressSteps';
import SeatMap from './components/SeatMap';
import SystemLog from './components/SystemLog'; // Default import
import { useCheckIn } from './hooks/useCheckIn';

function App() {
  const { state, lookupBooking, selectSeat, completeCheckIn, reset } = useCheckIn();
  const [lastName, setLastName] = useState('');
  const [pnrInput, setPnrInput] = useState('');

  const handleLookup = () => {
      lookupBooking(pnrInput, lastName);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans selection:bg-indigo-100">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 py-4 px-6 bg-white rounded-2xl shadow-sm">
            <h1 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
                ✈️ Check-In System
            </h1>
            <div className="text-sm text-gray-500 font-mono">
                {state.pnr && `REF: ${state.pnr}`}
            </div>
             {state.step > 1 && (
                <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 underline">
                    Start Over
                </button>
            )}
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ProgressSteps currentStep={state.step} />
            
            <div className="transition-all duration-300">
                {state.step === 1 && (
                   <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                       <BookingLookup 
                           pnr={pnrInput}
                           lastName={lastName}
                           onPnrChange={setPnrInput}
                           onLastNameChange={setLastName}
                           onLookup={handleLookup}
                           isLoading={state.loading}
                           error={state.error || ''}
                       />
                   </div>
                )}

                {state.step === 2 && state.booking && state.flight && (
                  <div>
                      <SeatMap 
                          flight={state.flight} 
                          selectedSeat={state.selectedSeat}
                          onSeatSelect={selectSeat}
                          onConfirm={completeCheckIn}
                          isLoading={state.loading}
                          error={state.error || ''}
                      />
                  </div>
                )}

                {state.step === 4 && state.booking && state.selectedSeat && state.checkIn && state.flight && (
                    <div className="animate-fade-in-up">
                        <BoardingPass 
                            checkIn={state.checkIn}
                            seat={state.selectedSeat}
                            flight={state.flight}
                            passengerName={state.booking.passenger_name}
                            pnr={state.booking.pnr}
                            onReset={reset}
                        />
                    </div>
                )}
            </div>
            
            {state.error && state.step !== 1 && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200">
                    <strong>Error:</strong> {state.error}
                </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
                <SystemLog logs={state.logs} />
                
                 <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs font-mono text-gray-400 break-all hidden">
                     {JSON.stringify(state, null, 2)}
                 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
