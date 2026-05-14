import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Map as MapIcon, CloudRain, Sun, Wind, Zap, Info, RefreshCw, Truck, Navigation
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { RealMap } from '../../components/RealMap';

export const Simulation: React.FC = () => {
  const [weather, setWeather] = useState('Clear');
  const [traffic, setTraffic] = useState(1.0);
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActive = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/simulation/active');
      if (res.ok) setActiveMissions(await res.json());
    } catch (e) {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchActive]);

  const mapMarkers = activeMissions.map(m => ({
    position: [m.current_lat || m.start_lat, m.current_lng || m.start_lng] as [number, number],
    label: `${m.driver_name} - LIV-${m.id} (${m.status})`
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header with Env Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
            Simulation IA Opérationnelle
          </h2>
          <p className="text-slate-400 mt-1">Suivi temps réel et contrôle de l'environnement des livraisons actives.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
            {[
              { id: 'Clear', icon: Sun, color: 'text-amber-400' },
              { id: 'Rain', icon: CloudRain, color: 'text-blue-400' },
              { id: 'Windy', icon: Wind, color: 'text-slate-400' }
            ].map((w) => (
              <button 
                key={w.id}
                onClick={() => setWeather(w.id)}
                className={cn(
                  "p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold",
                  weather === w.id ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <w.icon className={cn("w-4 h-4", weather === w.id && w.color)} />
                {w.id}
              </button>
            ))}
          </div>
          <button onClick={fetchActive} className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all">
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Live Map */}
        <div className="xl:col-span-2 space-y-6">
          <div className="h-[550px] w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <RealMap markers={mapMarkers} center={[33.5731, -7.5898]} zoom={6} />
            
            {/* Map Overlay Info */}
            <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-xl">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Statut Environnement</p>
              <div className="space-y-2">
                <div className="flex justify-between gap-8">
                  <span className="text-xs text-slate-400">Trafic</span>
                  <span className="text-xs font-bold text-emerald-400">Fluide (x1.0)</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-xs text-slate-400">Météo</span>
                  <span className="text-xs font-bold text-amber-400">{weather}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Missions List in Simulation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMissions.length === 0 ? (
              <div className="col-span-2 py-12 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl text-center">
                <Truck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">Aucune mission active à simuler.</p>
              </div>
            ) : activeMissions.map(m => (
              <div key={m.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                      <Truck className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">LIV-{m.id}</h4>
                      <p className="text-[10px] text-slate-500">{m.driver_name}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/20">
                    {m.status}
                  </span>
                </div>
                <div className="space-y-2">
                   <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Trafic détecté</span>
                    <span className="text-white font-mono">x{m.traffic_factor}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Retard estimé</span>
                    <span className="text-rose-400 font-bold">+{m.predicted_delay}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Controls & Logic */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Intelligence Adaptation
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Densité du Trafic (x{traffic.toFixed(1)})</label>
                <input 
                  type="range" min="1" max="3" step="0.1" 
                  value={traffic} onChange={e => setTraffic(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-2 uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5" />
                  Effet IA
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  L'algorithme de Reinforcement Learning surveille les capteurs de trafic. 
                  Si le trafic dépasse **x1.8**, l'IA proposera automatiquement un reroutage pour LIV-{activeMissions[0]?.id || '...'}.
                </p>
                {traffic > 1.8 && activeMissions.length > 0 && (
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-bounce">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-2">
                      <Zap className="w-3 h-3 fill-current" /> New optimized route generated
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-slate-500" />
              Logs Temps Réel
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {activeMissions.map((m, i) => (
                <div key={i} className="flex gap-3 text-[10px] font-mono text-slate-500 border-l border-slate-800 pl-3">
                  <span className="text-indigo-500">[{new Date().toLocaleTimeString()}]</span>
                  Agent {m.driver_name} : Itinéraire stable, météo {weather}.
                </div>
              ))}
              {activeMissions.length === 0 && <p className="text-xs text-slate-600 italic">En attente de livraisons actives...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
