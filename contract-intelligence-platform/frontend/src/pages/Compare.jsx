import React, { useState } from 'react';
import { useContracts } from '../context/ContractContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { 
  GitCompare, 
  HelpCircle, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Compare = () => {
  const { contracts, compareContracts } = useContracts();
  const [contract1Id, setContract1Id] = useState('');
  const [contract2Id, setContract2Id] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState('');

  // Find active selected contracts to show summary
  const contract1Obj = contracts.find(c => c.id === contract1Id);
  const contract2Obj = contracts.find(c => c.id === contract2Id);

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!contract1Id || !contract2Id) {
      setError('Please select two distinct contracts to compare.');
      return;
    }
    if (contract1Id === contract2Id) {
      setError('Please select two different contracts for comparison.');
      return;
    }

    setError('');
    setLoading(true);
    setComparisonResult(null);

    try {
      const result = await compareContracts(contract1Id, contract2Id);
      if (result) {
        setComparisonResult(result);
      } else {
        setError('Comparison failed to generate details. Please check the backend services.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while comparing contracts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Selection Panel */}
      <GlassCard hoverable={false} className="p-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
          <div className="p-2 bg-slate-900 border border-white/5 rounded-xl text-indigo-400">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Contract Cross-Comparison</h3>
            <p className="text-xs text-slate-400">Identify similarities, variances, and relative risk profiles side-by-side</p>
          </div>
        </div>

        <form onSubmit={handleCompare} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selection 1 */}
            <div className="space-y-2">
              <label className="block text-slate-350 font-semibold text-xs">Primary Document (Base)</label>
              <select
                value={contract1Id}
                onChange={(e) => setContract1Id(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-xs glass-input text-slate-200 cursor-pointer bg-slate-950 border-white/5"
              >
                <option value="">Select a contract...</option>
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Selection 2 */}
            <div className="space-y-2">
              <label className="block text-slate-350 font-semibold text-xs">Secondary Document (Target)</label>
              <select
                value={contract2Id}
                onChange={(e) => setContract2Id(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-xs glass-input text-slate-200 cursor-pointer bg-slate-950 border-white/5"
              >
                <option value="">Select a contract...</option>
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-red-450" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !contract1Id || !contract2Id}
              icon={loading ? Loader2 : GitCompare}
            >
              {loading ? 'Evaluating Comparisons...' : 'Compare Contracts'}
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Loading Widget */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-20 gap-3 bg-white/3 border border-white/5 rounded-2xl"
          >
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Running Deep NLP Contrast Analysis...</p>
            <span className="text-[10px] text-slate-500">Evaluating clauses & legal alignment indicators</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Results Dashboard */}
      {comparisonResult && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Contracts Headers Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard hoverable={false} className="border-l-4 border-indigo-500">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-400" />
                <div>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">Doc 1</span>
                  <h4 className="font-bold text-white text-base mt-1 truncate">{contract1Obj?.name}</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5">{contract1Obj?.type}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard hoverable={false} className="border-l-4 border-purple-500">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-400" />
                <div>
                  <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded">Doc 2</span>
                  <h4 className="font-bold text-white text-base mt-1 truncate">{contract2Obj?.name}</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5">{contract2Obj?.type}</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Risk Comparison Details */}
          <GlassCard hoverable={false} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-white text-sm">AI Risk Comparison</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-350 leading-relaxed">
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                <p className="font-bold text-indigo-400 uppercase tracking-wider mb-2 text-[10px]">Doc 1 Risks</p>
                "{comparisonResult.risk_comparison?.contract1 || 'No risk evaluation available for document 1.'}"
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                <p className="font-bold text-purple-400 uppercase tracking-wider mb-2 text-[10px]">Doc 2 Risks</p>
                "{comparisonResult.risk_comparison?.contract2 || 'No risk evaluation available for document 2.'}"
              </div>
            </div>
          </GlassCard>

          {/* Similarities & Differences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Similarities */}
            <GlassCard hoverable={false} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-white text-sm">Shared Terms / Similarities</h4>
              </div>
              <ul className="space-y-3 text-xs text-slate-350">
                {comparisonResult.similarities && comparisonResult.similarities.length > 0 ? (
                  comparisonResult.similarities.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start leading-relaxed p-3 bg-white/2 border border-white/2 rounded-xl">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic">No significant similarities identified.</li>
                )}
              </ul>
            </GlassCard>

            {/* Differences */}
            <GlassCard hoverable={false} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h4 className="font-bold text-white text-sm">Contrasts / Differences</h4>
              </div>
              <ul className="space-y-3 text-xs text-slate-350">
                {comparisonResult.differences && comparisonResult.differences.length > 0 ? (
                  comparisonResult.differences.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start leading-relaxed p-3 bg-white/2 border border-white/2 rounded-xl">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic">No significant differences identified.</li>
                )}
              </ul>
            </GlassCard>
          </div>

        </motion.div>
      )}

    </div>
  );
};

export default Compare;
