import math
import requests

def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance in kilometers between two points 
    """
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_osrm_distance(lon1, lat1, lon2, lat2):
    try:
        url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false"
        response = requests.get(url, timeout=2)
        if response.status_code == 200:
            data = response.json()
            if "routes" in data and len(data["routes"]) > 0:
                distance_meters = data["routes"][0]["distance"]
                return distance_meters / 1000.0
    except Exception:
        pass
    # Fallback to haversine with a 1.2x typical road network multiplier
    return haversine(lon1, lat1, lon2, lat2) * 1.2

def allocate_equipment(request_location, equipment_list, max_radius_km=50.0):
    best_equipment = None
    min_distance = float('inf')
    lon_r, lat_r = request_location
    
    for eq in equipment_list:
        if eq.get('status') != 'available':
            continue
            
        lon_e, lat_e = eq['location']['coordinates']
        dist = get_osrm_distance(lon_r, lat_r, lon_e, lat_e)
        
        if dist <= max_radius_km and dist < min_distance:
            min_distance = dist
            best_equipment = eq
            
    return best_equipment, min_distance
