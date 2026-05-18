// src/components/layout/Topbar.tsx
import React from 'react';
import ZayraLogo from '../ui/ZayraLogo';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

const SunIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconButton = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
  <button
    onClick={onClick} title={title}
    className="
      w-[30px] h-[30px] rounded-[8px] border border-[var(--z-border)]
      bg-[var(--surface2)] flex items-center justify-center cursor-pointer
      text-[var(--text2)] transition-all duration-150
      hover:border-[#9FE1CB] hover:text-[#1D9E75]
    "
  >
    {children}
  </button>
);

function formatDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

const Topbar = () => {
  const { toggle, isDark } = useTheme();
  const { logout, user }   = useAuth();

  const displayName = user?.name ?? 'Agent';
  const status      = user?.status ?? 'online';

  const statusLabel: Record<string, string> = { online: 'Online', busy: 'Busy', away: 'Away', offline: 'Offline' };
  const statusDot:   Record<string, string> = { online: 'bg-[#27B06E]', busy: 'bg-[#BA7517]', away: 'bg-[#888888]', offline: 'bg-[#888888]' };

  return (
    <header className="
      flex items-center justify-between px-5 py-[14px]
      border-b border-[var(--z-border)] bg-[var(--surface)]
      transition-colors duration-200
    ">
      <ZayraLogo />
      <div className="flex items-center gap-[10px]">
        <span className="text-[12px] text-[var(--text2)] hidden sm:block">{formatDate()}</span>
        <div className="
          flex items-center gap-[6px] text-[12px] text-[var(--text2)]
          bg-[var(--surface2)] border border-[var(--z-border)]
          rounded-full px-[10px] py-1
        ">
          <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${statusDot[status] ?? statusDot.online}`} />
          {displayName} — {statusLabel[status] ?? 'Online'}
        </div>
        <IconButton onClick={toggle} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {isDark ? <SunIcon /> : <MoonIcon />}
        </IconButton>
        <IconButton onClick={logout} title="Log out">
          <LogoutIcon />
        </IconButton>
      </div>
    </header>
  );
};

export default Topbar;
