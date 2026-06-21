import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContracts } from '../context/ContractContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  Clock,
  Briefcase,
  AlertCircle,
  Loader2,
  MessageSquare,
  Send,
  Cpu,
  RefreshCw,
  GitCommit,
  History,
  FileText,
  User,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Context Actions
  const { 
    fetchContractDetail, 
    analyzeContractManual, 
    askContractQuestion,
    getContractVersions,
    uploadContractVersion,
    getContractLogs
  } = useContracts();

  // Component States
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('clauses'); // 'clauses' | 'versions' | 'logs'
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All');
  
  const fileInputRef = useRef(null);
  
  // Version control states
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [uploadingVersion, setUploadingVersion] = useState(false);

  // Audit logs states
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hi, I have indexed this contract. Ask me any questions about liability, notice periods, or payment terms.' }
  ]);
  const [sendingChat, setSendingChat] = useState(false);

  // Load contract details from backend
  const loadDetails = async () => {
    setLoading(true);
    const details = await fetchContractDetail(id);
    if (details) {
      setContract(details);
    }
    setLoading(false);
  };

  const loadVersions = async () => {
    setLoadingVersions(true);
    const list = await getContractVersions(id);
    setVersions(list);
    setLoadingVersions(false);
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    const list = await getContractLogs(id);
    setLogs(list);
    setLoadingLogs(false);
  };

  useEffect(() => {
    loadDetails();
    loadVersions();
    loadLogs();
  }, [id]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    const success = await analyzeContractManual(id);
    if (success) {
      await loadDetails();
      await loadLogs();
    }
    setAnalyzing(false);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userMessage = chatInput;
    setChatMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setSendingChat(true);

    try {
      const reply = await askContractQuestion(id, userMessage);
      setChatMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, I failed to process that question. Check if the server is running.' }]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleUploadVersion = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingVersion(true);
    
    try {
      const success = await uploadContractVersion(id, file);
      if (success) {
        // Refresh versions list and logs
        await loadVersions();
        await loadLogs();
      } else {
        alert("Failed to upload new version file.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred uploading version.");
    } finally {
      setUploadingVersion(false);
      e.target.value = null; // reset input
    }
  };

  const handleDownloadPDFReport = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'https://contract-summarizer-gpra.onrender.com/api';
    window.open(`${API_URL}/contracts/${id}/report`, '_blank');
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

  const getRiskBorder = (level) => {
    switch (level) {
      case 'High':
        return 'border-red-500/30 bg-red-950/10';
      case 'Medium':
        return 'border-amber-500/30 bg-amber-950/10';
      default:
        return 'border-emerald-500/20 bg-emerald-950/10';
    }
  };

  const getRiskBadgeColor = (level) => {
    switch (level) {
      case 'High':
        return 'bg-red-500/25 border-red-500/40 text-red-300';
      case 'Medium':
        return 'bg-amber-500/25 border-amber-500/40 text-amber-300';
      default:
        return 'bg-emerald-500/25 border-emerald-500/40 text-emerald-300';
    }
  };

  // Loading indicator spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading analysis metadata...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <GlassCard className="text-center py-20" hoverable={false}>
        <div className="max-w-md mx-auto space-y-4">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-white">Contract not found</h3>
          <p className="text-sm text-slate-400">
            The requested contract review could not be located in your library workspace.
          </p>
          <Button variant="primary" onClick={() => navigate('/contracts')}>
            Back to Library
          </Button>
        </div>
      </GlassCard>
    );
  }

  // Filter clauses inside the details view
  const filteredClauses = contract.clauses.filter((clause) => {
    if (selectedRiskFilter === 'All') return true;
    return clause.riskLevel === selectedRiskFilter;
  });

  return (
    <div className="space-y-6">
      {/* Back & PDF Download Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/contracts')}
        >
          Back to Library
        </Button>
        {contract.hasAnalysis && (
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleDownloadPDFReport}
          >
            Download PDF Report
          </Button>
        )}
      </div>

      {/* If contract has not been analyzed yet */}
      {!contract.hasAnalysis && (
        <GlassCard hoverable={false} className="border-indigo-500/25 p-8 text-center space-y-5 flex flex-col items-center justify-center bg-indigo-500/5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            <Cpu className={`w-8 h-8 ${analyzing ? 'animate-spin' : ''}`} />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-lg font-bold text-white">Analysis Pending</h3>
            <p className="text-sm text-slate-455 leading-relaxed">
              This contract has been uploaded, but the AI evaluation is not yet complete. Run AI analysis to extract metadata, key timelines, and risks.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleRunAnalysis}
            disabled={analyzing}
            icon={analyzing ? Loader2 : RefreshCw}
          >
            {analyzing ? 'Evaluating Contract...' : 'Run AI Analysis'}
          </Button>
        </GlassCard>
      )}

      {contract.hasAnalysis && (
        /* Main Grid: Left Clause List, Right Statistics */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
          
          {/* Left Column: Clauses Analysis & Tabs */}
          <div className={`${activeTab === 'clauses' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            
            {/* Tab navigation headers */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/60 border border-white/5 text-xs w-full sm:w-max">
              <button
                onClick={() => setActiveTab('clauses')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'clauses' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>AI Clauses</span>
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'versions' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Version History</span>
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Audit Logs</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <AnimatePresence mode="wait">
              {activeTab === 'clauses' && (
                <motion.div
                  key="clauses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <GlassCard hoverable={false} className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">AI Clause Extraction</h3>
                        <p className="text-xs text-slate-400">Identified and analyzed clauses within this document</p>
                      </div>

                      {/* Clause Filter Buttons */}
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                        {['All', 'High', 'Medium', 'Low'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setSelectedRiskFilter(filter)}
                            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                              selectedRiskFilter === filter
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clauses List */}
                    <div className="space-y-4">
                      {filteredClauses.length > 0 ? (
                        filteredClauses.map((clause, index) => (
                          <motion.div
                            key={clause.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl border flex flex-col gap-3 ${getRiskBorder(clause.riskLevel)}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-900/80 px-2 py-0.5 rounded border border-white/5">
                                  {clause.category}
                                </span>
                                <h4 className="font-semibold text-white text-sm mt-1">{clause.title}</h4>
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getRiskBadgeColor(clause.riskLevel)}`}>
                                {clause.riskLevel} Risk
                              </span>
                            </div>

                            {/* Original Clause Text */}
                            <div className="p-3.5 bg-slate-950/40 rounded-lg border border-white/5 text-xs leading-relaxed text-slate-300">
                              <p className="font-medium text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Extract Text</p>
                              "{clause.content}"
                            </div>

                            {/* AI Assessment */}
                            <div className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-400 bg-white/3 p-3 rounded-lg border border-white/3">
                              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-slate-300">AI Risk Assessment: </span>
                                {clause.riskDescription}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-slate-500 text-sm">
                          No clauses matching the "{selectedRiskFilter}" risk selection.
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'versions' && (
                <motion.div
                  key="versions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <GlassCard hoverable={false} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">Version Control</h3>
                        <p className="text-xs text-slate-400">View and upload alternative drafts/versions of this contract</p>
                      </div>

                      {/* Upload new version action */}
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleUploadVersion}
                          disabled={uploadingVersion}
                          className="hidden"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={uploadingVersion}
                          icon={uploadingVersion ? Loader2 : Upload}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploadingVersion ? 'Uploading...' : 'New Version'}
                        </Button>
                      </div>
                    </div>

                    {/* Versions list */}
                    {loadingVersions ? (
                      <div className="flex items-center justify-center py-12 text-slate-450 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                        <span className="text-xs">Loading version nodes...</span>
                      </div>
                    ) : versions.length > 0 ? (
                      <div className="space-y-4">
                        {versions.map((ver) => (
                          <div 
                            key={ver.id}
                            className="flex items-center justify-between p-4 bg-slate-900/40 border border-white/5 rounded-2xl text-xs hover:border-indigo-500/20 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                                <GitCommit className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">Version #{ver.version_number}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Uploaded: {new Date(ver.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-450 bg-slate-950 border border-white/5 px-2.5 py-1 rounded-md uppercase">
                              Active node
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        No version drafts uploaded yet.
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'logs' && (
                <motion.div
                  key="logs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <GlassCard hoverable={false} className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">Audit Trail Logs</h3>
                      <p className="text-xs text-slate-400">Historical records of actions taken on this workspace contract</p>
                    </div>

                    {loadingLogs ? (
                      <div className="flex items-center justify-center py-12 text-slate-455 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                        <span className="text-xs">Fetching event records...</span>
                      </div>
                    ) : logs.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                              <th className="py-3 px-4">Action</th>
                              <th className="py-3 px-4">Triggered By</th>
                              <th className="py-3 px-4 text-right">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {logs.map((log) => (
                              <tr key={log.id} className="hover:bg-white/2 text-slate-200">
                                <td className="py-3.5 px-4 font-semibold text-indigo-400">{log.action}</td>
                                <td className="py-3.5 px-4 flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[9px]">
                                    {log.name ? log.name.substring(0,2).toUpperCase() : 'JD'}
                                  </div>
                                  <span>{log.name || 'John Doe'}</span>
                                </td>
                                <td className="py-3.5 px-4 text-right text-slate-450">{new Date(log.created_at).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        No activity logs registered for this contract.
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Statistics & Metadata Summary */}
          {activeTab === 'clauses' && (
            <div className="space-y-6">
              {/* Interactive Q&A Assistant Chat Drawer */}
              <GlassCard hoverable={false} className="p-5 flex flex-col h-[500px]">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-3">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="font-bold text-white text-sm">AI Contract Assistant</h4>
                  <p className="text-[10px] text-slate-400">Ask granular questions about this agreement</p>
                </div>
              </div>

              {/* Message log */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 text-xs mb-3 scrollbar">
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] p-3 rounded-xl leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {sendingChat && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl rounded-tl-none flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Assistant is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input form */}
              <form onSubmit={handleSendChat} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={sendingChat}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl text-xs glass-input text-slate-200 placeholder-slate-500"
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={sendingChat || !chatInput.trim()} 
                  icon={Send} 
                  className="px-3 py-2.5 flex-shrink-0"
                />
              </form>
            </GlassCard>

            {/* Metadata Card */}
            <GlassCard hoverable={false} className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Contract Metadata</h3>
                <p className="text-xs text-slate-400">Basic identification properties</p>
              </div>

              <div className="space-y-3.5 divide-y divide-white/5 text-xs">
                <div className="pt-3 flex justify-between">
                  <span className="text-slate-400">File Name</span>
                  <span className="font-semibold text-white truncate max-w-[160px]" title={contract.name}>{contract.name}</span>
                </div>
                <div className="pt-3.5 flex justify-between">
                  <span className="text-slate-400">Contract Class</span>
                  <span className="font-semibold text-indigo-400">{contract.type}</span>
                </div>
                <div className="pt-3.5 flex justify-between">
                  <span className="text-slate-400">Party A (Us)</span>
                  <span className="font-semibold text-white">{contract.partyA}</span>
                </div>
                <div className="pt-3.5 flex justify-between">
                  <span className="text-slate-400">Party B (Counter)</span>
                  <span className="font-semibold text-white">{contract.partyB}</span>
                </div>
                <div className="pt-3.5 flex justify-between">
                  <span className="text-slate-400">Uploaded On</span>
                  <span className="font-semibold text-white">{contract.uploadDate}</span>
                </div>
              </div>
            </GlassCard>

            {/* AI Assessment Gauge */}
            <GlassCard hoverable={false} className="space-y-5" glowColor={contract.riskLevel === 'High' ? 'purple' : ''}>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Intelligence Scores</h3>
                <p className="text-xs text-slate-400">Automated metrics from deep learning evaluation</p>
              </div>

              {/* Risk Index Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Risk Index</span>
                  <span className={`font-bold ${contract.riskScore > 70 ? 'text-red-400' : contract.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {contract.riskScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      contract.riskLevel === 'High' ? 'bg-gradient-to-r from-red-600 to-rose-500' :
                      contract.riskLevel === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                      'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`} 
                    style={{ width: `${contract.riskScore}%` }}
                  />
                </div>
              </div>

              {/* Compliance Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Compliance Rate</span>
                  <span className="font-bold text-emerald-400">
                    {contract.complianceScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" 
                    style={{ width: `${contract.complianceScore}%` }}
                  />
                </div>
              </div>

              {/* General AI Summary */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <p className="text-xs font-bold text-white tracking-wide">AI Summary Notes</p>
                <p className="text-xs text-slate-400 leading-relaxed bg-white/3 p-3 rounded-lg border border-white/3">
                  {contract.summary}
                </p>
              </div>
            </GlassCard>

            {/* Key Dates Card */}
            {contract.keyDates && contract.keyDates.length > 0 && (
              <GlassCard hoverable={false} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Timeline & Milestones</h3>
                  <p className="text-xs text-slate-400">Extracted date conditions</p>
                </div>

                <div className="space-y-3">
                  {contract.keyDates.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2.5 bg-slate-900/40 border border-white/5 rounded-xl text-xs">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{item.label}</p>
                        <p className="font-semibold text-white mt-0.5">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractDetail;
