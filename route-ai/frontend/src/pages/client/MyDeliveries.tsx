import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, Search, MapPin, Clock, AlertTriangle,
  ChevronRight, Filter, RefreshCw, Navigation, Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useData } from '../../context/DataContext';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', assigned: 'Assignée',
  accepted: 'Acceptée', in_progress: 'En cours', delivered: 'Livrée',
  cancelled: 'Refusée/Annulée', optimized: 'Optimisée IA', near_destination: 'Arrivée Proche'
};
const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  assigned: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  accepted: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  in_progress: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  optimized: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  near_destination: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export const MyDeliveries: React.FC = () => {
  const { deliveries, fetchDeliveries, isLoading: loading } = useData();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const filtered = deliveries.filter(d => {
    const matchSearch = !search ||
      String(d.id).includes(search) ||
      (d.start_address || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.end_address || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await fetch(`http://localhost:8000/api/deliveries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await fetchDeliveries();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Mes livraisons</h2>
          <p className="text-slate-400">Gérez et suivez toutes vos expéditions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchDeliveries()} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => window.location.href = '/client/new'}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all"
          >
            + Nouvelle livraison
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher ID ou ville..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-64"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="text-xs text-slate-500 font-bold">{filtered.length} résultat(s)</span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-24 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-10 text-white" />
            <p className="text-slate-500">Aucune livraison trouvée</p>
            <button
              onClick={() => window.location.href = '/client/new'}
              className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all"
            >
              Créer ma première livraison
            </button>
          </div>
        ) : filtered.map(d => (
          <div key={d.id} className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden hover:border-indigo-500/20 transition-all">
            {/* Main row */}
            <div
              onClick={() => setExpanded(expanded === d.id ? null : d.id)}
              className="flex items-center gap-4 p-5 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                #{d.id}
              </div>
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Trajet</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="text-sm font-medium text-white truncate">{d.start_city} → {d.end_city}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">IA / Distance</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {d.distance_km ? (
                      <><Navigation className="w-3 h-3 text-blue-400" /><span className="text-sm text-slate-300">{d.distance_km} km · {d.eta_minutes} min</span></>
                    ) : <span className="text-sm text-slate-600 italic">Non calculé</span>}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Coût estimé</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {d.cost ? (
                      <>
                        <span className="text-sm font-bold text-emerald-400">{Number(d.cost).toFixed(0)} MAD</span>
                        {d.distance_km && d.status === 'optimized' && (
                          <span className="text-xs font-medium text-slate-500 line-through" title="Ancien prix standard">
                            {Math.round(d.distance_km * 10.5)} MAD
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-slate-500">—</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase border", STATUS_STYLES[d.status])}>
                    {STATUS_LABELS[d.status] || d.status}
                  </span>
                  {d.predicted_delay > 0 && (
                    <span className="text-[9px] text-rose-400 font-bold flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" />+{d.predicted_delay}h
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className={cn("w-4 h-4 text-slate-600 transition-transform shrink-0", expanded === d.id && "rotate-90")} />
            </div>

            {/* Expanded details */}
            {expanded === d.id && (
              <div className="border-t border-slate-800/50 px-5 pb-5 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/30 animate-in fade-in duration-300">
                {[
                  { label: 'Date souhaitée', value: d.delivery_date || 'Non spécifiée' },
                  { label: 'Fenêtre horaire', value: d.time_window_open ? `${d.time_window_open} — ${d.time_window_close}` : 'Non spécifiée' },
                  { label: 'Priorité', value: d.priority },
                  { label: 'Poids', value: `${d.weight} kg` },
                  { label: 'Conducteur', value: d.driver_name ? `${d.driver_name} (${d.driver_phone || 'Pas de tel'})` : 'Non assigné' },
                  { label: 'Date de livraison', value: d.status === 'delivered' ? (d.delivered_at ? new Date(d.delivered_at).toLocaleString() : 'Confirmée') : 'En attente' },
                  { label: 'Météo', value: d.weather_condition || '—' },
                  { label: 'Trafic ×', value: d.traffic_factor || '—' },
                  { label: 'Algorithme IA', value: d.algorithm_used || 'hybrid' },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">{item.label}</p>
                    <p className="text-sm text-slate-300 mt-0.5 font-medium capitalize">{item.value}</p>
                  </div>
                ))}
                
                {d.status === 'optimized' && (
                  <div className="col-span-2 md:col-span-4 mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-end gap-3">
                    <p className="text-sm text-slate-400 flex-1">Le devis a été généré par l'IA. Veuillez l'approuver pour lancer l'assignation du chauffeur.</p>
                    <button 
                      onClick={() => handleUpdateStatus(d.id, 'cancelled')}
                      className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl font-bold text-sm transition-all"
                    >
                      Refuser
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(d.id, 'confirmed')}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
                    >
                      Accepter le devis
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
