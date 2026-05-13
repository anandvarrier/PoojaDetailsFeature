import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Browse", sublabel: "Find a Puja" },
  { id: 2, label: "Details", sublabel: "Select Package" },
  { id: 3, label: "Schedule & Pay", sublabel: "Date, Details & Payment" },
];

interface Props {
  currentStep: number;
}

export function BookingProgress({ currentStep }: Props) {
  return (
    <div className="bg-white border-b py-3 px-4" style={{ borderColor: "#FBCFB8" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((step, idx) => {
            const isDone = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step circle + label */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all"
                    style={{
                      backgroundColor: isDone ? "#E77237" : isActive ? "#FFF0E9" : "#F9FAFB",
                      borderColor: isDone || isActive ? "#E77237" : "#D1D5DB",
                      color: isDone ? "#fff" : isActive ? "#E77237" : "#9CA3AF",
                    }}
                  >
                    {isDone ? <Check size={14} /> : step.id}
                  </div>
                  <div className="mt-1 text-center hidden sm:block">
                    <p
                      className="text-xs font-medium"
                      style={{ color: isActive ? "#E77237" : isDone ? "#6B7280" : "#9CA3AF" }}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>{step.sublabel}</p>
                  </div>
                  <p
                    className="mt-1 text-xs font-medium sm:hidden"
                    style={{ color: isActive ? "#E77237" : "#9CA3AF" }}
                  >
                    {step.label}
                  </p>
                </div>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className="h-0.5 w-16 sm:w-28 md:w-40 mx-1 transition-all"
                    style={{ backgroundColor: step.id < currentStep ? "#E77237" : "#E5E7EB" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}