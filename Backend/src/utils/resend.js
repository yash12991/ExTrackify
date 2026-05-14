import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;

let resend = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
  console.log("✅ Resend client initialized");
} else {
  console.warn("⚠️ RESEND_API_KEY not set. Email features will be disabled.");
}

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!resend) {
    console.warn("Resend not configured. Skipping email to:", to);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "ExTrackify <onboarding@resend.dev>",
      to,
      subject,
      html,
      ...(text && { text }),
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("✅ Email sent via Resend:", data?.id);
    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};

export default resend;
