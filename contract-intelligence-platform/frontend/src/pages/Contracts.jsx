import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContracts } from '../context/ContractContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { 
  Search, 
  Filter, 
  Calendar, 
  Trash2, 
  ArrowUpRight, 
  FileText, 
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contracts = () => {
  const { contracts, deleteContract } = useContracts();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Available contract types for filters
  const contractTypes = useMemo(() => {
    const types = new Set(contracts.map(c => c.type));
    return ['All', ...Array.from(types)];
  }, [contracts]);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.partyA.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.partyB.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesRisk = riskFilter === 'All' || c.riskLevel === riskFilter;
      const matchesType = typeFilter === 'All' || c.type === typeFilter;
      
      return matchesSearch && matchesRisk && matchesType;
    });
  }, [contracts, searchTerm, riskFilter, typeFilter]);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this contract record?')) {
      deleteContract(id);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High':
        return 'text-red-400 border-red-500/20 bg-red-500/10';
      case 'Medium':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      default:
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score > 70) return 'text-red-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/5 border border-white/5 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by contract name or party..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm glass-input text-slate-100 placeholder-slate-500"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-white/5 px-3 py-2 rounded-xl text-xs text-slate-400">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Filters</span>
          </div>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs glass-input text-slate-200 cursor-pointer bg-slate-900 border-white/5"
          >
            <option value="All">All Risks</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs glass-input text-slate-200 cursor-pointer bg-slate-900 border-white/5"
          >
            {contractTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'All' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Layout of Contracts */}
      {filteredContracts.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredContracts.map((contract, index) => (
              <GlassCard
                key={contract.id}
                hoverable={true}
                delay={index * 0.05}
                className="flex flex-col justify-between h-80 min-h-[320px] relative overflow-hidden"
                onClick={() => navigate(`/contracts/${contract.id}`)}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                      <FileText className="w-5.5 h-5.5" />
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRiskColor(contract.riskLevel)}`}>
                      {contract.riskLevel}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base truncate pr-6 group-hover:text-indigo-400 transition-colors leading-tight">
                      {contract.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium truncate">
                      {contract.partyA} vs {contract.partyB}
                    </p>
                  </div>

                  {/* Metadata Indicators */}
                  <div className="grid grid-cols-2 gap-3.5 my-5">
                    <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Compliance</p>
                      <p className="text-sm font-bold text-slate-200 mt-0.5">{contract.complianceScore}%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Risk Score</p>
                      <p className={`text-sm font-bold mt-0.5 ${getRiskScoreColor(contract.riskScore)}`}>
                        {contract.riskScore}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>{contract.uploadDate}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(contract.id, e)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete contract"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
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
                      Analyze
                    </Button>
                  </div>
                </div>

                {/* Background glow strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  contract.riskLevel === 'High' ? 'bg-red-500' :
                  contract.riskLevel === 'Medium' ? 'bg-amber-500' :
                  'bg-emerald-500'
                }`} />
              </GlassCard>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <GlassCard className="text-center py-20" hoverable={false}>
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-900/60 border border-white/5 flex items-center justify-center text-slate-500 mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No contracts found</h3>
            <p className="text-sm text-slate-400">
              Try adjusting your search terms or filters to find the documents you need.
            </p>
            <Button variant="secondary" size="sm" onClick={() => { setSearchTerm(''); setRiskFilter('All'); setTypeFilter('All'); }}>
              Reset Filters
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default Contracts;
