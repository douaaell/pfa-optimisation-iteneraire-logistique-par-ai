import React from 'react';
import { useData } from '../../context/DataContext';
import { KPICard } from '../../components/KPICard';
import { 
  Zap, 
  Activity, 
  Truck, 
  Route, 
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { formatNumber, formatPercent, cn } from '../../utils/cn';
import { RealMap } from '../../components/RealMap';

export const OperatorDashboard: React.FC = () => {
  const { data, metrics, isLoading } = useData();

  const activeRoutes = data.filter(r => r.status === 'in-progress').slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Operator Console</h2>
        <p className="text-slate-400">Manage real-time logistics flows and AI-driven optimizations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Active Routes" value={data.filter(r => r.status === 'in-progress').length} icon={Activity} className="bg-emerald-600/10 border-emerald-500/20" />
        <KPICard title="Efficiency Score" value="96.4%" icon={Zap} trend={{ value: 2.1, isPositive: true }} />
        <KPICard title="Avg Response" value="1.2s" icon={Clock} />
        <KPICard title="Fleet Health" value="98%" icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Live Route Monitoring</h3>
              <button className="text-xs font-bold text-emerald-500 hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {activeRoutes.map((route) => (
                <div key={route.route_id} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between group hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-600 transition-colors">
                      <Truck className="w-4 h-4 text-emerald-500 group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{route.route_id}</p>
                      <p className="text-xs text-slate-500">{route.start_city} → {route.end_city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">{route.distance.toFixed(0)} km</p>
                      <p className="text-[10px] text-slate-500 font-mono">LAT: {route.start_lat}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white">Regional Map</h3>
            <RealMap 
              center={[33.5731, -7.5898]} // Casablanca
              zoom={10}
              markers={activeRoutes.map(r => ({ 
                position: [r.start_lat, r.start_lng], 
                label: `Vehicle: ${r.vehicle_id}` 
              }))}
              className="h-[250px] w-full rounded-xl"
            />
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Optimization Yield
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.slice(0, 7)}>
                  <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-200 leading-tight">
                AI suggests rerouting <strong>RT0045</strong> due to predicted fog in the Rabat region.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
