const express = require("express");
const router = express.Router();

const {
    register,
    login,
    forgotPassword,
    resetPassword,
} = require("../controllers/authController");

const validationMiddleware = require(
    "../middleware/validationMiddleware"
);

const {
    registerValidation,
    loginValidation,
} = require("../validators/authvalidator");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const roleMiddleware = require(
    "../middleware/roleMiddleware"
);

router.post(
    "/register",
    registerValidation,
    validationMiddleware,
    register
);

router.post(
    "/login",
    loginValidation,
    validationMiddleware,
    login
);

const pool = require("../config/db");

router.get(
    "/profile",
    authMiddleware,
    async (req, res) => {
        try {
            const userRes = await pool.query(
                "SELECT id, name, email, role FROM users WHERE id = $1",
                [req.user.id]
            );
            if (userRes.rows.length === 0) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            res.json({
                message: "Profile retrieved successfully",
                user: userRes.rows[0],
            });
        } catch (err) {
            res.status(500).json({
                message: err.message,
            });
        }
    }
);

router.get(
    "/admin-dashboard",
    authMiddleware,
    roleMiddleware("admin"),
    (req, res) => {

        res.json({
            message: "Welcome Admin",
        });
    }
);

router.get(
    "/lawyer-dashboard",
    authMiddleware,
    roleMiddleware("lawyer"),
    (req, res) => {

        res.json({
            message: "Welcome Lawyer",
        });
    }
);

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/reset-password/:token",
    resetPassword
);

module.exports = router;