const pool = require("../config/db");

exports.logActivity = async (
    userId,
    contractId,
    action
) => {
    try {

        console.log(
            "LOGGING:",
            userId,
            contractId,
            action
        );

        await pool.query(
            `
            INSERT INTO audit_logs
            (
                user_id,
                contract_id,
                action
            )
            VALUES ($1,$2,$3)
            `,
            [
                userId,
                contractId,
                action
            ]
        );

        console.log("LOG SAVED");

    } catch (error) {
        console.error(
            "AUDIT ERROR:",
            error
        );
    }
};