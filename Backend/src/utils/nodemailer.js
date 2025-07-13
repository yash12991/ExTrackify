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

export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "hitec3314@gmail.com",
      to,
      subject,
      text,
      ...(html && { html }),
    };
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Email templates
export const createSIPEmailTemplate = (user, sipData) => {
  const {
    sipName,
    amount,
    startDate,
    durationInMonths,
    frequency,
    goal,
    expectedRate,
    expectedMaturityValue,
    nextPaymentDate,
  } = sipData;

  const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SIP Created Successfully</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .header {
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                opacity: 0.3;
            }
            
            .logo {
                font-size: 2.5rem;
                font-weight: 800;
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .header h1 {
                font-size: 1.8rem;
                font-weight: 600;
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
            }
            
            .header p {
                font-size: 1.1rem;
                opacity: 0.9;
                position: relative;
                z-index: 1;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .success-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                color: white;
                padding: 12px 24px;
                border-radius: 50px;
                font-weight: 600;
                margin-bottom: 30px;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            }
            
            .sip-details {
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
                border-radius: 16px;
                padding: 30px;
                margin: 30px 0;
                border: 1px solid rgba(102, 126, 234, 0.2);
            }
            
            .sip-name {
                font-size: 1.5rem;
                font-weight: 700;
                color: #1F2937;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .detail-item {
                background: white;
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #10B981;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            }
            
            .detail-label {
                font-size: 0.9rem;
                color: #6B7280;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            
            .detail-value {
                font-size: 1.2rem;
                font-weight: 700;
                color: #1F2937;
            }
            
            .detail-value.amount {
                color: #10B981;
                font-size: 1.4rem;
            }
            
            .maturity-highlight {
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                color: white;
                padding: 25px;
                border-radius: 16px;
                text-align: center;
                margin: 30px 0;
                box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
            }
            
            .maturity-label {
                font-size: 1rem;
                opacity: 0.9;
                margin-bottom: 8px;
            }
            
            .maturity-value {
                font-size: 2.2rem;
                font-weight: 800;
                margin-bottom: 5px;
            }
            
            .maturity-note {
                font-size: 0.9rem;
                opacity: 0.8;
            }
            
            .next-steps {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 12px;
                padding: 25px;
                margin: 30px 0;
            }
            
            .next-steps h3 {
                color: #1F2937;
                margin-bottom: 15px;
                font-size: 1.2rem;
            }
            
            .next-steps ul {
                list-style: none;
                padding: 0;
            }
            
            .next-steps li {
                padding: 8px 0;
                color: #4B5563;
                padding-left: 25px;
                position: relative;
            }
            
            .next-steps li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #10B981;
                font-weight: bold;
            }
            
            .footer {
                background: #F9FAFB;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #E5E7EB;
            }
            
            .footer p {
                color: #6B7280;
                margin-bottom: 10px;
            }
            
            .contact-info {
                display: flex;
                justify-content: center;
                gap: 20px;
                flex-wrap: wrap;
                margin-top: 15px;
            }
            
            .contact-item {
                color: #6B7280;
                font-size: 0.9rem;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 12px;
                }
                
                .header {
                    padding: 30px 20px;
                }
                
                .content {
                    padding: 30px 20px;
                }
                
                .details-grid {
                    grid-template-columns: 1fr;
                }
                
                .logo {
                    font-size: 2rem;
                }
                
                .maturity-value {
                    font-size: 1.8rem;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">💰 ExpenseTracker</div>
                <h1>SIP Created Successfully!</h1>
                <p>Your systematic investment plan is now active</p>
            </div>
            
            <div class="content">
                <div class="success-badge">
                    ✅ SIP Activated
                </div>
                
                <p>Dear ${user.name || "Valued Customer"},</p>
                
                <p>Congratulations! Your SIP (Systematic Investment Plan) has been successfully created and activated. Here are your investment details:</p>
                
                <div class="sip-details">
                    <div class="sip-name">${sipName}</div>
                    
                    <div class="details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Investment Amount</div>
                            <div class="detail-value amount">${formatCurrency(
                              amount
                            )}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Frequency</div>
                            <div class="detail-value">${
                              frequency.charAt(0).toUpperCase() +
                              frequency.slice(1)
                            }</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Duration</div>
                            <div class="detail-value">${durationInMonths} Months</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Expected Return Rate</div>
                            <div class="detail-value">${expectedRate}% p.a.</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Start Date</div>
                            <div class="detail-value">${formatDate(
                              startDate
                            )}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Next Payment</div>
                            <div class="detail-value">${formatDate(
                              nextPaymentDate
                            )}</div>
                        </div>
                    </div>
                    
                    ${
                      goal
                        ? `<div class="detail-item" style="margin-top: 20px; grid-column: 1 / -1;">
                        <div class="detail-label">Investment Goal</div>
                        <div class="detail-value">${goal}</div>
                    </div>`
                        : ""
                    }
                </div>
                
                <div class="maturity-highlight">
                    <div class="maturity-label">Expected Maturity Value</div>
                    <div class="maturity-value">${formatCurrency(
                      expectedMaturityValue
                    )}</div>
                    <div class="maturity-note">*Based on ${expectedRate}% annual return rate</div>
                </div>
                
                <div class="next-steps">
                    <h3>What happens next?</h3>
                    <ul>
                        <li>Your first payment will be processed on ${formatDate(
                          nextPaymentDate
                        )}</li>
                        <li>You'll receive email notifications before each payment</li>
                        <li>Track your SIP performance in your dashboard</li>
                        <li>You can modify or pause your SIP anytime</li>
                        <li>Monthly statements will be sent to your email</li>
                    </ul>
                </div>
                
                <p>Thank you for choosing ExpenseTracker for your investment journey. We're committed to helping you achieve your financial goals!</p>
            </div>
            
            <div class="footer">
                <p><strong>ExpenseTracker - Your Financial Companion</strong></p>
                <p>This is an automated email. Please do not reply to this message.</p>
                <div class="contact-info">
                    <span class="contact-item">📧 support@expensetracker.com</span>
                    <span class="contact-item">📞 +91-XXXX-XXXXXX</span>
                    <span class="contact-item">🌐 www.expensetracker.com</span>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};
