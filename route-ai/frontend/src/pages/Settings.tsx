import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Trash2, Shield } from 'lucide-react';
import { useData } from '../context/DataContext';
import { cn } from '../utils/cn';

export const Settings: React.FC = () => {
  const { loadCsvData, data, isLoading, error, refreshData } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadCsvData(file);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadCsvData(file);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Paramètres Système</h2>
        <p className="text-slate-400 mt-1">Gérez les données historiques et les configurations de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Data Management */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Importation des données IA</h3>
                <p className="text-xs text-slate-500">Mettez à jour le dataset CSV pour l'analyse prédictive</p>
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group",
                isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 hover:border-slate-700 bg-slate-800/20"
              )}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                {isLoading ? <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" /> : <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />}
              </div>
              <div className="text-center">
                <p className="text-white font-bold">Cliquez ou glissez le fichier CSV</p>
                <p className="text-xs text-slate-500 mt-1">Format recommandé : dataset.csv standard</p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 animate-in shake-in duration-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}

            {success && !error && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="text-xs font-medium">Données chargées avec succès ! {data.length} lignes traitées.</p>
              </div>
            )}

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Dataset actuel</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{data.length > 0 ? `${data.length} enregistrements` : 'Aucune donnée'}</p>
                </div>
              </div>
              <button onClick={refreshData} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Account & Security */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sécurité & Système</h3>
                <p className="text-xs text-slate-500">Configurations globales de la plateforme</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/20 border border-slate-800 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Réinitialiser le cache</p>
                    <p className="text-[10px] text-slate-500">Supprime les données locales stockées</p>
                  </div>
                </div>
                <button
                  onClick={() => { localStorage.clear(); window.location.reload(); }}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-bold rounded-xl transition-all"
                >
                  Exécuter
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
                <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Note sur le déploiement
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cette instance de LogiOptima IA est configurée pour un environnement PFA. Les optimisations IA utilisent un mix de solveurs OR-Tools et de modèles prédictifs basés sur le dataset CSV fourni.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
