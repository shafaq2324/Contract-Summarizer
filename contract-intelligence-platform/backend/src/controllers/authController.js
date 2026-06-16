const pool = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const transporter = require("../config/mail");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) =>
    typeof email === "string" && emailRegex.test(email);

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Name is required",
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Please provide a valid email",
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO users(name, email, password, role)
             VALUES($1,$2,$3,$4)
             RETURNING id, name, email, role`,
            [name, email, hashedPassword, role || "employee"]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: newUser.rows[0],
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        res.json({
            token,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

exports.forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        const userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {

            return res.status(404).json({
                message: "User not found",
            });
        }

        const user = userResult.rows[0];

        const resetToken = crypto
            .randomBytes(32)
            .toString("hex");

        const expiry = new Date(
            Date.now() + 60 * 60 * 1000
        );

        await pool.query(
            `UPDATE users
             SET reset_token = $1,
                 reset_token_expiry = $2
             WHERE id = $3`,
            [resetToken, expiry, user.id]
        );

        const resetLink =
            `http://localhost:3000/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            html: `
                <p>Click the link below:</p>
                <a href="${resetLink}">
                    Reset Password
                </a>
            `,
        });

        res.json({
            message:
                "Password reset email sent",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });
    }
};

exports.resetPassword = async (req, res) => {

    try {

        const { token } = req.params;

        const { password } = req.body;

        const userResult = await pool.query(
            `SELECT *
             FROM users
             WHERE reset_token = $1
             AND reset_token_expiry > NOW()`,
            [token]
        );

        if (userResult.rows.length === 0) {

            return res.status(400).json({
                message:
                    "Invalid or expired token",
            });
        }

        const user = userResult.rows[0];

        const hashedPassword =
            await bcrypt.hash(password, 10);

        await pool.query(
            `UPDATE users
             SET password = $1,
                 reset_token = NULL,
                 reset_token_expiry = NULL
             WHERE id = $2`,
            [hashedPassword, user.id]
        );

        res.json({
            message:
                "Password reset successful",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });
    }
};