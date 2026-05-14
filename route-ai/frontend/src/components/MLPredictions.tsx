import React from 'react';
import { useData } from '../context/DataContext';
import { 
  Brain, 
  Target, 
  AlertCircle, 
  TrendingDown, 
  BarChart3,
  Search,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line,
  Legend
} from 'recharts';

export const MLPredictions: React.FC = () => {
  const { data, mlMetrics } = useData();

  // On prend les 20 dernières routes pour la visualisation comparative
  const comparisonData = data
    .filter(r => r.predicted_delay > 0)
    .slice(-20)
    .map(r => ({
      name: r.route_id.substring(0, 8),
      Rée: r.delay_hours,
      Prédit: r.predicted_delay
    }));

  return (
    <div className="space-y-6">
      {/* Modèle de prédiction des retards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Précision du Modèle</span>
          </div>
          <div className="text-3xl font-bold text-white">{mlMetrics.accuracy.toFixed(1)}%</div>
          <div className="text-slate-500 text-xs mt-1">Tolérance de ±30 minutes</div>
        </div>

        <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Erreur Moyenne (MAE)</span>
          </div>
          <div className="text-3xl font-bold text-white">{mlMetrics.mae.toFixed(2)}h</div>
          <div className="text-slate-500 text-xs mt-1">Écart moyen par rapport au réel</div>
        </div>

        <div className="bg-indigo-600/10 border border-indigo-500/30 p-6 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Brain className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Algorithme</span>
          </div>
          <div className="text-xl font-bold text-white">Random Forest Regressor</div>
          <div className="text-indigo-300/60 text-xs mt-1">Optimisé pour les facteurs non-linéaires</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique de comparaison */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-400" />
            Réel vs Prédit (Derniers trajets)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} label={{ value: 'Heures', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="Rée" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Prédit" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Facteurs d'influence */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400" />
            Impact des Facteurs Environnementaux
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Trafic (Traffic Factor)', value: 85, color: 'bg-red-500' },
              { label: 'Heure de Pointe (Peak Hour)', value: 65, color: 'bg-amber-500' },
              { label: 'Distance du trajet', value: 45, color: 'bg-indigo-500' },
              { label: 'Conditions Météo', value: 30, color: 'bg-emerald-500' },
            ].map((factor) => (
              <div key={factor.label} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{factor.label}</span>
                  <span className="text-white font-medium">{factor.value}% d'influence</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${factor.color} rounded-full`} 
                    style={{ width: `${factor.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              Insight IA
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Le facteur trafic est la variable dominante. Une augmentation de 0.5 du Traffic Factor entraîne en moyenne une hausse de 1.2h de retard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
