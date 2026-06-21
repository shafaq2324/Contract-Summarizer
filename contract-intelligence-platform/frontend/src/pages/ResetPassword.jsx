import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { ShieldCheck, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://contract-summarizer-gpra.onrender.com/api';
      const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, {
        password
      });

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Token is invalid or has expired, or server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 overflow-hidden">

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <GlassCard hoverable={false} className="p-8 space-y-6 border-indigo-500/15 glow-indigo">
          {/* Logo header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] mx-auto">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Set New Password</h1>
            <p className="text-xs text-slate-400">Please choose a secure new password</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {success && (
              <div className="text-xs text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                Password updated successfully! Redirecting to login page...
              </div>
            )}

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs glass-input text-slate-200 placeholder-slate-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs glass-input text-slate-200 placeholder-slate-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Actions */}
            <Button
              type="submit"
              variant="primary"
              disabled={loading || success}
              icon={loading ? Loader2 : null}
              className="w-full py-3 mt-2"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </Button>
          </form>

          {/* Footer links */}
          <p className="text-center text-xs text-slate-500">
            Remembered your password?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
