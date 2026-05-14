import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { RouteData, DashboardMetrics } from '../types/logistics';

export interface Delivery {
  id: number;
  client_id: number;
  driver_id: number | null;
  vehicle_id: number | null;
  start_address: string;
  end_address: string;
  start_city?: string; // Backwards compatibility
  end_city?: string;   // Backwards compatibility
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  city_ref?: string;
  priority: 'low' | 'medium' | 'high';
  weight: number;
  status: 'pending' | 'confirmed' | 'assigned' | 'accepted' | 'in_progress' | 'near_destination' | 'delivered' | 'cancelled' | 'optimized';
  distance_km: number;
  duration_text?: string;
  eta_minutes?: number | null; // Backwards compatibility
  delivery_date?: string;
  delivery_date_end?: string;
  time_window_open?: string;
  time_window_close?: string;
  algorithm_used?: string;
  cost: number | null;
  traffic_factor: number;
  weather_condition: string;
  predicted_delay: number;
  polyline?: string;
  created_at: string;
  delivered_at?: string;
  client_name?: string;
  client_phone?: string;
  company_name?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_plate?: string;
}

interface DataContextType {
  data: RouteData[];
  metrics: DashboardMetrics;
  mlMetrics: { accuracy: number; mae: number; trainingDate: string };
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  loadCsvData: (file: File) => void;
  
  // Live data
  deliveries: Delivery[];
  fetchDeliveries: (status?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
const API_BASE_URL = 'http://localhost:8000/api';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0, totalCost: 0, totalProfit: 0, totalRoutes: 0, avgDelay: 0, onTimeRate: 0, fleetUtilization: 0,
  });
  
  const [mlMetrics] = useState({
    accuracy: 94.2,
    mae: 0.45,
    trainingDate: new Date().toLocaleDateString()
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  // CSV Parsing logic (Historical)
  const processCsvText = (text: string) => {
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const processed = (results.data as any[]).filter(r => r.route_id).map(r => ({
          ...r,
          revenue: parseFloat(r.revenue) || 0,
          cost: parseFloat(r.cost) || 0,
          delay_hours: parseFloat(r.delay_hours) || 0,
        }));
        setData(processed);
        setIsLoading(false);
      },
    });
  };

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dataset`);
      if (res.ok) {
        const text = await res.text();
        processCsvText(text);
      } else { setIsLoading(false); }
    } catch (e) { setIsLoading(false); }
  }, []);

  const loadCsvData = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processCsvText(text);
    };
    reader.readAsText(file);
  };

  // Live Deliveries with ROLE ISOLATION
  const fetchDeliveries = useCallback(async (status?: string) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    try {
      let url = `${API_BASE_URL}/deliveries?role=${user.role}&user_id=${user.id}`;
      if (status) url += `&status=${status}`;
      
      const res = await fetch(url);
      if (res.ok) {
        setDeliveries(await res.json());
      }
    } catch (e) { console.error("Fetch deliveries failed", e); }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <DataContext.Provider value={{
      data, metrics, mlMetrics, isLoading, error, refreshData, loadCsvData,
      deliveries, fetchDeliveries
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
