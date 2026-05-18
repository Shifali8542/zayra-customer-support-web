// src/components/layout/TabBar.tsx
import React, { useState } from 'react';
import type { TabId, NavTab } from '../../schema';

const NAV_TABS: NavTab[] = [
  { id: 'queue',          label: 'Live Queue'     },
  { id: 'my-cases',       label: 'My Cases'       },
  { id: 'escalations',    label: 'Escalations'    },
  { id: 'device-alerts',  label: 'Device Alerts'  },
  { id: 'knowledge-base', label: 'Knowledge Base' },
  { id: 'analytics',      label: 'Analytics'      },
];

interface TabBarProps {
  activeTab:   TabId;
  onTabChange: (tab: TabId) => void;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="12" height="12" viewBox="0 0 12 12" fill="none"
    stroke="currentColor" strokeWidth="2"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
  >
    <path d="M2 4l4 4 4-4"/>
  </svg>
);

const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLabel = NAV_TABS.find((t: NavTab) => t.id === activeTab)?.label;

  return (
    <>
      <nav className="
        hidden md:flex border-b border-[var(--z-border)]
        bg-[var(--surface)] px-5 overflow-x-auto
        transition-colors duration-200
        [&::-webkit-scrollbar]:h-0
      ">
        {NAV_TABS.map((tab: NavTab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-[14px] py-[10px] text-[13px] whitespace-nowrap
              border-b-2 transition-all duration-150 bg-transparent font-sans
              ${activeTab === tab.id
                ? 'text-[#1D9E75] border-[#1D9E75] font-medium'
                : 'text-[var(--text3)] border-transparent hover:text-[var(--text2)]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div
        className="
          md:hidden flex items-center justify-between px-5 py-[10px]
          bg-[var(--surface)] border-b border-[var(--z-border)]
          text-[13px] text-[var(--text1)] font-medium cursor-pointer
          transition-colors duration-200
        "
        onClick={() => setMobileOpen(o => !o)}
      >
        <span>{activeLabel}</span>
        <ChevronIcon open={mobileOpen} />
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[var(--surface)] border-b border-[var(--z-border)]">
          {NAV_TABS.map((tab: NavTab) => (
            <button
              key={tab.id}
              onClick={() => { onTabChange(tab.id); setMobileOpen(false); }}
              className={`
                block w-full text-left px-5 py-3 text-[13px]
                font-sans transition-all duration-100
                ${activeTab === tab.id
                  ? 'text-[#1D9E75] font-medium bg-[var(--surface2)]'
                  : 'text-[var(--text2)] hover:bg-[var(--surface2)]'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default TabBar;
