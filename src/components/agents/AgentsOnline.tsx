import React from 'react';
import type { AgentStatus } from '../../schema';
import { AGENTS } from '../../data/mockData';
import Card from '../ui/Card';

const STATUS_PILL: Record<AgentStatus, string> = {
  online:  'bg-[#EAF3DE] text-[#3B6D11]',
  busy:    'bg-[#FAEEDA] text-[#BA7517]',
  away:    'bg-[var(--surface2)] text-[var(--text3)] border border-[var(--z-border)]',
  offline: 'bg-[var(--surface2)] text-[var(--text3)] border border-[var(--z-border)]',
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  online: 'Online', busy: 'Busy', away: 'Away', offline: 'Offline',
};

const AgentsOnline = () => (
  <Card>
    <div className="text-[11px] font-medium text-[var(--text3)] uppercase tracking-[.06em] mb-3">
      Agents online
    </div>

    <div className="flex flex-col gap-2">
      {AGENTS.map((agent) => (
        <div
          key={agent.id}
          className="
            flex items-center gap-[10px] p-[8px_10px]
            bg-[var(--surface2)] rounded-[8px] border border-[var(--z-border)]
          "
        >
          <div
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0"
            style={{ background: agent.avatarBg, color: agent.avatarColor }}
          >
            {agent.initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-[var(--text1)]">{agent.name}</div>
            <div className="text-[11px] text-[var(--text2)]">
              {agent.status === 'away'
                ? 'Away'
                : `${agent.openCases} open case${agent.openCases !== 1 ? 's' : ''}`
              }
            </div>
          </div>

          <span className={`text-[10px] px-[7px] py-[2px] rounded-full ${STATUS_PILL[agent.status]}`}>
            {STATUS_LABEL[agent.status]}
          </span>
        </div>
      ))}
    </div>
  </Card>
);

export default AgentsOnline;
