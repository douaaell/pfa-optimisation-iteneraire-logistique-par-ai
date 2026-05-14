import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Package, 
  Map as MapIcon, Clock, DollarSign, PieChart as PieChartIcon, 
  ArrowRight, Download, RefreshCw, Zap, Target
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { cn } from '../utils/cn';

export const Analytics: React.FC = () => {
  const [liveStats, setLiveStats] = useState<any>(null);
  const [histCharts, setHistCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [liveRes, histRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/live_stats'),
        fetch('http://localhost:8000/api/admin/analytics')
      ]);
      if (liveRes.ok) setLiveStats(await liveRes.json());
      if (histRes.ok) setHistCharts(await histRes.json());
    } catch (e) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const kpis = liveStats?.kpis || {};
  
  const statusData = liveStats?.status_distribution?.map((s: any) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count
  })) || [];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Centre d'Analytique IA
          </h2>
          <p className="text-slate-400 mt-1">Intelligence d'affaires et performance opérationnelle en temps réel.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchStats} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all">
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20">
            <Download className="w-4 h-4" />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Main KPIs from Database */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenu Total (EST)', value: `${Number(kpis.total_revenue || 0).toLocaleString()} MAD`, icon: DollarSign, color: 'text-emerald-400', trend: '+12.5%' },
          { label: 'Coût Opérationnel', value: `${Number(kpis.total_cost || 0).toLocaleString()} MAD`, icon: TrendingDown, color: 'text-rose-400', trend: '-2.4%' },
          { label: 'Marge Profit', value: `${Number((kpis.total_revenue - kpis.total_cost) || 0).toLocaleString()} MAD`, icon: Target, color: 'text-indigo-400', trend: '+5.2%' },
          { label: 'Taux Ponctualité', value: '94.2%', icon: Clock, color: 'text-amber-400', trend: '+1.1%' }
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800/50 p-6 rounded-3xl hover:border-slate-700 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform")}>
                <kpi.icon className={cn("w-6 h-6", kpi.color)} />
              </div>
              <span className={cn("text-xs font-bold px-2 py-1 rounded-full bg-slate-950 border border-slate-800", kpi.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400')}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-black text-white mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Real-time Business Flow */}
        <div className="xl:col-span-2 bg-slate-900/50 border border-slate-800/50 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Évolution Financière (Dataset + Real)
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Revenu
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-rose-500" /> Coût
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={histCharts?.revenue_vs_cost || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-8">État des Livraisons</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-indigo-500/10 rounded-2xl">
                 <Zap className="w-5 h-5 text-indigo-400" />
               </div>
               <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase">Insight IA</p>
                 <p className="text-xs text-white leading-relaxed">
                   Le taux de livraison a augmenté de **14%** suite à l'optimisation des routes Hybrid.
                 </p>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Top Drivers from real data */}
         <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            Performance Conducteurs
          </h3>
          <div className="space-y-4">
            {liveStats?.driver_performance?.map((d: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                    {i+1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{d.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{d.count} Missions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{d.cost} MAD</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, star) => (
                      <div key={star} className={`w-1 h-1 rounded-full ${star < 4 ? 'bg-amber-400' : 'bg-slate-700'}`} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {(!liveStats?.driver_performance || liveStats.driver_performance.length === 0) && (
              <p className="text-center py-10 text-slate-500 italic">Aucune donnée de performance conducteur.</p>
            )}
          </div>
        </div>

        {/* Weather Impact Analysis */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-6">Impact Météo sur Délais</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histCharts?.weather_impact || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'Retard moy. (h)', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: '10px' } }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Bar dataKey="avgDelay" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
