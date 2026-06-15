import React, { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import StatsRow from '../../components/layout/StatsRow';
import TicketQueue from '../../components/tickets/TicketQueue';
import TicketDetail from '../../components/tickets/TicketDetail';
import AgentsOnline from '../../components/agents/AgentsOnline';
import CategoryChart from '../../components/charts/CategoryChart';
import CsatCard from '../../components/charts/CsatCard';
import Analytics from '../analytics/Analytics';
import KnowledgeBase from './KnowledgeBase';
import DeviceAlerts from './DeviceAlerts';
import { useBLEMonitor } from '../../hooks/useBLEMonitor';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../hooks/useAuth';
import type { TabId, FilterTag } from '../../schema';

const getAccessToken = () => localStorage.getItem('zayra-access-token');

const Icons = {
  Queue: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M9 12h6M9 8h6M9 16h4" /><rect x="3" y="3" width="18" height="18" rx="3" />
    </svg>
  ),
  MyCases: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  Escalations: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 2L2 19h20L12 2z" /><path d="M12 9v5M12 16.5v.5" />
    </svg>
  ),
  Device: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><circle cx="12" cy="17" r="1" />
    </svg>
  ),
  Knowledge: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Analytics: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 4-6" />
    </svg>
  ),
  Refresh: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
};

interface NavItem { id: TabId; label: string; Icon: React.FC; badge?: number; }

const NAV_ITEMS: NavItem[] = [
  { id: 'queue', label: 'Live Queue', Icon: Icons.Queue },
  { id: 'my-cases', label: 'My Cases', Icon: Icons.MyCases },
  { id: 'escalations', label: 'Escalations', Icon: Icons.Escalations },
  { id: 'device-alerts', label: 'Device Alerts', Icon: Icons.Device },
  { id: 'knowledge-base', label: 'Knowledge Base', Icon: Icons.Knowledge },
  { id: 'analytics', label: 'Analytics', Icon: Icons.Analytics },
];


// LEFT SIDEBAR
interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ activeTab, onTabChange, collapsed, onToggle }: SidebarProps) => (
  <aside
    className="flex-shrink-0 h-full flex flex-col border-r border-[var(--z-border)] bg-[var(--surface)] transition-all duration-200"
    style={{ width: collapsed ? '56px' : '200px' }}
  >
    {/* Collapse toggle */}
    <div className="flex-shrink-0 flex items-center justify-end px-2 py-3 border-b border-[var(--z-border)]">
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="
          w-7 h-7 rounded-[6px] flex items-center justify-center
          text-[var(--text3)] hover:text-[var(--text1)]
          hover:bg-[var(--surface2)] transition-all duration-150 cursor-pointer
        "
      >
        {collapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
      </button>
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-[2px]">
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            title={collapsed ? label : undefined}
            className={`
              w-full flex items-center gap-[10px] rounded-[8px] font-sans cursor-pointer
              transition-all duration-150 text-left
              ${collapsed ? 'justify-center px-0 py-[9px]' : 'px-[10px] py-[9px]'}
              ${isActive
                ? 'bg-[#E1F5EE] text-[#0F6E56]'
                : 'text-[var(--text2)] hover:bg-[var(--surface2)] hover:text-[var(--text1)]'
              }
            `}
          >
            <span className="flex-shrink-0"><Icon /></span>
            {!collapsed && (
              <span className="text-[12.5px] font-medium truncate">{label}</span>
            )}
            {/* Active indicator dot for collapsed mode */}
            {collapsed && isActive && (
              <span
                className="absolute right-0 w-[3px] h-5 rounded-l-full bg-[#1D9E75]"
                style={{ position: 'absolute', right: 0 }}
              />
            )}
          </button>
        );
      })}
    </nav>

    {/* Bottom section label */}
    {!collapsed && (
      <div className="flex-shrink-0 px-3 pb-4 pt-2 border-t border-[var(--z-border)]">
        <p className="text-[10px] text-[var(--text3)] leading-relaxed">
          Zayra Support
        </p>
      </div>
    )}
  </aside>
);

// PAGE HEADER — breadcrumb + tab title inside content
const TAB_META: Record<TabId, { title: string; description: string }> = {
  'queue': { title: 'Live Queue', description: 'All incoming support tickets in real time' },
  'my-cases': { title: 'My Cases', description: 'Tickets assigned to you' },
  'escalations': { title: 'Escalations', description: 'Tickets requiring senior attention' },
  'device-alerts': { title: 'Device Alerts', description: 'Hardware & device-related issues' },
  'knowledge-base': { title: 'Knowledge Base', description: 'Articles and guides for agents' },
  'analytics': { title: 'Analytics', description: 'Performance metrics and reporting' },
};

