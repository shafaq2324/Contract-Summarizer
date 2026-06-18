const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

const {
    extractTextFromPDF,
} = require("../services/pdfService");
const {
    extractTextFromImage,
} = require("../services/ocrService");

// ========================================
// Upload Contract
// ========================================

exports.uploadContract = async (req, res) => {
    try {
        const { title, category } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }

        const filePath = path.join(
            req.file.destination,
            req.file.filename
        );

        // Step 1: PDF Extraction
        let extractedText =
            await extractTextFromPDF(filePath);

        let processingType = "pdf";

        const pdfTextLength =
            extractedText?.trim()?.length || 0;

        console.log(
            "PDF TEXT LENGTH:",
            pdfTextLength
        );

        // Step 2: OCR Fallback
        if (pdfTextLength < 500) {

            console.log(
                "Low text detected. Running OCR..."
            );

            try {

                extractedText =
                    await extractTextFromImage(
                        filePath
                    );

                processingType = "ocr";

                console.log(
                    "OCR TEXT LENGTH:",
                    extractedText?.length || 0
                );

            } catch (ocrError) {

                console.error(
                    "OCR ERROR:",
                    ocrError
                );

                processingType =
                    "pdf-fallback";
            }
        }

        console.log(
            "FINAL PROCESSING TYPE:",
            processingType
        );

        console.log(
            "TEXT PREVIEW:",
            extractedText?.substring(
                0,
                200
            )
        );

        const contract = await pool.query(
            `
            INSERT INTO contracts
            (
                title,
                original_filename,
                stored_filename,
                category,
                uploaded_by,
                extracted_text,
                processing_type
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *
            `,
            [
                title,
                req.file.originalname,
                req.file.filename,
                category,
                1,
                extractedText,
                processingType,
            ]
        );

        res.status(201).json({
            message:
                "Contract uploaded successfully",
            contract: contract.rows[0],
        });

    } catch (error) {

        console.error(
            "UPLOAD ERROR:",
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};

// ========================================
// Get All Contracts
// ========================================

exports.getAllContracts = async (req, res) => {
    try {
        const contracts = await pool.query(
            `
            SELECT *
            FROM contracts
            ORDER BY upload_date DESC
            `
        );

        res.status(200).json({
            contracts: contracts.rows,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message,
        });
    }
};

// ========================================
// Get Contract By ID
// ========================================

exports.getContractById = async (req, res) => {
    try {
        const { id } = req.params;

        const contract = await pool.query(
            `
            SELECT *
            FROM contracts
            WHERE id = $1
            `,
            [id]
        );

        if (contract.rows.length === 0) {
            return res.status(404).json({
                message: "Contract not found",
            });
        }

        res.status(200).json(
            contract.rows[0]
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message,
        });
    }
};

// ========================================
// Delete Contract
// ========================================

exports.deleteContract = async (req, res) => {
    try {
        const { id } = req.params;

        const contract = await pool.query(
            `
            SELECT *
            FROM contracts
            WHERE id = $1
            `,
            [id]
        );

        if (contract.rows.length === 0) {
            return res.status(404).json({
                message: "Contract not found",
            });
        }

        const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            contract.rows[0].stored_filename
        );

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await pool.query(
            `
            DELETE FROM contracts
            WHERE id = $1
            `,
            [id]
        );

        res.status(200).json({
            message: "Contract deleted successfully",
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message,
        });
    }
};