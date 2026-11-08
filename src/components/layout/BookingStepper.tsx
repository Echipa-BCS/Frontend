import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: 1 | 2 | 3;
}

export default function BookingStepper({ currentStep }: StepperProps) {
  const steps = [
    { number: 1, label: 'Interval' },
    { number: 2, label: 'Echipament' },
    { number: 3, label: 'Plată' },
  ];

  return (
    <div className="flex items-center justify-center gap-4 my-6">
      {steps.map((step, idx) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-blue-900 text-white'
                    : isCurrent
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span
                className={`text-sm font-medium ${
                  isCurrent ? 'text-slate-900 font-bold' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="w-12 h-0.5 mx-3 bg-slate-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}