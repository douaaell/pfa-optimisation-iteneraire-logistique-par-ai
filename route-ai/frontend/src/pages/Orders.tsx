import React, { useEffect, useState } from 'react';
import { 
  Package, Search, Filter, MoreVertical, MapPin, 
  Clock, Truck, CheckCircle2, AlertCircle, RefreshCw,
  UserCheck, BrainCircuit, Calendar, Navigation, X
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { cn } from '../utils/cn';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  assigned: 'Assigné',
  accepted: 'Accepté',
  in_progress: 'En cours',
  delivered: 'Livré',
  cancelled: 'Refusé/Annulé',
  optimized: 'Optimisée IA',
  near_destination: 'Arrivée Proche',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  assigned: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  accepted: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  in_progress: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  optimized: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  near_destination: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export const Orders: React.FC = () => {
  const { deliveries, fetchDeliveries } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  
  // AI Dispatch Modal State
  const [dispatchModalDelivery, setDispatchModalDelivery] = useState<any | null>(null);

  useEffect(() => {
    fetchDeliveries();
    fetch('http://localhost:8000/api/admin/drivers')
      .then(r => r.json())
      .then(setDrivers);
  }, [fetchDeliveries]);

  const handleAssign = async (deliveryId: number, driverId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/deliveries/${deliveryId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId })
      });
      if (res.ok) {
        await fetchDeliveries();
        setDispatchModalDelivery(null);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateStatus = async (deliveryId: number, status: string) => {
    if (status === 'cancelled' && !window.confirm("Voulez-vous vraiment refuser cette livraison ?")) return;
    setLoading(true);
    try {
      await fetch(`http://localhost:8000/api/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await fetchDeliveries();
    } finally {
      setLoading(false);
    }
  };

  const filtered = deliveries.filter(d => {
    const matchesSearch = 
      (d.id.toString().includes(searchTerm)) ||
      (d.start_address?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.end_address?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.client_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.company_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === '' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate AI Recommendations
  const getDriverRecommendations = (delivery: any) => {
    return drivers.map(driver => {
      let score = 100;
      let reasons = [];
      let isAvailable = true;

      // 1. Validation Spatio-Temporelle (Calendrier)
      // On cherche si le conducteur a déjà une livraison le même jour
      const driverDeliveries = deliveries.filter(d => d.driver_id === driver.id && d.status !== 'delivered');
      const sameDayDelivery = driverDeliveries.find(d => d.delivery_date === delivery.delivery_date);
      
      if (sameDayDelivery) {
        // Conflit horaire (Simplifié pour la démo)
        if (sameDayDelivery.time_window_open === delivery.time_window_open) {
          isAvailable = false;
          score = 0;
          reasons.push("Conflit horaire exact");
        } else {
          score -= 40;
          reasons.push("A déjà une tournée ce jour-là");
        }
      } else {
        reasons.push("Calendrier 100% libre");
      }

      // 2. Matching par Proximité Prédictive (Backhauling)
      if (driver.assigned_vehicle_id) {
        reasons.push("Possède un véhicule assigné");
      } else {
        score -= 80;
        isAvailable = false;
        reasons.push("Aucun véhicule assigné");
      }

      // Simulation de proximité (Si on avait les vraies coordonnées en continu)
      // Pour la démo, on simule un score aléatoire basé sur l'ID pour le backhauling
      if (isAvailable && !sameDayDelivery) {
        const distanceSimulee = (driver.id * 17) % 150; // Random 0-150 km
        if (distanceSimulee < 20) {
          reasons.push("Fret de retour (Backhauling parfait)");
        } else if (distanceSimulee < 80) {
          score -= 10;
          reasons.push(`Proximité acceptable (~${distanceSimulee}km)`);
        } else {
          score -= 30;
          reasons.push(`Trajet à vide long (~${distanceSimulee}km)`);
        }
      }

      return { ...driver, matchScore: Math.max(0, score), reasons, isAvailable };
    }).sort((a, b) => b.matchScore - a.matchScore);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Gestion des Livraisons</h2>
          <p className="text-slate-400 mt-1">Supervision et Assignation par Intelligence Artificielle.</p>
        </div>
        <button onClick={() => fetchDeliveries()} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">
          <RefreshCw className={cn("w-5 h-5 text-slate-400", loading && "animate-spin")} />
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" placeholder="Rechercher ID, ville, client..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <select 
          value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-950/50 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/30">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Livraison</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date & Heure</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Trajet</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Chauffeur</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map(d => (
                <React.Fragment key={d.id}>
                  <tr 
                    onClick={() => setExpandedRow(expandedRow === d.id ? null : d.id)}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400">#{d.id}</div>
                        <div>
                          <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border mb-1 inline-block", STATUS_STYLES[d.status])}>
                            {STATUS_LABELS[d.status]}
                          </span>
                          <p className="text-xs text-slate-500 font-bold">{d.weight} kg • {d.priority}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {d.delivery_date || 'Non spécifiée'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {d.time_window_open ? `${d.time_window_open} - ${d.time_window_close}` : 'Aucune fenêtre'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate max-w-[200px] font-medium">{d.start_city} <ArrowRight className="inline w-3 h-3 mx-1 text-slate-600"/> {d.end_city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {d.driver_name ? (
                        <div className="flex items-center gap-2 text-sm text-indigo-400 font-medium">
                          <Truck className="w-4 h-4" />
                          {d.driver_name}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest bg-slate-800/50 px-2 py-1 rounded-md">Non assigné</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {d.status === 'optimized' && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 italic">
                            En attente de validation client
                          </span>
                        )}
                        {(d.status === 'confirmed' || d.status === 'assigned') && (
                          <button 
                            onClick={() => setDispatchModalDelivery(d)}
                            className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 font-bold text-[10px] rounded-lg transition-all flex items-center gap-2"
                            title={d.status === 'assigned' ? "Changer de chauffeur" : "Assigner un chauffeur"}
                          >
                            <BrainCircuit className="w-3.5 h-3.5" />
                            {d.status === 'assigned' ? 'Ré-assigner' : 'IA Dispatch'}
                          </button>
                        )}
                        
                        {(d.status === 'pending' || d.status === 'optimized' || d.status === 'confirmed' || d.status === 'assigned') && (
                          <button 
                            onClick={() => handleUpdateStatus(d.id, 'cancelled')}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-lg transition-all"
                            title="Annuler la livraison"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        
                        {d.status !== 'pending' && d.status !== 'assigned' && (
                          <button className="p-2 text-slate-600 hover:text-white transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Details Panel */}
                  {expandedRow === d.id && (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 bg-slate-950/40 border-y border-slate-800/50 animate-in slide-in-from-top duration-300">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                          <div className="space-y-4">
                            <div><p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Client</p><p className="text-sm font-medium text-white mt-1">{d.client_name || d.company_name || 'Inconnu'}</p></div>
                            <div><p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Téléphone</p><p className="text-sm text-slate-300 mt-1">{d.client_phone || 'Non renseigné'}</p></div>
                          </div>
                          <div className="space-y-4">
                            <div><p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Départ</p><p className="text-sm text-slate-300 mt-1">{d.start_address}</p></div>
                            <div><p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Destination</p><p className="text-sm text-slate-300 mt-1">{d.end_address}</p></div>
                          </div>
                          <div className="space-y-4">
                            <div><p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Analyse IA (Trafic)</p><p className="text-sm text-slate-300 mt-1">Facteur: {d.traffic_factor}x</p></div>
                            <div><p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Analyse IA (Météo)</p><p className="text-sm text-slate-300 mt-1">{d.weather_condition}</p></div>
                          </div>
                          <div className="space-y-4">
                            <div><p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Retard Prédit</p><p className="text-sm text-rose-400 mt-1">+{d.predicted_delay} heures</p></div>
                            <div><p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Distance Réelle</p><p className="text-sm text-slate-300 mt-1">{d.distance_km} km</p></div>
                          </div>
                          <div className="space-y-4">
                            <div><p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Coût Facturé</p><p className="text-lg font-bold text-emerald-400 mt-1">{d.cost} MAD</p></div>
                            <div><p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Durée Est.</p><p className="text-sm text-slate-300 mt-1">{d.duration_text}</p></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Dispatch Modal */}
      {dispatchModalDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">IA Dispatch & Validation</h3>
                  <p className="text-xs text-slate-400">Mission #{dispatchModalDelivery.id} • {dispatchModalDelivery.delivery_date || 'Date non spécifiée'}</p>
                </div>
              </div>
              <button onClick={() => setDispatchModalDelivery(null)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {getDriverRecommendations(dispatchModalDelivery).map((drv, i) => (
                <div key={drv.id} className={cn(
                  "p-4 rounded-2xl border transition-all flex items-center justify-between",
                  drv.matchScore >= 80 ? "bg-emerald-500/5 border-emerald-500/20" : 
                  drv.matchScore >= 50 ? "bg-indigo-500/5 border-indigo-500/20" : 
                  "bg-slate-800/20 border-slate-800 opacity-75"
                )}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900", drv.isAvailable ? "bg-emerald-500" : "bg-rose-500")} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        {drv.name}
                        {i === 0 && drv.isAvailable && <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-400">Recommandé</span>}
                      </p>
                      <div className="text-[10px] mt-1 space-y-0.5">
                        {drv.reasons.map((r: string, idx: number) => (
                          <p key={idx} className={cn(
                            "flex items-center gap-1",
                            r.includes("Conflit") || r.includes("Aucun véhicule") ? "text-rose-400" : "text-slate-400"
                          )}>
                            • {r}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Match Score</span>
                      <span className={cn(
                        "text-lg font-black",
                        drv.matchScore >= 80 ? "text-emerald-400" : drv.matchScore >= 50 ? "text-indigo-400" : "text-slate-500"
                      )}>{drv.matchScore}%</span>
                    </div>
                    <button 
                      disabled={!drv.isAvailable || loading}
                      onClick={() => handleAssign(dispatchModalDelivery.id, drv.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-lg transition-all"
                    >
                      {loading ? '...' : 'Assigner'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for ArrowRight icon
const ArrowRight = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
