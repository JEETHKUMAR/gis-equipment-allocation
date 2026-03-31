import React, { useState, useEffect } from 'react';
import FleetManager from './FleetManager';
import RequestManager from './RequestManager';
import AdminMap from './AdminMap';

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
  const [activeTab, setActiveTab] = useState('dashboard');

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
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`px-1 pt-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'dashboard' ? 'border-green-500 text-white' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('fleets')} 
                className={`px-1 pt-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'fleets' ? 'border-green-500 text-white' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'}`}
              >
                Fleets
              </button>
              <button 
                onClick={() => setActiveTab('requests')} 
                className={`px-1 pt-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'requests' ? 'border-green-500 text-white' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'}`}
              >
                Requests
              </button>
              <button 
                onClick={() => setActiveTab('settings')} 
                className={`px-1 pt-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'settings' ? 'border-green-500 text-white' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'}`}
              >
                Settings
              </button>
            </nav>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-600"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {activeTab === 'dashboard' && (
          <>
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

        <AdminMap />
          </>
        )}

        {activeTab === 'fleets' && <FleetManager />}
        {activeTab === 'requests' && <RequestManager />}
        
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex items-center justify-center text-gray-500">
            <p className="text-xl font-medium">Content for {activeTab} coming soon.</p>
          </div>
        )}

      </main>
    </div>
  );
}

