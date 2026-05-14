import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck, MapPin, Clock, Navigation, RefreshCw, Search, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const AvailableMissions: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [hasVehicle, setHasVehicle] = useState(true);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!user.id) return;
    setLoading(true);
    try {
      // Check profile
      const pRes = await fetch(`http://localhost:8000/api/drivers/user/${user.id}`);
      if (pRes.ok) {
        const profile = await pRes.json();
        setDriverInfo(profile);
        setHasVehicle(!!profile?.assigned_vehicle_id);
      }

      const res = await fetch(`http://localhost:8000/api/deliveries?role=driver&user_id=${user.id}`);
      if (res.ok) {
        const allMissions = await res.json();
        setMissions(allMissions.filter((m: any) => m.status === 'assigned' || m.status === 'confirmed'));
      }
    } catch (e) {
      console.error("Failed to load missions", e);
    } finally { setLoading(false); }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const updateMissionStatus = async (deliveryId: number, status: string) => {
    if (status === 'pending' && !window.confirm("Voulez-vous vraiment décliner cette mission ?")) return;
    
    setAccepting(deliveryId);
    try {
      const res = await fetch(`http://localhost:8000/api/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status === 'start' ? 'in_progress' : status })
      });
      if (res.ok) {
        await load();
        if (status === 'start') window.location.href = '/driver/active';
      }
    } catch (e) {} finally { setAccepting(null); }
  };

  const filtered = missions.filter(m =>
    !search ||
    String(m.id).includes(search) ||
    (m.start_city || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.end_city || '').toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    // Sort by date then time
    const dateA = a.delivery_date || '9999-12-31';
    const dateB = b.delivery_date || '9999-12-31';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    const timeA = a.time_window_open || '23:59';
    const timeB = b.time_window_open || '23:59';
    return timeA.localeCompare(timeB);
  });

  const groupedMissions = filtered.reduce((acc, mission) => {
    const date = mission.delivery_date || 'Immédiat / Sans Date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(mission);
    return acc;
  }, {} as Record<string, any[]>);

  const priorityColors: Record<string, string> = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Mon Planning (Emploi du Temps)</h2>
          <p className="text-slate-400">Vos futures livraisons planifiées et assignées</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all w-56"
            />
          </div>
          <button onClick={load} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {!loading && !hasVehicle && (
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-8 flex items-center gap-6 animate-pulse mb-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 flex-shrink-0">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Véhicule requis</h3>
            <p className="text-slate-400 text-sm">Vous ne pouvez pas accepter de missions tant qu'un véhicule ne vous a pas été assigné par l'administrateur. Les actions sont désactivées.</p>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-900/50 border border-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <Truck className="w-16 h-16 mx-auto mb-4 opacity-10 text-white" />
          <p className="text-slate-500 text-lg font-medium">Aucune mission assignée</p>
          <p className="text-xs text-slate-600 mt-1">L'administrateur vous assignera des livraisons prochainement</p>
        </div>
      ) : (
        <div className={cn("space-y-8", !hasVehicle && "opacity-50 pointer-events-none grayscale-[50%]")}>
          {Object.entries(groupedMissions).map(([date, dayMissions]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px bg-slate-800 flex-1" />
                <h3 className="text-lg font-bold text-indigo-400 bg-slate-900 px-4 py-1 rounded-full border border-slate-800">
                  {date === 'Immédiat / Sans Date' ? '🚨 ' + date : '📅 ' + date}
                </h3>
                <div className="h-px bg-slate-800 flex-1" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(dayMissions as any[]).map((mission: any) => (
                  <div
                    key={mission.id}
                    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 transition-all shadow-xl"
                  >
                    {/* Top */}
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                          <Truck className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">LIV-{mission.id}</h3>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {mission.company_name || mission.client_name || 'Client'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-400">{Number(mission.cost || 0).toFixed(0)} MAD</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rémunération totale</div>
                      </div>
                    </div>

                    {/* Schedule Time Window */}
                    <div className="mb-4 py-2 px-3 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Horaire Requis</span>
                      </div>
                      <span className="text-sm font-black text-white">
                        {mission.time_window_open ? `${mission.time_window_open} à ${mission.time_window_close}` : 'Non spécifié'}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="flex gap-4 mb-5">
                      <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
                        <div className="w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-500" />
                        <div className="w-0.5 h-8 bg-slate-700" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-400" />
                      </div>
                      <div className="space-y-5">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Enlèvement</p>
                          <p className="text-sm font-medium text-white truncate max-w-[250px]">{mission.start_city || mission.start_address}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Livraison</p>
                          <p className="text-sm font-medium text-white truncate max-w-[250px]">{mission.end_city || mission.end_address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-3 py-4 border-t border-slate-800/50 mb-5 flex-wrap">
                      {mission.distance_km && (
                        <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                          <Navigation className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs font-bold text-slate-300">{mission.distance_km} km</span>
                        </div>
                      )}
                      <span className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border", priorityColors[mission.priority] || priorityColors.medium)}>
                        {mission.priority === 'high' ? '🔴 URGENT' : mission.priority === 'medium' ? '🟡 Moyen' : '🟢 Faible'}
                      </span>
                    </div>

                    {/* Action buttons based on status */}
                    <div className="flex flex-col gap-3">
                      {mission.status === 'assigned' ? (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => updateMissionStatus(mission.id, 'confirmed')}
                            disabled={accepting === mission.id || !hasVehicle}
                            className="py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all"
                          >
                            {accepting === mission.id ? '...' : 'Approuver'}
                          </button>
                          <button
                            onClick={() => updateMissionStatus(mission.id, 'pending')}
                            disabled={accepting === mission.id || !hasVehicle}
                            className="py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700 text-rose-500 rounded-xl font-bold text-sm transition-all border border-slate-700"
                          >
                            {accepting === mission.id ? '...' : 'Décliner'}
                          </button>
                        </div>
                      ) : (
                        /* Status is confirmed */
                        (() => {
                          const today = new Date().toISOString().split('T')[0];
                          const isTooEarly = mission.delivery_date && mission.delivery_date > today;
                          
                          return (
                            <button
                              onClick={() => updateMissionStatus(mission.id, 'start')}
                              disabled={accepting === mission.id || !hasVehicle || isTooEarly}
                              className={cn(
                                "w-full py-4 rounded-2xl font-black text-base transition-all shadow-lg",
                                isTooEarly 
                                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
                                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                              )}
                            >
                              {accepting === mission.id ? '...' : 
                               isTooEarly ? `🔒 Disponible le ${new Date(mission.delivery_date).toLocaleDateString()}` :
                               '✓ Démarrer la mission'}
                            </button>
                          );
                        })()
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
