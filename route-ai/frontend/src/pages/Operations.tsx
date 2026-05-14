import React, { useState, useEffect, useCallback } from 'react';
import {
  Play, Zap, BarChart3, RefreshCw, CheckCircle2,
  AlertTriangle, Navigation, TrendingUp, Clock, DollarSign, MapPin
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, Radar
} from 'recharts';
import { cn } from '../utils/cn';

const ALGORITHMS = [
  { id: 'ortools', name: 'OR-Tools', color: '#3b82f6', desc: 'Solveur de contraintes pour VRP (Google).' },
  { id: 'genetic', name: 'Genetic Algorithm', color: '#10b981', desc: 'Approche évolutive pour la découverte d\'itinéraires.' },
  { id: 'hybrid', name: 'Hybrid IA', color: '#8b5cf6', desc: 'Combine heuristiques + optimisation locale.' },
  { id: 'rl', name: 'RL Agent', color: '#f59e0b', desc: 'Apprentissage par renforcement pour adaptation dynamique.' },
];

export const Operations: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState('hybrid');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [benchmark, setBenchmark] = useState<any>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));

  const loadPending = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/deliveries?role=admin&status=pending');
      if (res.ok) setPendingDeliveries(await res.json());
    } catch (e) {}
  }, []);

  const handleRun = async () => {
    if (!selectedDelivery) return;
    
    setIsRunning(true);
    setResult(null);
    setLogs([]); // Clear logs for new run
    
    addLog(`🚀 Initialisation du moteur LogiOptima pour LIV-${selectedDelivery.id}...`);
    addLog(`🔍 Analyse des contraintes: Poids=${selectedDelivery.weight}kg, Priorité=${selectedDelivery.priority}`);
    addLog(`📡 Appel du module ${ALGORITHMS.find(a => a.id === selectedAlgo)?.name}...`);
    
    // Simulate real-time logs
    setTimeout(() => addLog("🧬 Génération des populations (Génétique)..."), 500);
    setTimeout(() => addLog("📍 Calcul des matrices de distance Google Maps..."), 1200);
    setTimeout(() => addLog("✨ Recherche locale et raffinement de l'itinéraire..."), 2000);

    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/optimize/${selectedDelivery.id}?algo=${selectedAlgo}`,
        { method: 'POST' }
      );
      const data = await res.json();
      
      setTimeout(() => {
        // Flatten selected + metadata into a single result object for display
        const flatResult = {
          ...data.selected,
          algorithm: data.best_algorithm,
          start_city: selectedDelivery.start_city,
          end_city: selectedDelivery.end_city,
          weather_condition: data.selected.weather,   // API returns "weather", UI reads "weather_condition"
          algorithms: data.algorithms,
        };
        setResult(flatResult);
        addLog(`✅ Optimisation terminée avec succès.`);
        addLog(`🏆 Meilleure solution trouvée : ${data.selected.distance_km}km @ ${data.selected.cost} MAD`);
        addLog(`🔄 Statut de la livraison mis à jour : OPTIMIZED`);
        setIsRunning(false);
        loadPending();
        setSelectedDelivery(null);
        loadBenchmark();
      }, 2500);
    } catch (e) {
      addLog(`❌ Erreur critique : Échec de la connexion au moteur IA`);
      setIsRunning(false);
    }
  };

  const loadBenchmark = useCallback(async () => {
    setBenchmarkLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/benchmark');
      if (res.ok) setBenchmark(await res.json());
    } catch (e) {} finally {
      setBenchmarkLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadBenchmark(); 
    loadPending();
  }, [loadBenchmark, loadPending]);

  const benchmarkChartData = benchmark ? ALGORITHMS.map(a => ({
    name: a.name,
    'Distance moy. (km)': benchmark[a.id]?.avg_distance || 0,
    'Coût moy. (MAD)': benchmark[a.id]?.avg_cost || 0,
    'Retard moy. (h)': benchmark[a.id]?.avg_delay || 0,
  })) : [];

  const bestAlgo = benchmark?.best_algorithm;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            Centre d'Optimisation IA
          </h2>
          <p className="text-slate-400 mt-1">Lancez et comparez les algorithmes d'optimisation de routes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* LEFT: Run Optimization */}
        <div className="space-y-6">
          {/* Algorithm Selection */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Algorithme</h3>
            <div className="grid grid-cols-3 gap-3">
              {ALGORITHMS.map(algo => (
                <button
                  key={algo.id}
                  onClick={() => setSelectedAlgo(algo.id)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all text-left",
                    selectedAlgo === algo.id
                      ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                      : "border-slate-800 bg-slate-800/30 hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: algo.color }} />
                    {selectedAlgo === algo.id && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                  </div>
                  <p className="text-sm font-bold text-white">{algo.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{algo.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Real Deliveries Selection */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
              Livraisons en attente
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{pendingDeliveries.length} total</span>
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {pendingDeliveries.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm italic border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center not-italic text-slate-400">0</div>
                  Aucune livraison en attente.
                </div>
              ) : pendingDeliveries.map(d => (
                <div 
                  key={d.id}
                  onClick={() => setSelectedDelivery(d)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer group",
                    selectedDelivery?.id === d.id 
                      ? "border-indigo-500 bg-indigo-500/10" 
                      : "border-slate-800 bg-slate-800/20 hover:border-slate-700"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-400">LIV-{d.id}</span>
                    <span className="text-[10px] text-slate-500 font-mono italic">#{d.client_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {d.start_city} → {d.end_city}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-bold">{d.weight}kg</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold",
                        d.priority === 'high' ? "bg-rose-500/20 text-rose-400" : "bg-slate-800 text-slate-400"
                      )}>{d.priority.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleRun}
              disabled={isRunning || !selectedDelivery}
              className={cn(
                "w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg mt-4",
                isRunning || !selectedDelivery
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              )}
            >
              {isRunning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
              {isRunning ? 'Optimisation en cours...' : 'Lancer l\'optimisation métier'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-slate-900/50 border border-indigo-500/30 rounded-3xl p-6 space-y-4 shadow-lg shadow-indigo-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Résultat — {result.algorithm}</h3>
                  <p className="text-xs text-slate-500">{result.start_city} → {result.end_city}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-center">
                  <Navigation className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Distance</p>
                  <p className="text-lg font-bold text-white">{result.distance_km} km</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                  <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Coût estimé</p>
                  <p className="text-lg font-bold text-white">{result.cost} MAD</p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-center">
                  <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">ETA</p>
                  <p className="text-lg font-bold text-white">{result.eta_minutes} min</p>
                </div>
              </div>
              <div className={cn("flex items-center gap-3 p-4 rounded-2xl", result.predicted_delay > 0 ? "bg-rose-500/10 border border-rose-500/20" : "bg-emerald-500/10 border border-emerald-500/20")}>
                {result.predicted_delay > 0 ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-rose-400">Retard prédit: +{result.predicted_delay}h</p>
                      {result.adaptation_message && <p className="text-xs text-rose-300 mt-0.5">{result.adaptation_message}</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-sm font-bold text-emerald-400">Conditions optimales — aucun retard prévu</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="px-2 py-1 rounded bg-slate-800 font-bold">Trafic: ×{result.traffic_factor}</span>
                <span className="px-2 py-1 rounded bg-slate-800 font-bold">Météo: {result.weather_condition}</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Benchmark + Logs */}
        <div className="space-y-6">
          {/* Benchmark from CSV */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-400" />
                Benchmark IA (Dataset CSV)
              </h3>
              <button onClick={loadBenchmark} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-white transition-all">
                <RefreshCw className={cn("w-4 h-4", benchmarkLoading && "animate-spin")} />
              </button>
            </div>

            {bestAlgo && (
              <div className="mb-4 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Meilleur algorithme (coût)</p>
                  <p className="text-sm font-bold text-white capitalize">{bestAlgo === 'ortools' ? 'OR-Tools' : bestAlgo === 'genetic' ? 'Genetic Algorithm' : 'Hybrid IA'}</p>
                </div>
              </div>
            )}

            {benchmarkChartData.length > 0 && (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkChartData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} width={90} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Coût moy. (MAD)" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Retard moy. (h)" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Summary table */}
            {benchmark && (
              <div className="mt-4 space-y-2">
                {ALGORITHMS.map(a => {
                  const b = benchmark[a.id];
                  if (!b) return null;
                  return (
                    <div key={a.id} className={cn(
                      "flex items-center justify-between p-3 rounded-xl",
                      bestAlgo === a.id ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-slate-800/30"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                        <span className="text-sm font-bold text-white">{a.name}</span>
                        {bestAlgo === a.id && <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold">BEST</span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>{b.avg_distance} km</span>
                        <span className="text-emerald-400 font-bold">{b.avg_cost} MAD</span>
                        <span className="text-rose-400">+{b.avg_delay}h</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Execution Logs */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Logs d'exécution</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Lancez une optimisation pour voir les logs...</p>
              ) : logs.map((log, i) => (
                <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-slate-950/50 text-xs font-mono">
                  <span className={log.includes('❌') ? 'text-rose-400' : log.includes('⚠️') ? 'text-amber-400' : log.includes('✅') ? 'text-emerald-400' : 'text-indigo-400'}>›</span>
                  <span className="text-slate-300">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
