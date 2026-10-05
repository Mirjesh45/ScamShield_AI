import React from 'react';
import { Shield, Activity, Search, History, Database, Cpu, Lock, User, LogOut, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserType | null;
  onDemoLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onDemoLogin,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#070B14]/90 backdrop-blur-md border-b border-[#1F2A44]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                ScamShield <span className="text-cyan-400">AI</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono tracking-wider font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Detect. Understand. Stay Safe.</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0D1424]/80 p-1.5 rounded-xl border border-[#1F2A44]">
          <button
            onClick={() => setCurrentTab('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'landing'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1F2A44]/50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'dashboard'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1F2A44]/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('analyze')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'analyze'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1F2A44]/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Analyze
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'history'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1F2A44]/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>
          <button
            onClick={() => setCurrentTab('threats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'threats'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1F2A44]/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Threat Matrix
          </button>
          <button
            onClick={() => setCurrentTab('metrics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'metrics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1F2A44]/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            ML Telemetry
          </button>
          <button
            onClick={() => setCurrentTab('privacy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'privacy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1F2A44]/50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Privacy
          </button>
        </nav>

        {/* Right User Controls */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#0D1424] border border-[#1F2A44] px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
                {currentUser.username[0].toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium text-slate-200 leading-none">{currentUser.username}</p>
                <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">{currentUser.role}</p>
              </div>
              <button
                onClick={onLogout}
                title="Log Out"
                className="ml-2 text-slate-400 hover:text-rose-400 transition-colors p-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onDemoLogin}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all"
            >
              <User className="w-3.5 h-3.5" />
              Sign In (Demo Analyst)
            </button>
          )}

          {/* Quick CTA */}
          <button
            onClick={() => setCurrentTab('analyze')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all"
          >
            <Shield className="w-4 h-4" />
            Analyze Now
          </button>
        </div>
      </div>
    </header>
  );
};
