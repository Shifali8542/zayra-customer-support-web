import React from 'react';
import logo from '../../assets/icon.png'

const ZayraLogo = () => (
  <div className="flex items-center gap-2">
    <img src={logo} alt="Zayra" className="w-16 h-16 rounded-full object-cover" />
    <span className="text-[20px] font-semibold text-[var(--text1)]">
      Zayra{' '}
      <span className="text-[18px] font-normal text-[var(--text3)] ml-0.5">Support</span>
    </span>
  </div>
);

export default ZayraLogo;
