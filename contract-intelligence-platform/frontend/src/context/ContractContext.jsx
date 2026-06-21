import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Add request interceptor for JWT authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cip_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to redirect to /login on 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('cip_token');
      // Prevent infinite redirect loops
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const ContractContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://contract-summarizer-gpra.onrender.com/api';

export const ContractProvider = ({ children }) => {
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState({
    totalContracts: 0,
    analyzedContracts: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  });
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const getPartyName = (party) => {
    if (!party) return '';
    if (typeof party === 'string') return party;
    if (typeof party === 'object') {
      return party.name || party.party || party.company || JSON.stringify(party);
    }
    return String(party);
  };

  // Helper to map backend contract structures to frontend layouts
  const mapContractData = (backendContract) => {
    const riskLevel = backendContract.risk_level || 'Low';
    
    // Map risk trigger scores
    const riskScore = riskLevel === 'High' ? 85 
                    : riskLevel === 'Medium' ? 48 
                    : backendContract.risk_level ? 18 : 0;
                    
    const complianceScore = riskScore > 0 ? 100 - riskScore : 100;

    let parties = ['Vertex Solutions Inc.', 'Mock Counterparty Ltd.'];
    try {
      if (backendContract.parties) {
        parties = typeof backendContract.parties === 'string' 
          ? JSON.parse(backendContract.parties) 
          : backendContract.parties;
      }
    } catch (e) {
      console.error("Error parsing parties", e);
    }

    return {
      id: backendContract.id.toString(),
      name: backendContract.title || backendContract.original_filename,
      type: backendContract.contract_type || backendContract.category || 'Commercial Agreement',
      partyA: getPartyName(parties[0]) || '',
      partyB: getPartyName(parties[1]) || '',
      status: backendContract.risk_level ? (riskLevel === 'High' ? 'Risk Flagged' : 'Completed') : 'Pending Analysis',
      riskScore: riskScore,
      riskLevel: riskLevel,
      uploadDate: new Date(backendContract.upload_date).toISOString().split('T')[0],
      fileSize: '1.5 MB', // mock size if not available
      complianceScore: complianceScore,
      summary: backendContract.summary || 'Summary of AI analysis is being generated.',
      keyDates: [
        { label: 'Effective Date', date: backendContract.effective_date || 'N/A' },
        { label: 'Expiration Date', date: backendContract.expiry_date || 'N/A' }
      ]
    };
  };

  // Fetch all contracts from backend
  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/contracts`);
      if (response.data && response.data.contracts) {
        const mapped = response.data.contracts.map(mapContractData);
        setContracts(mapped);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contracts/dashboard/stats`);
      if (response.data) {
        setStats({
          totalContracts: parseInt(response.data.totalContracts) || 0,
          analyzedContracts: parseInt(response.data.analyzedContracts) || 0,
          highRisk: parseInt(response.data.highRisk) || 0,
          mediumRisk: parseInt(response.data.mediumRisk) || 0,
          lowRisk: parseInt(response.data.lowRisk) || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`);
      if (response.data && response.data.user) {
        setUserProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Run initial fetch on mount
  useEffect(() => {
    const token = localStorage.getItem('cip_token');
    if (token) {
      fetchProfile();
      fetchContracts();
      fetchStats();
    }
  }, []);

  // Upload files and trigger automatic AI analysis
  const uploadFiles = async (files, categories = {}) => {
    const fileArray = Array.from(files);
    
    // Add items to visual queue
    const queueItems = fileArray.map((file, idx) => ({
      id: `q_${Date.now()}_${idx}`,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      progress: 10,
      stage: 'Uploading...',
      status: 'pending'
    }));

    setUploadQueue((prev) => [...prev, ...queueItems]);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const qItem = queueItems[i];

      const formData = new FormData();
      formData.append('contract', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ""));
      formData.append('category', categories[file.name] || 'General');

      try {
        // Step 1: Upload multipart file
        setUploadQueue(prev => prev.map(q => q.id === qItem.id ? { ...q, progress: 40, stage: 'Parsing OCR text...' } : q));
        const uploadRes = await axios.post(`${API_BASE_URL}/contracts/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.data && uploadRes.data.contract) {
          const contractId = uploadRes.data.contract.id;

          // Step 2: Trigger AI analysis immediately
          setUploadQueue(prev => prev.map(q => q.id === qItem.id ? { ...q, progress: 75, stage: 'AI Risk Analysis...', status: 'analyzing' } : q));
          const analyzeRes = await axios.post(`${API_BASE_URL}/contracts/${contractId}/analyze`);

          if (analyzeRes.data) {
            // Trigger fetch to refresh lists and stats
            await fetchContracts();
            await fetchStats();

            // Remove from queue
            setUploadQueue(prev => prev.filter(q => q.id !== qItem.id));
          }
        }
      } catch (error) {
        console.error('Upload/Analysis error for file:', file.name, error);
        setUploadQueue(prev => prev.map(q => q.id === qItem.id ? { ...q, stage: 'Failed to upload/analyze', progress: 100, status: 'error' } : q));
      }
    }
  };

  // Delete a contract
  const deleteContract = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/contracts/${id}`);
      setContracts((prev) => prev.filter((c) => c.id !== id));
      await fetchStats();
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  };

  // Fetch full analysis for a single contract (for Detail View)
  const fetchContractDetail = async (id) => {
    try {
      const contractRes = await axios.get(`${API_BASE_URL}/contracts/${id}`);
      const analysisRes = await axios.get(`${API_BASE_URL}/contracts/${id}/analysis`).catch(() => null);

      const contractData = contractRes.data;
      const analysisData = analysisRes?.data?.analysis;

      let parsedParties = ['Vertex Solutions Inc.', 'Mock Counterparty Ltd.'];
      let parsedRisks = [];

      if (analysisData) {
        try {
          if (analysisData.parties) {
            parsedParties = typeof analysisData.parties === 'string' 
              ? JSON.parse(analysisData.parties) 
              : analysisData.parties;
          }
          if (analysisData.risks) {
            parsedRisks = typeof analysisData.risks === 'string' 
              ? JSON.parse(analysisData.risks) 
              : analysisData.risks;
          }
        } catch (e) {
          console.error("Error parsing analysis JSON fields", e);
        }
      }

      // Map risk trigger score
      const riskLevel = analysisData?.risk_level || 'Low';
      const riskScore = riskLevel === 'High' ? 85 
                      : riskLevel === 'Medium' ? 48 
                      : analysisData?.risk_level ? 18 : 0;
      const complianceScore = riskScore > 0 ? 100 - riskScore : 100;

      // Dynamically compile clauses list from backend fields
      const clauses = [];
      
      if (analysisData?.liability_clause) {
        clauses.push({
          id: 'liability',
          title: 'Section: Limitation of Liability',
          category: 'Liability',
          content: analysisData.liability_clause,
          riskLevel: riskLevel === 'High' ? 'High' : 'Medium',
          riskDescription: 'Governing limits of liabilities extracted by AI.'
        });
      }
      
      if (analysisData?.confidentiality_clause) {
        clauses.push({
          id: 'confidentiality',
          title: 'Section: Confidentiality Obligations',
          category: 'Confidentiality',
          content: analysisData.confidentiality_clause,
          riskLevel: 'Low',
          riskDescription: 'Confidential information rules and restrictions.'
        });
      }

      if (analysisData?.termination_clause) {
        clauses.push({
          id: 'termination',
          title: 'Section: Termination Conditions',
          category: 'Operations',
          content: analysisData.termination_clause,
          riskLevel: riskLevel === 'High' || riskLevel === 'Medium' ? 'Medium' : 'Low',
          riskDescription: 'Scope of termination and notice requirements.'
        });
      }

      if (analysisData?.payment_terms) {
        clauses.push({
          id: 'payment',
          title: 'Section: Payment Terms',
          category: 'Finance',
          content: analysisData.payment_terms,
          riskLevel: 'Low',
          riskDescription: 'Payment timeline and billing parameters.'
        });
      }

      // Map raw risks to clause rows if clauses are empty
      if (clauses.length === 0 && parsedRisks.length > 0) {
        parsedRisks.forEach((riskText, idx) => {
          clauses.push({
            id: `risk_${idx}`,
            title: `Risk Assessment Indicator #${idx + 1}`,
            category: 'Risk Clause',
            content: riskText,
            riskLevel: riskLevel,
            riskDescription: 'AI Flagged compliance concern in contract text.'
          });
        });
      }

      // Add dummy fallback clause if none are extracted
      if (clauses.length === 0) {
        clauses.push({
          id: 'default_text',
          title: 'Full Contract Text Extract',
          category: 'Text Extract',
          content: contractData.extracted_text || 'No text extracted from document.',
          riskLevel: 'Low',
          riskDescription: 'Raw text extracted via OCR/PDF parses.'
        });
      }

      return {
        id: contractData.id.toString(),
        name: contractData.title || contractData.original_filename,
        type: analysisData?.contract_type || contractData.category || 'Commercial Contract',
        partyA: getPartyName(parsedParties[0]) || '',
        partyB: getPartyName(parsedParties[1]) || '',
        status: analysisData ? (riskLevel === 'High' ? 'Risk Flagged' : 'Completed') : 'Pending Analysis',
        riskScore: riskScore,
        riskLevel: riskLevel,
        uploadDate: new Date(contractData.upload_date).toISOString().split('T')[0],
        fileSize: '1.2 MB',
        complianceScore: complianceScore,
        summary: analysisData ? `This contract has been analyzed. Major risk highlights are classifed as ${riskLevel} Risk.` : 'This contract is currently pending AI analysis. Click "Analyze" to proceed.',
        keyDates: [
          { label: 'Effective Date', date: analysisData?.effective_date || 'N/A' },
          { label: 'Expiration Date', date: analysisData?.expiry_date || 'N/A' }
        ],
        clauses: clauses,
        hasAnalysis: !!analysisData
      };

    } catch (error) {
      console.error('Error fetching contract detail:', error);
      return null;
    }
  };

  // Run AI analysis manually
  const analyzeContractManual = async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/contracts/${id}/analyze`);
      if (response.data) {
        await fetchContracts();
        await fetchStats();
        return true;
      }
    } catch (error) {
      console.error('Error analyzing contract:', error);
    }
    return false;
  };

  // Chat with a contract using the backend AI service
  const askContractQuestion = async (id, question) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/contracts/${id}/chat`, { question });
      return response.data?.answer || 'No response returned from assistant.';
    } catch (error) {
      console.error('Error chatting with contract:', error);
      return 'Failed to fetch response. Check server connection.';
    }
  };

  // Fetch all versions of a contract
  const getContractVersions = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contracts/${id}/versions`);
      return response.data?.versions || [];
    } catch (error) {
      console.error('Error fetching versions:', error);
      return [];
    }
  };

  // Upload a new version for a contract
  const uploadContractVersion = async (id, file) => {
    const formData = new FormData();
    formData.append('contract', file);
    try {
      const response = await axios.post(`${API_BASE_URL}/contracts/${id}/version`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.status === 201;
    } catch (error) {
      console.error('Error uploading version:', error);
      return false;
    }
  };

  // Fetch contract logs audit trail
  const getContractLogs = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contracts/${id}/logs`);
      return response.data?.logs || [];
    } catch (error) {
      console.error('Error fetching contract logs:', error);
      return [];
    }
  };

  // Compare two contracts via backend AI comparison
  const compareContracts = async (contract1Id, contract2Id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/contracts/compare`, {
        contract1: contract1Id,
        contract2: contract2Id
      });
      return response.data?.comparison || null;
    } catch (error) {
      console.error('Error comparing contracts:', error);
      return null;
    }
  };

  const clearQueue = () => {
    setUploadQueue([]);
  };

  return (
    <ContractContext.Provider value={{
      contracts,
      stats,
      uploadQueue,
      isLoading,
      fetchContracts,
      fetchStats,
      uploadFiles,
      deleteContract,
      fetchContractDetail,
      analyzeContractManual,
      askContractQuestion,
      getContractVersions,
      uploadContractVersion,
      getContractLogs,
      compareContracts,
      clearQueue,
      userProfile
    }}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContracts = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContracts must be used within a ContractProvider');
  }
  return context;
};
