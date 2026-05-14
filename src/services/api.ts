import axios, { AxiosInstance, AxiosError } from 'axios';
import type { LoginCredentials, SignupCredentials, Ticket, Agent } from '../schema';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_API_URL ?? 'https://api.zayra.health/v1';

const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('zayra-token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
http.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('zayra-token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Error Normaliser ─────────────────────────────────────────────────────────
function normaliseError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: string })?.message ?? err.message;
    throw new Error(msg);
  }
  throw err;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login:  (creds: LoginCredentials)  => http.post('/auth/login',  creds).then(r => r.data).catch(normaliseError),
  signup: (creds: SignupCredentials) => http.post('/auth/signup', creds).then(r => r.data).catch(normaliseError),
  logout: ()                         => http.post('/auth/logout').then(r => r.data).catch(normaliseError),
};

// ─── Tickets API ──────────────────────────────────────────────────────────────
export const ticketApi = {
  getAll:       (): Promise<Ticket[]>  => http.get('/tickets').then(r => r.data).catch(normaliseError),
  getById:      (id: string)           => http.get(`/tickets/${id}`).then(r => r.data).catch(normaliseError),
  reply:        (id: string, msg: string) => http.post(`/tickets/${id}/reply`, { message: msg }).then(r => r.data).catch(normaliseError),
  updateStatus: (id: string, status: string) => http.patch(`/tickets/${id}/status`, { status }).then(r => r.data).catch(normaliseError),
};

// ─── Agents API ───────────────────────────────────────────────────────────────
export const agentApi = {
  getAll: (): Promise<Agent[]> => http.get('/agents').then(r => r.data).catch(normaliseError),
};

export default http;
