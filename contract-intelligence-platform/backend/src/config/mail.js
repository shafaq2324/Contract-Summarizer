const nodemailer = require("nodemailer");
const dns = require("dns");

// Force Node to resolve DNS to IPv4 first, as Render does not support outbound IPv6
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL on port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    },
    family: 4 // Force IPv4 to prevent ENETUNREACH ipv6 connect errors
});

module.exports = transporter;