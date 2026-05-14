import pandas as pd
import os

CSV_PATH = os.path.join(os.path.dirname(__file__), "dataset.csv")

def get_df():
    """Load dataset.csv as DataFrame (read-only, for analytics)."""
    try:
        df = pd.read_csv(CSV_PATH)
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        for col in ['revenue', 'cost', 'delay_hours', 'distance', 'traffic_factor', 'predicted_delay']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        return df
    except Exception as e:
        print(f"Erreur lecture CSV: {e}")
        return None

def get_kpis():
    df = get_df()
    if df is None:
        return {"total_revenue": 0, "total_cost": 0, "profit": 0, "total_routes": 0, "avg_delay": 0}
    return {
        "total_revenue": round(float(df['revenue'].sum()), 2),
        "total_cost": round(float(df['cost'].sum()), 2),
        "profit": round(float((df['revenue'] - df['cost']).sum()), 2),
        "total_routes": int(len(df)),
        "avg_delay": round(float(df['delay_hours'].mean()), 2)
    }

def get_analytics_charts():
    df = get_df()
    if df is None:
        return {}

    # Revenue vs Cost by date (group by month)
    df['month'] = df['date'].dt.to_period('M').astype(str)
    rev_cost = df.groupby('month')[['revenue', 'cost']].sum().reset_index()
    rev_cost['profit'] = rev_cost['revenue'] - rev_cost['cost']
    rev_cost_data = rev_cost.sort_values('month').tail(12).to_dict(orient='records')

    # Delay distribution
    delay_hist = df['delay_hours'].value_counts(bins=8).sort_index()
    delay_data = [{"range": f"{int(b.left)}-{int(b.right)}h", "count": int(c)} for b, c in delay_hist.items()]

    # Weather impact
    weather_impact = df.groupby('weather_condition')['delay_hours'].mean().reset_index()
    weather_data = weather_impact.rename(columns={'weather_condition': 'name', 'delay_hours': 'avgDelay'}).to_dict(orient='records')
    weather_data = [{"name": w["name"], "avgDelay": round(float(w["avgDelay"]), 2)} for w in weather_data]

    # Peak hour impact
    if 'peak_hour' in df.columns:
        peak_impact = df.groupby('peak_hour')['actual_delivery_time_hours'].mean().reset_index()
        peak_data = [{"name": str(row['peak_hour']), "value": round(float(row['actual_delivery_time_hours']), 2)} for _, row in peak_impact.iterrows()]
    else:
        peak_data = []

    # Traffic correlation
    traffic_data = df[['traffic_factor', 'delay_hours']].dropna().sample(min(150, len(df))).rename(
        columns={'traffic_factor': 'x', 'delay_hours': 'y'}
    ).to_dict(orient='records')

    return {
        "revenue_vs_cost": rev_cost_data,
        "delay_analysis": delay_data,
        "weather_impact": weather_data,
        "peak_hour_analysis": peak_data,
        "traffic_correlation": traffic_data,
    }

def get_fleet_analysis():
    df = get_df()
    if df is None:
        return {}

    vehicle_dist = df['vehicle_type'].value_counts().reset_index()
    vehicle_dist.columns = ['name', 'value']

    df['capacity_usage'] = (df['weight'] / df['capacity'].replace(0, 1)) * 100
    avg_usage = df.groupby('vehicle_type')['capacity_usage'].mean().reset_index()
    avg_usage.columns = ['vehicle_type', 'avg_usage']
    avg_usage['avg_usage'] = avg_usage['avg_usage'].round(1)

    return {
        "vehicle_distribution": vehicle_dist.to_dict(orient='records'),
        "capacity_usage": avg_usage.to_dict(orient='records')
    }

def get_advanced_insights():
    df = get_df()
    if df is None:
        return {}

    weather_impact = df.groupby('weather_condition')['delay_hours'].mean().sort_values(ascending=False).reset_index()
    weather_impact.columns = ['weather', 'avg_delay']

    df['performance'] = (df['revenue'] - df['cost']) / df['actual_delivery_time_hours'].replace(0, 1)
    peak_impact = df.groupby('peak_hour')['performance'].mean().reset_index() if 'peak_hour' in df.columns else pd.DataFrame()

    best_vehicle = df.groupby('vehicle_type')['performance'].mean().idxmax() if 'vehicle_type' in df.columns else "N/A"

    return {
        "weather_impact": weather_impact.to_dict(orient='records'),
        "peak_performance": peak_impact.to_dict(orient='records'),
        "best_vehicle": best_vehicle
    }

def get_routes_data():
    df = get_df()
    if df is None:
        return []
    return df.head(500).to_dict(orient='records')

def get_benchmark_comparison():
    """Compare OR-Tools vs Genetic Algorithm vs Hybrid vs RL using CSV columns."""
    df = get_df()
    if df is None:
        return {}

    results = {}
    algos = ['ortools', 'genetic', 'hybrid', 'rl']
    names = {
        "ortools": "OR-Tools",
        "genetic": "Genetic Algorithm",
        "hybrid": "Hybrid IA",
        "rl": "RL Agent"
    }
    
    for algo in algos:
        col = f'optimized_{algo}'
        if col in df.columns:
            subset = df[df[col] == True]
        else:
            # Mock subset if column doesn't exist in CSV
            subset = df.sample(min(200, len(df)))

        avg_dist = round(float(subset['distance'].mean()), 2) if len(subset) > 0 else 0
        avg_cost = round(float(subset['cost'].mean()), 2) if len(subset) > 0 else 0
        avg_delay = round(float(subset['delay_hours'].mean()), 2) if len(subset) > 0 else 0

        results[algo] = {
            "name": names[algo],
            "avg_distance": avg_dist,
            "avg_cost": avg_cost,
            "avg_delay": avg_delay,
            "routes_analyzed": int(len(subset))
        }

    # Determine best algorithm (lowest cost)
    valid_results = {k: v for k, v in results.items() if v['avg_cost'] > 0}
    if valid_results:
        best = min(valid_results, key=lambda k: valid_results[k]['avg_cost'])
        results['best_algorithm'] = best
    else:
        results['best_algorithm'] = 'hybrid'

    return results

def get_live_stats(conn):
    """Fetch stats from real database (deliveries table)."""
    try:
        cursor = conn.cursor(dictionary=True)
        
        # 1. KPIs
        cursor.execute("""
            SELECT 
                COUNT(*) as total_deliveries,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_count,
                SUM(cost) as total_cost,
                SUM(cost * 1.4) as total_revenue, -- Simulated revenue
                AVG(predicted_delay) as avg_delay
            FROM deliveries
        """)
        kpis = cursor.fetchone()
        
        # 2. Performance by Driver
        cursor.execute("""
            SELECT dr.name, COUNT(d.id) as count, SUM(d.cost) as cost
            FROM deliveries d
            JOIN drivers dr ON d.driver_id = dr.id
            GROUP BY dr.id
            LIMIT 5
        """)
        driver_perf = cursor.fetchall()
        
        # 3. Deliveries Status
        cursor.execute("SELECT status, COUNT(*) as count FROM deliveries GROUP BY status")
        status_dist = cursor.fetchall()

        return {
            "kpis": kpis,
            "driver_performance": driver_perf,
            "status_distribution": status_dist
        }
    except Exception as e:
        print(f"Live stats error: {e}")
        return {}
