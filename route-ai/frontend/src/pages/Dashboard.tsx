import React, { useEffect, useState } from 'react';
import { Truck, Activity, Package, CheckCircle2, AlertTriangle, TrendingUp, Users, Wrench } from 'lucide-react';
import { useData } from '../context/DataContext';
import GoogleMapComponent from '../components/GoogleMapComponent';
import { cn } from '../utils/cn';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { deliveries, data, fetchDeliveries } = useData();
  const [fleet, setFleet] = useState<any[]>([]);
  const [fleetStats, setFleetStats] = useState<any>(null);

  useEffect(() => {
    fetchDeliveries(); // Fetch the real deliveries to populate the 'Livraisons Totales' KPI
    
    fetch('http://localhost:8000/api/admin/fleet')
      .then(r => r.json())
      .then(setFleet);
    
    fetch('http://localhost:8000/api/admin/fleet_stats')
      .then(r => r.json())
      .then(setFleetStats);
  }, [fetchDeliveries]);

  const stats = [
    { label: 'Livraisons Totales', value: deliveries.length, icon: Package, color: 'indigo' },
    { label: 'Chauffeurs en Mission', value: fleet.filter(f => f.status === 'on_mission').length, icon: Users, color: 'blue' },
    { label: 'Alertes Trafic', value: deliveries.filter(d => d.predicted_delay > 0).length, icon: AlertTriangle, color: 'amber' },
  ];

  const statusCounts = fleetStats?.status_counts || [];
  const getTotal = (statusList: any[]) => statusList.reduce((acc, s) => acc + s.count, 0);
  const getCount = (statusList: any[], status: string) => statusList.find((s: any) => s.status === status)?.count || 0;

  const totalVehicles = getTotal(statusCounts);
  const activeFleet = getCount(statusCounts, 'on_delivery');
  const availableFleet = getCount(statusCounts, 'available');
  const maintenanceFleet = getCount(statusCounts, 'maintenance');

  const fleetKpis = [
    { label: 'Total Véhicules', value: totalVehicles, icon: Truck, color: 'slate' },
    { label: 'Flotte Active', value: activeFleet, icon: Activity, color: 'blue' },
    { label: 'Disponibles', value: availableFleet, icon: CheckCircle2, color: 'emerald' },
    { label: 'En Maintenance', value: maintenanceFleet, icon: Wrench, color: 'amber' },
  ];

  const typeCountsData = fleetStats?.type_counts?.map((tc: any) => ({ name: tc.vehicle_type, value: tc.count })) || [];
  const capacityCountsData = fleetStats?.capacity_counts?.map((cc: any) => ({ name: cc.vehicle_type, value: cc.total_capacity })) || [];
  const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

  const mapMarkers = [
    ...fleet.map(f => ({ id: `f-${f.id}`, lat: f.current_lat, lng: f.current_lng, label: f.name, type: 'driver' as const })),
    ...deliveries.filter(d => d.status === 'pending').map(d => ({ id: `d-${d.id}`, lat: d.start_lat, lng: d.start_lng, label: `CMD-${d.id}`, type: 'delivery' as const }))
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Supervision Globale</h2>
          <p className="text-slate-400">Analyse du Dataset CSV et Monitoring en temps réel.</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 premium-shadow">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", 
              s.color === 'indigo' ? "bg-indigo-500/10 text-indigo-400" :
              s.color === 'blue' ? "bg-blue-500/10 text-blue-400" :
              s.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
            )}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Fleet Management Section */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[32px] p-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Truck className="w-5 h-5 text-indigo-400" />Gestion de Flotte</h3>
        
        {/* Fleet KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {fleetKpis.map((s, i) => (
            <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", 
                s.color === 'slate' ? "bg-slate-500/10 text-slate-400" :
                s.color === 'blue' ? "bg-blue-500/10 text-blue-400" :
                s.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
              )}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fleet Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distribution des véhicules */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 h-64 flex flex-col">
            <h4 className="text-sm font-bold text-slate-300 mb-4 text-center">Distribution par Type</h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeCountsData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {typeCountsData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Capacité utilisée */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 h-64 flex flex-col">
            <h4 className="text-sm font-bold text-slate-300 mb-4 text-center">Capacité Totale (kg)</h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capacityCountsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{fill: '#334155'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {capacityCountsData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Monitoring Map */}
        <div className="lg:col-span-2 h-[500px] bg-slate-900/50 border border-slate-800 rounded-[32px] overflow-hidden relative">
          <GoogleMapComponent markers={mapMarkers} />
          <div className="absolute top-6 left-6 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Surveillance Chauffeurs Live</span>
          </div>
        </div>

        {/* Recent Dataset Insights */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[32px] p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-400" />Insights Dataset CSV</h3>
          <div className="space-y-4">
            {deliveries.slice(0, 4).map(d => (
              <div key={d.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-bold text-indigo-400 border border-slate-800">#{d.id}</div>
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">{d.end_address}</p>
                    <p className="text-[10px] text-slate-500">IA: +{d.predicted_delay}h delay</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400">TRAFIC</p>
                  <p className={cn("text-xs font-bold", d.traffic_factor > 1.8 ? "text-rose-400" : "text-emerald-400")}>x{d.traffic_factor}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/admin/stats')} className="w-full py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-bold text-xs rounded-xl transition-all">VOIR ANALYTICS COMPLÈTES</button>
        </div>
      </div>
    </div>
  );
};
