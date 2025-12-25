require("dotenv").config();
const nodemailer = require("nodemailer");

async function main() {
    console.log("Testing SMTP…");

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // verify SMTP login
    try {
        await transporter.verify();
        console.log("SMTP verify OK");
    } catch (err) {
        console.error("SMTP verify FAILED:", err);
        return;
    }

    const testRecipient = "eerieape@gmail.com";   // <-- change if needed

    console.log("Attempting sendMail to:", testRecipient);

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: testRecipient,
            subject: "Cora Test Email",
            text: "This is a test email sent from your CORA backend.",
        });

        console.log("sendMail OK:", info.messageId);
    } catch (err) {
        console.error("sendMail FAILED:", err);
    }
}

main();
