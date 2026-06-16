const { body } = require("express-validator");

exports.registerValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 6 })
        .withMessage(
            "Password must be at least 6 characters long"
        ),

    body("role")
        .optional()
        .isIn([
            "admin",
            "lawyer",
            "hr",
            "employee",
        ])
        .withMessage("Invalid role"),
];

exports.loginValidation = [
    body("email")
        .isEmail()
        .withMessage(
            "Please provide a valid email"
        ),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),
];