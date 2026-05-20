import React from 'react';
import Topbar        from '../../components/layout/Topbar';
import TabBar        from '../../components/layout/TabBar';
import StatsRow      from '../../components/layout/StatsRow';
import TicketQueue   from '../../components/tickets/TicketQueue';
import TicketDetail  from '../../components/tickets/TicketDetail';
import AgentsOnline  from '../../components/agents/AgentsOnline';
import CategoryChart from '../../components/charts/CategoryChart';
import CsatCard      from '../../components/charts/CsatCard';
import Analytics      from '../analytics/Analytics';
import KnowledgeBase  from './KnowledgeBase';
import { useDashboard } from '../../hooks/useDashboard';
import type { TabId, FilterTag } from '../../schema';

const getAccessToken = () => localStorage.getItem('zayra-access-token');

const Dashboard = () => {
  const {
    filteredTickets, selectedTicket, selectedId,
    activeFilter, activeTab, isLoading, error,
    selectTicket, setFilter, setActiveTab,
    sendReply, selfAssign, escalateTicket, resolveTicket, closeTicket, refresh,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-[var(--surface2)] transition-colors duration-200 flex flex-col">
      <div className="sticky top-0 z-50">
        <Topbar />
        <TabBar activeTab={activeTab} onTabChange={(tab: TabId) => setActiveTab(tab)} />
      </div>

      {activeTab === 'analytics' ? (
        <Analytics />
      ) : activeTab === 'knowledge-base' ? (
        <KnowledgeBase />
      ) : (
        <>
          <StatsRow />

          {error && (
            <div className="mx-5 mt-3 p-[10px_12px] bg-[#FCEBEB] border border-[rgba(226,75,74,.2)] rounded-[8px] text-[12px] text-[#E24B4A]">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4 p-[16px_20px]">
            <div className="w-full lg:w-[60%] min-w-0">
              <TicketQueue
                tickets={filteredTickets}
                selectedId={selectedId}
                activeFilter={activeFilter}
                isLoading={isLoading}
                onSelect={selectTicket}
                onFilter={(f: FilterTag) => setFilter(f)}
              />
            </div>

            <div className="w-full lg:w-[40%] flex-shrink-0 flex flex-col gap-3">
              {selectedTicket ? (
                <TicketDetail
                  ticket={selectedTicket}
                  accessToken={getAccessToken()}
                  onSendReply={sendReply}
                  onSelfAssign={selfAssign}
                  onEscalate={escalateTicket}
                  onResolve={resolveTicket}
                  onClose={closeTicket}
                />
              ) : !isLoading ? (
                <div className="bg-[var(--surface)] border border-[var(--z-border)] rounded-xl p-6 text-center text-[13px] text-[var(--text3)]">
                  Select a ticket to view details
                </div>
              ) : null}
              <AgentsOnline />
              <CsatCard />
              <CategoryChart />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
