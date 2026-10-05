import React from 'react';
import { X, Download, Printer, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ReportModalProps {
  result: AnalysisResult;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ result, onClose }) => {
  const downloadJSON = () => {
    const reportData = {
      header: 'ScamShield AI Incident Assessment Report',
      id: result.analysis_id,
      generated_at: new Date().toISOString(),
      classification: result.classification,
      risk_score: `${result.risk_score}/100`,
      risk_level: result.risk_level,
      confidence: `${Math.round(result.confidence * 100)}%`,
      category: result.category,
      indicators: result.indicators,
      explanation: result.explanation,
      recommendations: result.recommendations,
      advisory_disclaimer: result.advisory_disclaimer,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScamShield_Report_${result.analysis_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0D1424] border border-[#1F2A44] rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1F2A44] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#1F2A44] pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-sans">
              ScamShield AI Incident Report
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              ID: {result.analysis_id} • Generated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#070B14] p-4 rounded-xl border border-[#1F2A44]">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Classification</span>
            <span className="text-sm font-bold text-white">{result.classification}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Risk Score</span>
            <span className="text-sm font-bold font-mono text-cyan-400">{result.risk_score} / 100</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Risk Level</span>
            <span className="text-sm font-bold text-rose-400">{result.risk_level}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Confidence</span>
            <span className="text-sm font-bold font-mono text-slate-200">{Math.round(result.confidence * 100)}%</span>
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Forensic Rationale
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#070B14] p-3 rounded-lg border border-[#1F2A44]">
            {result.explanation}
          </p>
        </div>

        {/* Detected Indicators */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Identified Threat Indicators ({result.indicators.length})
          </h4>
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {result.indicators.map((ind, i) => (
              <div key={i} className="text-xs p-2.5 rounded bg-[#070B14] border border-[#1F2A44] flex items-start justify-between gap-3">
                <div>
                  <span className="font-semibold text-slate-200">{ind.name}</span>
                  {ind.evidence && <span className="block font-mono text-[11px] text-cyan-300 mt-0.5">{ind.evidence}</span>}
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30 shrink-0">
                  {ind.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Recommended Defensive Measures
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300/90 font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{result.advisory_disclaimer}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1F2A44]">
          <button
            onClick={downloadJSON}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-[#1F2A44] text-slate-200 hover:bg-[#2D3E64] transition-colors"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            <Printer className="w-4 h-4" />
            Print / Save Report
          </button>
        </div>
      </div>
    </div>
  );
};
