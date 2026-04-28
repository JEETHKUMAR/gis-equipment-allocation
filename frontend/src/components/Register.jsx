import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    role: 'farmer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Full Name is required";
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) return "Phone number must be exactly 10 digits";
    if (formData.password.length < 6) return "Password must be at least 6 characters strong";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success("Registration successful! Please login.");
      // Redirect to login
      navigate('/login');

    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-60px)] bg-gray-50 flex flex-col justify-center items-center p-4 py-12"
    >
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden border border-gray-100">
        
        {/* Header Ribbon UI flair */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

        <div className="text-center mb-8 mt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-gray-500">Join the AgriConnect ecosystem</p>
        </div>
        
        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start">
             <span className="mr-2 mt-0.5 font-bold">!</span>
             {error}
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName} 
              onChange={handleChange} 
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors shadow-sm bg-gray-50 focus:bg-white"
              placeholder="e.g. Ramesh Kumar"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400 font-medium">+91</span>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone} 
                onChange={handleChange} 
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors shadow-sm bg-gray-50 focus:bg-white"
                placeholder="99999 99999"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors shadow-sm bg-gray-50 focus:bg-white appearance-none"
            >
              <option value="farmer">Farmer (Need Equipment)</option>
              <option value="owner">Equipment Owner (Provide Equipment)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors shadow-sm bg-gray-50 focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center items-center bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3.5 rounded-xl transition duration-200 mt-6 shadow-lg shadow-green-600/30 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5 mr-3" /> : null}
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm border-t border-gray-100 pt-6">
          <p className="text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-green-600 hover:text-green-800 transition-colors hover:underline">
              Secure Login
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
