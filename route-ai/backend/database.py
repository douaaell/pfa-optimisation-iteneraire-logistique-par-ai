import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'logistique_db')
        )
        return conn
    except Error as e:
        print(f"Erreur de connexion: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if not conn: return

    try:
        cursor = conn.cursor()
        
        # 1. Création des tables uniquement si elles n'existent pas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'client', 'driver') NOT NULL,
                phone VARCHAR(20),
                company_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS drivers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE,
                name VARCHAR(255) NOT NULL,
                status ENUM('available', 'on_mission', 'offline') DEFAULT 'available',
                current_lat DOUBLE DEFAULT 33.5731,
                current_lng DOUBLE DEFAULT -7.5898,
                vehicle_type VARCHAR(50),
                vehicle_plate VARCHAR(20),
                rating DOUBLE DEFAULT 5.0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vehicles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_name VARCHAR(100) NOT NULL,
                vehicle_type VARCHAR(50) NOT NULL,
                capacity DOUBLE NOT NULL,
                status ENUM('available', 'on_delivery', 'maintenance', 'inactive') DEFAULT 'available',
                assigned_driver_id INT NULL,
                current_location VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (assigned_driver_id) REFERENCES drivers(id) ON DELETE SET NULL
            )
        """)

        # Ajout sécurisé des colonnes si elles manquent (pour éviter les erreurs d'initialisation)
        try:
            cursor.execute("ALTER TABLE drivers ADD COLUMN vehicle_plate VARCHAR(20)")
        except: pass
        try:
            cursor.execute("ALTER TABLE drivers ADD COLUMN rating DOUBLE DEFAULT 5.0")
        except: pass
        try:
            cursor.execute("ALTER TABLE drivers ADD COLUMN assigned_vehicle_id INT NULL")
            cursor.execute("ALTER TABLE drivers ADD FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL")
        except: pass

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS deliveries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT NOT NULL,
                driver_id INT NULL,
                vehicle_id INT NULL,
                start_address VARCHAR(255) NOT NULL,
                end_address VARCHAR(255) NOT NULL,
                start_city VARCHAR(100) NULL,
                end_city VARCHAR(100) NULL,
                start_lat DOUBLE NOT NULL,
                start_lng DOUBLE NOT NULL,
                end_lat DOUBLE NOT NULL,
                end_lng DOUBLE NOT NULL,
                priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                weight DOUBLE NOT NULL,
                status ENUM('pending', 'confirmed', 'assigned', 'accepted', 'in_progress', 'delivered') DEFAULT 'pending',
                distance_km DOUBLE NOT NULL,
                duration_text VARCHAR(50),
                cost DOUBLE,
                traffic_factor DOUBLE DEFAULT 1.0,
                weather_condition VARCHAR(50),
                predicted_delay DOUBLE DEFAULT 0.0,
                polyline TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES users(id),
                FOREIGN KEY (driver_id) REFERENCES drivers(id)
            )
        """)

        try:
            cursor.execute("ALTER TABLE deliveries ADD COLUMN algorithm_used VARCHAR(50) NULL")
        except: pass
        try:
            cursor.execute("ALTER TABLE deliveries ADD COLUMN eta_minutes INT DEFAULT 0")
        except: pass
        try:
            cursor.execute("ALTER TABLE deliveries MODIFY COLUMN status ENUM('pending', 'confirmed', 'assigned', 'accepted', 'in_progress', 'near_destination', 'delivered', 'cancelled', 'optimized') DEFAULT 'pending'")
        except: pass

        # Ajout des colonnes de fenêtre horaire si elles manquent
        try:
            cursor.execute("ALTER TABLE deliveries ADD COLUMN time_window_open VARCHAR(10) NULL")
        except: pass
        try:
            cursor.execute("ALTER TABLE deliveries ADD COLUMN time_window_close VARCHAR(10) NULL")
        except: pass
        try:
            cursor.execute("ALTER TABLE deliveries ADD COLUMN delivery_date DATE NULL")
        except: pass
        try:
            cursor.execute("ALTER TABLE deliveries ADD COLUMN delivery_date_end DATE NULL")
        except: pass
        try:
            cursor.execute("ALTER TABLE deliveries ADD COLUMN delivered_at DATETIME NULL")
        except: pass

        # 2. Création de l'ADMIN UNIQUE (uniquement s'il n'existe pas)
        cursor.execute("SELECT id FROM users WHERE email = 'douaa@gmail.com'")
        if not cursor.fetchone():
            print("Création de l'administrateur par défaut...")
            cursor.execute("""
                INSERT INTO users (first_name, last_name, email, password, role, company_name)
                VALUES ('Douaa', 'Admin', 'douaa@gmail.com', 'douaa123', 'admin', 'LogiOptima HQ')
            """)
        
        # 3. Synchronisation des conducteurs
        print("Vérification de la synchronisation des conducteurs...")
        cursor.execute("SELECT id, first_name, last_name FROM users WHERE role = 'driver'")
        users_drivers = cursor.fetchall()
        
        for u in users_drivers:
            # Gérer le format tuple ou dictionnaire selon le curseur
            u_id = u[0] if isinstance(u, tuple) else u['id']
            fname = u[1] if isinstance(u, tuple) else u['first_name']
            lname = u[2] if isinstance(u, tuple) else u['last_name']
            
            cursor.execute("SELECT id, status FROM drivers WHERE user_id = %s", (u_id,))
            drv = cursor.fetchone()
            
            if not drv:
                print(f"-> Création de la fiche conducteur pour : {fname} {lname}")
                cursor.execute("INSERT INTO drivers (user_id, name, status) VALUES (%s, %s, 'available')", (u_id, f"{fname} {lname}"))
                drv_id = cursor.lastrowid
            else:
                drv_id = drv[0] if isinstance(drv, tuple) else drv['id']
            
            # Correction automatique du statut basé sur les missions en cours
            cursor.execute("""
                SELECT COUNT(*) FROM deliveries 
                WHERE driver_id = %s AND status IN ('assigned', 'accepted', 'in_progress')
            """, (drv_id,))
            active_count = cursor.fetchone()[0]
            
            if active_count > 0:
                print(f"-> Mise à jour : {fname} est EN MISSION ({active_count} active(s))")
                cursor.execute("UPDATE drivers SET status = 'on_mission' WHERE id = %s", (drv_id,))
            else:
                # Uniquement si on n'est pas déjà offline
                cursor.execute("SELECT status FROM drivers WHERE id = %s", (drv_id,))
                current_status = cursor.fetchone()[0]
                if current_status == 'on_mission':
                    cursor.execute("UPDATE drivers SET status = 'available' WHERE id = %s", (drv_id,))

        conn.commit()
        print("Base de données synchronisée avec succès.")

    except Error as e:
        print(f"Erreur d'initialisation: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
