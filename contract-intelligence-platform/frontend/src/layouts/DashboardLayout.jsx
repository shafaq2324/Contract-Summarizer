import React, { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  GitCompare,
  Menu,
  X,
  Search,
  ChevronDown,
  User,
  ShieldCheck
} from 'lucide-react';
import { useContracts } from '../context/ContractContext';

const DashboardLayout = () => {
  const location = useLocation();
  const { uploadQueue, userProfile } = useContracts();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Auth Protection Lock
  const token = localStorage.getItem('cip_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload Contracts', path: '/upload', icon: UploadCloud, badge: uploadQueue.length > 0 ? uploadQueue.length : null },
    { name: 'Contracts Library', path: '/contracts', icon: FileText },
    { name: 'Compare Contracts', path: '/compare', icon: GitCompare }
  ];

  const getPageTitle = () => {
    const activeItem = navItems.find(item => item.path === location.pathname);
    if (activeItem) return activeItem.name;
    if (location.pathname.startsWith('/contracts/')) return 'Contract Analysis';
    return 'Contract Intelligence';
  };

  const handleLogout = () => {
    localStorage.removeItem('cip_token');
    window.location.href = '/login';
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden flex">
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse-slower pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[35%] h-[35%] rounded-full bg-fuchsia-500/5 blur-[100px] pointer-events-none" />

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 glass-panel h-screen sticky top-0 z-30">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">ContractIQ</h1>
            <span className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">Enterprise</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 border-l-2 border-indigo-500 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 bg-slate-900 border-r border-white/5 glass-panel z-50 p-6 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
                    <ShieldCheck className="w-5.5 h-5.5 text-white" />
                  </div>
                  <h1 className="text-lg font-bold text-white">ContractIQ</h1>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-6 space-y-1.5">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-indigo-500/10 border-l-2 border-indigo-500 text-white font-medium'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5.5 h-5.5" />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-20 px-6 lg:px-8 border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
          {/* Header Left (Mobile Menu Button & Title) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-900/60 border border-white/5 hover:bg-slate-900/90 text-slate-300"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <h2 className="text-xl font-bold text-white tracking-tight leading-none hidden sm:block">
              {getPageTitle()}
            </h2>
          </div>

          {/* Header Right Tools */}
          <div className="flex items-center gap-4">
            {/* Global Search Bar */}
            <div className="relative w-44 md:w-64 hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search contracts, risk terms..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm glass-input text-slate-200 placeholder-slate-500"
              />
            </div>

            {/* Notifications Button Removed */}

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                }}
                className="flex items-center gap-2 p-1.5 pr-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:bg-slate-900/95 hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500/30 to-purple-600/30 border border-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-sm">
                  {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-semibold text-slate-200 leading-none">{userProfile?.name || 'User Account'}</p>
                  <p className="text-[9px] text-slate-400">{userProfile?.role || 'Member'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 bg-slate-900/95 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-20"
                    >
                      <div className="p-3 border-b border-white/5 mb-1.5">
                        <p className="text-xs font-bold text-white">{userProfile?.name || 'Workspace Account'}</p>
                        <p className="text-[10px] text-slate-400">{userProfile?.email || 'Active Member'}</p>
                      </div>
                      {/* Settings tab link removed */}
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-455 hover:bg-rose-500/10 rounded-lg transition-all text-left cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Inner Container */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
