import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Map as MapIcon, 
  Navigation, 
  Truck, 
  Clock, 
  Activity,
  Zap,
  ShieldCheck,
  Search
} from 'lucide-react';
import { cn } from '../../utils/cn';

const CLIENT_NAME = "OceanPath Shipping";

export const LiveTracking: React.FC = () => {
  const { data } = useData();
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  const activeDeliveries = useMemo(() => {
    return data.filter(r => r.company === CLIENT_NAME && r.status === 'in-progress');
  }, [data]);

  useEffect(() => {
    if (activeDeliveries.length > 0 && !selectedRoute) {
      setSelectedRoute(activeDeliveries[0]);
    }
  }, [activeDeliveries, selectedRoute]);

  const eta = useMemo(() => {
    if (!selectedRoute) return null;
    const baseTime = selectedRoute.travel_time_hours;
    const factor = selectedRoute.traffic_factor;
    const estimatedHours = baseTime * factor;
    return estimatedHours.toFixed(1);
  }, [selectedRoute]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Live Tracking</h2>
          <p className="text-slate-400">Monitor your active shipments in real-time with AI ETA adjustments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 h-[600px] relative overflow-hidden group">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1569336415962-a4bd9f6dfc0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center opacity-40 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20" />
          
          {selectedRoute && (
            <div className="absolute inset-0">
               {/* Origin */}
               <div className="absolute" style={{ left: '30%', top: '40%' }}>
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                  <div className="mt-2 bg-slate-900/90 backdrop-blur px-2 py-1 rounded border border-slate-700 text-[10px] text-white font-bold">{selectedRoute.start_city}</div>
               </div>
               {/* Destination */}
               <div className="absolute" style={{ left: '70%', top: '60%' }}>
                  <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  <div className="mt-2 bg-slate-900/90 backdrop-blur px-2 py-1 rounded border border-slate-700 text-[10px] text-white font-bold">{selectedRoute.end_city}</div>
               </div>
               {/* Moving Truck */}
               <div className="absolute transition-all duration-1000" style={{ left: '55%', top: '53%' }}>
                  <div className="p-2 bg-white rounded-lg shadow-xl animate-bounce">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
               </div>
            </div>
          )}

          <div className="absolute bottom-8 left-8 right-8">
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Route</span>
                  <span className="text-sm font-bold text-white">{selectedRoute?.route_id || 'N/A'}</span>
                </div>
                <div className="w-px bg-slate-800 h-10" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Adjusted ETA</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm font-bold text-white">{eta} hours</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-500 uppercase">Live Update</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-6">Select Shipment</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {activeDeliveries.map((route) => (
                <button 
                  key={route.route_id}
                  onClick={() => setSelectedRoute(route)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all text-left group",
                    selectedRoute?.route_id === route.route_id 
                      ? "bg-blue-600/10 border-blue-600 shadow-lg shadow-blue-500/10" 
                      : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "text-xs font-bold font-mono",
                      selectedRoute?.route_id === route.route_id ? "text-blue-400" : "text-slate-500"
                    )}>{route.route_id}</span>
                    <Activity className={cn("w-4 h-4", selectedRoute?.route_id === route.route_id ? "text-blue-500 animate-pulse" : "text-slate-700")} />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{route.end_city}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{route.vehicle_id}</p>
                </button>
              ))}
              {activeDeliveries.length === 0 && (
                <div className="text-center py-12 text-slate-600">
                  <Navigation className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p>No active shipments to track.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20 text-white relative overflow-hidden">
            <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
            <h3 className="text-lg font-bold mb-2">Secure Link</h3>
            <p className="text-blue-100 text-xs mb-6 leading-relaxed">Share this live tracking link with your customer for full transparency.</p>
            <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all text-xs">
              Copy Tracking URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
