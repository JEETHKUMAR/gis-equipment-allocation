import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in as admin, skip login
  useEffect(() => {
    if (localStorage.getItem('auth_token') && localStorage.getItem('admin_role')) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('admin_role', 'true');
        navigate('/admin');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Ensure API gateway is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[calc(100vh-60px)] bg-slate-50 flex flex-col justify-center items-center p-4"
    >
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm mb-16 relative overflow-hidden border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage fleet operations</p>
        </div>
        
        {error && <div className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors shadow-sm disabled:bg-slate-100"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors shadow-sm disabled:bg-slate-100"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-bold py-3.5 rounded-xl transition-all mt-4 shadow-lg transform active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Secure Login'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm border-t pt-4">
          <Link to="/" className="font-semibold text-slate-600 hover:text-slate-800 transition-colors">
            ← Back to Portal Selection
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
