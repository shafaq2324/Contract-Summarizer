const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const protect = require("../middleware/authMiddleware");

const {
    uploadContract,
    getAllContracts,
    getContractById,
    deleteContract,
    analyzeContractById,
    getContractAnalysis,
    getDashboardStats,
    searchContracts,
    chatWithContract,
    compareTwoContracts,
    getRecentContracts,
    downloadReport,
    getContractLogs,
} = require("../controllers/contractController");

const {
    uploadVersion,
    getVersions,
} = require("../controllers/versionController");

// Protect all contract routes
router.use(protect);

// ======================
// Upload Contract
// ======================
router.post(
    "/upload",
    upload.single("contract"),
    uploadContract
);


// ======================
// Dashboard
// ======================
router.get(
    "/dashboard/stats",
    getDashboardStats
);

router.get(
    "/dashboard/recent",
    getRecentContracts
);


// ======================
// Search
// ======================
router.get(
    "/search",
    searchContracts
);


// ======================
// Compare Contracts
// ======================
router.post(
    "/compare",
    compareTwoContracts
);


// ======================
// Versioning
// ======================
router.post(
    "/:id/version",
    upload.single("contract"),
    uploadVersion
);

router.get(
    "/:id/versions",
    getVersions
);


// ======================
// AI Analysis
// ======================
router.post(
    "/:id/analyze",
    analyzeContractById
);

router.get(
    "/:id/analysis",
    getContractAnalysis
);


// ======================
// Chat with Contract
// ======================
router.post(
    "/:id/chat",
    chatWithContract
);


// ======================
// Report & Logs
// ======================
router.get(
    "/:id/report",
    downloadReport
);

router.get(
    "/:id/logs",
    getContractLogs
);


// ======================
// Get All Contracts
// ======================
router.get(
    "/",
    getAllContracts
);


// ======================
// Get One Contract
// ======================
router.get(
    "/:id",
    getContractById
);


// ======================
// Delete Contract
// ======================
router.delete(
    "/:id",
    deleteContract
);

module.exports = router;