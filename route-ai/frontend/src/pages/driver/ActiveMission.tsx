import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation, Clock, AlertTriangle, MapPin, Package, RefreshCw, CheckCircle, Zap, ShieldAlert, Truck, Wind, Search } from 'lucide-react';
import { useJsApiLoader } from '@react-google-maps/api';
import GoogleMapComponent from '../../components/GoogleMapComponent';
import { cn } from '../../utils/cn';

export const ActiveMission: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);
  
  // Real-time State
  const [currentPos, setCurrentPos] = useState<{lat: number, lng: number} | null>(null);
  const [progressIdx, setProgressIdx] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(0);
  const [distanceLeft, setDistanceLeft] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places'] as any
  });

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev].slice(0, 3));
    // Auto clear after 5s
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== msg));
    }, 5000);
  };

  const load = useCallback(async () => {
    if (!user.id) return;
    try {
      const res = await fetch(`http://localhost:8000/api/deliveries?role=driver&user_id=${user.id}`);
      if (res.ok) {
        const missions = await res.json();
        const active = missions.find((m: any) => m.status === 'in_progress' || m.status === 'accepted' || m.status === 'near_destination');
        setMission(active || null);
        
        if (active && active.status === 'accepted') {
            setCurrentPos({ lat: active.start_lat, lng: active.start_lng });
        }
        
        if (active && isLoaded && !directions) {
          const directionsService = new google.maps.DirectionsService();
          const result = await directionsService.route({
            origin: { lat: active.start_lat, lng: active.start_lng },
            destination: { lat: active.end_lat, lng: active.end_lng },
            travelMode: google.maps.TravelMode.DRIVING,
          });
          setDirections(result);
          if (result.routes[0]) {
            const path = result.routes[0].overview_path;
            setRoutePath(path);
            setEta(active.eta_minutes || Math.round((result.routes[0].legs[0].duration?.value || 0) / 60));
            setDistanceLeft(active.distance_km || ((result.routes[0].legs[0].distance?.value || 0) / 1000));
          }
        }
      }
    } catch (e) {
      console.error("Failed to load mission", e);
    } finally { setLoading(false); }
  }, [user.id, isLoaded, directions]);

  useEffect(() => { load(); }, [load]);

  // Real-time Simulation Engine
  useEffect(() => {
    if (mission?.status === 'in_progress' && routePath.length > 0) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setProgressIdx(prev => {
            const next = prev + 1;
            if (next >= routePath.length) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              return prev;
            }
            
            // Calculate mock real-time data
            const pos = routePath[next];
            const lat = pos.lat();
            const lng = pos.lng();
            
            setCurrentPos({ lat, lng });
            
            // Random speed between 30 and 70 km/h
            const curSpeed = Math.floor(Math.random() * 40) + 30;
            setSpeed(curSpeed);
            
            // Decrease ETA and Distance
            const percent = next / routePath.length;
            setDistanceLeft(prevDist => Math.max(0.1, prevDist - (prevDist * 0.05)));
            setEta(prevEta => Math.max(1, Math.round(prevEta - (prevEta * 0.05))));
            
            // Sync to backend (Update driver's location)
            fetch(`http://localhost:8000/api/drivers/${user.id}/location`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mission_id: mission.id, lat, lng })
            }).catch(() => {});

            // AI Dynamic Events
            if (percent > 0.4 && percent < 0.45 && !notifications.includes("⚠️ Trafic dense détecté")) {
               addNotification("⚠️ Trafic dense détecté. Recalcul IA en cours...");
               setTimeout(() => addNotification("✅ Nouvelle route optimisée (+3 min)."), 2000);
               setEta(e => e + 3);
            }
            
            if (percent > 0.85 && mission.status !== 'near_destination') {
                updateMissionStatus('near_destination');
                addNotification("📍 Vous approchez de la destination.");
            }

            return next;
          });
        }, 3000); // Update every 3 seconds for smooth simulation
      }
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mission?.status, routePath, notifications]);

  const updateMissionStatus = async (status: string) => {
    if (!mission) return;
    try {
      await fetch(`http://localhost:8000/api/deliveries/${mission.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (status === 'delivered') setFinishing(false);
      await load();
    } catch (e) {}
  };

  const startDelivery = () => {
      addNotification("🚀 Mission démarrée. Conduisez prudemment.");
      updateMissionStatus('in_progress');
  };

  const finishDelivery = () => {
      setFinishing(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      updateMissionStatus('delivered');
  };

  const jumpToEnd = () => {
    if (!routePath.length) return;
    const lastIdx = routePath.length - 1;
    setProgressIdx(lastIdx);
    const pos = routePath[lastIdx];
    setCurrentPos({ lat: pos.lat(), lng: pos.lng() });
    setDistanceLeft(0.1);
    setEta(1);
    updateMissionStatus('near_destination');
    if (intervalRef.current) clearInterval(intervalRef.current);
    addNotification("✨ Arrivée simulée à destination.");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <Navigation className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );

  if (!mission) return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-6 animate-in fade-in zoom-in duration-500">
      <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-2xl">
        <Package className="w-12 h-12 text-slate-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Aucune course active</h2>
        <p className="text-slate-500 max-w-sm mx-auto">Vous êtes actuellement hors mission. Consultez les missions disponibles pour commencer à rouler.</p>
      </div>
      <button onClick={() => window.location.href = '/driver/missions'} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2">
        <Search className="w-5 h-5" /> Trouver une mission
      </button>
    </div>
  );

  const percentComplete = routePath.length > 0 ? Math.round((progressIdx / routePath.length) * 100) : 0;
  
  // Real-time markers
  const markers: Array<{ id: string; lat: number; lng: number; type: 'delivery' | 'driver' }> = [
    { id: 'dest', lat: mission.end_lat, lng: mission.end_lng, type: 'delivery' as const }
  ];
  if (currentPos) {
      markers.push({ id: 'driver', lat: currentPos.lat, lng: currentPos.lng, type: 'driver' as const });
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col xl:flex-row gap-6 animate-in fade-in duration-700">
      
      {/* ─── LIVE MAP AREA (UBER STYLE) ─── */}
      <div className="flex-1 bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 relative shadow-2xl min-h-[500px]">
        {isLoaded && <GoogleMapComponent directions={directions} markers={markers} centerPos={currentPos || undefined} zoom={15} />}
        
        {/* Floating Notifications */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-10 w-[90%] max-w-md">
          {notifications.map((notif, i) => (
            <div key={i} className="px-6 py-3 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-full shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 text-sm font-bold text-white text-center">
              {notif}
            </div>
          ))}
        </div>

        {/* Floating Metrics Header */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg", 
              mission.status === 'accepted' ? "bg-amber-500" :
              mission.status === 'in_progress' ? "bg-indigo-500" : "bg-emerald-500"
            )}>
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Destination</p>
              <p className="text-base font-bold text-white truncate max-w-[200px]">{mission.end_city || mission.end_address}</p>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-3 rounded-2xl shadow-2xl pointer-events-auto flex gap-3 text-center">
            <div className="px-3 border-r border-slate-800">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Météo</p>
              <p className="text-sm font-bold text-white flex items-center gap-1 justify-center"><Wind className="w-3 h-3 text-sky-400"/> {mission.weather_condition}</p>
            </div>
            <div className="px-3">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Trafic</p>
              <p className={cn("text-sm font-bold flex items-center gap-1 justify-center", mission.traffic_factor > 1.5 ? "text-rose-400" : "text-emerald-400")}>
                {mission.traffic_factor > 1.5 ? <ShieldAlert className="w-3 h-3"/> : <CheckCircle className="w-3 h-3"/>}
                x{mission.traffic_factor}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action Sheet */}
        <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700 p-6 rounded-[32px] shadow-2xl pointer-events-auto max-w-3xl mx-auto">
            
            {/* Real-time Telemetry Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> ETA</p>
                <p className="text-2xl font-black text-white">{eta} <span className="text-sm text-slate-500 font-medium">min</span></p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Restant</p>
                <p className="text-2xl font-black text-white">{distanceLeft.toFixed(1)} <span className="text-sm text-slate-500 font-medium">km</span></p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1"><Zap className="w-3 h-3"/> Vitesse</p>
                <p className="text-2xl font-black text-indigo-400">{speed} <span className="text-sm text-slate-500 font-medium">km/h</span></p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Progression</p>
                <p className="text-2xl font-black text-emerald-400">{percentComplete}%</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-1000" style={{ width: `${percentComplete}%` }} />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {mission.status === 'accepted' ? (
                <button onClick={startDelivery} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 text-lg flex items-center justify-center gap-2">
                  <Navigation className="w-6 h-6" /> Démarrer la route
                </button>
              ) : (
                <>
                  {mission.status === 'in_progress' && (
                    <button 
                      onClick={jumpToEnd}
                      className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-bold transition-all border border-slate-700 flex items-center gap-2"
                      title="Sauter à la destination"
                    >
                      <Zap className="w-5 h-5 text-amber-500" />
                      Simuler l'arrivée
                    </button>
                  )}
                  <button 
                    onClick={finishDelivery} 
                    disabled={finishing || mission.status !== 'near_destination'} 
                    className={cn(
                      "flex-1 py-4 text-white rounded-2xl font-black uppercase tracking-wider transition-all shadow-lg text-lg flex items-center justify-center gap-2",
                      finishing || mission.status !== 'near_destination'
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                        : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                    )}
                  >
                    {finishing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                    {mission.status !== 'near_destination' ? 'En transit...' : 'Confirmer la Livraison'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── DETAILS & WORKFLOW PANEL ─── */}
      <div className="w-full xl:w-[380px] flex flex-col gap-6">
        {/* Mission Info */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl"><Package className="w-6 h-6 text-indigo-400" /></div>
              Colis #{mission.id}
            </h3>
            <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400">{mission.weight} kg</span>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700"><Truck className="w-4 h-4 text-slate-400" /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Client</p>
                <p className="text-sm font-bold text-white">{mission.company_name || mission.client_name || 'Inconnu'}</p>
              </div>
            </div>
            <div className="w-full h-px bg-slate-800/50" />
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-indigo-400" /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Départ</p>
                <p className="text-sm font-bold text-white truncate max-w-[200px]">{mission.start_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Steps */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8 shadow-2xl flex-1">
          <h3 className="text-lg font-black text-white mb-8">Suivi Logistique</h3>
          <div className="space-y-8 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
            {[
              { label: 'Mission Assignée', desc: 'Validé par l\'Admin', done: true },
              { label: 'Mission Acceptée', desc: 'Prêt au départ', done: ['accepted', 'in_progress', 'near_destination', 'delivered'].includes(mission.status) },
              { label: 'En Route', desc: 'Trajet optimisé IA', done: ['in_progress', 'near_destination', 'delivered'].includes(mission.status) },
              { label: 'Arrivée Proche', desc: 'À moins de 15%', done: ['near_destination', 'delivered'].includes(mission.status) },
              { label: 'Colis Livré', desc: 'Fin de la mission', done: mission.status === 'delivered' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-5 relative z-10">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-900 shrink-0 transition-all duration-500", 
                  step.done ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-800"
                )}>
                  {step.done ? <CheckCircle className="w-5 h-5 text-white" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
                </div>
                <div className="pt-1.5">
                  <p className={cn("text-base font-black transition-colors duration-500", step.done ? "text-white" : "text-slate-500")}>{step.label}</p>
                  <p className="text-xs text-slate-500 font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
