import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

const Card = ({
  children,
  className = '',
  padding = 'p-[14px_16px]',
}: CardProps) => (
  <div
    className={`
      bg-[var(--surface)] border border-[var(--z-border)]
      rounded-xl transition-colors duration-200
      ${padding} ${className}
    `}
  >
    {children}
  </div>
);

export default Card;