const PageHeader = ({ activeTab }: { activeTab: TabId }) => {
  const meta = TAB_META[activeTab];
  return (
    <div className="flex-shrink-0 px-6 pt-5 pb-4">
      <h1 className="text-[17px] font-semibold text-[var(--text1)] leading-none mb-1">
        {meta.title}
      </h1>
      <p className="text-[12px] text-[var(--text3)]">{meta.description}</p>
    </div>
  );
};


// EMPTY DETAIL STATE
const EmptyDetailState = () => (
  <div className="
    h-full flex flex-col items-center justify-center
    bg-[var(--surface)] border border-[var(--z-border)] border-dashed
    rounded-xl p-8 text-center transition-colors duration-200 min-h-[200px]
  ">
    <div className="w-11 h-11 rounded-full bg-[var(--surface2)] border border-[var(--z-border)]
      flex items-center justify-center mb-3">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 12h8M8 8h5" />
      </svg>
    </div>
    <p className="text-[13px] font-medium text-[var(--text2)] mb-1">No ticket selected</p>
    <p className="text-[11px] text-[var(--text3)]">Pick a ticket from the queue to start working</p>
  </div>
);


  // DETAIL PANEL (shared across breakpoints)
interface DetailPanelProps {
  selectedTicket: ReturnType<typeof useDashboard>['selectedTicket'];
  isLoading: boolean;
  accessToken: string | null;
  onSendReply: ReturnType<typeof useDashboard>['sendReply'];
  onSelfAssign: ReturnType<typeof useDashboard>['selfAssign'];
  onEscalate: ReturnType<typeof useDashboard>['escalateTicket'];
  onResolve: ReturnType<typeof useDashboard>['resolveTicket'];
  onClose: ReturnType<typeof useDashboard>['closeTicket'];
}

const DetailPanel = ({
  selectedTicket, isLoading, accessToken,
  onSendReply, onSelfAssign, onEscalate, onResolve, onClose,
}: DetailPanelProps) => (
  <>
    {selectedTicket ? (
      <TicketDetail
        ticket={selectedTicket}
        accessToken={accessToken}
        onSendReply={onSendReply}
        onSelfAssign={onSelfAssign}
        onEscalate={onEscalate}
        onResolve={onResolve}
        onClose={onClose}
      />
    ) : !isLoading ? (
      <EmptyDetailState />
    ) : null}
  </>
);


  // DASHBOARD ROOT
