import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { ShieldCheck, Mail, Lock, User as UserIcon, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee'); // 'employee' | 'lawyer' | 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://contract-summarizer-gpra.onrender.com/api';
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role
      });

      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Check server connection.');
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Workspace Account</h1>
            <p className="text-xs text-slate-455">Join LexiAI workspace to analyze agreements</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {success && (
              <div className="text-xs text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                Account created successfully! Redirecting to login page...
              </div>
            )}

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs glass-input text-slate-200 placeholder-slate-500"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs glass-input text-slate-200 placeholder-slate-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="•••••••• (Min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs glass-input text-slate-200 placeholder-slate-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Role select */}
            <div className="space-y-1.5">
              <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider">Workspace Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs glass-input text-slate-205 cursor-pointer bg-slate-900 border-white/5"
                >
                  <option value="employee">Employee</option>
                  <option value="lawyer">Legal Counsel / Lawyer</option>
                  <option value="admin">Administrator</option>
                </select>
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
              {loading ? 'Registering Account...' : 'Register'}
            </Button>
          </form>

          {/* Footer links */}
          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Register;
