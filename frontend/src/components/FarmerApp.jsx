import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function FarmerApp() {
  const navigate = useNavigate();
  const [equipmentType, setEquipmentType] = useState('Tractor');
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeRequests, setActiveRequests] = useState([]);
  
  const fetchMyRequests = async () => {
    try {
      const mobile = localStorage.getItem('farmer_id');
      if (!mobile) return;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/requests`);
      if (res.ok) {
        const data = await res.json();
        const myActive = data.filter(r => r.farmer_id === mobile && (r.status === 'allocated' || r.status === 'approved'));
        setActiveRequests(myActive);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
      navigate('/login');
    } else {
      fetchMyRequests();
      const interval = setInterval(fetchMyRequests, 5000);
      return () => clearInterval(interval);
    }
  }, [navigate]);

  const handleCompleteJob = async (reqId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/requests/${reqId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        toast.success("Job marked as complete. Equipment released!");
        fetchMyRequests();
      } else {
        toast.error("Failed to complete job.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!position) {
      toast.error("Please drop a pin on the map for your farm location.");
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const mobile = localStorage.getItem('farmer_id') || 'farmer_user';
      const payload = {
        farmer_id: mobile,
        equipment_type: equipmentType,
        farm_size: 10,
        crop: 'Wheat',
        location: { coordinates: [position.lat, position.lng] }
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/requests`, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        // We trigger the toast to exact text match the Playwright tests that read "text=Request confirmed!"
        toast.success(`Request confirmed! Status: ${data.request?.status || 'Allocated'}`);
        fetchMyRequests();
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('Network error submitting request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 flex flex-col items-center"
    >
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col md:min-h-[850px] md:my-10 md:rounded-3xl md:shadow-2xl overflow-hidden relative border border-gray-100">
        
        {/* Header Ribbon UI flair */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 to-green-600 z-50"></div>

        {/* Header */}
        <div className="bg-green-600 text-white p-6 shadow-md z-10 relative pt-8">
          <h2 className="text-2xl font-bold tracking-wide">Request Equipment</h2>
          <p className="text-green-100 text-sm mt-1">Select and pinpoint delivery location</p>
        </div>



        <form onSubmit={handleSubmitRequest} className="flex flex-col flex-grow p-5 space-y-6">
          {/* Equipment Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment Type</label>
            <div className="relative">
              <select 
                value={equipmentType} 
                onChange={e => setEquipmentType(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors shadow-sm appearance-none font-medium text-gray-800"
              >
                <option value="Tractor">🚜 Tractor</option>
                <option value="Rotavator">⚙️ Rotavator</option>
                <option value="Harvester">🌾 Harvester</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="flex-grow flex flex-col min-h-[350px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Location</label>
            <div className="rounded-2xl overflow-hidden border-4 border-white shadow-[0_0_15px_rgba(0,0,0,0.1)] flex-grow relative bg-gray-100">
              <MapContainer center={[30.7333, 76.7794]} zoom={11} className="h-full w-full absolute inset-0 z-0">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
              {/* Optional nice overlay hint */}
              {!position && (
                <div className="absolute inset-x-0 top-4 flex justify-center pointer-events-none z-[1000]">
                  <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                    Tap anywhere on the map
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-3">
              {position ? (
                 <div className="flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-2.5 px-4 rounded-xl text-sm font-semibold">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                   <span>{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
                 </div>
              ) : (
                 <div className="text-center py-2.5 text-sm text-gray-400 font-medium">
                   Pin pending...
                 </div>
              )}
            </div>
          </div>

          {/* Sticky CTA Button */}
          <div className="mt-auto pt-4 pb-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-extrabold text-lg py-4 rounded-2xl shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? 'Processing...' : 'Submit Request'}
            </button>
          </div>
        </form>

        {activeRequests.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50 flex-grow">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Active Equipment</h3>
            <div className="space-y-4">
              {activeRequests.map(req => (
                <div key={req._id} className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{req.equipment_type}</p>
                    <p className="text-xs text-gray-500 mt-1">Dispatched to your location</p>
                  </div>
                  <button 
                    onClick={() => handleCompleteJob(req._id)}
                    className="text-xs font-bold bg-green-100 hover:bg-green-200 text-green-700 py-2 px-3 rounded-lg transition-colors"
                  >
                    Complete Job
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
