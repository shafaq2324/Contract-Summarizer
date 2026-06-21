import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContracts } from '../context/ContractContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  UploadCloud,
  FileCheck,
  Activity,
  Plus,
  Sparkles,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Smooth requestAnimationFrame animated counter hook
const useAnimatedCounter = (target, duration = 1200, trigger = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTime = null;
    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };
    requestAnimationFrame(animateCount);
  }, [target, duration, trigger]);

  return count;
};

const Dashboard = () => {
  const { contracts, stats, userProfile } = useContracts();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for skeletons
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Dynamic calculations
  const totalContracts = contracts.length;
  const analyzedContracts = contracts.filter(c => c.status === 'Completed' || c.status === 'Risk Flagged').length;
  const highRiskContracts = contracts.filter(c => c.riskLevel === 'High').length;
  const medRiskContracts = contracts.filter(c => c.riskLevel === 'Medium').length;
  const lowRiskContracts = contracts.filter(c => c.riskLevel === 'Low').length;

  // Animated numbers
  const animatedTotal = useAnimatedCounter(totalContracts, 1000, !isLoading);
  const animatedAnalyzed = useAnimatedCounter(analyzedContracts, 1000, !isLoading);
  const animatedHigh = useAnimatedCounter(highRiskContracts, 1000, !isLoading);
  const animatedMed = useAnimatedCounter(medRiskContracts, 1000, !isLoading);
  const animatedLow = useAnimatedCounter(lowRiskContracts, 1000, !isLoading);

  // Chart 1: Category breakdown (Bar chart)
  const categoryCounts = contracts.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({
    name: name.split(' ')[0], // truncate terms
    count,
  }));

  // Standard fallback categories if empty
  const barChartData = categoryData.length > 0 ? categoryData : [
    { name: 'NDA', count: 0 },
    { name: 'Lease', count: 0 },
    { name: 'MSA', count: 0 },
    { name: 'Employment', count: 0 },
  ];

  // Chart 2: Risk distribution data linked directly to DB stats from context
  const riskDistribution = [
    { name: 'Low Risk', value: stats.lowRisk || 0, color: '#10b981' },
    { name: 'Medium Risk', value: stats.mediumRisk || 0, color: '#f59e0b' },
    { name: 'High Risk', value: stats.highRisk || 0, color: '#ef4444' },
  ];

  const getRiskBadgeColor = (level) => {
    if (level === 'High') return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (level === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  const getRiskScoreColor = (score) => {
    if (score > 70) return 'text-red-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-xs text-slate-400 font-semibold">{payload[0].name}</p>
          <p className="text-sm text-indigo-400 font-bold mt-1">
            {payload[0].value} Contracts
          </p>
        </div>
      );
    }
    return null;
  };

  // Animation constants
  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15 }
  };

  // SKELETON RENDERER
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Welcome Banner Skeleton */}
        <div className="h-32 bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
          <div className="h-6 bg-slate-800/60 rounded-md w-1/3" />
          <div className="h-4 bg-slate-800/40 rounded-md w-1/2" />
        </div>

        {/* Stats Row Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="min-h-[135px] bg-slate-900/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-3 bg-slate-850 rounded w-1/2" />
                <div className="w-8 h-8 rounded-lg bg-slate-800" />
              </div>
              <div className="h-8 bg-slate-850 rounded w-1/3 mt-2" />
            </div>
          ))}
        </div>

        {/* Charts Grid Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-900/35 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
            <div className="h-4 bg-slate-800/60 rounded w-1/4" />
            <div className="h-64 bg-slate-950/20 border border-white/5 rounded-xl" />
          </div>
          <div className="h-96 bg-slate-900/35 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
            <div className="h-4 bg-slate-800/60 rounded w-1/4" />
            <div className="h-64 bg-slate-950/20 border border-white/5 rounded-xl" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="h-80 bg-slate-900/35 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
          <div className="h-4 bg-slate-800/65 rounded w-1/5" />
          <div className="space-y-4 my-4">
            <div className="h-10 bg-slate-850/50 rounded-lg" />
            <div className="h-10 bg-slate-850/50 rounded-lg" />
            <div className="h-10 bg-slate-850/50 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // REAL RENDERER
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
    >
      {/* Welcome Banner & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-white/5 p-6 rounded-2xl glow-indigo relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>AI Platform Dashboard</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back, {userProfile?.name || 'User'}</h2>
          <p className="text-sm text-slate-400 max-w-xl">
            You currently have <span className="text-indigo-400 font-semibold">{totalContracts} contracts</span> active in your repository. AI has scanned and flagged risk criteria successfully.
          </p>
        </div>

        {/* Quick Action Button Box */}
        <div className="flex flex-wrap gap-3 z-10">
          <Button 
            variant="primary" 
            icon={Plus} 
            onClick={() => navigate('/upload')}
          >
            Upload Contract
          </Button>
        </div>
        
        {/* Ambient Gradient Blob in background */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
      </div>

      {/* Stats Cards Row (5 Stats - Responsive grid positioning fixed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        
        {/* Stat 1: Total */}
        <GlassCard hoverable={true} glowColor="indigo" className="flex flex-col justify-between min-h-[135px] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Files</span>
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-white text-glow">{animatedTotal}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Ingested source documents</p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl" />
        </GlassCard>

        {/* Stat 2: Analyzed */}
        <GlassCard hoverable={true} className="flex flex-col justify-between min-h-[135px] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Analyzed</span>
            <div className="p-2 bg-slate-900/80 border border-white/5 rounded-xl text-indigo-400">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-white">{animatedAnalyzed}</h3>
            <p className="text-[10px] text-slate-400 mt-1">100% processing rate</p>
          </div>
        </GlassCard>

        {/* Stat 3: High Risk */}
        <GlassCard hoverable={true} glowColor="purple" className="flex flex-col justify-between min-h-[135px] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">High Risk</span>
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <ShieldAlert className="w-4 h-4 animate-bounce" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-red-400 text-glow">{animatedHigh}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Requires active remediation</p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-red-500/5 rounded-full blur-xl" />
        </GlassCard>

        {/* Stat 4: Medium Risk */}
        <GlassCard hoverable={true} className="flex flex-col justify-between min-h-[135px] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Medium Risk</span>
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-amber-400">{animatedMed}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Caution flags raised</p>
          </div>
        </GlassCard>

        {/* Stat 5: Low Risk */}
        <GlassCard hoverable={true} className="flex flex-col justify-between min-h-[135px] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Low Risk</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-emerald-400">{animatedLow}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Safe/Standard alignment</p>
          </div>
        </GlassCard>

      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Category Distribution Bar Chart */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between" delay={0.1}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Contract Classes</h3>
              <p className="text-xs text-slate-400">Breakdown of documents currently in system</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                {/* Bar Graph hover tooltip and cells removed */}
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="url(#barGradient)" activeBar={false}>
                  {barChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Right: Risk Distribution Pie Chart (Linked to DB stats) */}
        <GlassCard className="flex flex-col justify-between" delay={0.2}>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Risk Distribution</h3>
            <p className="text-xs text-slate-400 mb-6">Proportion of files by assessment tier</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Color Indicators */}
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            {riskDistribution.map((group) => (
              <div key={group.name} className="p-2 rounded-xl bg-slate-900/40 border border-white/5">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">{group.name.split(' ')[0]}</p>
                <p className="text-base font-bold mt-1 text-white" style={{ color: group.color }}>
                  {group.value}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Contracts Section */}
      <GlassCard className="overflow-hidden" delay={0.3}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Contract Registry</h3>
            <p className="text-xs text-slate-400">Newly analyzed files in details</p>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate('/contracts')}
          >
            View Library
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Contract Details</th>
                {/* Counterparty header removed */}
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {contracts.slice(0, 4).map((contract) => (
                <tr 
                  key={contract.id} 
                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/contracts/${contract.id}`)}
                >
                  {/* Name and size details */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-400 group-hover:scale-105 transition-transform" />
                      <div>
                        <p className="font-semibold text-white leading-snug">{contract.name}</p>
                        <p className="text-[10px] text-slate-400">{contract.type} • {contract.fileSize}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Counterparty columns removed */}
                  
                  {/* Badge details */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRiskBadgeColor(contract.riskLevel)}`}>
                      {contract.riskLevel}
                    </span>
                  </td>
                  
                  {/* Score details */}
                  <td className={`py-4 px-4 font-bold text-glow ${getRiskScoreColor(contract.riskScore)}`}>
                    {contract.riskScore}%
                  </td>
                  
                  {/* Actions details */}
                  <td className="py-4 px-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={ArrowUpRight} 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/contracts/${contract.id}`);
                      }}
                      className="pr-1"
                    >
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Dashboard;
