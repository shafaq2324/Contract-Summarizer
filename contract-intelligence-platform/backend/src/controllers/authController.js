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

        let clientOrigin = req.get("origin") || process.env.CLIENT_URL || process.env.VERCEL_URL || "http://localhost:5173";
        if (clientOrigin.endsWith("/")) {
            clientOrigin = clientOrigin.slice(0, -1);
        }
        const resetLink = `${clientOrigin}/reset-password/${resetToken}`;

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Reset Your Password - ContractIQ",
                html: `
                    <div style="background-color: #0b0f19; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #f1f5f9; min-height: 100%;">
                      <div style="max-width: 480px; margin: 0 auto; background-color: #111827; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 32px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);">
                        <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; line-height: 48px; font-size: 20px; font-weight: bold; margin-bottom: 20px;">
                          IQ
                        </div>
                        <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; color: #ffffff; letter-spacing: -0.025em;">Reset Your Password</h2>
                        <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; text-align: center;">
                          We received a request to reset your ContractIQ workspace password. Click the button below to choose a new password. This link is valid for 60 minutes.
                        </p>
                        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 600; border-radius: 10px; box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);">
                          Reset Password
                        </a>
                        <div style="margin-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 16px; font-size: 11px; color: #64748b; text-align: center;">
                          If you did not make this request, you can safely ignore this email.
                        </div>
                      </div>
                    </div>
                `,
            });

            return res.json({
                message: "Password reset email sent successfully.",
            });
        } catch (mailError) {
            console.error("SMTP EMAIL SENDING FAILED:", mailError.message);
            console.log("\n=======================================================");
            console.log("🔑 MOCK PASSWORD RESET LINK FOR USER:", email);
            console.log("🔗 LINK:", resetLink);
            console.log("=======================================================\n");

            return res.json({
                message: "Password reset initiated successfully.",
                resetLink: resetLink,
            });
        }

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
             AND reset_token_expiry > $2`,
            [token, new Date()]
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