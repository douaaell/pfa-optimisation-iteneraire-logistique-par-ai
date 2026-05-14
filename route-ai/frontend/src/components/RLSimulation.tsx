import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Navigation, 
  AlertCircle,
  TrendingUp,
  Cpu,
  History
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

interface SimulationStep {
  step: number;
  reward: number;
  delay: number;
  action: string;
}

export const RLSimulation: React.FC = () => {
  const { data } = useData();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [history, setHistory] = useState<SimulationStep[]>([]);
  const [agentState, setAgentState] = useState({
    traffic: 1.0,
    delay: 0,
    position: 'Dépôt',
    reward: 0
  });

  const runStep = useCallback(() => {
    if (currentStep >= 50) {
      setIsRunning(false);
      return;
    }

    // Simulation de l'environnement basée sur un trajet aléatoire du CSV
    const randomRoute = data[Math.floor(Math.random() * data.length)];
    const traffic = (randomRoute?.traffic_factor || 1.0) + (Math.random() * 0.4 - 0.2);
    
    // Logique de décision RL (Simplifiée pour la démo PFA)
    // L'agent "choisit" une action pour minimiser le retard
    let action = "Maintenir l'itinéraire";
    let reward = 0;
    let newDelay = agentState.delay + (traffic > 1.5 ? 0.5 : 0.1);

    if (traffic > 1.4) {
      action = "Reroutage Dynamique (Voie B)";
      newDelay -= 0.4; // L'action de reroutage réduit le retard potentiel
      reward = 10; // Récompense positive pour avoir évité le trafic
    } else {
      reward = 2; // Récompense de base pour avancer
    }

    const newStep: SimulationStep = {
      step: currentStep,
      reward: agentState.reward + reward,
      delay: Math.max(0, newDelay),
      action
    };

    setAgentState({
      traffic,
      delay: newStep.delay,
      position: `Point ${currentStep + 1}`,
      reward: newStep.reward
    });

    setHistory(prev => [...prev, newStep].slice(-30));
    setCurrentStep(prev => prev + 1);
  }, [currentStep, agentState, data]);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(runStep, 800);
    }
    return () => clearInterval(interval);
  }, [isRunning, runStep]);

  const resetSim = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setHistory([]);
    setAgentState({ traffic: 1.0, delay: 0, position: 'Dépôt', reward: 0 });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Agent RL - Adaptation Dynamique</h3>
            <p className="text-indigo-300/60 text-xs">Deep Q-Learning Simulation (Reroutage en temps réel)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`p-2 rounded-lg transition-all ${isRunning ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button 
            onClick={resetSim}
            className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State Panel */}
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">État de l'Environnement</span>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Trafic Actuel</span>
                <span className={`text-sm font-mono ${agentState.traffic > 1.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                  x{agentState.traffic.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Position</span>
                <span className="text-white text-sm font-medium">{agentState.position}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Retard accumulé</span>
                <span className="text-amber-400 text-sm font-mono">{agentState.delay.toFixed(1)}h</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-indigo-300 text-xs font-bold uppercase">Récompense Totale</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">{agentState.reward} pts</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[140px]">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Dernière Décision</span>
            </div>
            {history.length > 0 ? (
              <div className="animate-in slide-in-from-left duration-300">
                <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
                  <Zap className="w-3 h-3" />
                  {history[history.length - 1].action}
                </div>
                <p className="text-slate-500 text-[10px]">
                  Action choisie pour maximiser la récompense future à l'étape {currentStep}.
                </p>
              </div>
            ) : (
              <p className="text-slate-700 text-xs italic">En attente du démarrage...</p>
            )}
          </div>
        </div>

        {/* Chart Panel */}
        <div className="lg:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Évolution de la Récompense RL</span>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-[10px] text-slate-400">Reward</span>
              </div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorReward" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="step" stroke="#475569" fontSize={10} hide />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reward" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorReward)" 
                  strokeWidth={3}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
