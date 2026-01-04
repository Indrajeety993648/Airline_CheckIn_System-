import { CheckCircle } from 'lucide-react';
import React from 'react';

interface ProgressStepsProps {
  currentStep: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Find Booking' },
    { num: 2, label: 'Select Seat' },
    { num: 3, label: 'Confirm' },
    { num: 4, label: 'Boarding Pass' },
  ];

  return (
    <div className="flex justify-center">
      {steps.map((step, index) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                currentStep >= step.num
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20 text-white/60'
              }`}
            >
              {currentStep > step.num ? <CheckCircle className="w-5 h-5" /> : step.num}
            </div>
            <span className="text-xs text-white/70 mt-1 hidden sm:block">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-8 sm:w-16 h-1 mx-1 ${
                currentStep > step.num ? 'bg-green-500' : 'bg-white/20'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;
