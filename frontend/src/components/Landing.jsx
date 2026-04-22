import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();

  // If already logged in, redirect based on token
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const farmerId = localStorage.getItem('farmer_id');
    const adminRole = localStorage.getItem('admin_role'); // we will set this in admin login
    
    if (token) {
      if (adminRole) {
        navigate('/admin');
      } else if (farmerId) {
        navigate('/farmer');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg text-center"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">AgriConnect</h1>
        <p className="text-gray-500 mb-10">Select your portal to continue</p>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <button 
            onClick={() => navigate('/farmer-login')}
            className="flex flex-col items-center p-6 bg-green-50 hover:bg-green-100 rounded-2xl transition-colors border border-green-100 group"
          >
            <div className="bg-green-500 text-white p-3 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-semibold text-green-900 text-lg">Farmer App View</span>
            <span className="text-sm text-green-700 mt-2">Request equipment & manage tasks</span>
          </button>

          <button 
            onClick={() => navigate('/admin-login')}
            className="flex flex-col items-center p-6 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-100 group"
          >
            <div className="bg-slate-700 text-white p-3 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900 text-lg">Admin Dashboard View</span>
            <span className="text-sm text-slate-600 mt-2">Fleet management & dispatch</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
