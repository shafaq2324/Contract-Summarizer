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


// ======================
// Upload Contract
// ======================
router.post(
    "/upload",
    protect,
    upload.single("contract"),
    uploadContract
);


// ======================
// Dashboard
// ======================
router.get(
    "/dashboard/stats",
    protect,
    getDashboardStats
);

router.get(
    "/dashboard/recent",
    protect,
    getRecentContracts
);


// ======================
// Search
// ======================
router.get(
    "/search",
    protect,
    searchContracts
);


// ======================
// Compare Contracts
// ======================
router.post(
    "/compare",
    protect,
    compareTwoContracts
);


// ======================
// Versioning
// ======================
router.post(
    "/:id/version",
    protect,
    upload.single("contract"),
    uploadVersion
);

router.get(
    "/:id/versions",
    protect,
    getVersions
);


// ======================
// AI Analysis
// ======================
router.post(
    "/:id/analyze",
    protect,
    analyzeContractById
);

router.get(
    "/:id/analysis",
    protect,
    getContractAnalysis
);


// ======================
// Chat with Contract
// ======================
router.post(
    "/:id/chat",
    protect,
    chatWithContract
);


// ======================
// Report & Logs
// ======================
router.get(
    "/:id/report",
    protect,
    downloadReport
);

router.get(
    "/:id/logs",
    protect,
    getContractLogs
);


// ======================
// Get All Contracts
// ======================
router.get(
    "/",
    protect,
    getAllContracts
);


// ======================
// Get One Contract
// ======================
router.get(
    "/:id",
    protect,
    getContractById
);


// ======================
// Delete Contract
// ======================
router.delete(
    "/:id",
    protect,
    deleteContract
);

module.exports = router;