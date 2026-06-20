const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

const {
    extractTextFromPDF,
} = require("../services/pdfService");
const {
    extractTextFromImage,
} = require("../services/ocrService");
const {
    analyzeContract,
} = require("../services/aiService");

const {
    compareContracts,
} = require("../services/comparisonService");

const {
    generatePDF,
} = require("../services/reportService");

const {
    logActivity,
} = require("../services/auditService");

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

        console.log("PDF TEXT LENGTH:", extractedText?.trim()?.length || 0);
        console.log("PDF TEXT PREVIEW:", extractedText?.substring(0, 300));

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
        console.log(req.user);

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

        await logActivity(
            req.user.id,
            contract.rows[0].id,
            "Contract uploaded"
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

        await logActivity(
            req.user.id,
            Number(id),
            "Contract deleted"
        );

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


exports.analyzeContractById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get contract
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

        // AI analysis
        const analysis = await analyzeContract(
            contract.rows[0].extracted_text
        );

        // Remove markdown if present
        const cleanedResponse = analysis
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsedAnalysis = JSON.parse(
            cleanedResponse
        );

        // Check existing analysis
        const existingAnalysis =
            await pool.query(
                `
                SELECT *
                FROM contract_analysis
                WHERE contract_id = $1
                `,
                [id]
            );

        if (existingAnalysis.rows.length > 0) {

            await pool.query(
                `
                UPDATE contract_analysis
                SET
                    contract_type = $1,
                    effective_date = $2,
                    expiry_date = $3,
                    parties = $4,
                    payment_terms = $5,
                    termination_clause = $6,
                    confidentiality_clause = $7,
                    liability_clause = $8,
                    risk_level = $9,
                    risks = $10
                WHERE contract_id = $11
                `,
                [
                    parsedAnalysis.contract_type || null,
                    parsedAnalysis.effective_date || null,
                    parsedAnalysis.expiry_date || null,
                    JSON.stringify(
                        parsedAnalysis.parties || []
                    ),
                    parsedAnalysis.payment_terms || null,
                    parsedAnalysis.termination_clause || null,
                    parsedAnalysis.confidentiality_clause || null,
                    parsedAnalysis.liability_clause || null,
                    parsedAnalysis.risk_level || null,
                    JSON.stringify(
                        parsedAnalysis.risks || []
                    ),
                    id,
                ]
            );
            console.log(parsedAnalysis);

        } else {

            await pool.query(
                `
                INSERT INTO contract_analysis
                (
                    contract_id,
                    contract_type,
                    effective_date,
                    expiry_date,
                    parties,
                    payment_terms,
                    termination_clause,
                    confidentiality_clause,
                    liability_clause,
                    risk_level,
                    risks
                )
                VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                `,
                [
                    id,
                    parsedAnalysis.contract_type || null,
                    parsedAnalysis.effective_date || null,
                    parsedAnalysis.expiry_date || null,
                    JSON.stringify(
                        parsedAnalysis.parties || []
                    ),
                    parsedAnalysis.payment_terms || null,
                    parsedAnalysis.termination_clause || null,
                    parsedAnalysis.confidentiality_clause || null,
                    parsedAnalysis.liability_clause || null,
                    parsedAnalysis.risk_level || null,
                    JSON.stringify(
                        parsedAnalysis.risks || []
                    ),
                ]
            );
        }

        await logActivity(
            req.user.id,
            Number(id),
            "Contract analyzed"
        );

        res.status(200).json({
            message: "Analysis saved successfully",
            analysis: parsedAnalysis,
        });

    } catch (error) {

        console.error(
            "ANALYSIS ERROR:",
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};

exports.getContractAnalysis = async (req, res) => {
    try {
        const { id } = req.params;

        const analysis = await pool.query(
            `
            SELECT *
            FROM contract_analysis
            WHERE contract_id = $1
            `,
            [id]
        );

        if (analysis.rows.length === 0) {
            return res.status(404).json({
                message: "Analysis not found",
            });
        }

        res.status(200).json({
            analysis: analysis.rows[0],
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message,
        });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalContracts = await pool.query(
            `SELECT COUNT(*) FROM contracts`
        );

        const totalAnalysis = await pool.query(
            `SELECT COUNT(*) FROM contract_analysis`
        );

        const highRisk = await pool.query(
            `
            SELECT COUNT(*)
            FROM contract_analysis
            WHERE risk_level = 'High'
            `
        );

        const mediumRisk = await pool.query(
            `
            SELECT COUNT(*)
            FROM contract_analysis
            WHERE risk_level = 'Medium'
            `
        );

        const lowRisk = await pool.query(
            `
            SELECT COUNT(*)
            FROM contract_analysis
            WHERE risk_level = 'Low'
            `
        );

        res.status(200).json({
            totalContracts:
                totalContracts.rows[0].count,

            analyzedContracts:
                totalAnalysis.rows[0].count,

            highRisk:
                highRisk.rows[0].count,

            mediumRisk:
                mediumRisk.rows[0].count,

            lowRisk:
                lowRisk.rows[0].count,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

exports.searchContracts = async (req, res) => {
    try {
        const { q } = req.query;

        const result = await pool.query(
            `
            SELECT
                c.id,
                c.title,
                c.category,
                c.upload_date,
                ca.contract_type,
                ca.risk_level
            FROM contracts c
            LEFT JOIN contract_analysis ca
            ON c.id = ca.contract_id
            WHERE
                LOWER(c.title) LIKE LOWER($1)
                OR LOWER(c.category) LIKE LOWER($1)
                OR LOWER(COALESCE(ca.contract_type, '')) LIKE LOWER($1)
            ORDER BY c.upload_date DESC
            `,
            [`%${q}%`]
        );

        res.status(200).json({
            results: result.rows,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
const {
    askContractQuestion,
} = require("../services/chatService");

exports.chatWithContract = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { question } = req.body;

        const contract = await pool.query(
            `
            SELECT extracted_text
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

        const answer =
            await askContractQuestion(
                contract.rows[0].extracted_text,
                question
            );

        res.status(200).json({
            question,
            answer,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message,
        });
    }
};

exports.compareTwoContracts = async (
    req,
    res
) => {
    try {

        const {
            contract1,
            contract2,
        } = req.body;

        const first =
            await pool.query(
                `
                SELECT extracted_text
                FROM contracts
                WHERE id = $1
                `,
                [contract1]
            );

        const second =
            await pool.query(
                `
                SELECT extracted_text
                FROM contracts
                WHERE id = $1
                `,
                [contract2]
            );

        if (
            first.rows.length === 0 ||
            second.rows.length === 0
        ) {
            return res.status(404).json({
                message:
                    "One or both contracts not found",
            });
        }

        const comparison =
            await compareContracts(
                first.rows[0].extracted_text,
                second.rows[0].extracted_text
            );

        const cleanedResponse =
            comparison
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

        res.status(200).json({
            comparison:
                JSON.parse(cleanedResponse),
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                error.message,
        });
    }
};

exports.getRecentContracts = async (
    req,
    res
) => {
    try {

        const contracts =
            await pool.query(
                `
                SELECT
                    c.id,
                    c.title,
                    c.category,
                    c.upload_date,
                    ca.contract_type,
                    ca.risk_level
                FROM contracts c
                LEFT JOIN contract_analysis ca
                ON c.id = ca.contract_id
                ORDER BY c.upload_date DESC
                LIMIT 5
                `
            );

        res.status(200).json({
            contracts:
                contracts.rows,
        });

    } catch (error) {

        res.status(500).json({
            message:
                error.message,
        });
    }
};

exports.downloadReport = async (
    req,
    res
) => {
    try {

        const { id } = req.params;

        const analysis =
            await pool.query(
                `
                SELECT *
                FROM contract_analysis
                WHERE contract_id = $1
                `,
                [id]
            );

        if (
            analysis.rows.length === 0
        ) {
            return res.status(404).json({
                message:
                    "Analysis not found",
            });
        }

        const pdfBuffer =
            await generatePDF(
                analysis.rows[0]
            );

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=contract-${id}.pdf`
        );

        await logActivity(
            req.user.id,
            Number(id),
            "Report downloaded"
        );

        res.send(pdfBuffer);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                error.message,
        });
    }
};

exports.getContractLogs = async (
    req,
    res
) => {
    try {

        const { id } = req.params;

        const logs = await pool.query(
            `
            SELECT
                a.id,
                u.name,
                a.action,
                a.created_at
            FROM audit_logs a
            JOIN users u
            ON a.user_id = u.id
            WHERE a.contract_id = $1
            ORDER BY a.created_at DESC
            `,
            [id]
        );

        res.status(200).json({
            logs: logs.rows,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });
    }
};