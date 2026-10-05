import React, { useEffect, useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Eye, 
  Download, 
  Filter, 
  RefreshCw, 
  AlertTriangle,
  FileText,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../api/client';
import { HistoryItem, AnalysisResult } from '../types';
import { ReportModal } from '../components/ReportModal';

export const HistoryPage: React.FC = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [totalCount, setTotalCount] = useState(0);

  // Selected item for modal
  const [viewItem, setViewItem] = useState<AnalysisResult | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory({
        search: searchTerm,
        type: selectedType,
        risk_level: selectedRisk,
      });
      setItems(res.items);
      setTotalCount(res.total);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedType, selectedRisk]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete analysis record #${id}?`)) return;
    try {
      await api.deleteHistoryItem(id);
      setItems(items.filter(item => item.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to permanently clear your analysis audit history?')) return;
    try {
      await api.clearHistory();
      setItems([]);
      setTotalCount(0);
    } catch (err) {
      alert('Failed to clear history.');
    }
  };

  const openInspection = (item: HistoryItem) => {
    const converted: AnalysisResult = {
      analysis_id: item.id,
      classification: item.classification,
      risk_score: item.risk_score,
      risk_level: item.risk_level,
      confidence: item.confidence,
      category: item.category,
      indicators: item.indicators,
      explanation: item.explanation,
      recommendations: item.recommendations,
      advisory_disclaimer: 'AI predictions are advisory and should not be treated as absolute proof.',
    };
    setViewItem(converted);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Analysis History & Logs
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {totalCount} total forensic evaluations logged with sanitized privacy redaction
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D1424] hover:bg-[#131D33] border border-[#1F2A44] text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-mono text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Audit Log
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#1F2A44] flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search preview, category, explanation..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B14] border border-[#1F2A44] focus:border-cyan-400 text-xs text-slate-100 placeholder:text-slate-500 font-mono"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#070B14] border border-[#1F2A44] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-mono"
            >
              <option value="all">All Types</option>
              <option value="message">Message</option>
              <option value="email">Email</option>
              <option value="url">URL</option>
              <option value="image">Screenshot</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-[#070B14] border border-[#1F2A44] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-mono"
            >
              <option value="all">All Risk Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl bg-[#0D1424] border border-[#1F2A44] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070B14] border-b border-[#1F2A44] text-slate-400 font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Date / Time</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Input Preview (Sanitized)</th>
                <th className="py-3.5 px-4">Result</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2A44]/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                    Loading analysis history...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    No matching analysis records found in audit log.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#131D33]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {item.created_at}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono uppercase text-[10px] bg-[#070B14] text-cyan-300 border border-[#1F2A44]">
                        {item.input_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-200 font-mono text-[11px]">
                      {item.input_preview}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-200">
                      {item.classification}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{item.risk_score}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getRiskBadge(item.risk_level)}`}>
                          {item.risk_level}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => openInspection(item)}
                        className="p-1.5 rounded-lg bg-[#070B14] hover:bg-[#1F2A44] text-cyan-400 hover:text-cyan-300 transition-colors"
                        title="View Detailed Incident Report"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-[#070B14] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal view if an item was clicked */}
      {viewItem && (
        <ReportModal result={viewItem} onClose={() => setViewItem(null)} />
      )}
    </div>
  );
};
