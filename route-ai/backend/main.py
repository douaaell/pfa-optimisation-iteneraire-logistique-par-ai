from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import mysql.connector
from database import get_db_connection, init_db
from optimizer import OptimizerService
import analytics
from typing import Optional, List
import os
import random

app = FastAPI(title="LogiOptima IA - Hybrid (Maps + CSV)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MODELS ──────────────────────────────────────────────────────────────────

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: str
    phone: Optional[str] = None
    company_name: Optional[str] = None

class DeliveryCreate(BaseModel):
    client_id: int
    start_address: str
    end_address: str
    start_city: Optional[str] = None
    end_city: Optional[str] = None
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    priority: str = "medium"
    weight: float
    distance_km: float
    duration_text: str
    cost: float
    delivery_date: Optional[str] = None
    delivery_date_end: Optional[str] = None
    time_window_open: Optional[str] = None
    time_window_close: Optional[str] = None
    polyline: Optional[str] = None

class UpdateStatus(BaseModel):
    status: str

class AssignDelivery(BaseModel):
    driver_id: Optional[int] = None
    vehicle_id: Optional[int] = None

class LocationUpdate(BaseModel):
    mission_id: int
    lat: float
    lng: float


class VehicleBase(BaseModel):
    vehicle_name: str
    vehicle_type: str
    capacity: float
    status: str = "available"
    assigned_driver_id: Optional[int] = None
    current_location: Optional[str] = None

# ─── AUTH ─────────────────────────────────────────────────────────────────────

@app.post("/login")
def login(user: UserLogin):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id, u.first_name, u.last_name, u.role, u.email, u.company_name, d.id as driver_id, d.assigned_vehicle_id
            FROM users u
            LEFT JOIN drivers d ON u.id = d.user_id
            WHERE u.email = %s AND u.password = %s
        """, (user.email, user.password))
        db_user = cursor.fetchone()
        if db_user:
            db_user['username'] = f"{db_user['first_name']} {db_user['last_name']}"
            return {"message": "Success", "user": db_user}
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    finally: conn.close()

@app.post("/register")
def register(user: UserRegister):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # 1. Vérifier si l'email existe déjà
        cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
        
        # 2. Créer l'utilisateur
        cursor.execute("""
            INSERT INTO users (first_name, last_name, email, password, role, phone, company_name)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (user.first_name, user.last_name, user.email, user.password, user.role, user.phone, user.company_name))
        user_id = cursor.lastrowid
        
        # 3. Si c'est un chauffeur, créer sa fiche conducteur
        if user.role == 'driver':
            cursor.execute("INSERT INTO drivers (user_id, name, status) VALUES (%s, %s, 'available')", (user_id, f"{user.first_name} {user.last_name}"))
        
        conn.commit()
        return {"message": "Utilisateur créé avec succès", "id": user_id}
    finally: conn.close()

# ─── DELIVERIES ──────────────────────────────────────────────────────────────

@app.get("/api/deliveries")
def get_deliveries(role: str = Query(...), user_id: Optional[int] = None, status: Optional[str] = None):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT d.*, u.company_name, CONCAT(u.first_name, ' ', u.last_name) as client_name, u.phone as client_phone,
                   dr.name as driver_name, ud.phone as driver_phone,
                   dr.current_lat, dr.current_lng, v.vehicle_name, v.vehicle_type
            FROM deliveries d
            LEFT JOIN users u ON d.client_id = u.id
            LEFT JOIN drivers dr ON d.driver_id = dr.id
            LEFT JOIN users ud ON dr.user_id = ud.id
            LEFT JOIN vehicles v ON d.vehicle_id = v.id
        """
        params = []
        conditions = []
        if role == "client":
            conditions.append("d.client_id = %s")
            params.append(user_id)
        elif role == "driver":
            cursor.execute("SELECT id FROM drivers WHERE user_id = %s", (user_id,))
            drv = cursor.fetchone()
            if drv: conditions.append("d.driver_id = %s"); params.append(drv['id'])
            else: return []
        
        if status: conditions.append("d.status = %s"); params.append(status)
        if conditions: query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY d.created_at DESC"
        cursor.execute(query, params)
        return cursor.fetchall()
    finally: conn.close()

@app.post("/api/deliveries")
def create_delivery(d: DeliveryCreate):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # 🧠 HYBRID IA ENRICHMENT
        address_text = d.start_address.lower()
        if "casablanca" in address_text:
            traffic_factor = 2.4; weather = "Cloudy"; predicted_delay = 1.2
        elif "rabat" in address_text:
            traffic_factor = 1.8; weather = "Sunny"; predicted_delay = 0.4
        else:
            traffic_factor = 1.2; weather = "Clear"; predicted_delay = 0.0
        
        cursor.execute("""
            INSERT INTO deliveries (client_id, start_address, end_address, start_city, end_city, start_lat, start_lng, end_lat, end_lng, 
            priority, weight, status, distance_km, duration_text, cost, traffic_factor, weather_condition, predicted_delay, 
            delivery_date, delivery_date_end, time_window_open, time_window_close, polyline)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (d.client_id, d.start_address, d.end_address, d.start_city, d.end_city, d.start_lat, d.start_lng, d.end_lat, d.end_lng,
              d.priority, d.weight, d.distance_km, d.duration_text, d.cost, traffic_factor, weather, predicted_delay, 
              d.delivery_date, d.delivery_date_end, d.time_window_open, d.time_window_close, d.polyline))
        conn.commit()
        return {"id": cursor.lastrowid}
    finally: conn.close()

