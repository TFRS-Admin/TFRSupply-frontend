import React from 'react';
import { Check } from 'lucide-react';

const STEP_LABELS = ['Vehicle', 'Options', 'Accessories', 'Dependencies', 'Review'];

export default function StepProgress({ currentStep, totalSteps = 5 }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEP_LABELS.slice(0, totalSteps).map((label, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isFuture = index > currentStep;
          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isActive
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-gray-900 border-gray-700 text-gray-600'
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : index + 1}
                </div>
                <span className={`text-[10px] font-semibold tracking-wide hidden sm:block ${
                  isActive ? 'text-white' : isCompleted ? 'text-blue-400' : 'text-gray-600'
                }`}>
                  {label}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div className={`flex-1 h-[2px] mx-2 rounded-full transition-all duration-500 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-800'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}