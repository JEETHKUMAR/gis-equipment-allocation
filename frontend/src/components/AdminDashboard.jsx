import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom icons using generic marker URLs to avoid local asset issues
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

export default function AdminDashboard() {
  const [activeRoutes, setActiveRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/dashboard/active-routes`);
        const data = await res.json();
        if (res.ok) {
          setActiveRoutes(data);
        }
      } catch (err) {
        console.error('Error fetching routes:', err);
      }
    };
    
    fetchRoutes();
    const interval = setInterval(fetchRoutes, 5000);
    return () => clearInterval(interval);
  }, []);

  // Polyline options for the dispatch route
  const polylineOptions = { color: 'blue', dashArray: '5, 10', weight: 4 };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                AG
              </div>
              <span className="font-bold text-xl tracking-wide">AgriConnect Admin</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="border-b-2 border-green-500 text-white px-1 pt-1 text-sm font-medium">Dashboard</a>
              <a href="#" className="border-transparent text-gray-300 hover:text-white hover:border-gray-300 border-b-2 px-1 pt-1 text-sm font-medium transition-colors">Fleets</a>
              <a href="#" className="border-transparent text-gray-300 hover:text-white hover:border-gray-300 border-b-2 px-1 pt-1 text-sm font-medium transition-colors">Requests</a>
              <a href="#" className="border-transparent text-gray-300 hover:text-white hover:border-gray-300 border-b-2 px-1 pt-1 text-sm font-medium transition-colors">Settings</a>
            </nav>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-600"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* KPI Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">24</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Available Tractors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">18</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-2xl">
              🚜
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Dispatched Fleets</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">12</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-2xl">
              🚚
            </div>
          </div>
        </div>

        {/* Massive Map Section */}
        <div className="flex-1 bg-white p-4 rounded-3xl shadow-lg border border-gray-200 flex flex-col relative min-h-[600px]">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-xl font-bold text-gray-800">Live Dispatch Routing</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">System Online</span>
            </div>
          </div>
          
          <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 relative shadow-inner">
            <MapContainer center={[30.7390, 76.7794]} zoom={13} className="h-full w-full absolute inset-0 z-0">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {activeRoutes.map((route) => (
                <React.Fragment key={route._id}>
                  <Marker position={route.farmLocation} icon={redIcon}>
                    <Popup>
                      <strong>Farm Request</strong><br/>
                      Status: Allocated
                    </Popup>
                  </Marker>

                  <Marker position={route.dispatchLocation} icon={greenIcon}>
                    <Popup>
                      <strong>{route.equipmentName}</strong><br/>
                      Status: Dispatched
                    </Popup>
                  </Marker>

                  <Polyline positions={[route.dispatchLocation, route.farmLocation]} pathOptions={polylineOptions} />
                </React.Fragment>
              ))}
            </MapContainer>

            {/* Floating Legend Overlay */}
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

      </main>
    </div>
  );
}
