import { 
  AnalysisResult, 
  HistoryItem, 
  DashboardStats, 
  ThreatItem, 
  ModelMetrics, 
  User 
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('scamshield_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.detail || 'Analysis request failed. Please check your input.');
    }
    return data as T;
  } catch (err: any) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to ScamShield AI detection engine. Please ensure the backend is running.');
    }
    throw err;
  }
}

export const api = {
  // Detection Endpoints
  analyzeMessage: (content: string, save_to_history: boolean = true) =>
    request<AnalysisResult>('/analyze/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, save_to_history }),
    }),

  analyzeEmail: (sender: string, subject: string, body: string, save_to_history: boolean = true) =>
    request<AnalysisResult>('/analyze/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, subject, body, save_to_history }),
    }),

  analyzeUrl: (url: string, save_to_history: boolean = true) =>
    request<AnalysisResult>('/analyze/url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, save_to_history }),
    }),

  analyzeImage: (file: File, save_to_history: boolean = true) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('save_to_history', String(save_to_history));
    return request<AnalysisResult>('/analyze/image', {
      method: 'POST',
      body: formData,
    });
  },

  // History Endpoints
  getHistory: (params: { search?: string; type?: string; risk_level?: string; limit?: number; offset?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.risk_level && params.risk_level !== 'all') query.append('risk_level', params.risk_level);
    if (params.limit) query.append('limit', String(params.limit));
    if (params.offset) query.append('offset', String(params.offset));
    return request<{ total: number; limit: number; offset: number; items: HistoryItem[] }>(`/history?${query.toString()}`);
  },

  deleteHistoryItem: (id: string) =>
    request<{ status: string; message: string }>(`/history/${id}`, { method: 'DELETE' }),

  clearHistory: () =>
    request<{ status: string; message: string }>('/history', { method: 'DELETE' }),

  // Stats, Threat Intel & Reports
  getStats: () => request<DashboardStats>('/stats'),
  getThreatIntel: () => request<{ total_threats: number; threats: ThreatItem[]; status: string }>('/threat-intel'),
  getAdminMetrics: () => request<ModelMetrics>('/admin/metrics'),
  getReport: (id: string) => request<any>(`/report/${id}`),

  // Auth Endpoints
  demoLogin: () =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/demo', {
      method: 'POST',
    }),

  login: (username_or_email: string, password: string) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username_or_email, password }),
    }),

  register: (username: string, email: string, password: string) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    }),

  getMe: () => request<{ user: User }>('/auth/me'),
};
