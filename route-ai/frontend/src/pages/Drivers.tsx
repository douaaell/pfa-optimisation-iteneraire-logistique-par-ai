import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck, Star, UserSquare2, RefreshCw, CheckCircle2,
  MapPin, Package, Plus, X, Navigation, Edit2, Trash2, History,
  Mail, Phone, Briefcase, Building, AlertTriangle
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useData } from '../context/DataContext';

const DRIVER_STATUS: Record<string, { label: string; style: string }> = {
  available: { label: 'Disponible', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  on_mission: { label: 'En mission', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  offline: { label: 'Hors ligne', style: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const VEHICLE_STATUS: Record<string, { label: string; style: string }> = {
  available: { label: 'Disponible', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  on_delivery: { label: 'En livraison', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  maintenance: { label: 'Maintenance', style: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  inactive: { label: 'Inactif', style: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

export const Drivers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'fleet' | 'clients'>('drivers');
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { deliveries } = useData();
  
  // Driver states
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  
  // Vehicle states
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicleHistory, setSelectedVehicleHistory] = useState<any>(null);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_name: '',
    vehicle_type: '',
    capacity: 0,
    status: 'available',
    assigned_driver_id: '',
    current_location: ''
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [drvRes, vehRes, cliRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/drivers'),
        fetch('http://localhost:8000/api/admin/vehicles'),
        fetch('http://localhost:8000/api/admin/clients'),
      ]);
      if (drvRes.ok) setDrivers(await drvRes.json());
      if (vehRes.ok) setVehicles(await vehRes.json());
      if (cliRes.ok) setClients(await cliRes.json());
    } catch (e) { console.error("Failed to load data", e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openMissions = async (driver: any) => {
    setSelectedDriver(driver);
    setMissions([]);
    try {
      const res = await fetch(`http://localhost:8000/api/drivers/${driver.id}/missions`);
      if (res.ok) setMissions(await res.json());
    } catch (e) {}
  };

  const openVehicleModal = (v: any = null) => {
    if (v) {
      setEditingVehicle(v);
      setVehicleForm({
        vehicle_name: v.vehicle_name,
        vehicle_type: v.vehicle_type,
        capacity: v.capacity,
        status: v.status,
        assigned_driver_id: v.assigned_driver_id || '',
        current_location: v.current_location || ''
      });
    } else {
      setEditingVehicle(null);
      setVehicleForm({
        vehicle_name: '',
        vehicle_type: '',
        capacity: 0,
        status: 'available',
        assigned_driver_id: '',
        current_location: ''
      });
    }
    setIsVehicleModalOpen(true);
  };

  const saveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...vehicleForm,
      capacity: Number(vehicleForm.capacity),
      assigned_driver_id: vehicleForm.assigned_driver_id ? Number(vehicleForm.assigned_driver_id) : null
    };

    const url = editingVehicle ? `http://localhost:8000/api/admin/vehicles/${editingVehicle.id}` : 'http://localhost:8000/api/admin/vehicles';
    const method = editingVehicle ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setIsVehicleModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteVehicle = async (id: number) => {
    if(!window.confirm("Supprimer ce véhicule ?")) return;
    try {
      await fetch(`http://localhost:8000/api/admin/vehicles/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {}
  };

  const deleteDriver = async (id: number) => {
    if(!window.confirm("Supprimer ce conducteur ? Cette action est irréversible.")) return;
    try {
      await fetch(`http://localhost:8000/api/admin/drivers/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteClient = async (id: number) => {
    if(!window.confirm("Supprimer ce client ? Toutes ses livraisons seront également supprimées.")) return;
    try {
      await fetch(`http://localhost:8000/api/admin/clients/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const driverStats = {
    total: drivers.length,
    available: drivers.filter(d => d.status === 'available').length,
    onMission: drivers.filter(d => d.status === 'on_mission').length,
    avgRating: drivers.length > 0 ? (drivers.reduce((a, d) => a + (d.rating || 0), 0) / drivers.length).toFixed(1) : '—',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Ressources & Flotte</h2>
          <p className="text-slate-400">Gestion des conducteurs, clients et des véhicules</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/50 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setActiveTab('drivers')}
              className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'drivers' ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white")}
            >
              Conducteurs
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'fleet' ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white")}
            >
              Flotte
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'clients' ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white")}
            >
              Clients
            </button>
          </div>
          <button onClick={load} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
            <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
          </button>
          {activeTab === 'fleet' && (
            <button onClick={() => openVehicleModal()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-600/20">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          )}
        </div>
      </div>

      {activeTab === 'drivers' ? (
        <>
          {/* Driver KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total conducteurs', value: driverStats.total, color: 'text-white' },
              { label: 'Disponibles', value: driverStats.available, color: 'text-emerald-400' },
              { label: 'En mission', value: driverStats.onMission, color: 'text-blue-400' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{s.label}</p>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Driver Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 animate-pulse">
                  <div className="w-12 h-12 bg-slate-800 rounded-full mb-4" />
                  <div className="h-4 bg-slate-800 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              ))
            ) : drivers.map(driver => {
              const statusInfo = DRIVER_STATUS[driver.status] || DRIVER_STATUS.offline;
              return (
                <div key={driver.id} className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {(driver.name || 'D').charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{driver.name}</h4>
                          <p className="text-xs text-slate-500 font-mono">ID-{String(driver.id).padStart(3, '0')}</p>
                        </div>
                      </div>
                      <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusInfo.style)}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{driver.email || 'Pas d\'email'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{driver.phone || 'Pas de téléphone'}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm pt-2 border-t border-slate-800/50">
                        <span className="text-slate-500 font-bold uppercase text-[10px]">Livraisons</span>
                        <span className="text-emerald-400 font-bold">{driver.total_missions || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold uppercase text-[10px]">Véhicule</span>
                        <span className={cn("font-medium", driver.assigned_vehicle_name ? "text-indigo-400" : "text-slate-600 italic")}>
                          {driver.assigned_vehicle_name ? `${driver.assigned_vehicle_name}` : 'Aucun'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-slate-800 flex gap-2">
                    <button
                      onClick={() => openMissions(driver)}
                      className="flex-1 py-2.5 text-sm font-bold text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-xl transition-all border border-indigo-500/20 hover:border-transparent"
                    >
                      Missions
                    </button>
                    <button
                      onClick={async () => {
                        if(!window.confirm("Réinitialiser le statut de ce conducteur à 'Disponible' ?")) return;
                        await fetch(`http://localhost:8000/api/drivers/${driver.id}/status`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'available' })
                        });
                        load();
                      }}
                      className="p-2.5 text-emerald-400 hover:text-white hover:bg-emerald-600 rounded-xl transition-all border border-emerald-500/20 hover:border-transparent"
                      title="Réinitialiser le statut (Débloquer)"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteDriver(driver.id)}
                      className="p-2.5 text-rose-400 hover:text-white hover:bg-rose-600 rounded-xl transition-all border border-rose-500/20 hover:border-transparent"
                      title="Supprimer le conducteur"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {drivers.length === 0 && !isLoading && (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
              <UserSquare2 className="w-16 h-16 mx-auto mb-4 opacity-10 text-white" />
              <p className="text-slate-500">Aucun conducteur enregistré</p>
            </div>
          )}
        </>
      ) : activeTab === 'fleet' ? (
        <>
          {/* Fleet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 animate-pulse">
                  <div className="w-12 h-12 bg-slate-800 rounded-full mb-4" />
                  <div className="h-4 bg-slate-800 rounded mb-2 w-3/4" />
                </div>
              ))
            ) : vehicles.map(v => {
              const statusInfo = VEHICLE_STATUS[v.status] || VEHICLE_STATUS.inactive;
              return (
                <div key={v.id} className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                          v.status === 'available' ? "bg-emerald-600" :
                          v.status === 'on_delivery' ? "bg-blue-600" :
                          "bg-slate-700"
                        )}>
                          <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{v.vehicle_name}</h4>
                          <p className="text-xs text-slate-500 font-mono">Type: {v.vehicle_type}</p>
                        </div>
                      </div>
                      <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusInfo.style)}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Capacité</span>
                        <span className="text-white font-medium">{v.capacity} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Conducteur assigné</span>
                        <span className="text-slate-300 truncate max-w-[140px]">{v.assigned_driver_name || 'Aucun'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-slate-800 flex gap-2">
                    <button
                      onClick={() => setSelectedVehicleHistory(v)}
                      className="flex-1 flex justify-center items-center gap-2 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-all"
                    >
                      <History className="w-3.5 h-3.5" /> Historique
                    </button>
                    <button
                      onClick={() => openVehicleModal(v)}
                      className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-lg transition-all border border-indigo-500/20 hover:border-transparent"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteVehicle(v.id)}
                      className="p-2 text-rose-400 hover:text-white hover:bg-rose-600 rounded-lg transition-all border border-rose-500/20 hover:border-transparent"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {vehicles.length === 0 && !isLoading && (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
              <Truck className="w-16 h-16 mx-auto mb-4 opacity-10 text-white" />
              <p className="text-slate-500">Aucun véhicule enregistré</p>
              <button onClick={() => openVehicleModal()} className="mt-4 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all">
                Ajouter le premier véhicule
              </button>
            </div>
          )}
        </>
      ) : activeTab === 'clients' ? (
        <>
          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 animate-pulse" />
              ))
            ) : clients.map(client => (
              <div key={client.id} className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {(client.first_name || 'C').charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{client.first_name} {client.last_name}</h4>
                        <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <Building className="w-3 h-3" /> {client.company_name || 'Particulier'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{client.phone || 'Pas de téléphone'}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-800/50">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Commandes</span>
                      <span className="text-emerald-400 font-bold">{client.total_orders || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-slate-800 flex gap-2">
                  <div className="flex-1 py-2 text-xs text-slate-500 italic flex items-center gap-2">
                    Inscrit le {new Date(client.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => deleteClient(client.id)}
                    className="p-2.5 text-rose-400 hover:text-white hover:bg-rose-600 rounded-xl transition-all border border-rose-500/20 hover:border-transparent"
                    title="Supprimer le client"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {clients.length === 0 && !isLoading && (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
              <UserSquare2 className="w-16 h-16 mx-auto mb-4 opacity-10 text-white" />
              <p className="text-slate-500">Aucun client enregistré</p>
            </div>
          )}
        </>
      ) : null}

      {/* Driver missions modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Missions — {selectedDriver.name}</h3>
                <p className="text-sm text-slate-500">Historique des livraisons assignées</p>
              </div>
              <button onClick={() => setSelectedDriver(null)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            {missions.length === 0 ? (
              <div className="text-center py-10 text-slate-600">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucune mission assignée à ce conducteur</p>
              </div>
            ) : (
              <div className="space-y-3">
                {missions.map(m => (
                  <div key={m.id} className="p-4 bg-slate-800/50 rounded-2xl flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold text-white">#{m.id}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{m.start_city} → {m.end_city}</p>
                      <p className="text-xs text-slate-500">{m.company_name} · {m.weight} kg</p>
                    </div>
                    <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase border",
                      m.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      m.status === 'in_progress' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    )}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vehicle Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">{editingVehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h3>
                <p className="text-sm text-slate-500">Renseignez les détails du véhicule</p>
              </div>
              <button onClick={() => setIsVehicleModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom du véhicule (ex: Renault Master)</label>
                <input
                  required
                  type="text"
                  disabled={vehicleForm.status === 'on_delivery'}
                  value={vehicleForm.vehicle_name}
                  onChange={e => setVehicleForm({...vehicleForm, vehicle_name: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                  <select
                    required
                    value={vehicleForm.vehicle_type}
                    disabled={vehicleForm.status === 'on_delivery'}
                    onChange={e => setVehicleForm({...vehicleForm, vehicle_type: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none disabled:opacity-50"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Van">Van</option>
                    <option value="Camion">Camion</option>
                    <option value="Frigorifique">Frigorifique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Capacité (kg)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    disabled={vehicleForm.status === 'on_delivery'}
                    value={vehicleForm.capacity}
                    onChange={e => setVehicleForm({...vehicleForm, capacity: Number(e.target.value)})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Statut</label>
                <select
                  value={vehicleForm.status}
                  disabled={vehicleForm.status === 'on_delivery'}
                  onChange={e => setVehicleForm({...vehicleForm, status: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none disabled:opacity-50"
                >
                  <option value="available">Disponible</option>
                  <option value="on_delivery">En livraison</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Conducteur assigné (Optionnel)</label>
                <select
                  value={vehicleForm.assigned_driver_id}
                  disabled={vehicleForm.status === 'on_delivery'}
                  onChange={e => {
                    const drvId = e.target.value;
                    const drv = drivers.find(d => String(d.id) === String(drvId));
                    let nextStatus = vehicleForm.status;
                    if (drv && drv.status === 'on_mission') nextStatus = 'on_delivery';
                    setVehicleForm({...vehicleForm, assigned_driver_id: drvId, status: nextStatus});
                  }}
                  className={cn(
                    "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none",
                    vehicleForm.status === 'on_delivery' && "opacity-50 cursor-not-allowed border-amber-500/30"
                  )}
                >
                  <option value="">Aucun conducteur</option>
                  {drivers
                    .filter(d => {
                      // On affiche le conducteur s'il est disponible
                      // OU s'il n'a actuellement aucun véhicule (même s'il est buggé en mission)
                      // OU si c'est le conducteur actuel du véhicule qu'on édite
                      const isAssignedToOther = vehicles.some((v: any) => v.assigned_driver_id === d.id && (!editingVehicle || v.id !== editingVehicle.id));
                      const isAvailable = d.status === 'available' || d.status === 'offline' || !d.vehicle_id;
                      
                      return !isAssignedToOther && (isAvailable || (editingVehicle && editingVehicle.assigned_driver_id === d.id));
                    })
                    .map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
                    ))
                  }
                </select>
                {vehicleForm.status === 'on_delivery' && (
                  <p className="text-[10px] text-amber-500 mt-2 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Véhicule en mission : modification du conducteur restreinte.
                  </p>
                )}
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={vehicleForm.status === 'on_delivery'}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex justify-center"
                >
                  {vehicleForm.status === 'on_delivery' ? 'Modification impossible (en mission)' : editingVehicle ? 'Enregistrer les modifications' : 'Ajouter le véhicule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle History Modal */}
      {selectedVehicleHistory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Historique — {selectedVehicleHistory.vehicle_name}</h3>
                <p className="text-sm text-slate-500">Missions effectuées par ce véhicule</p>
              </div>
              <button onClick={() => setSelectedVehicleHistory(null)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {deliveries.filter(d => d.vehicle_plate === selectedVehicleHistory.vehicle_name).length === 0 ? (
              <div className="text-center py-10 text-slate-600">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucune mission trouvée pour ce véhicule</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deliveries
                  .filter(d => d.vehicle_plate === selectedVehicleHistory.vehicle_name)
                  .map(m => (
                    <div key={m.id} className="p-4 bg-slate-800/50 rounded-2xl flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold text-white">#{m.id}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{m.start_city} → {m.end_city}</p>
                        <p className="text-xs text-slate-500">Conducteur : <span className="text-indigo-400 font-medium">{m.driver_name || 'Inconnu'}</span> · {m.delivery_date || 'Date non spécifiée'}</p>
                      </div>
                      <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase border",
                        m.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        m.status === 'in_progress' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      )}>
                        {m.status}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
