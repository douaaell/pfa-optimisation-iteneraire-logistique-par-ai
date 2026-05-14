import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def check_data():
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'logistique_db')
    )
    cursor = conn.cursor(dictionary=True)
    
    print("--- UTILISATEURS (ROLE DRIVER) ---")
    cursor.execute("SELECT id, first_name, last_name, role FROM users WHERE role = 'driver'")
    users = cursor.fetchall()
    for u in users: print(u)
    
    print("\n--- TABLE DRIVERS ---")
    cursor.execute("SELECT * FROM drivers")
    drivers = cursor.fetchall()
    for d in drivers: print(d)
    
    conn.close()

if __name__ == "__main__":
    check_data()
