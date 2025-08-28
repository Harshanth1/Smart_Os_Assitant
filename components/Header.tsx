
import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

const Header: React.FC = () => {
  return (
    <header className="flex items-center p-4 border-b border-slate-700/50 bg-gray-900/70 backdrop-blur-sm z-10">
      <LogoIcon className="h-8 w-8 text-cyan-400" />
      <h1 className="ml-3 text-xl font-bold tracking-wider text-slate-200">
        SmartOS <span className="font-light text-slate-400">Assistant</span>
      </h1>
    </header>
  );
};

export default Header;
