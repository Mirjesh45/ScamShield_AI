import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  inputType: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ inputType }) => {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    'Extracting features & semantic tokens',
    'Checking suspicious domain patterns & threat database',
    'Analyzing language heuristics & structural entropy',
    'Calculating calibrated risk score',
    'Generating forensic explanation & safety plan',
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStage(1), 350);
    const timer2 = setTimeout(() => setActiveStage(2), 700);
    const timer3 = setTimeout(() => setActiveStage(3), 1100);
    const timer4 = setTimeout(() => setActiveStage(4), 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="p-8 rounded-2xl bg-[#0D1424] border border-cyan-500/30 max-w-xl mx-auto shadow-[0_0_30px_rgba(0,240,255,0.1)]">
      <div className="flex items-center gap-3 mb-6">
        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        <div>
          <h3 className="text-base font-semibold text-white">Analyzing {inputType}...</h3>
          <p className="text-xs text-slate-400 font-mono">Running multi-vector threat inspection</p>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {stages.map((stage, idx) => {
          const isDone = activeStage > idx;
          const isCurrent = activeStage === idx;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 transition-colors ${
                isDone
                  ? 'text-cyan-300'
                  : isCurrent
                  ? 'text-white font-medium'
                  : 'text-slate-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-700 shrink-0" />
              )}
              <span>{stage}</span>
            </div>
          );
        })}
      </div>

      {/* Cyber indeterminate scanner bar */}
      <div className="mt-6 h-1 w-full bg-[#1F2A44] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-1/2 animate-[shimmer_1.5s_infinite_linear] rounded-full" />
      </div>
    </div>
  );
};
