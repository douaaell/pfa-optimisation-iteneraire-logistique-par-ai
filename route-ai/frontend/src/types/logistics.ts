export interface RouteData {
  route_id: string;
  start_city: string;
  end_city: string;
  end_country: string;
  vehicle_type: string;
  vehicle_id: string;
  driver_name: string;
  revenue: number;
  cost: number;
  profit: number;
  weight: number;
  capacity: number;
  utilization: number;
  delay_hours: number;
  travel_time_hours: number;
  delay_rate: number;
  on_time: boolean;
  date: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  optimized_ortools: boolean;
  optimized_ga: boolean;
  optimized_rl: boolean;
  optimized_hybrid: boolean;
  peak_hour: boolean;
  company: string;
  weather_condition: string;
  traffic_factor: number;
  predicted_delay: number;
  time_window_close: string;
  time_window_open: string;
  distance: number;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  priority: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalRoutes: number;
  avgDelay: number;
  onTimeRate: number;
  fleetUtilization: number;
}
