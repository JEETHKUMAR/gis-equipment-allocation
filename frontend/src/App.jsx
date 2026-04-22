import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import FarmerApp from './components/FarmerApp';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import Register from './components/Register';
import Landing from './components/Landing';
import './styles.css';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) return <Navigate to="/" replace />;
  if (role === 'admin' && !localStorage.getItem('admin_role')) return <Navigate to="/admin-login" replace />;
  if (role === 'farmer' && localStorage.getItem('admin_role')) return <Navigate to="/admin" replace />;
  return children;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('auth_token');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('farmer_id');
    localStorage.removeItem('admin_role');
    navigate('/');
  };

  return (
    <div>
      <Toaster position="top-right" />
      
      {token && (
        <div className="nav bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center">
          <div className="font-bold text-xl text-green-700">AgriConnect</div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/farmer-login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/farmer" element={<ProtectedRoute role="farmer"><FarmerApp /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
