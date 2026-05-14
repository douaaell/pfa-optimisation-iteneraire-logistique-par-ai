from database import get_db_connection
from mysql.connector import Error

def migrate():
    conn = get_db_connection()
    if not conn:
        print("Erreur de connexion")
        return
    try:
        cursor = conn.cursor()
        print("Mise à jour des rôles dans la base de données (Suppression de 'operator')...")
        cursor.execute("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'client', 'driver') NOT NULL")
        conn.commit()
        print("Succès ! Le rôle 'driver' est maintenant supporté.")
    except Error as e:
        print(f"Erreur: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    migrate()
