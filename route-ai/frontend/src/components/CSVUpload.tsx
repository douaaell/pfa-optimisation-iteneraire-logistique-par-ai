import React, { useState, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const CSVUpload: React.FC = () => {
  const { loadCsvData, isLoading, error } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setFileName(file.name);
      loadCsvData(file);
    }
  }, [loadCsvData]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      loadCsvData(file);
    }
  }, [loadCsvData]);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            Importation des Données PFA
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Chargez votre fichier CSV pour alimenter les modèles d'IA.
          </p>
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-10 transition-all duration-300
          flex flex-col items-center justify-center gap-4
          ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'}
        `}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <span className="text-slate-300 font-medium">Analyse du CSV en cours...</span>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
            <span className="text-white font-medium">{fileName}</span>
            <span className="text-slate-400 text-xs">Données prêtes pour les algorithmes</span>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">Glissez-déposez votre CSV ici</p>
              <p className="text-slate-500 text-sm mt-1">ou cliquez pour parcourir vos fichiers</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-red-400 font-semibold uppercase text-xs">Erreur de validation</p>
            <p className="text-red-200 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {['route_id', 'traffic_factor', 'predicted_delay', 'weather_condition'].map((col) => (
          <div key={col} className="bg-slate-950/50 border border-slate-800 rounded-lg py-2 px-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-slate-500 text-xs font-mono">{col}</span>
          </div>
        ))}
        <div className="col-span-full text-center text-[10px] text-slate-500 uppercase tracking-widest mt-2">
          + 28 autres colonnes requises
        </div>
      </div>
    </div>
  );
};
