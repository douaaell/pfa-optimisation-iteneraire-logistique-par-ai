import React, { useEffect, useState } from 'react';
import { 
  Package, Clock, CheckCircle2, Navigation, TrendingUp, 
  PlusCircle, Search, Filter, AlertTriangle, BrainCircuit 
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { cn, formatCurrency } from '../../utils/cn';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', assigned: 'Assignée',
  accepted: 'Acceptée', in_progress: 'En cours', delivered: 'Livrée',
  optimized: 'Optimisée IA', near_destination: 'Arrivée Proche'
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  assigned: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  accepted: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  in_progress: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  optimized: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  near_destination: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export const ClientDashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { deliveries, fetchDeliveries } = useData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchDeliveries();
      setLoading(false);
    };
    load();
  }, [fetchDeliveries]);

  const stats = {
    total: deliveries.length,
    active: deliveries.filter(d => ['assigned', 'accepted', 'in_progress'].includes(d.status)).length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    pending: deliveries.filter(d => ['pending', 'confirmed'].includes(d.status)).length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            Tableau de Bord Client
          </h2>
          <p className="text-slate-400 mt-1">Gérez vos expéditions et suivez leur progression en temps réel.</p>
        </div>
        <button
          onClick={() => window.location.href = '/client/new'}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          <PlusCircle className="w-5 h-5" />
          Nouvelle Livraison
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Expéditions', value: stats.total, icon: Package, color: 'blue' },
          { label: 'En cours de route', value: stats.active, icon: Navigation, color: 'orange' },
          { label: 'Livrées avec succès', value: stats.delivered, icon: CheckCircle2, color: 'emerald' },
          { label: 'En attente IA', value: stats.pending, icon: Clock, color: 'amber' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 premium-shadow">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", 
              s.color === 'blue' ? 'bg-blue-500/10' : s.color === 'orange' ? 'bg-orange-500/10' : 
              s.color === 'emerald' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            )}>
              <s.icon className={cn("w-5 h-5", 
                s.color === 'blue' ? 'text-blue-400' : s.color === 'orange' ? 'text-orange-400' : 
                s.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'
              )} />
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{s.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{loading ? '...' : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent isolated deliveries */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Vos Expéditions Récentes</h3>
            <button onClick={() => window.location.href = '/client/deliveries'} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Voir toutes →</button>
          </div>
          <div className="space-y-3">
            {deliveries.slice(0, 5).map(d => (
              <div key={d.id} className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-indigo-400 border border-slate-800">#{d.id}</div>
                  <div>
                    <p className="text-sm font-bold text-white">{d.start_city} → {d.end_city}</p>
                    <p className="text-xs text-slate-500">{d.weight}kg · {d.priority} priority</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-bold">ETA</p>
                    <p className="text-sm font-bold text-white">{d.eta_minutes || '—'} min</p>
                  </div>
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase border", STATUS_STYLES[d.status])}>
                    {STATUS_LABELS[d.status]}
                  </span>
                </div>
              </div>
            ))}
            {deliveries.length === 0 && !loading && (
              <div className="py-12 text-center">
                <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">Aucune livraison trouvée.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Predictions side panel */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Alertes IA Prédictives</h3>
          </div>
          <div className="space-y-4">
            {deliveries.filter(d => d.predicted_delay > 0).slice(0, 4).map(d => (
              <div key={d.id} className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                <div className="flex items-center gap-2 text-rose-400 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Retard Prédit : +{d.predicted_delay}h</span>
                </div>
                <p className="text-sm font-medium text-white mb-2">Expédition #{d.id} vers {d.end_city}</p>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
            {deliveries.filter(d => d.predicted_delay > 0).length === 0 && (
              <div className="py-10 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-emerald-500">Toutes les routes sont fluides</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
