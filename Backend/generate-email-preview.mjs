import { createSIPEmailTemplate } from "./src/utils/nodemailer.js";
import fs from "fs";

// Sample user and SIP data for preview
const sampleUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  fullname: "John Doe",
};

const sampleSIPData = {
  sipName: "Dream Home Fund SIP",
  amount: 25000,
  startDate: new Date("2025-07-03"),
  durationInMonths: 60,
  frequency: "monthly",
  goal: "Building a fund for my dream home purchase",
  expectedRate: 12,
  expectedMaturityValue: 2045678.89,
  nextPaymentDate: new Date("2025-08-03"),
};

console.log("🎨 Generating SIP email template preview...");

const emailHTML = createSIPEmailTemplate(sampleUser, sampleSIPData);

// Save to file for preview
fs.writeFileSync("sip-email-preview.html", emailHTML);

console.log("✅ Email template generated!");
console.log("📧 Preview saved to: sip-email-preview.html");
console.log("🔍 Open this file in your browser to see how the email looks!");
console.log("");
console.log("Email Template Features:");
console.log("• 📱 Responsive design for mobile and desktop");
console.log("• 🎨 Modern gradient design matching your app theme");
console.log("• 💰 ExpenseTracker logo and branding");
console.log("• 📊 Complete SIP details with expected maturity value");
console.log("• ✅ Next steps and important information");
console.log("• 🎯 Professional footer with contact information");
