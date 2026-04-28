import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, KeyRound, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  const [step, setStep] = useState('mobile'); // 'mobile' | 'otp' (used for OTP flow)
  
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, skip login
  useEffect(() => {
    if (localStorage.getItem('auth_token')) {
      navigate('/farmer');
    }
  }, [navigate]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`}/api/auth/login-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('farmer_id', mobile);
        toast.success("Login successful!");
        navigate('/farmer');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Ensure API gateway is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      if (res.ok) {
        setStep('otp');
        toast.success("OTP sent to your mobile");
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Ensure API gateway is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('farmer_id', mobile);
        toast.success("Login successful!");
        navigate('/farmer');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[calc(100vh-60px)] bg-gray-50 flex flex-col justify-center items-center p-4"
    >
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm mb-16 relative overflow-hidden border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Farmer Login</h2>
          <p className="mt-2 text-sm text-gray-500">Access your equipment dashboard</p>
        </div>
        
        {/* Toggle Login Method */}
        <div className="flex w-full bg-gray-100 p-1 rounded-xl mb-6">
            <button 
                onClick={() => { setLoginMethod('password'); setError(''); }}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all ${loginMethod === 'password' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
            >
                <KeyRound className="w-4 h-4 mr-2" /> Password
            </button>
            <button 
                onClick={() => { setLoginMethod('otp'); setError(''); setStep('mobile'); }}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all ${loginMethod === 'otp' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
            >
                <Smartphone className="w-4 h-4 mr-2" /> OTP
            </button>
        </div>

        {error && <div className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-start"><span className="mr-2 font-bold">!</span>{error}</div>}

        {loginMethod === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
              <input 
                type="text" 
                value={mobile} 
                onChange={e => setMobile(e.target.value)} 
                required 
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm disabled:bg-gray-100"
                placeholder="99999 99999"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm disabled:bg-gray-100"
                placeholder="••••••••"
              />
              <div className="text-right mt-1.5">
                  <button type="button" onClick={() => { setLoginMethod('otp'); setStep('mobile'); }} className="text-xs font-semibold text-green-600 hover:text-green-800">Forgot Password?</button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3.5 rounded-xl transition-all mt-4 shadow-lg transform active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Login Securely'}
            </button>
          </form>
        )}

        {loginMethod === 'otp' && step === 'mobile' && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
              <input 
                type="text" 
                value={mobile} 
                onChange={e => setMobile(e.target.value)} 
                required 
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm disabled:bg-gray-100"
                placeholder="99999 99999"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3.5 rounded-xl transition-all mt-4 shadow-lg transform active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Send OTP'}
            </button>
          </form>
        )}
        
        {loginMethod === 'otp' && step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enter OTP sent to {mobile}</label>
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
              className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3.5 rounded-xl transition duration-200 mt-4 shadow-lg transform active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Verify & Login'}
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

        <div className="mt-8 text-center text-sm border-t pt-4">
          <p className="text-gray-500 mb-4">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-green-600 hover:text-green-800 transition-colors">
              Register now
            </Link>
          </p>
          <Link to="/" className="font-semibold text-gray-600 hover:text-gray-800 transition-colors">
            ← Back to Portal Selection
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