const Dashboard = () => {
  const {
    filteredTickets, selectedTicket, selectedId,
    activeFilter, activeTab, isLoading, error,
    selectTicket, setFilter, setActiveTab,
    sendReply, selfAssign, escalateTicket, resolveTicket, closeTicket, refresh,
  } = useDashboard();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(getAccessToken);
  useEffect(() => {
    setAccessToken(getAccessToken());
  }, [isAuthenticated]);
  const { events: bleEvents, connected: bleConnected, historyLoaded: bleHistoryLoaded, clearEvents: bleClear } = useBLEMonitor(accessToken);

  const queueProps = {
    tickets: filteredTickets,
    selectedId,
    activeFilter,
    isLoading,
    onSelect: selectTicket,
    onFilter: (f: FilterTag) => setFilter(f),
  };

  const detailProps = {
    selectedTicket,
    isLoading,
    accessToken,
    onSendReply: sendReply,
    onSelfAssign: selfAssign,
    onEscalate: escalateTicket,
    onResolve: resolveTicket,
    onClose: closeTicket,
  };

  const isTicketTab = !['analytics', 'knowledge-base'].includes(activeTab);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--surface2)] transition-colors duration-200">
      <div className="flex-shrink-0 z-50">
        <Topbar />
      </div>
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden">

        {/* ── Left sidebar */}
        <div className="hidden lg:block h-full relative">
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab: TabId) => setActiveTab(tab)}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(c => !c)}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">

          {/* Page header */}
          <PageHeader activeTab={activeTab} />

          {/*  Tab: Analytics */}
          {activeTab === 'analytics' ? (
            <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
              <Analytics />
            </div>

            /* Tab: Knowledge Base */
          ) : activeTab === 'knowledge-base' ? (
            <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
              <KnowledgeBase />
            </div>

            /* Tab: Device Alerts — BLE patient monitoring */
          ) : activeTab === 'device-alerts' ? (
            <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
              <DeviceAlerts
                events={bleEvents}
                connected={bleConnected}
                historyLoaded={bleHistoryLoaded}
                onClear={bleClear}
              />
            </div>

            /* Ticket tabs: queue / my-cases / escalations ── */
          ) : (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

              {/* Stats strip  */}
              <div className="flex-shrink-0 px-6 pb-4">
                <StatsRow />
              </div>

              {/* Error banner  */}
              {error && (
                <div className="flex-shrink-0 mx-6 mb-3 flex items-center gap-2
                  px-3 py-2 bg-[#FCEBEB] border border-[rgba(226,75,74,.2)]
                  rounded-lg text-[12px] text-[#E24B4A]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="flex-1">{error}</span>
                  <button
                    onClick={refresh}
                    className="flex items-center gap-1 text-[11px] font-medium
                      text-[#E24B4A] hover:text-[#c03837] underline underline-offset-2 cursor-pointer"
                  >
                    <Icons.Refresh /> Retry
                  </button>
                </div>
              )}

              <div className="hidden xl:flex flex-row flex-1 min-h-0 gap-4 px-6 pb-6">

                {/* Col A — Ticket queue  38% */}
                <div
                  className="flex-shrink-0 h-full overflow-y-auto
                    [&::-webkit-scrollbar]:w-[3px]
                    [&::-webkit-scrollbar-thumb]:bg-[var(--z-border)]
                    [&::-webkit-scrollbar-thumb]:rounded-full"
                  style={{ width: '38%' }}
                >
                  <TicketQueue {...queueProps} />
                </div>

                {/* Col B — Ticket detail  32% */}
                <div
                  className="flex-shrink-0 h-full overflow-y-auto flex flex-col gap-3
                    [&::-webkit-scrollbar]:w-[3px]
                    [&::-webkit-scrollbar-thumb]:bg-[var(--z-border)]
                    [&::-webkit-scrollbar-thumb]:rounded-full"
                  style={{ width: '32%' }}
                >
                  <DetailPanel {...detailProps} />
                </div>

                {/* Col C — Sidebar widgets  30% */}
                <div
                  className="flex-shrink-0 h-full overflow-y-auto flex flex-col gap-4
                    [&::-webkit-scrollbar]:w-[3px]
                    [&::-webkit-scrollbar-thumb]:bg-[var(--z-border)]
                    [&::-webkit-scrollbar-thumb]:rounded-full"
                  style={{ width: '30%' }}
                >
                  {/* Agents panel */}
                  <div>
                    <div className="text-[10px] font-semibold text-[var(--text3)] uppercase tracking-[.08em] mb-2 px-1">
                      Agents online
                    </div>
                    <AgentsOnline />
                  </div>

                  {/* CSAT + Categories side by side */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="text-[10px] font-semibold text-[var(--text3)] uppercase tracking-[.08em] mb-2 px-1">
                        CSAT Score
                      </div>
                      <CsatCard />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-[var(--text3)] uppercase tracking-[.08em] mb-2 px-1">
                        Categories today
                      </div>
                      <CategoryChart />
                    </div>
                  </div>
                </div>

              </div>

              <div className="hidden lg:flex xl:hidden flex-row flex-1 min-h-0 gap-4 px-6 pb-6">

                <div
                  className="flex-shrink-0 h-full overflow-y-auto
                    [&::-webkit-scrollbar]:w-[3px]
                    [&::-webkit-scrollbar-thumb]:bg-[var(--z-border)]
                    [&::-webkit-scrollbar-thumb]:rounded-full"
                  style={{ width: '50%' }}
                >
                  <TicketQueue {...queueProps} />
                </div>

                <div
                  className="flex-1 h-full overflow-y-auto flex flex-col gap-3 min-w-0
                    [&::-webkit-scrollbar]:w-[3px]
                    [&::-webkit-scrollbar-thumb]:bg-[var(--z-border)]
                    [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                  <DetailPanel {...detailProps} />
                  <AgentsOnline />
                  <div className="grid grid-cols-2 gap-3">
                    <CsatCard />
                    <CategoryChart />
                  </div>
                </div>

              </div>

              <div className="lg:hidden flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-3">
                <TicketQueue {...queueProps} />
                <DetailPanel {...detailProps} />
                <AgentsOnline />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CsatCard />
                  <CategoryChart />
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/*  Mobile bottom tab bar */}
      <div className="lg:hidden flex-shrink-0 border-t border-[var(--z-border)] bg-[var(--surface)] flex">
        {NAV_ITEMS.slice(0, 5).map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex-1 flex flex-col items-center gap-[3px] py-[10px] font-sans cursor-pointer
                transition-colors duration-150 border-none bg-transparent
                ${isActive ? 'text-[#1D9E75]' : 'text-[var(--text3)]'}
              `}
            >
              <Icon />
              <span className="text-[9px] font-medium leading-none">{label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default Dashboard;