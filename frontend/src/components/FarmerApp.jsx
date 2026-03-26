import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [step, setStep] = useState('mobile'); // 'mobile' | 'otp'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [equipmentType, setEquipmentType] = useState('Tractor');
  const [position, setPosition] = useState(null);
  const [toast, setToast] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      if (res.ok) {
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Ensure API gateway is running.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp })
      });
      const data = await res.json();
      if (res.ok) {
        // Store JWT token securely
        localStorage.setItem('auth_token', data.token);
        setIsLoggedIn(true);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error during verification.');
    }
    setLoading(false);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!position) {
      alert("Please drop a pin on the map for your farm location.");
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      const payload = {
        farmer_id: mobile || 'farmer_user',
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
        setToast(`Request confirmed! Status: ${data.request?.status || 'Allocated'}`);
        setTimeout(() => setToast(''), 5000);
      } else {
        alert(data.error || 'Failed to submit request');
      }
    } catch (err) {
      alert('Network error submitting request');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm mb-16 relative overflow-hidden">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Farmer Login</h2>
            <p className="mt-2 text-sm text-gray-500">Access your equipment dashboard</p>
          </div>
          
          {error && <div className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}

          {step === 'mobile' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                <input 
                  type="text" 
                  value={mobile} 
                  onChange={e => setMobile(e.target.value)} 
                  required 
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm disabled:bg-gray-100"
                  placeholder="+91 99999 99999"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3.5 rounded-xl transition duration-200 mt-4 shadow-lg transform active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP sent to {mobile}</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  required 
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm tracking-widest text-center text-xl font-bold disabled:bg-gray-100"
                  placeholder="• • • • • •"
                  maxLength={6}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3.5 rounded-xl transition duration-200 mt-4 shadow-lg transform active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? 'Verifying...' : 'Secure Login'}
              </button>
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => { setStep('mobile'); setError(''); setOtp(''); }}
                  className="text-green-600 font-semibold text-sm hover:underline"
                >
                  Change Mobile Number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col md:min-h-[850px] md:my-10 md:rounded-3xl md:shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-green-600 text-white p-6 shadow-md z-10 relative">
          <h2 className="text-2xl font-bold tracking-wide">Request Equipment</h2>
          <p className="text-green-100 text-sm mt-1">Select and pinpoint delivery location</p>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center z-[2000] border border-green-400 w-[90%] md:w-auto">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span className="font-semibold text-sm whitespace-nowrap">{toast}</span>
          </div>
        )}

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
              className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-extrabold text-lg py-4 rounded-2xl shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] transition-all transform active:scale-95"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