@app.patch("/api/deliveries/{id}/assign")
def assign_delivery(id: int, body: AssignDelivery):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        updates = []
        params = []
        
        if body.driver_id is not None:
            cursor.execute("SELECT assigned_vehicle_id FROM drivers WHERE id = %s", (body.driver_id,))
            driver_info = cursor.fetchone()
            if not driver_info or driver_info[0] is None:
                raise HTTPException(status_code=400, detail="Ce conducteur n'a pas de véhicule assigné.")
            updates.append("driver_id = %s")
            params.append(body.driver_id)
            # Automatiquement assigner le véhicule du conducteur à la livraison
            updates.append("vehicle_id = %s")
            params.append(driver_info[0])
            body.vehicle_id = driver_info[0]

        elif body.vehicle_id is not None:
            updates.append("vehicle_id = %s")
            params.append(body.vehicle_id)
            
        if updates:
            updates.append("status = 'assigned'")
            query = "UPDATE deliveries SET " + ", ".join(updates) + " WHERE id = %s"
            params.append(id)
            cursor.execute(query, params)
            
            if body.driver_id is not None:
                cursor.execute("UPDATE drivers SET status = 'on_mission' WHERE id = %s", (body.driver_id,))
            if body.vehicle_id is not None:
                cursor.execute("UPDATE vehicles SET status = 'on_delivery' WHERE id = %s", (body.vehicle_id,))
        conn.commit()
        return {"message": "Assigned"}
    finally: conn.close()

@app.patch("/api/deliveries/{id}/status")
def update_status(id: int, body: UpdateStatus):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # Mise à jour du statut et du timestamp de livraison si applicable
        if body.status == 'delivered':
            cursor.execute("UPDATE deliveries SET status = %s, delivered_at = NOW() WHERE id = %s", (body.status, id))
        else:
            cursor.execute("UPDATE deliveries SET status = %s WHERE id = %s", (body.status, id))
        
        # Si la livraison est terminée, annulée ou déclinée, libérer le chauffeur et le véhicule
        if body.status in ['delivered', 'cancelled', 'pending']:
            cursor.execute("SELECT driver_id, vehicle_id FROM deliveries WHERE id = %s", (id,))
            res = cursor.fetchone()
            if res:
                if res[0]:
                    cursor.execute("UPDATE drivers SET status = 'available' WHERE id = %s", (res[0],))
                if res[1]:
                    cursor.execute("UPDATE vehicles SET status = 'available' WHERE id = %s", (res[1],))
            
            # Si déclinée, on retire explicitement l'assignation
            if body.status == 'pending':
                cursor.execute("UPDATE deliveries SET driver_id = NULL, vehicle_id = NULL WHERE id = %s", (id,))
        
        conn.commit()
        return {"message": "Status updated"}
    finally: conn.close()

@app.post("/api/admin/optimize/{delivery_id}")
def run_ai_optimization(delivery_id: int, algo: Optional[str] = None):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        # Fetch the delivery details
        cursor.execute("SELECT * FROM deliveries WHERE id = %s", (delivery_id,))
        delivery = cursor.fetchone()
        if not delivery:
            raise HTTPException(status_code=404, detail="Delivery not found")
        
        # Run the Optimizer
        optimization_result = OptimizerService.optimize(
            delivery_id,
            delivery['start_lat'], delivery['start_lng'],
            delivery['end_lat'], delivery['end_lng'],
            delivery['weight'], delivery['priority'],
            algo_choice=algo
        )
        
        sel = optimization_result['selected']
        
        # Update the delivery with optimized data
        cursor.execute("""
            UPDATE deliveries 
            SET distance_km = %s, cost = %s, eta_minutes = %s, 
                traffic_factor = %s, weather_condition = %s, predicted_delay = %s,
                algorithm_used = %s, status = 'optimized'
            WHERE id = %s
        """, (
            sel['distance_km'], sel['cost'], sel['eta_minutes'],
            sel['traffic_factor'], sel['weather'], sel['predicted_delay'],
            optimization_result['best_algorithm'],
            delivery_id
        ))
        conn.commit()
        
        # Ensure we return a consistent best_algorithm name
        best_algo = algo if (algo and algo in ["ortools", "genetic", "hybrid", "rl"]) else "hybrid"
        
        return optimization_result
    finally: conn.close()

