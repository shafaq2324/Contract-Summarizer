const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const {
    uploadContract,
} = require("../controllers/contractController");

router.post(
    "/upload",
    upload.single("contract"),
    uploadContract
);

module.exports = router;