import React from 'react';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const Notifications: React.FC = () => {
  const notifications = [
    { 
      id: 1, 
      type: 'delay', 
      title: 'Potential Delay Detected', 
      desc: 'AI predicts a 2h delay for RT0045 due to extreme weather in Casablanca.', 
      time: '10 mins ago',
      icon: AlertCircle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    },
    { 
      id: 2, 
      type: 'update', 
      title: 'Delivery in Progress', 
      desc: 'RT0022 has successfully reached the Rabat distribution center.', 
      time: '1 hour ago',
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    { 
      id: 3, 
      type: 'success', 
      title: 'Delivery Completed', 
      desc: 'Shipment RT0018 has been delivered to your Tangier warehouse.', 
      time: '3 hours ago',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    { 
      id: 4, 
      type: 'ai', 
      title: 'AI Optimization Applied', 
      desc: 'RL agent rerouted 3 of your shipments to avoid urban congestion.', 
      time: '5 hours ago',
      icon: BrainCircuit,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Notifications</h2>
          <p className="text-slate-400">Stay updated with real-time delivery alerts and AI insights.</p>
        </div>
        <button className="text-sm font-bold text-blue-500 hover:underline">Mark all as read</button>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className={cn(
            "p-6 rounded-2xl border flex gap-6 transition-all hover:scale-[1.01]",
            "bg-slate-900/50",
            n.border
          )}>
            <div className={cn("p-4 rounded-xl h-fit", n.bg)}>
              <n.icon className={cn("w-6 h-6", n.color)} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-bold">{n.title}</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{n.time}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{n.desc}</p>
              <div className="pt-4 flex gap-3">
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all">View Details</button>
                <button className="px-4 py-2 text-slate-500 hover:text-white text-xs font-bold transition-all">Dismiss</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
