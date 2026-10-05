import React from 'react';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { Indicator } from '../types';

interface IndicatorCardProps {
  indicator: Indicator;
  index: number;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator, index }) => {
  const getSeverityBadge = () => {
    switch (indicator.severity) {
      case 'CRITICAL':
        return {
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/40',
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
          border: 'border-rose-500/30 hover:border-rose-500/60',
        };
      case 'HIGH':
        return {
          badge: 'bg-rose-500/10 text-rose-300 border-rose-500/40',
          icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
          border: 'border-rose-500/30 hover:border-rose-500/60',
        };
      case 'MEDIUM':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/40',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          border: 'border-amber-500/30 hover:border-amber-500/60',
        };
      case 'LOW':
      default:
        return {
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/40',
          icon: <Info className="w-4 h-4 text-blue-400" />,
          border: 'border-blue-500/30 hover:border-blue-500/60',
        };
    }
  };

  const style = getSeverityBadge();

  return (
    <div className={`p-4 rounded-xl bg-[#0D1424] border ${style.border} transition-all space-y-2.5`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {style.icon}
          <h4 className="text-sm font-semibold text-slate-100">{indicator.name}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${style.badge}`}>
          {indicator.severity}
        </span>
      </div>

      {/* Grounded Evidence Snippet */}
      {indicator.evidence && (
        <div className="bg-[#070B14] p-2.5 rounded-lg border border-[#1F2A44] font-mono text-xs text-cyan-300 break-all">
          <span className="text-slate-400 text-[10px] block font-sans uppercase tracking-wider mb-1">
            Detected Evidence:
          </span>
          {indicator.evidence}
        </div>
      )}

      {/* Forensic Explanation */}
      <p className="text-xs text-slate-300 leading-relaxed">
        {indicator.explanation}
      </p>
    </div>
  );
};
