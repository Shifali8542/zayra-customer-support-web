import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  LoginCredentials, SignupCredentials,
  Ticket, Agent, DashboardStats, CategoryBar,
  AnalyticsSummary, DailyMetric, CsatEntry,
  AgentPerformance, HeatmapData, PaginatedResponse, ChatMessage, LiveMetrics, KBArticle, KBListResponse,
} from '../schema';

// Axios Instance

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://192.168.1.172:8000';

const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — attach JWT ────────────────────────────────────────

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('zayra-access-token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor — handle 401 ───────────────────────────────────────

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('zayra-access-token');
      localStorage.removeItem('zayra-refresh-token');
      localStorage.removeItem('zayra-user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Error Normaliser ─────────────────────────────────────────────────────────

function normaliseError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, any> | undefined;
    const msg =
      data?.detail ??
      data?.message ??
      data?.non_field_errors?.[0] ??
      Object.values(data ?? {})[0]?.[0] ??
      err.message;
    throw new Error(msg);
  }
  throw err;
}

// ─── Auth API

export const authApi = {
  login: (creds: LoginCredentials) =>
    http.post('/api/v1/auth/login/', creds).then(r => r.data).catch(normaliseError),

  signup: (creds: SignupCredentials) =>
    http.post('/api/v1/auth/register/support-agent/', {
      first_name:       creds.name.split(' ')[0] ?? '',
      last_name:        creds.name.split(' ').slice(1).join(' ') ?? '',
      email:            creds.email,
      password:         creds.password,
      confirm_password: creds.confirmPassword,
    }).then(r => r.data).catch(normaliseError),

  logout: (refreshToken: string) =>
    http.post('/api/v1/auth/logout/', { refresh: refreshToken }).then(r => r.data).catch(normaliseError),

  profile: () =>
    http.get('/api/v1/auth/profile/').then(r => r.data).catch(normaliseError),
};

// ─── Tickets API — /api/v1/support/tickets/ ──────────────────────────────────

export interface TicketListParams {
  status?:      string;
  severity?:    string;
  tag?:         string;
  assigned_to?: string;
  escalated?:   string;
  search?:      string;
  page?:        number;
  page_size?:   number;
}

export const ticketApi = {
  getAll: (params: TicketListParams = {}): Promise<PaginatedResponse<Ticket>> =>
    http.get('/api/v1/support/tickets/', { params }).then(r => r.data).catch(normaliseError),

  getById: (id: number): Promise<Ticket> =>
    http.get(`/api/v1/support/tickets/${id}/`).then(r => r.data).catch(normaliseError),

  create: (data: Partial<Ticket>): Promise<Ticket> =>
    http.post('/api/v1/support/tickets/', data).then(r => r.data).catch(normaliseError),

  updateStatus: (id: number, status: string): Promise<Ticket> =>
    http.patch(`/api/v1/support/tickets/${id}/status/`, { status }).then(r => r.data).catch(normaliseError),

  escalate: (id: number, note?: string): Promise<Ticket> =>
    http.post(`/api/v1/support/tickets/${id}/escalate/`, { note: note ?? '' }).then(r => r.data).catch(normaliseError),

  resolve: (id: number, note?: string): Promise<Ticket> =>
    http.post(`/api/v1/support/tickets/${id}/resolve/`, { note: note ?? '' }).then(r => r.data).catch(normaliseError),

  getMessages: (id: number): Promise<ChatMessage[]> =>
    http.get(`/api/v1/support/tickets/${id}/messages/`).then(r => r.data).catch(normaliseError),

  sendMessage: (id: number, message: string): Promise<ChatMessage> =>
    http.post(`/api/v1/support/tickets/${id}/messages/`, { message }).then(r => r.data).catch(normaliseError),

  assign: (id: number, agentId?: number): Promise<Ticket> =>
    http.post(`/api/v1/support/tickets/${id}/assign/`, agentId ? { agent_id: agentId } : {}).then(r => r.data).catch(normaliseError),

  selfAssign: (id: number): Promise<Ticket> =>
    http.post(`/api/v1/support/tickets/${id}/assign/`, {}).then(r => r.data).catch(normaliseError),

  close: (id: number): Promise<Ticket> =>
    http.post(`/api/v1/support/tickets/${id}/close/`).then(r => r.data).catch(normaliseError),

  submitCsat: (id: number, score: number, comment?: string): Promise<void> =>
    http.post(`/api/v1/support/tickets/${id}/csat/`, { score, comment: comment ?? '' }).then(r => r.data).catch(normaliseError),
};

// Dashboard API
export const dashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    http.get('/api/v1/support/dashboard/stats/').then(r => r.data).catch(normaliseError),

  getCategories: (): Promise<CategoryBar[]> =>
    http.get('/api/v1/support/dashboard/categories/').then(r => r.data).catch(normaliseError),

  getLiveMetrics: (): Promise<LiveMetrics> =>
    http.get('/api/v1/support/dashboard/metrics/live/').then(r => r.data).catch(normaliseError),
};

// Agents API
export const agentApi = {
  getAll: (): Promise<Agent[]> =>
    http.get('/api/v1/support/agents/').then(r => r.data).catch(normaliseError),

  updateMyStatus: (status: string): Promise<Agent> =>
    http.patch('/api/v1/support/agents/me/status/', { status }).then(r => r.data).catch(normaliseError),
};

// ─── Analytics API — /api/v1/support/analytics/ ──────────────────────────────

export type RangeKey = '7d' | '30d' | '90d' | 'custom';

export const analyticsApi = {
  getSummary: (range: RangeKey = '30d'): Promise<AnalyticsSummary> =>
    http.get('/api/v1/support/analytics/summary/', { params: { range } }).then(r => r.data).catch(normaliseError),

  getDaily: (days = 30): Promise<DailyMetric[]> =>
    http.get('/api/v1/support/analytics/daily/', { params: { days } }).then(r => r.data).catch(normaliseError),

  getCsat: (weeks = 8): Promise<CsatEntry[]> =>
    http.get('/api/v1/support/analytics/csat/', { params: { weeks } }).then(r => r.data).catch(normaliseError),

  getAgentPerformance: (days = 30): Promise<AgentPerformance[]> =>
    http.get('/api/v1/support/analytics/agent-performance/', { params: { days } }).then(r => r.data).catch(normaliseError),

  getHeatmap: (): Promise<HeatmapData> =>
    http.get('/api/v1/support/analytics/heatmap/').then(r => r.data).catch(normaliseError),
};

export const kbApi = {
  getArticles: (params?: { category?: string; search?: string }): Promise<KBListResponse> =>
    http.get('/api/v1/support/kb/articles/', { params }).then(r => r.data).catch(normaliseError),

  getArticle: (slug: string): Promise<KBArticle> =>
    http.get(`/api/v1/support/kb/articles/${slug}/`).then(r => r.data).catch(normaliseError),
};

export default http;
