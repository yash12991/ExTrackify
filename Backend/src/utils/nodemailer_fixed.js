// utils/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("Environment check:", {
  EMAIL_USER: process.env.EMAIL_USER ? "✓ Loaded" : "✗ Missing",
  EMAIL_PASS: process.env.EMAIL_PASS ? "✓ Loaded" : "✗ Missing",
  NODE_ENV: process.env.NODE_ENV,
});

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "hitec3314@gmail.com",
    pass: process.env.EMAIL_PASS || "jltnwrfixjxcbgvq",
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verification error:", error);
  } else {
    console.log("Transporter ready to send emails");
  }
});

export const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "hitec3314@gmail.com",
      to,
      subject,
      text,
    };
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
