import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

// Fix for default marker icons resolving correctly in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function AdminMap() {
  const [requests, setRequests] = useState([]);

  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/requests`);
        const data = await res.json();
        
        // Filter for allocated requests where equipmentId exists
        const activeRequests = data.filter(req => 
          (req.status === 'approved' || req.status === 'allocated') && 
          req.allocated_equipment
        );
        
        setRequests(activeRequests);
      } catch (err) {
        console.error('Error fetching requests for map:', err);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  return (
    <div className="flex-1 bg-white p-4 rounded-3xl shadow-lg border border-gray-200 flex flex-col relative min-h-[600px] z-0">
      <div className="flex justify-between items-center mb-4 px-2 z-10">
        <h2 className="text-xl font-bold text-gray-800">Live Dispatch Routing</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">System Online</span>
        </div>
      </div>
      
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 relative shadow-inner z-0">
        <MapContainer center={[30.7333, 76.7794]} zoom={11} className="h-full w-full absolute inset-0 z-0">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          
          {requests.map((req) => {
            // MongoDB GeoJSON is [Lng, Lat]
            const farmLocation = [req.location.coordinates[1], req.location.coordinates[0]];
            const equipmentLocation = [
              req.allocated_equipment.location.coordinates[1], 
              req.allocated_equipment.location.coordinates[0]
            ];
            
            return (
              <React.Fragment key={req._id}>
                <Marker position={farmLocation} icon={redIcon}>
                  <Popup>
                    <strong>Farmer:</strong> {req.farmer_id}<br/>
                    <strong>Need:</strong> {req.equipment_type}
                  </Popup>
                </Marker>

                <Marker position={equipmentLocation} icon={greenIcon}>
                  <Popup>
                    <strong>Fleet Name:</strong> {req.allocated_equipment.name}<br/>
                    <strong>Type:</strong> {req.allocated_equipment.type}<br/>
                    <strong>Status:</strong> Dispatched
                  </Popup>
                </Marker>

                <Polyline 
                  positions={[equipmentLocation, farmLocation]} 
                  pathOptions={{ color: 'blue', dashArray: '5, 10', weight: 4 }} 
                />
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Floating Legend Overlay - z-index is elevated tightly */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-gray-200 flex items-center gap-6 z-[1000] text-sm font-semibold text-gray-700">
          <div className="flex items-center gap-2">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" alt="red" className="h-5" />
            <span>Farm Need</span>
          </div>
          <div className="w-px h-6 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png" alt="green" className="h-5" />
            <span>Dispatched</span>
          </div>
          <div className="w-px h-6 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-6 border-t-4 border-dashed border-blue-500 rounded-full"></div>
            <span>Route</span>
          </div>
        </div>
      </div>
    </div>
  );
}
