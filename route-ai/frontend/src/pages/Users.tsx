import React, { useState } from 'react';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical,
  Activity
} from 'lucide-react';
import { cn } from '../utils/cn';

const initialUsers = [
  { id: 1, name: 'Amine Alaoui', role: 'admin', email: 'amine@logiai.com', status: 'active', lastLogin: '2024-04-27 10:15' },
  { id: 2, name: 'Siham Tazi', role: 'operator', email: 'siham@logiai.com', status: 'active', lastLogin: '2024-04-27 09:45' },
  { id: 3, name: 'Karim Benani', role: 'client', email: 'contact@oceanpath.com', status: 'inactive', lastLogin: '2024-04-25 14:20' },
  { id: 4, name: 'Youssef Idrissi', role: 'operator', email: 'youssef@logiai.com', status: 'active', lastLogin: '2024-04-27 11:05' },
];

export const Users: React.FC = () => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('http://localhost:8000/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const roleColors = {
    admin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    operator: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    client: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`http://localhost:8000/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setUsers(users.filter(u => u.id !== id));
        } else {
          alert('Error deleting user');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAdd = () => {
    const name = prompt('User Name:');
    const role = prompt('Role (admin/operator/client):');
    if (name && role) {
      fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, password: 'password123', role })
      }).then(res => {
        if (res.ok) {
          alert('User added successfully');
          window.location.reload();
        } else {
          alert('Error adding user');
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Users & Permissions</h2>
          <p className="text-slate-400">Manage system access levels and track user activity.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <UsersIcon className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-bold text-white">{users.length}</p>
          </div>
        </div>
        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Now</p>
            <p className="text-2xl font-bold text-white">{Math.ceil(users.length * 0.4)}</p>
          </div>
        </div>
        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Shield className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Admin Roles</p>
            <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/30 text-xs font-bold uppercase text-slate-400">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{user.name}</span>
                      <span className="text-xs text-slate-500">{user.email || `${user.name.toLowerCase()}@logiai.com`}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    roleColors[user.role as keyof typeof roleColors]
                  )}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600')} />
                    <span className="text-sm text-slate-300 capitalize">{user.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{user.lastLogin}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
