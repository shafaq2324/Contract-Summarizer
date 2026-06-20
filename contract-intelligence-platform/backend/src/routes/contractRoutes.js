const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const {
    uploadContract,
    getAllContracts,
    getContractById,
    deleteContract,
    analyzeContractById,
} = require("../controllers/contractController");

router.post(
    "/upload",
    upload.single("contract"),
    uploadContract
);

router.post(
    "/:id/analyze",
    analyzeContractById
);

router.get(
    "/",
    getAllContracts
);

router.get(
    "/:id",
    getContractById
);

router.delete(
    "/:id",
    deleteContract
);

module.exports = router;