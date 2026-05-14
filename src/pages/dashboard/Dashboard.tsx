import React from 'react';
import Topbar      from '../../components/layout/Topbar';
import TabBar      from '../../components/layout/TabBar';
import StatsRow    from '../../components/layout/StatsRow';
import TicketQueue from '../../components/tickets/TicketQueue';
import TicketDetail from '../../components/tickets/TicketDetail';
import AgentsOnline from '../../components/agents/AgentsOnline';
import CategoryChart from '../../components/charts/CategoryChart';
import CsatCard     from '../../components/charts/CsatCard';
import Analytics    from '../analytics/Analytics';
import { useDashboard } from '../../hooks/useDashboard';
import type { TabId, FilterTag } from '../../schema';

const Dashboard = () => {
  const {
    filteredTickets, selectedTicket, selectedId,
    activeFilter, activeTab,
    selectTicket, setFilter, setActiveTab, sendReply,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-[var(--surface2)] transition-colors duration-200 flex flex-col">
      <div className="sticky top-0 z-50">
        <Topbar />
        <TabBar activeTab={activeTab} onTabChange={(tab: TabId) => setActiveTab(tab)} />
      </div>

      {activeTab === 'analytics' ? (
        <Analytics />
      ) : (
        <>
          <StatsRow />

          {/* Main content area */}
          <div className="flex flex-col lg:flex-row gap-4 p-[16px_20px]">
            {/* Left column — ticket queue */}
            <div className="flex-1 min-w-0">
              <TicketQueue
                tickets={filteredTickets}
                selectedId={selectedId}
                activeFilter={activeFilter}
                onSelect={selectTicket}
                onFilter={(f: FilterTag) => setFilter(f)}
              />
            </div>

            {/* Right column — detail + sidebar widgets */}
            <div className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-3">
              <TicketDetail ticket={selectedTicket} onSendReply={sendReply} />
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
