import React from 'react';
import { Shield, AlertTriangle, Lock, Eye, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1F2A44] bg-[#04070D] mt-20 text-slate-400">
      {/* Advisory Banner */}
      <div className="border-b border-[#1F2A44]/60 bg-[#070B14]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-xs text-amber-300/90 font-mono text-center">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>ADVISORY NOTICE:</strong> ScamShield AI predictions are advisory assessments and should not be treated as absolute legal proof. Always verify critical requests via official channels.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">ScamShield AI</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Autonomous cybersecurity platform providing real-time, explainable scam detection across messages, emails, URLs, and screenshots. Built with calibrated NLP pipelines, Random Forest threat matrices, and heuristic feature extractors.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Threat Feed Active
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Lock className="w-3.5 h-3.5" />
                Zero Public Sharing
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3">
              Capabilities
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-cyan-400 transition-colors">SMS & Message NLP Engine</li>
              <li className="hover:text-cyan-400 transition-colors">Domain Entropy & Punycode Scanner</li>
              <li className="hover:text-cyan-400 transition-colors">Phishing Email Spoofing Detector</li>
              <li className="hover:text-cyan-400 transition-colors">Screenshot OCR Extraction</li>
              <li className="hover:text-cyan-400 transition-colors">Explainable AI Indicator Breakdown</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3">
              Privacy & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-cyan-400 transition-colors">Automatic PII Redaction Engine</li>
              <li className="hover:text-cyan-400 transition-colors">Local Ephemeral Processing Option</li>
              <li className="hover:text-cyan-400 transition-colors">Explainable Forensic Evidence</li>
              <li className="hover:text-cyan-400 transition-colors">No Telemetry Sharing to 3rd Parties</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1F2A44] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} ScamShield AI. Detect. Understand. Stay Safe.</p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>ENGINE: SCAMSHIELD-V1</span>
            <span>STATUS: NOMINAL</span>
            <span>API: 127.0.0.1:8000</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
