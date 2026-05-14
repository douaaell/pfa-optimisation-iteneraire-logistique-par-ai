from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from database import get_db_connection

app = FastAPI() # Note: I'm adding this snippet to be integrated into main.py

class AssignDriver(BaseModel):
    driver_id: int

# Ce code sera intégré dans main.py
@app.patch("/api/deliveries/{id}/assign")
def assign_driver(id: int, body: AssignDriver):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # 1. Vérifier si le conducteur existe
        cursor.execute("SELECT id FROM drivers WHERE id = %s", (body.driver_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Conducteur non trouvé")
        
        # 2. Assigner le conducteur et changer le statut
        cursor.execute("UPDATE deliveries SET driver_id = %s, status = 'assigned' WHERE id = %s", (body.driver_id, id))
        conn.commit()
        return {"message": "Conducteur assigné avec succès"}
    finally:
        conn.close()
