import React from 'react';
import { DriverSidebar } from './DriverSidebar';

export const DriverLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200 selection:bg-emerald-500/30">
      <DriverSidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
