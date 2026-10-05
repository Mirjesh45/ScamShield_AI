import React from 'react';
import { 
  Shield, 
  ArrowRight, 
  Search, 
  Mail, 
  Link2, 
  Image as ImageIcon, 
  Cpu, 
  Lock, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  ChevronRight,
  Database,
  Terminal,
  FileText
} from 'lucide-react';

interface LandingPageProps {
  onAnalyzeNow: () => void;
  onSelectTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAnalyzeNow, onSelectTab }) => {
  return (
    <div className="space-y-24 py-8">
      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-center lg:text-left">
        {/* Ambient cyber glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* Status chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Next-Gen Cybersecurity Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Detect Scams <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
                Before They Detect You.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
              AI-powered protection against phishing, fraudulent messages, malicious links, and online scams. Transparent, explainable cybersecurity intelligence for modern digital threats.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onAnalyzeNow}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] transition-all"
              >
                <Shield className="w-4 h-4" />
                Analyze Now
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const elem = document.getElementById('how-it-works');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0D1424] hover:bg-[#131D33] border border-[#1F2A44] hover:border-cyan-500/40 text-slate-200 font-medium text-sm transition-all"
              >
                How It Works
              </button>
            </div>

            {/* Supported Modalities Quick Links */}
            <div className="pt-6 border-t border-[#1F2A44]/80 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="text-xs text-slate-400 font-mono">SCAN CAPABILITIES:</span>
              <button onClick={() => onSelectTab('analyze')} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0D1424] border border-[#1F2A44] text-xs text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors">
                <Search className="w-3.5 h-3.5 text-cyan-400" /> Messages
              </button>
              <button onClick={() => onSelectTab('analyze')} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0D1424] border border-[#1F2A44] text-xs text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> Emails
              </button>
              <button onClick={() => onSelectTab('analyze')} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0D1424] border border-[#1F2A44] text-xs text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" /> URLs
              </button>
              <button onClick={() => onSelectTab('analyze')} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0D1424] border border-[#1F2A44] text-xs text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Screenshots
              </button>
            </div>
          </div>

          {/* Interactive Threat Assessment Visual Mockup */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-[#0D1424] to-[#070B14] border border-cyan-500/30 p-6 shadow-[0_0_40px_rgba(0,240,255,0.15)] space-y-4">
              {/* Header Telemetry */}
              <div className="flex items-center justify-between border-b border-[#1F2A44] pb-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Terminal className="w-4 h-4" />
                  <span>SCAMSHIELD-TELEMETRY</span>
                </div>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE
                </span>
              </div>

              {/* Sample Analysis Preview Card */}
              <div className="p-4 rounded-xl bg-[#070B14] border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    CRITICAL RISK
                  </span>
                  <span className="text-xs font-mono text-cyan-400">Score: 92/100</span>
                </div>
                <p className="text-xs text-slate-300 font-mono italic">
                  "Dear customer, your bank account is suspended due to pending KYC. Update at sbi-kyc-portal.secure-net.cc immediately..."
                </p>
                <div className="space-y-1.5 pt-2 border-t border-[#1F2A44] text-[11px]">
                  <div className="flex items-center gap-2 text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Artificial Urgency ("immediately")</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Domain Spoofing ("sbi-kyc-portal.secure-net.cc")</span>
                  </div>
                </div>
              </div>

              {/* Trust Metric Counters */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                <div className="p-3 rounded-lg bg-[#070B14] border border-[#1F2A44]">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Inference Speed</span>
                  <span className="text-lg font-bold font-mono text-cyan-400">&lt; 350 ms</span>
                </div>
                <div className="p-3 rounded-lg bg-[#070B14] border border-[#1F2A44]">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Scam Categories</span>
                  <span className="text-lg font-bold font-mono text-slate-200">15+ Vectors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST INDICATORS (Strictly adhering to Section 3: Do not claim certifications or fake accuracy) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] hover:border-cyan-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">AI-Powered Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Combines TF-IDF natural language processing, Random Forest URL classifiers, and heuristic feature extraction.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] hover:border-cyan-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Real-Time Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant multi-stage scanning of messages, emails, domain syntax, and uploaded screenshot imagery.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] hover:border-cyan-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Privacy-Focused</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic PII redaction of card numbers, phone numbers, and IDs. Submissions are never shared publicly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] hover:border-cyan-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Explainable Results</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No black-box predictions. Every assessment clearly exposes detected indicators, severity levels, and grounded quotes.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Section 2 Main User Flow) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
            System Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-white">How ScamShield AI Analyzes Threats</h2>
          <p className="text-sm text-slate-400">
            From raw input submission to explainable forensic breakdown in 5 transparent stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Submit Input', desc: 'Paste suspicious text, email body, URL, or upload a screenshot.' },
            { step: '02', title: 'Feature Extraction', desc: 'OCR text recognition, URL entropy calculation, token parsing.' },
            { step: '03', title: 'AI Classification', desc: 'TF-IDF NLP + Random Forest models evaluate scam probabilities.' },
            { step: '04', title: 'Risk Scoring', desc: 'Calibrated 0-100 risk score with standardized severity tiers.' },
            { step: '05', title: 'Explainable AI', desc: 'Transparent breakdown of why it was flagged & safety actions.' },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#0D1424] border border-[#1F2A44] relative space-y-2">
              <span className="text-2xl font-extrabold font-mono text-cyan-400/40">{item.step}</span>
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. COVERED SCAM CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-white">Defends Against 15+ Scam Categories</h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Our detection engine flags nuanced threat patterns across specialized categories rather than providing generic warnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
          {[
            'Banking Scam', 'UPI Scam', 'OTP Scam', 'KYC Scam', 'Job Scam',
            'Investment Scam', 'Loan Scam', 'Lottery Scam', 'Prize Scam', 'Delivery Scam',
            'Government Impersonation', 'Tech Support Scam', 'Social Media Scam', 'Crypto Scam', 'Phishing'
          ].map((cat, i) => (
            <div key={i} className="px-3.5 py-2 rounded-xl bg-[#0D1424] border border-[#1F2A44] text-xs font-mono text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-all flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#0D1424] to-blue-950/40 border border-cyan-500/40 p-8 sm:p-12 text-center space-y-6 shadow-[0_0_40px_rgba(0,240,255,0.15)]">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Have a Suspicious Message or Link?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Test any SMS, email, suspicious payment request, or delivery notification right now with ScamShield AI.
          </p>
          <button
            onClick={onAnalyzeNow}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all"
          >
            Launch Detection Panel
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
