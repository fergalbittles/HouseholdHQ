const nodeMailer = require("nodemailer");
const dotenv = require("dotenv");

// Load config
dotenv.config();

const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

module.exports.transporter = transporter;
