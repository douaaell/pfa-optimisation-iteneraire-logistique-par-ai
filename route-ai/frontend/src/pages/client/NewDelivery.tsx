import React, { useState, useRef, useCallback } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { Package, MapPin, Zap, CheckCircle2, RefreshCw, Search, ArrowRight, BrainCircuit, AlertCircle, Weight } from 'lucide-react';
import GoogleMapComponent from '../../components/GoogleMapComponent';
import { cn } from '../../utils/cn';

import { useNavigate } from 'react-router-dom';

export const NewDelivery: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places'] as any
  });
  
  const [formData, setFormData] = useState({
    start_address: '', start_city: '', start_lat: 0, start_lng: 0,
    end_address: '', end_city: '', end_lat: 0, end_lng: 0,
    weight: 10, priority: 'medium',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_date_end: new Date().toISOString().split('T')[0],
    time_window_open: '08:00', time_window_close: '18:00',
    distance_km: 0, duration_text: '', cost: 0
  });

  const startRef = useRef<google.maps.places.Autocomplete | null>(null);
  const endRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceChanged = (type: 'start' | 'end') => {
    const autocomplete = type === 'start' ? startRef.current : endRef.current;
    const place = autocomplete?.getPlace();
    if (place?.geometry?.location) {
      const cityComp = place.address_components?.find(c => c.types.includes('locality'));
      const cityName = cityComp ? cityComp.long_name : (place.name || "");

      setFormData(prev => ({
        ...prev,
        [`${type}_address`]: place.formatted_address || "",
        [`${type}_city`]: cityName,
        [`${type}_lat`]: place.geometry!.location!.lat(),
        [`${type}_lng`]: place.geometry!.location!.lng(),
      }));
    }
  };

  const [calculating, setCalculating] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const calculateRoute = useCallback(async () => {
    if (!formData.start_lat || !formData.end_lat) return;
    setCalculating(true);
    setRouteError(null);
    
    const directionsService = new google.maps.DirectionsService();
    try {
      const result = await directionsService.route({
        origin: { lat: formData.start_lat, lng: formData.start_lng },
        destination: { lat: formData.end_lat, lng: formData.end_lng },
        travelMode: google.maps.TravelMode.DRIVING,
      });
      
      setDirections(result);
      if (result.routes[0].legs[0]) {
        const leg = result.routes[0].legs[0];
        const distance_km = (leg.distance?.value || 0) / 1000;
        
        // LogiOptima Professional Pricing Model
        const baseCost = distance_km * 1.5; // 1.5 MAD per km
        const weightCost = formData.weight * 2; // 2 MAD per kg
        const subtotal = baseCost + weightCost;
        
        let multiplier = 1.0;
        if (formData.priority === 'high') multiplier = 1.3;
        else if (formData.priority === 'low') multiplier = 0.9;
        
        const finalCost = Math.round(subtotal * multiplier);

        setFormData(prev => ({
          ...prev,
          distance_km: distance_km,
          duration_text: leg.duration?.text || "",
          cost: finalCost
        }));
        setStep(2);
      }
    } catch (e) {
      setRouteError("Impossible de trouver un itinéraire routier entre ces deux points.");
      console.error("Routing error", e);
    } finally {
      setCalculating(false);
    }
  }, [formData.start_lat, formData.start_lng, formData.end_lat, formData.end_lng, formData.weight, formData.priority]);

  const handleFinalConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: user.id, ...formData })
      });
      if (res.ok) setStep(3);
    } catch (e) {
      console.error("Confirm failed", e);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Expédition Intelligente</h2>
          <p className="text-slate-400">Modèle de tarification professionnel et prédictions IA LogiOptima.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[32px] p-6 overflow-y-auto flex flex-col gap-6">
          {!isLoaded ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-left duration-500">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Départ (Maps)</label>
                      <Autocomplete onLoad={(a) => startRef.current = a} onPlaceChanged={() => handlePlaceChanged('start')}>
                        <div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input type="text" placeholder="Sélectionnez une ville..." className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all" /></div>
                      </Autocomplete>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Destination (Maps)</label>
                      <Autocomplete onLoad={(a) => endRef.current = a} onPlaceChanged={() => handlePlaceChanged('end')}>
                        <div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input type="text" placeholder="Sélectionnez une ville..." className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all" /></div>
                      </Autocomplete>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Poids (Kg)</label>
                        <input 
                          type="number" min="1" 
                          value={formData.weight} 
                          onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Priorité</label>
                        <select 
                          value={formData.priority}
                          onChange={e => setFormData({...formData, priority: e.target.value})}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                        >
                          <option value="low">Faible</option>
                          <option value="medium">Standard</option>
                          <option value="high">Urgent (+30%)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date de début</label>
                        <input 
                          type="date" 
                          value={formData.delivery_date} 
                          onChange={e => setFormData({...formData, delivery_date: e.target.value})}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date de fin</label>
                        <input 
                          type="date" 
                          value={formData.delivery_date_end} 
                          onChange={e => setFormData({...formData, delivery_date_end: e.target.value})}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Heure de début</label>
                        <input 
                          type="time" 
                          value={formData.time_window_open} 
                          onChange={e => setFormData({...formData, time_window_open: e.target.value})}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Heure de fin</label>
                        <input 
                          type="time" 
                          value={formData.time_window_close} 
                          onChange={e => setFormData({...formData, time_window_close: e.target.value})}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                  {routeError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {routeError}
                    </div>
                  )}
                  <button
                    onClick={calculateRoute} disabled={!formData.start_lat || !formData.end_lat || calculating}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                  >
                    {calculating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Calculer Tarification <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-indigo-400"><BrainCircuit className="w-5 h-5" /><span className="text-xs font-bold uppercase tracking-widest">Modèle Tarifaire Actif</span></div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div><p className="text-[9px] text-slate-500 font-bold">DISTANCE</p><p className="text-lg font-bold text-white">{formData.distance_km.toFixed(1)} km</p></div>
                      <div><p className="text-[9px] text-slate-500 font-bold">POIDS</p><p className="text-lg font-bold text-white">{formData.weight} kg</p></div>
                      <div><p className="text-[9px] text-slate-500 font-bold">PRIORITÉ</p><p className="text-lg font-bold text-white capitalize">{formData.priority === 'high' ? 'Urgente' : formData.priority === 'low' ? 'Faible' : 'Standard'}</p></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-slate-800/50 pt-3">
                      <div><p className="text-[9px] text-slate-500 font-bold">DURÉE MAPS</p><p className="text-sm font-bold text-slate-300">{formData.duration_text}</p></div>
                      <div><p className="text-[9px] text-slate-500 font-bold">DATES</p><p className="text-[10px] font-bold text-slate-300">{formData.delivery_date} au {formData.delivery_date_end}</p></div>
                      <div><p className="text-[9px] text-slate-500 font-bold">FENÊTRE HORAIRE</p><p className="text-sm font-bold text-slate-300">{formData.time_window_open} à {formData.time_window_close}</p></div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-800">
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Frais kilométriques (1.5 MAD/km)</span>
                        <span>{Math.round(formData.distance_km * 1.5)} MAD</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Frais de poids (2 MAD/kg)</span>
                        <span>{formData.weight * 2} MAD</span>
                      </div>
                      {formData.priority === 'high' && (
                        <div className="flex justify-between items-center text-xs text-rose-400">
                          <span>Majoration Urgence (+30%)</span>
                          <span>+{Math.round((formData.distance_km * 1.5 + formData.weight * 2) * 0.3)} MAD</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-700 flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">TOTAL FACTURÉ AU CLIENT</p>
                        <p className="text-3xl font-black text-emerald-400">{formData.cost} MAD</p>
                      </div>
                    </div>

                    <div className="mt-4 py-3 px-4 bg-slate-900/80 rounded-xl flex justify-between items-center border border-slate-800">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Package className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Part Chauffeur (70%)</span>
                      </div>
                      <p className="text-base font-bold text-indigo-400">{Math.round(formData.cost * 0.7)} MAD</p>
                    </div>
                  </div>
                  <button onClick={handleFinalConfirm} disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2">
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Confirmer & Envoyer la commande <CheckCircle2 className="w-5 h-5" /></>}
                  </button>
                  <button onClick={() => setStep(1)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all text-sm">
                    Modifier les informations
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-10 space-y-6 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-10 h-10 text-emerald-500" /></div>
                  <h3 className="text-xl font-bold text-white">Commande Enregistrée</h3>
                  <p className="text-sm text-slate-400">Notre IA est en train d'analyser la météo et le trafic pour affiner l'heure de livraison estimée.</p>
                  <button onClick={() => navigate('/client')} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl mt-4">Retour au Dashboard</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Map Area */}
        <div className="lg:col-span-8 relative rounded-[32px] overflow-hidden border border-slate-800 bg-slate-900">
          <GoogleMapComponent directions={directions} />
          <div className="absolute top-6 left-6 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Calculateur de Tarif Avancé</span>
          </div>
        </div>
      </div>
    </div>
  );
};
