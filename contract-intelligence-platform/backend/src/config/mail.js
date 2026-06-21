const nodemailer = require("nodemailer");
const dns = require("dns");

// Force Node to resolve DNS to IPv4 first for SMTP fallback
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

// SMTP Transporter as a fallback
const smtpTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    },
    family: 4
});

// Hybrid Transporter supporting HTTP APIs (Resend, SendGrid, Brevo) and SMTP
const transporter = {
    sendMail: async ({ from, to, subject, html }) => {
        // 1. Resend HTTP API
        if (process.env.RESEND_API_KEY) {
            console.log("Sending email via Resend HTTP API...");
            
            // Resend Free Tier requires sending from onboarding@resend.dev if domain is unverified
            let fromAddress = process.env.EMAIL_USER;
            if (!fromAddress || fromAddress.includes("@gmail.com") || fromAddress.includes("@yahoo.com") || fromAddress.includes("@outlook.com")) {
                fromAddress = "ContractIQ <onboarding@resend.dev>";
            }

            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: fromAddress,
                    to: [to],
                    subject: subject,
                    html: html
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Resend API failed: ${errText}`);
            }
            return { messageId: "resend" };
        }

        // 2. SendGrid HTTP API
        if (process.env.SENDGRID_API_KEY) {
            console.log("Sending email via SendGrid HTTP API...");
            const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: to }] }],
                    from: { email: from || process.env.EMAIL_USER || "no-reply@contractiq.com" },
                    subject: subject,
                    content: [{ type: "text/html", value: html }]
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`SendGrid API failed: ${errText}`);
            }
            return { messageId: "sendgrid" };
        }

        // 3. Brevo (Sendinblue) HTTP API
        if (process.env.BREVO_API_KEY) {
            console.log("Sending email via Brevo HTTP API...");
            const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.BREVO_API_KEY
                },
                body: JSON.stringify({
                    sender: { name: "ContractIQ", email: from || process.env.EMAIL_USER || "no-reply@contractiq.com" },
                    to: [{ email: to }],
                    subject: subject,
                    htmlContent: html
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Brevo API failed: ${errText}`);
            }
            return { messageId: "brevo" };
        }

        // 4. Default Fallback to SMTP
        console.log("No HTTP API key found in environment. Falling back to SMTP...");
        return smtpTransporter.sendMail({ from, to, subject, html });
    }
};

module.exports = transporter;