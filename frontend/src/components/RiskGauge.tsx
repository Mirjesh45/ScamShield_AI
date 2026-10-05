import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Shield } from 'lucide-react';
import { RiskLevel, Classification } from '../types';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  classification: Classification;
  confidence: number;
  category: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  level,
  classification,
  confidence,
  category,
}) => {
  // SVG circular gauge math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (score / 100) * circumference;

  const getColorConfig = () => {
    switch (level) {
      case 'CRITICAL':
        return {
          stroke: '#F43F5E',
          glow: 'rgba(244, 63, 94, 0.4)',
          bgBadge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          cardBorder: 'border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)]',
          icon: <ShieldAlert className="w-8 h-8 text-rose-400" />,
        };
      case 'HIGH':
        return {
          stroke: '#FB7185',
          glow: 'rgba(251, 113, 133, 0.35)',
          bgBadge: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
          cardBorder: 'border-rose-500/40 shadow-[0_0_25px_rgba(251,113,133,0.15)]',
          icon: <AlertTriangle className="w-8 h-8 text-rose-400" />,
        };
      case 'MEDIUM':
        return {
          stroke: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.35)',
          bgBadge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          cardBorder: 'border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]',
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
        };
      case 'LOW':
      default:
        return {
          stroke: '#10B981',
          glow: 'rgba(16, 185, 129, 0.35)',
          bgBadge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          cardBorder: 'border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
        };
    }
  };

  const config = getColorConfig();

  return (
    <div className={`rounded-2xl p-6 bg-[#0D1424]/90 border ${config.cardBorder} transition-all`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Gauge & Score */}
        <div className="flex items-center gap-6">
          <div className="relative flex items-center justify-center">
            <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-[#1F2A44]"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress Bar */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={config.stroke}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: 'stroke-dashoffset 1s ease-in-out',
                  filter: `drop-shadow(0 0 8px ${config.glow})`,
                }}
              />
            </svg>

            {/* Inner Center Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {score}
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          {/* Classification & Tier Title */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${config.bgBadge}`}>
                {level} RISK
              </span>
              <span className="text-xs font-mono text-slate-400">
                Confidence: <strong className="text-slate-200">{Math.round(confidence * 100)}%</strong>
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
              {classification}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="text-slate-400">Threat Category:</span>
              <span className="font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                {category}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Security Status Summary */}
        <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-[#1F2A44] pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-slate-400 font-mono">ASSESSMENT STATUS</p>
              <p className="text-sm font-bold text-slate-200">
                {classification === 'Likely Safe' ? 'Threats Mitigated' : 'Action Recommended'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#131D33] border border-[#1F2A44]">
              {config.icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
