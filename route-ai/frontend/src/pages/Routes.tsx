import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { cn, formatCurrency } from '../utils/cn';

export const Routes: React.FC = () => {
  const { data, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.route_id.toLowerCase().includes(search.toLowerCase()) ||
                           item.start_city.toLowerCase().includes(search.toLowerCase()) ||
                           item.end_city.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusColors = {
    planned: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    'in-progress': "bg-amber-500/10 text-amber-500 border-amber-500/20",
    completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    delayed: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    cancelled: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Route Management</h2>
          <p className="text-slate-400">Track and manage every delivery route in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/30 text-xs font-bold uppercase text-slate-400">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Route</th>
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Cost</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {paginatedData.map((route) => (
              <tr key={route.route_id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4 font-bold text-white text-sm">{route.route_id}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-200">{route.start_city} → {route.end_city}</span>
                    <span className="text-xs text-slate-500">{route.distance.toFixed(0)} km</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{route.vehicle_id}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-200">{formatCurrency(route.cost)}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    statusColors[route.status as keyof typeof statusColors]
                  )}>
                    {route.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-slate-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
