# LogiOptima IA 🚚🤖

**Projet de Fin d'Année (PFA) : Optimisation des Itinéraires Logistiques par Intelligence Artificielle**

LogiOptima IA est une plateforme Full-Stack innovante conçue pour les entreprises de logistique. Elle permet de gérer une flotte de véhicules, d'importer des commandes via CSV, et d'utiliser des algorithmes d'Intelligence Artificielle avancés pour trouver les itinéraires les plus rentables et les plus rapides tout en s'adaptant dynamiquement au trafic et à la météo.

---

## 🌟 Fonctionnalités Principales

- 📍 **Cartographie Interactive** : Visualisation en direct des véhicules et des clients sur carte (Leaflet).
- 🧠 **Moteur d'Optimisation Multi-Algorithmes** : Comparaison en temps réel des performances de l'IA.
- 🚦 **Gestion Dynamique des Aléas** : Simulation de la météo et du trafic modifiant les temps de trajet (ETA).
- 📊 **Tableau de Bord Administrateur** : Statistiques, gestion de la flotte et attribution automatique des missions.
- 📱 **Espaces Utilisateurs** : Interfaces dédiées pour l'Administrateur, les Chauffeurs (suivi) et les Clients.

---

## 🛠️ Stack Technique

- **Backend** : Python 3, FastAPI, SQLAlchemy
- **Base de données** : MySQL
- **Frontend** : React.js, Tailwind CSS
- **IA & Algorithmes** : Google OR-Tools, Algorithmes Génétiques (GA), Q-Learning (RL)

---

## ⚙️ Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :
- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js & npm](https://nodejs.org/)
- Un serveur MySQL local (ex: XAMPP, WAMP ou MySQL Workbench) en cours d'exécution.

---

## 🚀 Installation & Démarrage

### 1. Cloner le projet
Ouvrez votre terminal et naviguez dans le dossier principal du projet :
```bash
cd route-ai
```

### 2. Démarrer le Backend (API & IA)
Ouvrez un **premier terminal** pour lancer le serveur Python :

```bash
cd backend

# Installer les dépendances (la première fois seulement)
pip install -r requirements.txt

# Initialiser la base de données et importer le dataset CSV
python database.py

# Démarrer le serveur FastAPI
uvicorn main:app --reload
```
Le backend sera accessible sur `http://localhost:8000`.

### 3. Démarrer le Frontend (Interface Utilisateur)
Ouvrez un **deuxième terminal** pour lancer l'application React :

```bash
cd frontend

# Installer les dépendances Node (la première fois seulement)
npm install

# Démarrer l'application React
npm start
```
Le frontend s'ouvrira automatiquement dans votre navigateur sur `http://localhost:3000`.

---

## 🔬 Algorithmes d'Optimisation (VRP Solvers)
L'application propose 4 approches de calcul pour optimiser vos trajets :
1. **Google OR-Tools** : Solution exacte et ultra-rapide (PATH_CHEAPEST_ARC).
2. **Algorithme Génétique (GA)** : Recherche métaheuristique par évolution et mutations.
3. **Reinforcement Learning (RL)** : Apprentissage continu par système de récompenses (Q-Table).
4. **Stratégie Hybride** : La combinaison optimale retenue par le système.

---
*Projet réalisé dans le cadre du PFA.*
