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
    max_radius_km: Optional[float] = 5.0

@app.post("/api/allocate")
def allocate(payload: AllocationRequest):
    # Convert Pydantic models to dict for the logic
    equip_dicts = [eq.dict() for eq in payload.equipment_list]
    
    best_equipment, min_dist = allocate_equipment(
        request_location=payload.request_location,
        equipment_list=equip_dicts,
        max_radius_km=payload.max_radius_km
    )
    
    if not best_equipment:
        return {"assigned_equipment": None, "message": "No available equipment within radius."}
        
    return {
        "assigned_equipment": best_equipment,
        "travel_distance_km": round(min_dist, 2),
        "message": "Equipment allocated successfully."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
