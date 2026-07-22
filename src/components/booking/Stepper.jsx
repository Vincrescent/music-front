import { useState } from "react";

const steps = [
  { number: 1, label: "Studio" },
  { number: 2, label: "Jadwal" },
  { number: 3, label: "Kontak" },
  { number: 4, label: "Bayar" },
];

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ── Circle Stepper (used for Step 1) ─────────────────────────── */
function CircleStepper({ currentStep, onStepClick }) {
  return (
    <div className="w-full max-w-xl mx-auto py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;
          const isFuture = step.number > currentStep;

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={isFuture || isActive}
                  onClick={() => isCompleted && onStepClick?.(step.number)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-200
                    ${isCompleted
                      ? "bg-accent text-white cursor-pointer hover:bg-accent-dark"
                      : ""}
                    ${isActive
                      ? "bg-accent text-white ring-4 ring-accent/20 cursor-default"
                      : ""}
                    ${isFuture
                      ? "border-2 border-gray-300 text-gray-400 cursor-default"
                      : ""}
                  `}
                >
                  {isCompleted ? <CheckIcon /> : step.number}
                </button>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isActive
                      ? "text-accent"
                      : isCompleted
                      ? "text-accent"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mt-[-1.25rem] ${
                    step.number < currentStep ? "bg-accent" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Progress-Bar Stepper (used for Steps 2–4) ───────────────── */
function ProgressBarStepper({ currentStep, onStepClick }) {
  const percentage = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto py-6">
      {/* Top row: step text + percentage */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-warm-gray">
          Langkah {currentStep} dari {steps.length}
        </span>
        <span className="text-sm font-semibold text-accent">
          {percentage}% Selesai
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step labels row */}
      <div className="flex items-center justify-between">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;
          const isFuture = step.number > currentStep;

          return (
            <button
              key={step.number}
              type="button"
              disabled={isFuture || isActive}
              onClick={() => isCompleted && onStepClick?.(step.number)}
              className={`
                flex items-center gap-1.5 text-xs font-medium transition-colors
                ${isCompleted
                  ? "text-accent cursor-pointer hover:text-accent-dark"
                  : ""}
                ${isActive ? "text-accent font-semibold cursor-default" : ""}
                ${isFuture ? "text-gray-400 cursor-default" : ""}
              `}
            >
              {isCompleted && (
                <span className="w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center">
                  <CheckIcon className="w-2.5 h-2.5" />
                </span>
              )}
              {isActive && (
                <span className="w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                  {step.number}
                </span>
              )}
              {isFuture && (
                <span className="w-4 h-4 rounded-full border border-gray-300 text-gray-400 flex items-center justify-center text-[10px]">
                  {step.number}
                </span>
              )}
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Stepper ─────────────────────────────────────────────── */
export default function Stepper({ currentStep = 1, onStepClick }) {
  if (currentStep === 1) {
    return <CircleStepper currentStep={currentStep} onStepClick={onStepClick} />;
  }
  return <ProgressBarStepper currentStep={currentStep} onStepClick={onStepClick} />;
}
