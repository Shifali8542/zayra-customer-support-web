// src/schema/index.ts
// Single source of truth for all TypeScript types.
// Mirrors backend API response shapes exactly.

export type TicketSeverity = 'critical' | 'urgent' | 'normal' | 'resolved';
export type TicketTag      = 'critical' | 'urgent' | 'device' | 'billing' | 'normal' | 'resolved';
export type FilterTag      = 'all' | TicketTag;
export type TicketStatus   = 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';

export interface ChatMessage {
  id:          number;
  sender:      string;
  text:        string;
  time:        string;
  sent_at:     string;
  mine:        boolean;
  sender_type: 'customer' | 'agent' | 'system';
}

export interface DeviceInfo {
  name:      string;
  firmware:  string;
  battery:   string;
  last_sync: string;
}

export interface Ticket {
  id:            number;
  ticket_number: string;
  title:         string;
  severity:      TicketSeverity;
  status:        TicketStatus;
  category:      string;
  user_name:     string;
  user_plan:     string;
  tags:          TicketTag[];
  time_ago:      string;
  message_count: number;
  assigned_to:   { id: number; name: string } | null;
  created_at:    string;
  description?:  string;
  user_email?:   string;
  member_since?: string;
  clinician?:    string;
  device?:       DeviceInfo | null;
  note?:         string;
  messages?:     ChatMessage[];
  updated_at?:   string;
  resolved_at?:  string;
}

export interface PaginatedResponse<T> {
  count:    number;
  next:     string | null;
  previous: string | null;
  results:  T[];
}

export type AgentStatus = 'online' | 'busy' | 'away' | 'offline';

export interface Agent {
  id:           string;
  name:         string;
  initials:     string;
  avatar_bg:    string;
  avatar_color: string;
  status:       AgentStatus;
  open_cases:   number;
}

export interface DashboardStats {
  open_tickets:         number;
  open_tickets_sub:     string;
  open_tickets_trend:   'up' | 'down' | 'neutral';
  avg_response_minutes: number | null;
  avg_response_sub:     string;
  avg_response_trend:   'up' | 'down' | 'neutral';
  csat_today:           number | null;
  csat_sub:             string;
  csat_trend:           'up' | 'down' | 'neutral';
  agents_online:        number;
  agents_scheduled:     number;
  agents_online_trend:  'up' | 'down' | 'neutral';
}

export interface StatCard {
  label: string;
  value: string;
  sub:   string;
  trend: 'up' | 'down' | 'neutral';
}

export interface CategoryBar {
  label:      string;
  percentage: number;
  color:      string;
  count:      number;
}

export interface AnalyticsSummary {
  range:              string;
  total_tickets:      number;
  resolved:           number;
  resolution_rate:    number;
  avg_first_response: string;
  avg_resolution:     string;
  csat:               number | null;
}

export interface DailyMetric {
  date:            string;
  label:           string;
  total_tickets:   number;
  resolved:        number;
  critical_count:  number;
  escalated_count: number;
}

export interface CsatEntry {
  week:  string;
  score: number;
}

export interface AgentPerformance {
  name:     string;
  tickets:  number;
  avg_resp: string;
  res_rate: number;
  csat:     number;
}

export interface HeatmapData {
  days:  string[];
  hours: string[];
  data:  number[][];
}

export interface LoginCredentials {
  email:    string;
  password: string;
}

export interface SignupCredentials {
  name:            string;
  email:           string;
  password:        string;
  confirmPassword: string;
}

export interface AuthUser {
  id:             string;
  name:           string;
  email:          string;
  role:           'support_agent' | 'support_supervisor' | 'admin' | 'agent' | 'supervisor';
  avatarInitials: string;
  status:         AgentStatus;
}

export interface AuthState {
  user:            AuthUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;
}

export type TabId =
  | 'queue'
  | 'my-cases'
  | 'escalations'
  | 'device-alerts'
  | 'knowledge-base'
  | 'analytics';

export interface NavTab {
  id:    TabId;
  label: string;
}
