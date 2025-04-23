# haversine.py
import math

def haversine(lat1, lon1, lat2, lon2):
    """
    Distância em km entre dois pontos geográficos.
    """
    R = 6371.0  # raio da Terra em km
    φ1, φ2 = math.radians(lat1), math.radians(lat2)
    Δφ = math.radians(lat2 - lat1)
    Δλ = math.radians(lon2 - lon1)

    a = math.sin(Δφ/2)**2 + math.cos(φ1) * math.cos(φ2) * math.sin(Δλ/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c
