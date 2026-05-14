import React from 'react';
import logo from '../../assets/icon.png'

const ZayraLogo = () => (
  <div className="flex items-center gap-2">
    <img src={logo} alt="Zayra" className="w-7 h-7 rounded-full object-cover" />
    <span className="text-[15px] font-semibold text-[var(--text1)]">
      Zayra{' '}
      <span className="text-[11px] font-normal text-[var(--text3)] ml-0.5">Support</span>
    </span>
  </div>
);

export default ZayraLogo;
