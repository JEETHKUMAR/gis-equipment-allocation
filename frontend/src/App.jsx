import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import FarmerApp from './components/FarmerApp';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Register from './components/Register';
import './styles.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const isFarmer = ['/', '/login', '/register', '/farmer'].includes(location.pathname);
  const isAdmin = location.pathname.includes('/admin');

  return (
    <div>
      <Toaster position="top-right" />
      <div className="nav bg-white shadow-sm border-b px-4 py-2 flex justify-center gap-4">
        <button 
          onClick={() => navigate('/login')} 
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${isFarmer ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Farmer App View
        </button>
        <button 
          onClick={() => navigate('/admin')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${isAdmin ? 'bg-slate-100 text-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Admin Dashboard View
        </button>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/farmer" element={<FarmerApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
