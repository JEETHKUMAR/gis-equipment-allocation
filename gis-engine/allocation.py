import math

def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees)
    """
    R = 6371.0 # Earth radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2) * math.sin(dlon / 2))
         
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    
    return distance

def allocate_equipment(request_location, equipment_list, max_radius_km=5.0):
    """
    Modified Nearest Neighbor algorithm.
    Finds the closest available equipment within max_radius_km.
    """
    best_equipment = None
    min_distance = float('inf')
    lon_r, lat_r = request_location
    
    for eq in equipment_list:
        if eq.get('status') != 'available':
            continue
            
        lon_e, lat_e = eq['location']['coordinates']
        dist = haversine(lon_r, lat_r, lon_e, lat_e)
        
        if dist <= max_radius_km and dist < min_distance:
            min_distance = dist
            best_equipment = eq
            
    return best_equipment, min_distance
