import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Zap, BarChart3, Users,
  Settings, ChevronRight, LogOut, Truck, Play
} from 'lucide-react';
import { cn } from '../utils/cn';

const menuItems = [
  { id: 'dashboard',    label: 'Tableau de bord',    icon: LayoutDashboard, path: '/admin',              end: true },
  { id: 'deliveries',   label: 'Livraisons',          icon: Package,         path: '/admin/deliveries',   end: false },
  { id: 'optimization', label: 'Optimisation IA',     icon: Zap,             path: '/admin/optimization', end: false },
  { id: 'simulation',   label: 'Simulateur IA',       icon: Play,            path: '/admin/simulation',   end: false },
  { id: 'stats',        label: 'Analytiques',         icon: BarChart3,       path: '/admin/stats',        end: false },
  { id: 'resources',    label: 'Ressources & Flotte', icon: Users,           path: '/admin/resources',    end: false },
];

export const Sidebar: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{"username":"Admin","role":"admin"}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-900/60 backdrop-blur-xl text-slate-300 border-r border-slate-800/50 fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Truck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-none">
            Logi<span className="text-indigo-400">Optima</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em] mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.end}
            className={({ isActive }) => cn(
              "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative",
              isActive
                ? "bg-indigo-600/15 text-white"
                : "hover:bg-slate-800/60 hover:text-slate-100 text-slate-400"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full" />}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                  )}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <ChevronRight className={cn(
                  "w-3.5 h-3.5 transition-all duration-200",
                  isActive ? "opacity-100 text-indigo-400" : "opacity-0 group-hover:opacity-60"
                )} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="p-4">
        <div className="px-4 py-4 rounded-2xl bg-slate-800/50 border border-slate-700/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.username}</p>
              <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold">Administrateur</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = '/settings'}
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs font-medium"
            >
              <Settings className="w-3.5 h-3.5" />
              Paramètres
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all"
              title="Déconnexion"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
