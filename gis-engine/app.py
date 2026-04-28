from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from allocation import allocate_equipment

app = FastAPI(title="GIS Engine - Equipment Allocation")

# Pydantic models for incoming requests
class Location(BaseModel):
    type: str = "Point"
    coordinates: List[float]

class Equipment(BaseModel):
    id: str
    name: str
    type: str
    location: Location
    status: str

class AllocationRequest(BaseModel):
    request_location: List[float] # [lon, lat]
    equipment_list: List[Equipment]
    initial_radius_km: Optional[float] = 5.0
    fallback_radius_km: Optional[float] = 50.0

@app.post("/api/allocate")
def allocate(payload: AllocationRequest):
    # Convert Pydantic models to dict for the logic
    equip_dicts = [eq.dict() for eq in payload.equipment_list]
    
    # Tier 1: Search within initial radius (5km)
    best_equipment, min_dist = allocate_equipment(
        request_location=payload.request_location,
        equipment_list=equip_dicts,
        max_radius_km=payload.initial_radius_km
    )
    
    radius_used = payload.initial_radius_km
    
    # Tier 2: Search within fallback radius (50km) if Tier 1 fails
    if not best_equipment:
        best_equipment, min_dist = allocate_equipment(
            request_location=payload.request_location,
            equipment_list=equip_dicts,
            max_radius_km=payload.fallback_radius_km
        )
        radius_used = payload.fallback_radius_km
    
    if not best_equipment:
        return {"assigned_equipment": None, "message": "No available equipment within radius.", "radius_used": None}
        
    return {
        "assigned_equipment": best_equipment,
        "travel_distance_km": round(min_dist, 2),
        "radius_used": radius_used,
        "message": "Equipment allocated successfully."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
