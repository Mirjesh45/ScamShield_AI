import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Database, 
  TrendingUp, 
  RefreshCw, 
  ArrowUpRight,
  PieChart,
  BarChart3,
  Layers,
  FileCheck
} from 'lucide-react';
import { api } from '../api/client';
import { DashboardStats } from '../types';

interface DashboardPageProps {
  onNavigateAnalyze: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateAnalyze }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
            <Activity className="w-3.5 h-3.5" />
            <span>Threat Telemetry Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Security Intelligence Matrix
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Real-time analysis metrics aggregated from active forensic scans
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D1424] hover:bg-[#131D33] border border-[#1F2A44] text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>
          <button
            onClick={onNavigateAnalyze}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            New Analysis
          </button>
        </div>
      </div>

      {/* Primary KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL ANALYSES</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">
            {stats ? stats.total_analyses : '--'}
          </p>
          <p className="text-xs text-slate-400">Scanned multi-modal events</p>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="p-6 rounded-2xl bg-[#0D1424] border border-rose-500/30 space-y-2 relative overflow-hidden shadow-[0_0_20px_rgba(244,63,94,0.05)]">
          <div className="flex items-center justify-between text-xs text-rose-400 font-mono">
            <span>SCAMS DETECTED</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-rose-400">
            {stats ? stats.scams_detected : '--'}
          </p>
          <p className="text-xs text-rose-300/70">Flagged as malicious / deceptive</p>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="p-6 rounded-2xl bg-[#0D1424] border border-amber-500/30 space-y-2 relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.05)]">
          <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
            <span>SUSPICIOUS ITEMS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-amber-400">
            {stats ? stats.suspicious : '--'}
          </p>
          <p className="text-xs text-amber-300/70">Required advisory caution</p>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="p-6 rounded-2xl bg-[#0D1424] border border-emerald-500/30 space-y-2 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.05)]">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
            <span>SAFE / BENIGN</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-emerald-400">
            {stats ? stats.safe : '--'}
          </p>
          <p className="text-xs text-emerald-300/70">Verified normal communications</p>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Risk Score Tier Distribution
              </h3>
              <p className="text-xs text-slate-400 font-mono">Standardized 0-100 severity distribution</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              Avg Score: {stats ? stats.avg_risk_score : '--'}/100
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { level: 'CRITICAL', range: '80–100', color: 'bg-rose-500', text: 'text-rose-400', count: stats?.risk_distribution?.CRITICAL || 0 },
              { level: 'HIGH', range: '60–79', color: 'bg-rose-400', text: 'text-rose-300', count: stats?.risk_distribution?.HIGH || 0 },
              { level: 'MEDIUM', range: '30–59', color: 'bg-amber-400', text: 'text-amber-400', count: stats?.risk_distribution?.MEDIUM || 0 },
              { level: 'LOW', range: '0–29', color: 'bg-emerald-400', text: 'text-emerald-400', count: stats?.risk_distribution?.LOW || 0 },
            ].map((tier, i) => {
              const total = stats ? Math.max(1, stats.total_analyses) : 1;
              const percentage = Math.round((tier.count / total) * 100);

              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`font-semibold ${tier.text}`}>{tier.level} ({tier.range})</span>
                    <span className="text-slate-300">{tier.count} items ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#070B14] rounded-full overflow-hidden border border-[#1F2A44]">
                    <div 
                      className={`h-full ${tier.color} transition-all duration-700 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Threat Categories Breakdown */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400" />
                Detected Threat Categories
              </h3>
              <p className="text-xs text-slate-400 font-mono">Prevalent scam vectors identified</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Top Categories</span>
          </div>

          <div className="space-y-2.5 pt-2">
            {stats && stats.categories.length > 0 ? (
              stats.categories.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#070B14] border border-[#1F2A44] text-xs">
                  <span className="font-medium text-slate-200">{c.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-400">{c.count} flagged</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      Active
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-mono py-6 text-center">No categories recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Modalities & Security Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Scanned Modalities
          </h4>
          <div className="space-y-2">
            {stats && stats.types.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#070B14]">
                <span className="capitalize font-mono text-slate-300">{t.type}</span>
                <span className="font-mono font-bold text-cyan-400">{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-3 md:col-span-2 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono mb-2">
              Privacy & Retention Policy
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ScamShield AI enforces zero permanent un-redacted storage. All submitted messages undergo automated PII redaction (PAN, Aadhaar, Credit Cards, Phone numbers) before persisting to local audit logs. Users maintain complete autonomy to clear audit history at any time.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            PII Redaction Engine Operational • Client Privacy Preserved
          </div>
        </div>
      </div>
    </div>
  );
};
