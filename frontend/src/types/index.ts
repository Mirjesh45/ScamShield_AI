export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Classification = 'Likely Safe' | 'Suspicious' | 'Likely Scam';
export type InputType = 'message' | 'email' | 'url' | 'image';

export interface Indicator {
  name: string;
  evidence: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
}

export interface AnalysisResult {
  analysis_id: string;
  classification: Classification;
  risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  category: string;
  indicators: Indicator[];
  explanation: string;
  recommendations: string[];
  extracted_urls?: string[];
  extracted_text?: string;
  image_info?: {
    filename: string;
    format: string;
    dimensions: string;
    size_kb: number;
    ocr_engine: string;
  };
  url_details?: {
    hostname: string;
    has_https: boolean;
    entropy: number;
  };
  advisory_disclaimer: string;
}

export interface HistoryItem {
  id: string;
  input_type: InputType;
  input_preview: string;
  classification: Classification;
  risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  category: string;
  indicators: Indicator[];
  explanation: string;
  recommendations: string[];
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  total_analyses: number;
  scams_detected: number;
  suspicious: number;
  safe: number;
  avg_risk_score: number;
  risk_distribution: Record<string, number>;
  categories: { category: string; count: number }[];
  types: { type: string; count: number }[];
}

export interface ThreatItem {
  id: number;
  indicator_type: string;
  value: string;
  risk_level: string;
  category: string;
  description: string;
  source: string;
  detected_at: string;
}

export interface ModelMetrics {
  system_status: string;
  total_registered_users: number;
  total_analyses_logged: number;
  active_models: Record<string, string>;
  model_evaluation: {
    text_model?: {
      accuracy: number;
      precision: number;
      recall: number;
      f1_score: number;
      roc_auc: number;
      confusion_matrix: number[][];
      total_test_samples: number;
    };
    url_model?: {
      accuracy: number;
      precision: number;
      recall: number;
      f1_score: number;
      roc_auc: number;
      confusion_matrix: number[][];
      total_test_samples: number;
    };
    timestamp?: string;
    description?: string;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}
