import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  color?: 'blue' | 'emerald' | 'orange' | 'purple' | 'rose' | 'indigo' | 'slate';
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, className, color = 'indigo' }) => {
  const colorMap = {
    blue: 'from-blue-600/20 to-blue-600/5 text-blue-500 border-blue-500/20',
    emerald: 'from-emerald-600/20 to-emerald-600/5 text-emerald-500 border-emerald-500/20',
    orange: 'from-orange-600/20 to-orange-600/5 text-orange-500 border-orange-500/20',
    purple: 'from-purple-600/20 to-purple-600/5 text-purple-500 border-purple-500/20',
    rose: 'from-rose-600/20 to-rose-600/5 text-rose-500 border-rose-500/20',
    indigo: 'from-indigo-600/20 to-indigo-600/5 text-indigo-500 border-indigo-500/20',
    slate: 'from-slate-600/20 to-slate-600/5 text-slate-500 border-slate-500/20',
  };

  const iconColorMap = {
    blue: 'bg-blue-500 text-white shadow-blue-500/20',
    emerald: 'bg-emerald-500 text-white shadow-emerald-500/20',
    orange: 'bg-orange-500 text-white shadow-orange-500/20',
    purple: 'bg-purple-500 text-white shadow-purple-500/20',
    rose: 'bg-rose-500 text-white shadow-rose-500/20',
    indigo: 'bg-indigo-500 text-white shadow-indigo-500/20',
    slate: 'bg-slate-700 text-white shadow-slate-500/20',
  };

  return (
    <div className={cn(
      "p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl flex flex-col gap-4 group relative overflow-hidden",
      "hover:border-slate-700/50 transition-all duration-500 shadow-2xl",
      className
    )}>
      {/* Glow Effect */}
      <div className={cn(
        "absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full bg-gradient-to-br",
        color === 'blue' ? 'from-blue-500' :
        color === 'emerald' ? 'from-emerald-500' :
        color === 'orange' ? 'from-orange-500' :
        color === 'purple' ? 'from-purple-500' :
        color === 'rose' ? 'from-rose-500' : 'from-indigo-500'
      )} />

      <div className="flex items-center justify-between relative z-10">
        <div className={cn(
          "p-2.5 rounded-xl transition-all duration-500 shadow-lg",
          iconColorMap[color]
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-md border",
            trend.isPositive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
          )}>
            {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}%
          </div>
        )}
      </div>
      
      <div className="space-y-1 relative z-10">
        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest">{title}</h3>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

