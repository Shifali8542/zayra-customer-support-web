// ─── Ticket ───────────────────────────────────────────────────────────────────
export type TicketSeverity = 'critical' | 'urgent' | 'normal' | 'resolved';
export type TicketTag = 'critical' | 'urgent' | 'device' | 'billing' | 'normal' | 'resolved';
export type FilterTag = 'all' | TicketTag;

export interface ChatMessage {
  from: string;
  text: string;
  time: string;
  mine: boolean;
}

export interface DeviceInfo {
  name: string;
  firmware: string;
  battery: string;
  lastSync: string;
}

export interface Ticket {
  id: string;
  title: string;
  severity: TicketSeverity;
  user: string;
  plan: string;
  timeAgo: string;
  tags: TicketTag[];
  device?: DeviceInfo;
  note?: string;
  messages: ChatMessage[];
  memberSince?: string;
  clinician?: string;
}

// ─── Agent ────────────────────────────────────────────────────────────────────
export type AgentStatus = 'online' | 'busy' | 'away' | 'offline';

export interface Agent {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  status: AgentStatus;
  openCases: number;
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export interface StatCard {
  label: string;
  value: string;
  sub: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface CategoryBar {
  label: string;
  percentage: number;
  color: string;
  count: number;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface DailyMetric {
  day: string;
  tickets: number;
  resolved: number;
}

export interface CsatEntry {
  date: string;
  score: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'agent' | 'supervisor' | 'admin';
  avatarInitials: string;
  status: AgentStatus;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type TabId =
  | 'queue'
  | 'my-cases'
  | 'escalations'
  | 'device-alerts'
  | 'knowledge-base'
  | 'analytics';

export interface NavTab {
  id: TabId;
  label: string;
}
