import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Gmail App Password, not your login password
    },
});

const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: `"EGuru" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    });
};

export default sendEmail;