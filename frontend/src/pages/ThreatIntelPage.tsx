import React, { useEffect, useState } from 'react';
import { 
  Database, 
  ShieldAlert, 
  Search, 
  Globe, 
  Terminal, 
  ExternalLink, 
  AlertTriangle, 
  RefreshCw,
  Tag,
  Key
} from 'lucide-react';
import { api } from '../api/client';
import { ThreatItem } from '../types';

export const ThreatIntelPage: React.FC = () => {
  const [threats, setThreats] = useState<ThreatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchThreats = async () => {
    setLoading(true);
    try {
      const res = await api.getThreatIntel();
      setThreats(res.threats);
    } catch (err) {
      console.error('Failed to load threat intel', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, []);

  const filtered = threats.filter(item => {
    const matchesSearch = 
      item.value.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || item.indicator_type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
            <Database className="w-3.5 h-3.5" />
            <span>Threat Intelligence Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Global Threat Matrix & Signatures
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Active indicators, malicious domains, and fraudulent payment lures monitored by ScamShield
          </p>
        </div>

        <button
          onClick={fetchThreats}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D1424] hover:bg-[#131D33] border border-[#1F2A44] text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          Sync Feeds
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
            <Globe className="w-4 h-4" />
            <span>DOMAIN / URL SIGNATURES</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {threats.filter(t => t.indicator_type === 'domain' || t.indicator_type === 'url').length} Active
          </p>
          <p className="text-xs text-slate-400">Targeting banking, logistics, and telecom</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
            <Tag className="w-4 h-4" />
            <span>SUSPICIOUS PATTERNS</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {threats.filter(t => t.indicator_type === 'keyword' || t.indicator_type === 'pattern').length} Heuristics
          </p>
          <p className="text-xs text-slate-400">High-correlation social engineering phrases</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
            <Terminal className="w-4 h-4" />
            <span>EXTENSIBILITY STATUS</span>
          </div>
          <p className="text-sm font-bold text-slate-200">
            Modular Threat Pipeline
          </p>
          <p className="text-xs text-slate-400">VirusTotal & STIX/TAXII connector interface ready</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#1F2A44] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search indicator, category, keyword..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B14] border border-[#1F2A44] focus:border-cyan-400 text-xs text-slate-100 placeholder:text-slate-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#070B14] border border-[#1F2A44] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-mono"
          >
            <option value="all">All Signatures</option>
            <option value="domain">Suspicious Domain</option>
            <option value="url">Malicious URL</option>
            <option value="keyword">Common Scam Keyword</option>
          </select>
        </div>
      </div>

      {/* Threat Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-slate-400 font-mono text-xs">
            Loading threat intelligence database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-500 font-mono text-xs">
            No threat items matching your search.
          </div>
        ) : (
          filtered.map((threat) => (
            <div
              key={threat.id}
              className="p-5 rounded-2xl bg-[#0D1424] border border-[#1F2A44] hover:border-cyan-500/30 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#070B14] text-cyan-300 border border-[#1F2A44]">
                    {threat.indicator_type}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    threat.risk_level === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {threat.risk_level}
                  </span>
                </div>

                <div className="font-mono text-xs font-bold text-white break-all bg-[#070B14] p-2.5 rounded-lg border border-[#1F2A44]">
                  {threat.value}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {threat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1F2A44] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-cyan-400">{threat.category}</span>
                <span>{threat.source}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
