import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, PlusCircle,
  ChevronRight, LogOut, Truck
} from 'lucide-react';
import { cn } from '../utils/cn';

const menuItems = [
  { id: 'dashboard',  label: 'Tableau de bord',  icon: LayoutDashboard, path: '/client',         end: true },
  { id: 'deliveries', label: 'Mes livraisons',    icon: Package,         path: '/client/deliveries', end: false },
  { id: 'new',        label: 'Nouvelle livraison', icon: PlusCircle,     path: '/client/new',     end: false },
];

export const ClientSidebar: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{"username":"Client","role":"client"}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-900/60 backdrop-blur-xl text-slate-300 border-r border-slate-800/50 fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Truck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-none">
            Logi<span className="text-blue-400">Optima</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em] mt-0.5">Espace Client</p>
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
                ? "bg-blue-600/15 text-white"
                : "hover:bg-slate-800/60 hover:text-slate-100 text-slate-400"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full" />}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                  )}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <ChevronRight className={cn(
                  "w-3.5 h-3.5 transition-all duration-200",
                  isActive ? "opacity-100 text-blue-400" : "opacity-0 group-hover:opacity-60"
                )} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* New delivery shortcut */}
      <div className="px-4 pb-2">
        <button
          onClick={() => window.location.href = '/client/new'}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Nouvelle livraison
        </button>
      </div>

      {/* User card */}
      <div className="p-4">
        <div className="px-4 py-4 rounded-2xl bg-slate-800/50 border border-slate-700/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.username}</p>
              <p className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">Client</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all text-xs font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};
