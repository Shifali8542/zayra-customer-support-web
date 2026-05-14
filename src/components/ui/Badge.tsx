import React from 'react';
import type { TicketSeverity } from '../../schema';

type BadgeVariant = TicketSeverity | 'device' | 'plan';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  critical: 'bg-[#FCEBEB] text-[#E24B4A]',
  urgent:   'bg-[#FAEEDA] text-[#BA7517]',
  normal:   'bg-[#E1F5EE] text-[#0F6E56]',
  resolved: 'bg-[var(--surface2)] text-[var(--text3)]',
  device:   'bg-[#E6F1FB] text-[#185FA5]',
  plan:     'bg-[#E6F1FB] text-[#185FA5]',
};

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ variant, children, className = '' }: BadgeProps) => (
  <span
    className={`
      inline-block text-[10px] font-medium px-[7px] py-[2px] rounded-full
      ${VARIANT_CLASSES[variant] ?? ''}
      ${className}
    `}
  >
    {children}
  </span>
);

export default Badge;
