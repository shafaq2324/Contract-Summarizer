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
} = require("../validators/authValidator");

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

router.get(
    "/profile",
    authMiddleware,
    (req, res) => {
        res.json({
            message: "Protected route accessed",
            user: req.user,
        });
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