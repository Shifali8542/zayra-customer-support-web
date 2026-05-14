import React, { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-[#1D9E75] text-white border-[#0F6E56] hover:bg-[#0F6E56]',
  secondary: 'bg-transparent text-[var(--text1)] border-[var(--z-border)] hover:bg-[var(--surface2)]',
};

const Button = ({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...rest
}: ButtonProps) => (
  <button
    className={`
      px-3 py-[9px] rounded-[8px] border text-[12px] font-medium
      cursor-pointer transition-all duration-150 font-sans
      ${VARIANTS[variant]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
