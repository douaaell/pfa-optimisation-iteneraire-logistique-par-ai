import random
import math
from algorithms.solvers import VRPSolver

class OptimizerService:
    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        # Haversine formula (approx)
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)

    @classmethod
    def optimize(cls, delivery_id, start_lat, start_lng, end_lat, end_lng, weight, priority, algo_choice=None):
        solver = VRPSolver(start_lat, start_lng, end_lat, end_lng, num_waypoints=4)
        
        ortools_res = solver.solve_ortools()
        ortools_res["name"] = "OR-Tools (Google)"
        
        genetic_res = solver.solve_genetic()
        genetic_res["name"] = "Genetic Algorithm"
        
        rl_res = solver.solve_rl()
        rl_res["name"] = "Reinforcement Learning"
        
        hybrid_res = solver.solve_hybrid()
        hybrid_res["name"] = "Hybrid IA"
        
        algorithms = {
            "ortools": ortools_res,
            "genetic": genetic_res,
            "hybrid": hybrid_res,
            "rl": rl_res
        }
        
        # Automatically select the best (Hybrid in this case) or use user choice
        best_algo = algo_choice if (algo_choice and algo_choice in algorithms) else "hybrid"
        result = algorithms[best_algo]
        
        # Add dynamic factors
        traffic_factor = 1.0 + (random.randint(0, 15) / 10.0) if random.random() > 0.5 else 1.0
        weather = random.choice(["Clear", "Sunny", "Rainy", "Windy"])
        
        return {
            "delivery_id": delivery_id,
            "best_algorithm": best_algo,
            "algorithms": algorithms,
            "selected": {
                **result,
                "traffic_factor": traffic_factor,
                "weather": weather,
                "predicted_delay": 0.5 if weather == "Rainy" else 0.0
            }
        }
