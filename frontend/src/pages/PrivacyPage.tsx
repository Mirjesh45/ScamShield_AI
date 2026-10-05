import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  EyeOff, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  Terminal,
  FileText
} from 'lucide-react';
import { api } from '../api/client';

export const PrivacyPage: React.FC = () => {
  const [testText, setTestText] = useState(
    "Hi, verify card 4111 2222 3333 4444 or call +91 98765 43210. My PAN is ABCDE1234F and UPI is testuser@okaxis."
  );
  const [sanitizedPreview, setSanitizedPreview] = useState<string>('');

  const simulateSanitization = (input: string) => {
    let res = input;
    res = res.replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[REDACTED_CARD_NUMBER]');
    res = res.replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[REDACTED_EMAIL]');
    res = res.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]');
    res = res.replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '[REDACTED_AADHAAR]');
    res = res.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, '[REDACTED_PAN]');
    res = res.replace(/\b[a-zA-Z0-9.\-_]{2,256}@(okaxis|okhdfcbank|okicici|oksbi|ybl|ibl|paytm|axl|apl)\b/g, '[REDACTED_UPI_ID]');
    return res;
  };

  const handleTestRedact = () => {
    setSanitizedPreview(simulateSanitization(testText));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <Lock className="w-3.5 h-3.5" />
          <span>Zero-Knowledge Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-1">
          Privacy & Data Protection Principles
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          "Your submitted content is analyzed securely and is not shared publicly."
        </p>
      </div>

      {/* Core Privacy Assurances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">No Public Exposure</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Content submitted for inspection is never added to public search indexes, shared with commercial brokers, or made accessible to third parties.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Automated PII Masking</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Before any record is persisted to the local audit table, credit card numbers, phone numbers, PAN cards, Aadhaar IDs, and UPI handles are scrubbed.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Ephemeral Analysis Controls</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            You can uncheck "Store in analysis history" to analyze in pure RAM without creating any persistent record, or wipe your audit log at any time with 1 click.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Backend Isolation</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            API keys and detection weights remain safely encapsulated within the backend server. No sensitive secrets or credentials are exposed in client-side code.
          </p>
        </div>
      </div>

      {/* Interactive PII Sanitizer Demo Playground */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Interactive PII Sanitizer Playground
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Test how ScamShield AI strips sensitive financial credentials in real-time before storage:
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-mono text-slate-400 block">Sample Text with Sensitive PII:</label>
          <textarea
            rows={3}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#070B14] border border-[#1F2A44] text-xs text-slate-200 font-mono"
          />

          <button
            onClick={handleTestRedact}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Test Redaction Engine
          </button>
        </div>

        {sanitizedPreview && (
          <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold">
              Redacted Output (Safe for Audit Storage):
            </span>
            <p className="text-xs font-mono text-slate-200 bg-[#0D1424] p-3 rounded-lg border border-[#1F2A44]">
              {sanitizedPreview}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
