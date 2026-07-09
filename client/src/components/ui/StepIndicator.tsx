import { ImportStep } from "../../types";

const STEPS: { id: ImportStep; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "preview", label: "Preview" },
  { id: "processing", label: "Processing" },
  { id: "result", label: "Result" },
];

const STEP_ORDER: Record<ImportStep, number> = {
  upload: 0,
  preview: 1,
  processing: 2,
  result: 3,
};

interface StepIndicatorProps {
  currentStep: ImportStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEP_ORDER[currentStep];

  return (
    <nav aria-label="Import progress" className="flex items-center gap-0">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200",
                  isDone
                    ? "bg-accent-600 text-white"
                    : isActive
                    ? "border-2 border-accent-600 bg-accent-50 text-accent-700"
                    : "border border-neutral-300 bg-white text-neutral-400",
                ].join(" ")}
                aria-current={isActive ? "step" : undefined}
              >
                {isDone ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={[
                  "mt-1 hidden text-xs sm:block transition-colors duration-200",
                  isActive ? "font-medium text-accent-700" : "text-neutral-400",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={[
                  "mx-2 h-px w-8 sm:w-16 transition-colors duration-200",
                  isDone ? "bg-accent-600" : "bg-neutral-200",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
