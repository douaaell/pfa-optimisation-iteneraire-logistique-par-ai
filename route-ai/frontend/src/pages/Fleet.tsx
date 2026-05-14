import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Truck, Scale, Activity, Route } from 'lucide-react';
import { cn } from '../utils/cn';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Fleet: React.FC = () => {
  const { data } = useData();

  const fleetStats = useMemo(() => {
    const vehicles = data.reduce((acc: any, curr) => {
      const vid = curr.vehicle_id;
      if (!acc[vid]) acc[vid] = { id: vid, type: curr.vehicle_type, capacity: curr.capacity, routes: 0, weight: 0, delay: 0 };
      acc[vid].routes += 1;
      acc[vid].weight += curr.weight;
      acc[vid].delay += curr.delay_hours;
      return acc;
    }, {});

    return Object.values(vehicles).map((v: any) => ({
      ...v,
      utilization: (v.weight / (v.capacity * v.routes)) * 100,
      avgDelay: v.delay / v.routes
    }));
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Fleet Performance</h2>
        <p className="text-slate-400">Analyze efficiency and capacity across your entire vehicle network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 h-[400px]">
          <h3 className="text-lg font-semibold text-white mb-6">Utilization by Vehicle (%)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fleetStats.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="id" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip cursor={{ fill: '#1e293b' }} />
              <Bar dataKey="utilization" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[400px] pr-2">
          {fleetStats.map((v: any) => (
            <div key={v.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-white">{v.id}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Utilization</span>
                  <span className="text-white font-bold">{v.utilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${v.utilization}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
