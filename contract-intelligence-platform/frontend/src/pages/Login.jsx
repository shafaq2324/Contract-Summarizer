import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      if (response.data && response.data.token) {
        localStorage.setItem('cip_token', response.data.token);
        // Force context or main router refresh
        window.location.href = '/';
      } else {
        setError('Login failed. No credentials returned.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials or server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      return;
    }
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: forgotEmail
      });

      if (response.data && response.data.resetLink) {
        setForgotSuccess(
          <div>
            <p>{response.data.message}</p>
            <a 
              href={response.data.resetLink}
              className="text-indigo-400 font-bold underline hover:text-indigo-300 block mt-2"
            >
              👉 Click here to Reset Password
            </a>
          </div>
        );
      } else {
        setForgotSuccess(response.data?.message || 'Password reset email sent successfully.');
      }
    } catch (err) {
      console.error(err);
      setForgotError(err.response?.data?.message || 'Failed to send password reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <GlassCard hoverable={false} className="p-8 space-y-6 border-indigo-500/15 glow-indigo">
          {isForgotPassword ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] mx-auto">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
                <p className="text-xs text-slate-400">Enter your email and we will send you a reset link</p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                {forgotSuccess && (
                  <div className="text-xs text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    {forgotSuccess}
                  </div>
                )}

                {forgotError && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      disabled={forgotLoading}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs glass-input text-slate-200 placeholder-slate-500"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={forgotLoading}
                  icon={forgotLoading ? Loader2 : null}
                  className="w-full py-3 mt-2"
                >
                  {forgotLoading ? 'Sending link...' : 'Send Reset Link'}
                </Button>
              </form>

              <p className="text-center text-xs text-slate-500">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotError('');
                    setForgotSuccess('');
                  }}
                  className="text-indigo-400 font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Back to Sign In
                </button>
              </p>
            </div>
          ) : (
            <>
              {/* Logo header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] mx-auto">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to ContractIQ</h1>
                <p className="text-xs text-slate-400">Login to access your contract review workspace</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {error && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs glass-input text-slate-200 placeholder-slate-500"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[10px] text-indigo-400 hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs glass-input text-slate-200 placeholder-slate-500"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Actions */}
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  icon={loading ? Loader2 : null}
                  className="w-full py-3 mt-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </Button>
              </form>

              <p className="text-center text-xs text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
            </>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

// Quick import motion to prevent build errors
import { motion } from 'framer-motion';

export default Login;
