import type {
  Ticket, Agent, StatCard, CategoryBar,
  DailyMetric, CsatEntry, NavTab, AuthUser,
} from '../schema';

// ─── Current Agent ────────────────────────────────────────────────────────────
export const CURRENT_AGENT: AuthUser = {
  id: 'agent-priya',
  name: 'Priya S.',
  email: 'priya.s@zayra.health',
  role: 'agent',
  avatarInitials: 'PS',
  status: 'online',
};

// ─── Nav Tabs ──────────────────────────────────────────────────────────────────
export const NAV_TABS: NavTab[] = [
  { id: 'queue',         label: 'Live Queue'     },
  { id: 'my-cases',      label: 'My Cases'       },
  { id: 'escalations',   label: 'Escalations'    },
  { id: 'device-alerts', label: 'Device Alerts'  },
  { id: 'knowledge-base',label: 'Knowledge Base' },
  { id: 'analytics',     label: 'Analytics'      },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
export const STATS: StatCard[] = [
  { label: 'Open tickets',  value: '47',  sub: '+8 since 9am',        trend: 'down'    },
  { label: 'Avg. response', value: '4m',  sub: '↓ 1m vs yesterday',   trend: 'up'      },
  { label: 'CSAT today',    value: '4.7', sub: '↑ 0.2 vs last week',  trend: 'up'      },
  { label: 'Agents online', value: '6',   sub: 'of 9 scheduled',      trend: 'neutral' },
];

// ─── Tickets ──────────────────────────────────────────────────────────────────
export const TICKETS: Ticket[] = [
  {
    id: 'ZS-10482',
    title: 'Axiom ECG patch not syncing — missed alert window',
    severity: 'critical',
    user: 'Meena Krishnamurthy',
    plan: 'Zayra Care',
    timeAgo: '2m ago',
    tags: ['critical', 'device'],
    memberSince: 'Feb 2025',
    clinician: 'Dr. Rao (assigned)',
    device: { name: 'Axiom ECG Patch — AX-2219', firmware: '3.1.4', battery: '61%', lastSync: '47m ago' },
    note: '⚠ Last sync 47 min ago. Alyna flagged an unreviewed ST event at 15:04. Escalate to device engineering if unresolved in 10 min.',
    messages: [
      { from: 'Meena K.', text: 'My patch stopped syncing around 3pm. I got a notification that there was a flag but the app says no data available. This is really worrying me.', time: '15:09', mine: false },
      { from: 'Priya S. (you)', text: "Hi Meena, I can see your device lost sync at 15:02. I'm escalating this to our device team right now. Can you confirm your phone's Bluetooth is on?", time: '15:11', mine: true },
    ],
  },
  {
    id: 'ZS-10481',
    title: 'Subscription not reflecting after upgrade to Care plan',
    severity: 'urgent',
    user: 'Rajan Verma',
    plan: 'Zayra Wellness',
    timeAgo: '8m ago',
    tags: ['urgent', 'billing'],
    messages: [
      { from: 'Rajan V.', text: 'I upgraded to Care plan 2 hours ago but the app still shows Wellness features. Payment went through.', time: '14:58', mine: false },
    ],
  },
  {
    id: 'ZS-10479',
    title: 'Zen wristband showing incorrect SpO₂ readings',
    severity: 'normal',
    user: 'Ananya Pillai',
    plan: 'Zayra Wellness',
    timeAgo: '15m ago',
    tags: ['normal', 'device'],
    device: { name: 'Zen Wristband ZW-0881', firmware: '2.3.1', battery: '44%', lastSync: '12m ago' },
    messages: [
      { from: 'Ananya P.', text: 'My SpO₂ readings have been jumping between 88% and 99% in the same minute. Is this a sensor issue?', time: '14:51', mine: false },
    ],
  },
  {
    id: 'ZS-10478',
    title: 'Alyna AI flagged arrhythmia — patient wants clarification',
    severity: 'normal',
    user: 'Suresh Menon',
    plan: 'Zayra Care',
    timeAgo: '22m ago',
    tags: ['normal'],
    device: { name: 'Axiom Patch AX-1984', firmware: '3.1.4', battery: '78%', lastSync: '5m ago' },
    messages: [
      { from: 'Suresh M.', text: "Alyna sent me an alert about irregular heartbeat. My doctor hasn't seen it yet. Should I go to hospital?", time: '14:44', mine: false },
    ],
  },
  {
    id: 'ZS-10476',
    title: 'Request to transfer data before account cancellation',
    severity: 'normal',
    user: 'Lakshmi T.',
    plan: 'Zayra Hospital',
    timeAgo: '35m ago',
    tags: ['billing'],
    messages: [
      { from: 'Lakshmi T.', text: 'I need to cancel my account but want to download all my ECG data first. How do I do this?', time: '14:31', mine: false },
    ],
  },
  {
    id: 'ZS-10474',
    title: 'Evac alert sent without trigger — false positive concern',
    severity: 'resolved',
    user: 'Deepak R.',
    plan: 'Zayra Evac',
    timeAgo: '1h ago',
    tags: ['resolved'],
    messages: [
      { from: 'Deepak R.', text: 'Got an Evac alert while I was just sitting at home. No chest pain or anything. Why did this happen?', time: '14:00', mine: false },
      { from: 'Priya S. (you)', text: "Hi Deepak, after reviewing the logs this appears to have been a false positive due to a calibration event. We've corrected this and your settings are now updated.", time: '14:15', mine: true },
    ],
  },
];

// ─── Agents ───────────────────────────────────────────────────────────────────
export const AGENTS: Agent[] = [
  { id: 'a1', name: 'Priya S.',   initials: 'PS', avatarBg: '#E1F5EE', avatarColor: '#0F6E56', status: 'online', openCases: 3 },
  { id: 'a2', name: 'Arjun K.',   initials: 'AK', avatarBg: '#E6F1FB', avatarColor: '#185FA5', status: 'busy',   openCases: 5 },
  { id: 'a3', name: 'Nandita M.', initials: 'NM', avatarBg: '#FAEEDA', avatarColor: '#633806', status: 'online', openCases: 1 },
  { id: 'a4', name: 'Vikram R.',  initials: 'VR', avatarBg: '#FCEBEB', avatarColor: '#A32D2D', status: 'away',   openCases: 0 },
];

// ─── Category Bars ────────────────────────────────────────────────────────────
export const CATEGORY_BARS: CategoryBar[] = [
  { label: 'Device sync',  percentage: 72, color: '#1D9E75', count: 18 },
  { label: 'Alyna alerts', percentage: 44, color: '#378ADD', count: 11 },
  { label: 'Billing',      percentage: 32, color: '#BA7517', count: 8  },
  { label: 'Onboarding',   percentage: 24, color: '#7F77DD', count: 6  },
  { label: 'Other',        percentage: 16, color: '#B4B2A9', count: 4  },
];

// ─── Analytics ────────────────────────────────────────────────────────────────
export const DAILY_METRICS: DailyMetric[] = [
  { day: 'Mon', tickets: 38, resolved: 34 },
  { day: 'Tue', tickets: 42, resolved: 39 },
  { day: 'Wed', tickets: 35, resolved: 33 },
  { day: 'Thu', tickets: 51, resolved: 44 },
  { day: 'Fri', tickets: 47, resolved: 41 },
  { day: 'Sat', tickets: 22, resolved: 21 },
  { day: 'Sun', tickets: 18, resolved: 17 },
];

export const CSAT_TREND: CsatEntry[] = [
  { date: '28 Apr', score: 4.4 },
  { date: '29 Apr', score: 4.5 },
  { date: '30 Apr', score: 4.3 },
  { date: '1 May',  score: 4.6 },
  { date: '2 May',  score: 4.5 },
  { date: '3 May',  score: 4.7 },
  { date: '4 May',  score: 4.8 },
  { date: '5 May',  score: 4.7 },
];
