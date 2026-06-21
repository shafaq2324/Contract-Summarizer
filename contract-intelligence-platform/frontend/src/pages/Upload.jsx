import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContracts } from '../context/ContractContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  ArrowRight,
  RefreshCw,
  X,
  ShieldCheck,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_OPTIONS = [
  { value: 'Non-Disclosure Agreement', label: 'Non-Disclosure Agreement (NDA)' },
  { value: 'Master Services Agreement', label: 'Master Services Agreement (MSA)' },
  { value: 'Lease Agreement', label: 'Lease Agreement' },
  { value: 'Employment Agreement', label: 'Employment Agreement' },
  { value: 'General Commercial Contract', label: 'General Commercial Contract' }
];

const Upload = () => {
  const { uploadFiles, uploadQueue, clearQueue } = useContracts();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [isDragActive, setIsDragActive] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [fileCategories, setFileCategories] = useState({});

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      prepareFilesForConfirmation(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      prepareFilesForConfirmation(e.target.files);
    }
  };

  const prepareFilesForConfirmation = (files) => {
    const fileList = Array.from(files);
    setPendingFiles(fileList);

    // Initialize categories map based on file names
    const initialCats = {};
    fileList.forEach(file => {
      const nameLower = file.name.toLowerCase();
      if (nameLower.includes('nda')) {
        initialCats[file.name] = 'Non-Disclosure Agreement';
      } else if (nameLower.includes('lease')) {
        initialCats[file.name] = 'Lease Agreement';
      } else if (nameLower.includes('msa') || nameLower.includes('service')) {
        initialCats[file.name] = 'Master Services Agreement';
      } else if (nameLower.includes('employ') || nameLower.includes('job') || nameLower.includes('offer')) {
        initialCats[file.name] = 'Employment Agreement';
      } else {
        initialCats[file.name] = 'General Commercial Contract';
      }
    });
    setFileCategories(initialCats);
  };

  const handleCategoryChange = (fileName, category) => {
    setFileCategories(prev => ({
      ...prev,
      [fileName]: category
    }));
  };

  const handleConfirmUpload = () => {
    if (pendingFiles.length === 0) return;
    uploadFiles(pendingFiles, fileCategories);
    setPendingFiles([]);
    setFileCategories({});
  };

  const handleCancelUpload = () => {
    setPendingFiles([]);
    setFileCategories({});
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Upload Zone & Confirmation Modals */}
      <AnimatePresence mode="wait">
        {pendingFiles.length === 0 ? (
          /* Normal drag zone */
          <motion.div
            key="dragzone"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GlassCard hoverable={false} className="p-0 overflow-hidden relative">
              <motion.div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                className={`flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isDragActive 
                    ? 'border-indigo-500 bg-indigo-500/5' 
                    : 'border-white/10 hover:border-indigo-500/40 hover:bg-white/2'
                }`}
                whileHover={{ scale: 1.002 }}
                whileTap={{ scale: 0.995 }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">Upload Your Contracts</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">
                  Drag and drop your PDF, Word, or text contracts here, or click to browse local files.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 items-center justify-center">
                  <span className="text-[10px] px-2.5 py-1 bg-slate-900 border border-white/5 text-slate-400 rounded-lg">PDF</span>
                  <span className="text-[10px] px-2.5 py-1 bg-slate-900 border border-white/5 text-slate-400 rounded-lg">DOCX</span>
                  <span className="text-[10px] px-2.5 py-1 bg-slate-900 border border-white/5 text-slate-400 rounded-lg">MAX 25MB</span>
                </div>
              </motion.div>
            </GlassCard>
          </motion.div>
        ) : (
          /* Confirmation Overlay Card */
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
          >
            <GlassCard hoverable={false} className="border-indigo-500/25 p-6 space-y-6 glow-indigo relative overflow-hidden">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                  <ShieldCheck className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Verify Ingestion Details</h3>
                  <p className="text-xs text-slate-400">Confirm file selection correctness and select their categories before database upload.</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1 scrollbar">
                {pendingFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs truncate max-w-[280px]" title={file.name}>{file.name}</p>
                        <p className="text-[10px] text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>

                    {/* Category Selector input field */}
                    <div className="w-full md:w-64 space-y-1">
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Document Category</span>
                      <select
                        value={fileCategories[file.name] || 'General Commercial Contract'}
                        onChange={(e) => handleCategoryChange(file.name, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-200 cursor-pointer bg-slate-900 border-white/5"
                      >
                        {CATEGORY_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkbox prompt verification */}
              <div className="p-3 bg-white/2 rounded-xl border border-white/3 text-xs leading-relaxed text-slate-400 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Confirmation Required: </span>
                  By proceeding, you verify that the selected file content is correct, uncorrupted, and authorized for AI scanning.
                </div>
              </div>

              {/* Action triggers */}
              <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                <Button variant="secondary" onClick={handleCancelUpload}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirmUpload} icon={CheckCircle}>
                  Confirm & Ingest
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue items */}
      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
          >
            <GlassCard hoverable={false} className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h4 className="font-bold text-white text-sm">Processing Queue</h4>
                  <p className="text-xs text-slate-400">Contracts undergoing OCR extraction and analysis</p>
                </div>
                <button
                  onClick={clearQueue}
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Clear Queue"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-3.5">
                {uploadQueue.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3.5 bg-slate-900/40 border border-white/5 rounded-xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-200 truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-500">({item.size})</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {item.status === 'analyzing' ? (
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                        ) : (
                          <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                        )}
                        <span className="font-medium text-indigo-400 text-[10px] uppercase tracking-wider">{item.stage}</span>
                      </div>
                    </div>

                    {/* Progress slider bar */}
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          item.status === 'analyzing' 
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse' 
                            : 'bg-indigo-500'
                        }`} 
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard hoverable={false} className="p-5 flex gap-4 text-left items-start">
          <div className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-white text-xs">1. Ingest Documents</h5>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              We extract clean layout metadata from digitized or scanned formats.
            </p>
          </div>
        </GlassCard>

        <GlassCard hoverable={false} className="p-5 flex gap-4 text-left items-start">
          <div className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-indigo-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-white text-xs">2. Automated Analysis</h5>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Legal NLP algorithms locate critical sections like Indemnity, Liabilities, and NDAs.
            </p>
          </div>
        </GlassCard>

        <GlassCard hoverable={false} className="p-5 flex gap-4 text-left items-start">
          <div className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-indigo-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-white text-xs">3. Risk Classification</h5>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Clauses are scored by severity matching your corporate template guidelines.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Button to library */}
      <div className="flex justify-center pt-2">
        <Button 
          variant="secondary" 
          icon={ArrowRight} 
          onClick={() => navigate('/contracts')}
        >
          Go to Contracts Library
        </Button>
      </div>
    </div>
  );
};

export default Upload;
