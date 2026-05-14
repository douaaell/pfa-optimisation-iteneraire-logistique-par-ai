import React, { useEffect, useState, useCallback } from 'react';
import { Truck, Navigation, CheckCircle2, Package, Play, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useData } from '../../context/DataContext';
import GoogleMapComponent from '../../components/GoogleMapComponent';
import { cn } from '../../utils/cn';

export const DriverDashboard: React.FC = () => {
  const { deliveries, fetchDeliveries } = useData();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [driverVehicle, setDriverVehicle] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showVehicleHistory, setShowVehicleHistory] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places'] as any
  });

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      if (!user?.id) return;
      const res = await fetch(`http://localhost:8000/api/drivers/user/${user.id}`);
      if (res.ok) {
        const profile = await res.json();
        setDriverProfile(profile);
        if (profile && profile.assigned_vehicle_id) {
          const vRes = await fetch(`http://localhost:8000/api/drivers/${profile.id}/vehicle`);
          if (vRes.ok) setDriverVehicle(await vRes.json());
        } else {
          setDriverVehicle(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchProfile();
      await fetchDeliveries();
      setLoading(false);
    };
    load();
  }, [fetchDeliveries, fetchProfile]);

  const hasVehicle = !!driverProfile?.assigned_vehicle_id;

  const loadRoute = useCallback(async (delivery: any) => {
    if (!isLoaded || !delivery.start_lat || !delivery.end_lat || !hasVehicle) return;
    try {
      const directionsService = new google.maps.DirectionsService();
      const result = await directionsService.route({
        origin: { lat: delivery.start_lat, lng: delivery.start_lng },
        destination: { lat: delivery.end_lat, lng: delivery.end_lng },
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirections(result);
      setActiveDelivery(delivery);
    } catch (e) {
      console.error("Route calculation failed", e);
    }
  }, [isLoaded, hasVehicle]);

  useEffect(() => {
    if (!hasVehicle) {
      setDirections(null);
      setActiveDelivery(null);
      return;
    }
    const inProgress = deliveries.find(d => d.status === 'in_progress');
    if (inProgress) loadRoute(inProgress);
    else if (deliveries.length > 0) loadRoute(deliveries[0]);
  }, [deliveries, loadRoute, hasVehicle]);

  const updateStatus = async (deliveryId: number, newStatus: string) => {
    if (!hasVehicle) return;
    setUpdating(deliveryId);
    try {
      await fetch(`http://localhost:8000/api/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      await fetchDeliveries();
    } finally { setUpdating(null); }
  };

  const activeMissions = hasVehicle ? deliveries.filter(d => ['assigned', 'accepted', 'in_progress'].includes(d.status)) : [];
  
  // Extract unique vehicles from past delivered missions
  const pastVehicles = Array.from(new Set(
    deliveries
      .filter(d => d.status === 'delivered' && d.vehicle_plate)
      .map(d => d.vehicle_plate)
  ));

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center"><Truck className="w-6 h-6 text-white" /></div>
            Navigation Chauffeur
          </h2>
          <p className="text-slate-400">Vos missions et suivi de livraison.</p>
        </div>
        <button onClick={() => { fetchProfile(); fetchDeliveries(); }} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
          <RefreshCw className={cn("w-5 h-5", (loading || profileLoading) && "animate-spin")} />
        </button>
      </div>

      {!profileLoading && !hasVehicle && (
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-8 flex items-center gap-6 animate-pulse">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 flex-shrink-0">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Aucun véhicule assigné</h3>
            <p className="text-slate-400 text-sm">Vous ne pouvez pas accepter ou démarrer de missions tant qu'un véhicule ne vous a pas été assigné par l'administrateur de flotte. Veuillez patienter ou contacter le support.</p>
          </div>
        </div>
      )}

      {!profileLoading && hasVehicle && driverVehicle && (
        <div className="bg-slate-900/50 border border-emerald-500/20 rounded-3xl p-6 flex items-center gap-6">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
            <Truck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Véhicule Actif : {driverVehicle.vehicle_name}</h3>
            <p className="text-slate-400 text-sm">Type: {driverVehicle.vehicle_type} · Capacité: {driverVehicle.capacity} kg</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button 
              onClick={() => setShowVehicleHistory(true)}
              className="text-xs font-bold text-slate-400 hover:text-white underline decoration-slate-600 transition-colors"
            >
              Voir l'historique
            </button>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Prêt pour livraison
            </span>
          </div>
        </div>
      )}

      {/* Vehicle History Modal */}
      {showVehicleHistory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Historique des véhicules</h3>
                <p className="text-sm text-slate-400">Véhicules que vous avez utilisés par le passé</p>
              </div>
              <button onClick={() => setShowVehicleHistory(false)} className="text-slate-500 hover:text-white text-xl">✕</button>
            </div>
            
            {pastVehicles.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Aucun historique de véhicule trouvé.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {pastVehicles.map((plate, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{plate}</p>
                      <p className="text-xs text-slate-500">Utilisé lors de missions précédentes</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
        {/* Navigation Map */}
        <div className="lg:col-span-3 relative bg-slate-900/50 border border-slate-800 rounded-[32px] overflow-hidden">
          <GoogleMapComponent directions={directions} />
          
          {!hasVehicle && !profileLoading && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-10">
              <div className="bg-slate-900/90 border border-slate-700 rounded-3xl p-8 max-w-md text-center shadow-2xl">
                <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Navigation Bloquée</h3>
                <p className="text-slate-400 text-sm">L'accès à la navigation et au suivi des missions est restreint. Un véhicule de l'entreprise doit vous être assigné pour débloquer ces fonctionnalités.</p>
              </div>
            </div>
          )}

          {hasVehicle && activeDelivery && (
            <div className="absolute bottom-6 left-6 right-6 p-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl flex items-center justify-between z-20 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20"><Navigation className="w-6 h-6 text-indigo-400 animate-pulse" /></div>
                <div><p className="text-[10px] font-bold text-slate-500 uppercase">Destination</p><p className="text-sm font-bold text-white truncate max-w-[250px]">{activeDelivery.end_address}</p></div>
              </div>
              <div className="flex items-center gap-4">
                {activeDelivery.status === 'accepted' && <button onClick={() => updateStatus(activeDelivery.id, 'in_progress')} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all">Démarrer <Play className="w-4 h-4 fill-current" /></button>}
                {activeDelivery.status === 'in_progress' && <button onClick={() => updateStatus(activeDelivery.id, 'delivered')} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all">Livré <CheckCircle2 className="w-4 h-4" /></button>}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[32px] p-6 flex flex-col gap-6 overflow-y-auto">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className={cn("w-5 h-5", hasVehicle ? "text-emerald-400" : "text-slate-500")} />
            Missions {hasVehicle ? `(${activeMissions.length})` : ''}
          </h3>
          
          {!hasVehicle ? (
            <div className="text-center py-10 opacity-50">
              <Truck className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">En attente d'un véhicule...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMissions.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">Aucune mission active</p>
              )}
              {activeMissions.map(m => (
                <div key={m.id} onClick={() => loadRoute(m)} className={cn("p-4 rounded-2xl border cursor-pointer transition-all", activeDelivery?.id === m.id ? "bg-indigo-600/10 border-indigo-500/30" : "bg-slate-950/50 border-slate-800 hover:border-slate-700")}>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">#{m.id}</p>
                  <p className="text-xs font-bold text-white truncate mb-2">{m.end_address}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-500"><span>{m.distance_km} km</span><span>{m.status}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
