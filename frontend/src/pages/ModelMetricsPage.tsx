import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  BarChart, 
  Activity, 
  Server, 
  ShieldAlert, 
  Target, 
  Zap, 
  Layers,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { ModelMetrics } from '../types';

export const ModelMetricsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const textMetrics = metrics?.model_evaluation?.text_model;
  const urlMetrics = metrics?.model_evaluation?.url_model;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
            <Cpu className="w-3.5 h-3.5" />
            <span>ML Evaluation & Governance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Machine Learning Evaluation Suite
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Ground-truth validation metrics on isolated test splits with false negative minimization
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D1424] hover:bg-[#131D33] border border-[#1F2A44] text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ENGINE HEALTH</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            {metrics?.system_status || 'Checking microservices...'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>AUDIT RECORDS ANALYZED</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-400">
            {metrics ? metrics.total_analyses_logged : '--'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TRAINED PIPELINES</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-sm font-bold text-slate-200">
            NLP + Random Forest + Heuristic Engine
          </p>
        </div>
      </div>

      {/* Model 1: NLP Text Classifier */}
      <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1F2A44] pb-4">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Pipeline #1</span>
            <h3 className="text-lg font-bold text-white">NLP Text & Phishing Message Classifier</h3>
            <p className="text-xs text-slate-400 font-mono">
              TF-IDF (1-2 ngrams, sublinear) + Calibrated Logistic Regression (Balanced)
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
            Test Samples: {textMetrics?.total_test_samples || 168}
          </span>
        </div>

        {textMetrics ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Accuracy</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {(textMetrics.accuracy * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Precision</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {(textMetrics.precision * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Recall (FN Guard)</span>
              <span className="text-2xl font-bold font-mono text-teal-400">
                {(textMetrics.recall * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">F1-Score</span>
              <span className="text-2xl font-bold font-mono text-blue-400">
                {(textMetrics.f1_score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">ROC-AUC</span>
              <span className="text-2xl font-bold font-mono text-purple-400">
                {(textMetrics.roc_auc * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-mono">Loading NLP model metrics...</p>
        )}

        {/* Text Confusion Matrix */}
        {textMetrics?.confusion_matrix && (
          <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] space-y-2">
            <span className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
              Confusion Matrix (Test Split)
            </span>
            <div className="grid grid-cols-2 gap-2 max-w-sm text-xs font-mono text-center">
              <div className="p-2.5 rounded bg-[#0D1424] border border-[#1F2A44]">
                <span className="text-slate-400 text-[10px] block">True Negatives</span>
                <span className="font-bold text-emerald-400 text-base">{textMetrics.confusion_matrix[0][0]}</span>
              </div>
              <div className="p-2.5 rounded bg-[#0D1424] border border-[#1F2A44]">
                <span className="text-slate-400 text-[10px] block">False Positives</span>
                <span className="font-bold text-slate-300 text-base">{textMetrics.confusion_matrix[0][1]}</span>
              </div>
              <div className="p-2.5 rounded bg-[#0D1424] border border-[#1F2A44]">
                <span className="text-slate-400 text-[10px] block">False Negatives (Critical)</span>
                <span className="font-bold text-rose-400 text-base">{textMetrics.confusion_matrix[1][0]}</span>
              </div>
              <div className="p-2.5 rounded bg-[#0D1424] border border-[#1F2A44]">
                <span className="text-slate-400 text-[10px] block">True Positives</span>
                <span className="font-bold text-cyan-400 text-base">{textMetrics.confusion_matrix[1][1]}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model 2: Random Forest URL Classifier */}
      <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1F2A44] pb-4">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Pipeline #2</span>
            <h3 className="text-lg font-bold text-white">Random Forest URL & Malicious Domain Engine</h3>
            <p className="text-xs text-slate-400 font-mono">
              Ensemble of 120 Decision Trees over 11 Syntactic & Structural Entropy Features
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
            Test Samples: {urlMetrics?.total_test_samples || 111}
          </span>
        </div>

        {urlMetrics ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Accuracy</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {(urlMetrics.accuracy * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Precision</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {(urlMetrics.precision * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Recall (FN Guard)</span>
              <span className="text-2xl font-bold font-mono text-teal-400">
                {(urlMetrics.recall * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">F1-Score</span>
              <span className="text-2xl font-bold font-mono text-blue-400">
                {(urlMetrics.f1_score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">ROC-AUC</span>
              <span className="text-2xl font-bold font-mono text-purple-400">
                {(urlMetrics.roc_auc * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-mono">Loading URL model metrics...</p>
        )}

        {/* URL Confusion Matrix */}
        {urlMetrics?.confusion_matrix && (
          <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] space-y-2">
            <span className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
              URL Classifier Confusion Matrix (Test Split)
            </span>
            <div className="grid grid-cols-2 gap-2 max-w-sm text-xs font-mono text-center">
              <div className="p-2.5 rounded bg-[#0D1424] border border-[#1F2A44]">
                <span className="text-slate-400 text-[10px] block">True Negatives</span>
                <span className="font-bold text-emerald-400 text-base">{urlMetrics.confusion_matrix[0][0]}</span>
              </div>
              <div className="p-2.5 rounded bg-[#0D1424] border border-[#1F2A44]">
                <span className="text-slate-400 text-[10px] block">False Positives</span>
                <span className="font-bold text-slate-300 text-base">{urlMetrics.confusion_matrix[0][1]}</span>
              </div>
              <div className="p-2.5 rounded bg-[#0D1424] border border-[#1F2A44]">
                <span className="text-slate-400 text-[10px] block">False Negatives (Critical)</span>
                <span className="font-bold text-rose-400 text-base">{urlMetrics.confusion_matrix[1][0]}</span>
              </div>
              <div className="p-2.5 rounded bg-[#0D1424] border border-[#1F2A44]">
                <span className="text-slate-400 text-[10px] block">True Positives</span>
                <span className="font-bold text-cyan-400 text-base">{urlMetrics.confusion_matrix[1][1]}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
