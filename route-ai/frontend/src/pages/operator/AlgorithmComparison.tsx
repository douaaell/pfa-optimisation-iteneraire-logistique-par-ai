import React from 'react';
import { AlgorithmBenchmark } from '../../components/AlgorithmBenchmark';
import { Award, ShieldCheck, Microscope } from 'lucide-react';

export const AlgorithmComparison: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Microscope className="w-8 h-8 text-indigo-500" />
            Benchmark Multi-Algorithmes
          </h2>
          <p className="text-slate-400">Évaluation quantitative des performances : Heuristiques vs Intelligence Artificielle.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right">Meilleure Performance</span>
            <span className="text-emerald-400 font-bold flex items-center gap-2">
              <Award className="w-4 h-4" />
              Approche Hybride PFA
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            title: "Optimisation de Distance", 
            desc: "Réduction des kilomètres parcourus via l'algorithme génétique hybridé.",
            icon: ShieldCheck,
            color: "text-blue-400"
          },
          { 
            title: "Minimisation des Retards", 
            desc: "Prédiction ML intégrée pour ajuster les routes avant l'apparition des bouchons.",
            icon: ShieldCheck,
            color: "text-indigo-400"
          },
          { 
            title: "Rentabilité Maximale", 
            desc: "Équilibre entre coût de carburant et satisfaction client (ponctualité).",
            icon: ShieldCheck,
            color: "text-emerald-400"
          }
        ].map((item, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex gap-4 items-start">
            <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Benchmark Component */}
      <section className="animate-in slide-in-from-bottom duration-1000">
        <AlgorithmBenchmark />
      </section>

      {/* Methodology Section */}
      <div className="bg-slate-900/30 border border-slate-800/50 p-8 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-4">Note Méthodologique</h3>
        <p className="text-slate-400 text-sm leading-relaxed max-w-4xl">
          Les résultats affichés sont consolidés à partir du traitement des données réelles importées via le fichier CSV. 
          L'approche <strong>Hybride PFA</strong> combine la puissance de recherche globale des Algorithmes Génétiques avec 
          la finesse prédictive du Random Forest, permettant une anticipation des retards de trafic là où les algorithmes 
          traditionnels (OR-Tools) restent réactifs et statiques.
        </p>
      </div>
    </div>
  );
};
