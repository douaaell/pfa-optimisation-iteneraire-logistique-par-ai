import pandas as pd
from sqlalchemy import create_engine

def import_routes_csv_to_mysql(csv_filepath):
    print(f"Lecture du fichier {csv_filepath}...")
    try:
        df = pd.read_csv(csv_filepath)
    except Exception as e:
        print(f"Erreur lors de la lecture du CSV: {e}")
        return

    # Connexion via SQLAlchemy (nécessaire pour pandas to_sql)
    # Remplacer par votre mot de passe si vous en avez un (actuellement root sans mdp)
    db_url = "mysql+mysqlconnector://root:@localhost/logistique_db"
    
    try:
        engine = create_engine(db_url)
        print("Importation des données massives dans MySQL (table 'historical_routes')...")
        
        # On insère tout d'un coup. S'il existe déjà, on remplace
        df.to_sql(name='historical_routes', con=engine, if_exists='replace', index=False)
        
        print("Importation réussie ! Vous avez", len(df), "itinéraires dans la base de données.")
    except Exception as e:
        print(f"Erreur lors de la connexion ou l'insertion MySQL: {e}")

if __name__ == "__main__":
    import_routes_csv_to_mysql("dataset.csv")