@app.get("/api/admin/simulation/active")
def get_active_simulation_data():
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        # Fetch in_progress deliveries for the live simulator
        cursor.execute("""
            SELECT d.id, d.start_lat, d.start_lng, d.end_lat, d.end_lng, 
                   d.status, d.traffic_factor, d.weather_condition, d.predicted_delay,
                   dr.name as driver_name, dr.current_lat, dr.current_lng,
                   v.vehicle_name
            FROM deliveries d
            JOIN drivers dr ON d.driver_id = dr.id
            JOIN vehicles v ON d.vehicle_id = v.id
            WHERE d.status IN ('accepted', 'in_progress')
        """)
        return cursor.fetchall()
    finally: conn.close()
    
@app.patch("/api/drivers/{id}/status")
def update_driver_status(id: int, body: UpdateStatus):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE drivers SET status = %s WHERE id = %s", (body.status, id))
        conn.commit()
        return {"message": "Driver status updated"}
    finally: conn.close()

@app.post("/api/drivers/{id}/location")
def update_driver_location(id: int, loc: LocationUpdate):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE drivers SET current_lat = %s, current_lng = %s WHERE id = %s", (loc.lat, loc.lng, id))
        conn.commit()
        return {"message": "Location updated"}
    finally: conn.close()

# ─── ADMIN TOOLS ─────────────────────────────────────────────────────────────

@app.get("/api/admin/drivers")
def get_all_drivers():
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT d.id, d.name, d.status, d.assigned_vehicle_id, d.rating,
                   u.email, u.phone,
                   v.vehicle_name as assigned_vehicle_name, v.vehicle_type as assigned_vehicle_type,
                   (SELECT COUNT(*) FROM deliveries WHERE driver_id = d.id) as total_missions
            FROM drivers d
            LEFT JOIN users u ON d.user_id = u.id
            LEFT JOIN vehicles v ON d.assigned_vehicle_id = v.id
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally: conn.close()

@app.get("/api/admin/vehicles")
def get_all_vehicles():
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT v.*, dr.name as assigned_driver_name 
            FROM vehicles v 
            LEFT JOIN drivers dr ON v.assigned_driver_id = dr.id
            ORDER BY v.created_at DESC
        """)
        return cursor.fetchall()
    finally: conn.close()

@app.get("/api/admin/clients")
def get_all_clients():
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT id, first_name, last_name, email, phone, company_name, created_at,
                   (SELECT COUNT(*) FROM deliveries WHERE client_id = u.id) as total_orders
            FROM users u
            WHERE role = 'client'
            ORDER BY created_at DESC
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally: conn.close()

@app.post("/api/admin/vehicles")
def create_vehicle(v: VehicleBase):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO vehicles (vehicle_name, vehicle_type, capacity, status, assigned_driver_id, current_location)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (v.vehicle_name, v.vehicle_type, v.capacity, v.status, v.assigned_driver_id, v.current_location))
        vehicle_id = cursor.lastrowid
        
        if v.assigned_driver_id:
            # S'assurer que le conducteur n'est pas déjà assigné ailleurs
            cursor.execute("UPDATE vehicles SET assigned_driver_id = NULL WHERE assigned_driver_id = %s AND id != %s", (v.assigned_driver_id, vehicle_id))
            cursor.execute("UPDATE drivers SET assigned_vehicle_id = %s WHERE id = %s", (vehicle_id, v.assigned_driver_id))
            
        conn.commit()
        return {"message": "Vehicle created successfully", "id": vehicle_id}
    finally: conn.close()

@app.put("/api/admin/vehicles/{id}")
def update_vehicle(id: int, v: VehicleBase):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE vehicles 
            SET vehicle_name = %s, vehicle_type = %s, capacity = %s, status = %s, assigned_driver_id = %s, current_location = %s
            WHERE id = %s
        """, (v.vehicle_name, v.vehicle_type, v.capacity, v.status, v.assigned_driver_id, v.current_location, id))
        
        cursor.execute("UPDATE drivers SET assigned_vehicle_id = NULL WHERE assigned_vehicle_id = %s", (id,))
        if v.assigned_driver_id:
            # S'assurer que le conducteur n'est pas déjà assigné à un AUTRE véhicule
            cursor.execute("UPDATE vehicles SET assigned_driver_id = NULL WHERE assigned_driver_id = %s AND id != %s", (v.assigned_driver_id, id))
            cursor.execute("UPDATE drivers SET assigned_vehicle_id = %s WHERE id = %s", (id, v.assigned_driver_id))
            
        conn.commit()
        return {"message": "Vehicle updated successfully"}
    finally: conn.close()

