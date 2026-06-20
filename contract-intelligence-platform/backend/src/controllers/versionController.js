const pool = require("../config/db");
const path = require("path");

const {
    extractTextFromPDF,
} = require("../services/pdfService");

exports.uploadVersion = async (
    req,
    res
) => {
    try {

        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }

        const contract =
            await pool.query(
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

        const latestVersion =
            await pool.query(
                `
                SELECT MAX(version_number)
                AS latest
                FROM contract_versions
                WHERE contract_id = $1
                `,
                [id]
            );

        const versionNumber =
            (latestVersion.rows[0]
                .latest || 0) + 1;

        const filePath = path.join(
            req.file.destination,
            req.file.filename
        );

        const extractedText =
            await extractTextFromPDF(
                filePath
            );

        await pool.query(
            `
            INSERT INTO contract_versions
            (
                contract_id,
                version_number,
                stored_filename,
                extracted_text
            )
            VALUES ($1,$2,$3,$4)
            `,
            [
                id,
                versionNumber,
                req.file.filename,
                extractedText,
            ]
        );

        res.status(201).json({
            message:
                "Version uploaded successfully",
            version: versionNumber,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message,
        });
    }
};

exports.getVersions = async (
    req,
    res
) => {
    try {

        const { id } = req.params;

        const versions =
            await pool.query(
                `
                SELECT
                    id,
                    version_number,
                    created_at
                FROM contract_versions
                WHERE contract_id = $1
                ORDER BY version_number DESC
                `,
                [id]
            );

        res.status(200).json({
            versions:
                versions.rows,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });
    }
};