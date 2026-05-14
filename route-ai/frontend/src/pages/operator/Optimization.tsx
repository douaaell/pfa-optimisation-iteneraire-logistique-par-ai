import React, { useState } from 'react';
import { 
  Zap, 
  Settings2, 
  Map as MapIcon, 
  Clock, 
  Activity, 
  Play, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const algorithms = [
  { id: 'nn', name: 'Nearest Neighbor', complexity: 'Low', desc: 'Fast, greedy heuristic for initial routing.' },
  { id: 'ga', name: 'Genetic Algorithm', complexity: 'Medium', desc: 'Population-based search for global optima.' },
  { id: 'ql', name: 'Q-Learning (RL)', complexity: 'High', desc: 'Reinforcement learning for dynamic traffic adaptation.' },
  { id: 'hybrid', name: 'Hybrid AI', complexity: 'High', desc: 'State-of-the-art combined heuristic-ML model.' },
];

export const Optimization: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState('hybrid');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runOptimization = () => {
    setIsOptimizing(true);
    // Simulate complex calculation
    setTimeout(() => {
      setIsOptimizing(false);
      setResults({
        distance: 124.5,
        time: 182,
        delayReduction: '24%',
        efficiency: 98.2,
        chartData: [
          { name: 'Initial', val: 100 },
          { name: 'Optimized', val: 76 }
        ]
      });
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">AI Engine Optimization</h2>
          <p className="text-slate-400">Select and run advanced algorithms to minimize logistics overhead.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {algorithms.map((algo) => (
          <div 
            key={algo.id}
            onClick={() => setSelectedAlgo(algo.id)}
            className={cn(
              "p-6 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
              selectedAlgo === algo.id 
                ? "bg-emerald-600/10 border-emerald-500 shadow-xl shadow-emerald-500/10" 
                : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
            )}
          >
            <div className={cn(
              "absolute top-0 right-0 p-1 text-[10px] font-bold uppercase px-3 rounded-bl-xl",
              algo.complexity === 'High' ? "bg-rose-500 text-white" : "bg-blue-500 text-white"
            )}>
              {algo.complexity}
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", selectedAlgo === algo.id ? "bg-emerald-600" : "bg-slate-800")}>
                <Zap className={cn("w-5 h-5", selectedAlgo === algo.id ? "text-white" : "text-slate-400")} />
              </div>
            </div>
            <h3 className="text-white font-bold mb-2">{algo.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{algo.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-emerald-500" />
            Control Parameters
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Fleet Capacity</label>
              <input type="number" placeholder="20000 kg" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time Window Slack</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                <option>Strict (0 min)</option>
                <option>Flexible (15 min)</option>
                <option>Dynamic Adaptation</option>
              </select>
            </div>
            <div className="pt-4">
              <button 
                onClick={runOptimization}
                disabled={isOptimizing}
                className={cn(
                  "w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20",
                  isOptimizing && "animate-pulse"
                )}
              >
                {isOptimizing ? <Activity className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                {isOptimizing ? "Processing AI Layers..." : "Run Engine"}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Optimization Results</h3>
            {results && <div className="text-xs font-bold text-emerald-500 px-3 py-1 bg-emerald-500/10 rounded-full">Convergence Achieved</div>}
          </div>

          {!results ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 py-12 gap-4">
              <MapIcon className="w-16 h-16 opacity-20" />
              <p>Configure and run the engine to see optimized results.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
              <div className="space-y-6">
                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-slate-400">Total Travel Time</span>
                  </div>
                  <span className="text-white font-bold">{results.time} mins</span>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-slate-400">Efficiency Gain</span>
                  </div>
                  <span className="text-emerald-500 font-bold">{results.delayReduction}</span>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-200 leading-relaxed">
                    AI detected high traffic on <strong>Node 42</strong>. RL agent redirected 4 vehicles to secondary corridors.
                  </p>
                </div>
              </div>
              
              <div className="h-[250px] bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 text-center">Distance Comparison (km)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.chartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#1e293b' }} />
                    <Bar dataKey="val" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