@app.delete("/api/admin/vehicles/{id}")
def delete_vehicle(id: int):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM vehicles WHERE id = %s", (id,))
        conn.commit()
        return {"message": "Vehicle deleted successfully"}
    finally: conn.close()

@app.delete("/api/admin/drivers/{id}")
def delete_driver(id: int):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Récupérer le user_id associé avant la suppression
        cursor.execute("SELECT user_id FROM drivers WHERE id = %s", (id,))
        row = cursor.fetchone()
        user_id = row[0] if row else None
        
        # On libère le véhicule si nécessaire
        cursor.execute("UPDATE vehicles SET assigned_driver_id = NULL WHERE assigned_driver_id = %s", (id,))
        # On détache le chauffeur des livraisons en cours/passées
        cursor.execute("UPDATE deliveries SET driver_id = NULL WHERE driver_id = %s", (id,))
        # On supprime le conducteur
        cursor.execute("DELETE FROM drivers WHERE id = %s", (id,))
        
        # On supprime aussi le compte utilisateur définitif
        if user_id:
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            
        conn.commit()
        return {"message": "Driver and account deleted successfully"}
    finally: conn.close()

@app.delete("/api/admin/clients/{id}")
def delete_client(id: int):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Supprimer les livraisons liées ou les mettre à NULL
        cursor.execute("DELETE FROM deliveries WHERE client_id = %s", (id,))
        # Supprimer l'utilisateur
        cursor.execute("DELETE FROM users WHERE id = %s", (id,))
        conn.commit()
        return {"message": "Client deleted successfully"}
    finally: conn.close()

@app.get("/api/admin/fleet_stats")
def get_fleet_stats():
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT status, COUNT(*) as count FROM vehicles GROUP BY status")
        status_counts = cursor.fetchall()
        
        cursor.execute("SELECT vehicle_type, COUNT(*) as count FROM vehicles GROUP BY vehicle_type")
        type_counts = cursor.fetchall()
        
        cursor.execute("SELECT vehicle_type, SUM(capacity) as total_capacity FROM vehicles GROUP BY vehicle_type")
        capacity_counts = cursor.fetchall()

        return {
            "status_counts": status_counts,
            "type_counts": type_counts,
            "capacity_counts": capacity_counts
        }
    finally: conn.close()

@app.get("/api/drivers/{id}/missions")
def get_driver_missions(id: int):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM deliveries WHERE driver_id = %s ORDER BY id DESC", (id,))
        return cursor.fetchall()
    finally: conn.close()

@app.get("/api/drivers/user/{user_id}")
def get_driver_by_user_id(user_id: int):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM drivers WHERE user_id = %s", (user_id,))
        return cursor.fetchone()
    finally: conn.close()

@app.get("/api/drivers/{id}/vehicle")
def get_driver_vehicle(id: int):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT v.* 
            FROM drivers d
            JOIN vehicles v ON d.assigned_vehicle_id = v.id
            WHERE d.id = %s
        """, (id,))
        return cursor.fetchone()
    finally: conn.close()

@app.get("/api/admin/fleet")
def get_fleet_status():
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, current_lat, current_lng, status FROM drivers")
        return cursor.fetchall()
    finally: conn.close()

@app.get("/api/admin/live_stats")
def get_live_stats():
    conn = get_db_connection()
    try: return analytics.get_live_stats(conn)
    finally: conn.close()

@app.get("/api/admin/analytics")
def get_analytics(): return analytics.get_analytics_charts()

@app.get("/api/admin/benchmark")
def get_benchmark():
    return analytics.get_benchmark_comparison()

@app.get("/api/fix-db")
def fix_db():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Fix invalid empty strings
        cursor.execute("UPDATE deliveries SET status = 'pending' WHERE status = '' OR status IS NULL")
        # Alter table to include optimized and near_destination
        cursor.execute("ALTER TABLE deliveries MODIFY COLUMN status ENUM('pending', 'confirmed', 'assigned', 'accepted', 'in_progress', 'near_destination', 'delivered', 'cancelled', 'optimized') DEFAULT 'pending'")
        # Update delivery 6 back to optimized
        cursor.execute("UPDATE deliveries SET status = 'optimized' WHERE id = 6")
        conn.commit()
        return {"message": "DB Fixed"}
    except Exception as e:
        return {"error": str(e)}
    finally: conn.close()

@app.get("/api/dataset")
def get_dataset():
    path = os.path.join(os.path.dirname(__file__), "dataset.csv")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f: return f.read()
    return ""
