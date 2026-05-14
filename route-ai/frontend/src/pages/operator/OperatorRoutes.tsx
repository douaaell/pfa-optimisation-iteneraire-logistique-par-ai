import React from 'react';
import { Routes as BaseRoutes } from '../Routes';

export const OperatorRoutes: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-600/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-sm font-bold text-emerald-500">Live Tracking Enabled</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">SYNCING WITH MYSQL @ 12:44:00</span>
      </div>
      <BaseRoutes />
    </div>
  );
};
