import React, { useState, useEffect } from 'react';
import FleetManager from './FleetManager';
import RequestManager from './RequestManager';
import AdminMap from './AdminMap';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [activeRoutes, setActiveRoutes] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [kpis, setKpis] = useState({ requests: 0, tractors: 0, dispatch: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;
        const resRoutes = await fetch(`${apiUrl}/api/dashboard/active-routes`);
        if (resRoutes.ok) {
          const dataRoutes = await resRoutes.json();
          setActiveRoutes(dataRoutes);
        }

        const resDash = await fetch(`${apiUrl}/api/dashboard`);
        if (resDash.ok) {
          const dashData = await resDash.json();
          const requestsCount = dashData.requests?.filter(r => r.status === 'pending').length || 0;
          const tractorsCount = dashData.equipment?.filter(e => e.status === 'available' && e.type === 'Tractor').length || 0;
          const dispatchCount = dashData.equipment?.filter(e => e.status === 'assigned').length || 0;
          setKpis({ requests: requestsCount, tractors: tractorsCount, dispatch: dispatchCount });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
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
              <button 
                onClick={() => {
                  localStorage.clear();
                  navigate('/');
                }}
                className="text-sm font-bold bg-slate-800 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-red-500 transition-colors"
              >
                Logout
              </button>
              <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center font-bold text-xs text-white">AD</div>
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{kpis.requests}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Available Tractors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{kpis.tractors}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-2xl">
              🚜
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Dispatched Fleets</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{kpis.dispatch}</p>
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
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">System Preferences</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-lg text-gray-700">UI & Animations</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-green-600 rounded focus:ring-green-500" defaultChecked />
                  <span className="text-gray-600">Enable Map Route Pulsing</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-green-600 rounded focus:ring-green-500" defaultChecked />
                  <span className="text-gray-600">Dynamic Card Hover Effects</span>
                </label>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-lg text-gray-700">Data Management</h3>
                <p className="text-sm text-gray-500">Clear cached logistics data. Note: this will not delete database records, only local UI state.</p>
                <button 
                  onClick={() => {
                    localStorage.removeItem('activeRoutes');
                    alert('Local cache cleared successfully.');
                  }}
                  className="w-fit bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg transition-colors border border-slate-200"
                >
                  Clear Local Cache
                </button>
              </div>
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
}

