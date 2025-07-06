import cron from "node-cron";
import { SIP } from "../models/SIP.models.js";
import { Payment } from "../models/Payment.models.js";
import { User } from "../models/Users.models.js";
import { sendEmail } from "../utils/nodemailer.js";

// Daily check for upcoming SIP payments (runs at 9 AM every day)
cron.schedule("0 9 * * *", async () => {
  console.log("Running daily SIP reminder check...");

  try {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Find SIPs with payments due in the next 3 days
    const upcomingSIPs = await SIP.find({
      isActive: true,
      nextPaymentDate: { $gte: today, $lte: threeDaysFromNow },
    }).populate("user");

    for (const sip of upcomingSIPs) {
      const daysUntilPayment = Math.ceil(
        (new Date(sip.nextPaymentDate) - today) / (1000 * 60 * 60 * 24)
      );

      let subject, emailBody;

      if (daysUntilPayment === 0) {
        subject = `🚨 SIP Payment Due Today: ${sip.sipName}`;
        emailBody = `
Dear ${sip.user.fullname || sip.user.username},

Your SIP payment for "${sip.sipName}" is due TODAY!

Payment Details:
- Amount: ₹${sip.amount}
- SIP Name: ${sip.sipName}
- Goal: ${sip.goal}
- Due Date: ${sip.nextPaymentDate.toDateString()}

Please make the payment to stay on track with your investment goals.

Best regards,
Your Investment Tracker Team
        `;
      } else if (daysUntilPayment === 1) {
        subject = `⏰ SIP Payment Due Tomorrow: ${sip.sipName}`;
        emailBody = `
Dear ${sip.user.fullname || sip.user.username},

Your SIP payment for "${sip.sipName}" is due TOMORROW!

Payment Details:
- Amount: ₹${sip.amount}
- SIP Name: ${sip.sipName}
- Goal: ${sip.goal}
- Due Date: ${sip.nextPaymentDate.toDateString()}

Please prepare for your upcoming payment.

Best regards,
Your Investment Tracker Team
        `;
      } else {
        subject = `📅 SIP Payment Reminder: ${sip.sipName} (Due in ${daysUntilPayment} days)`;
        emailBody = `
Dear ${sip.user.fullname || sip.user.username},

This is a friendly reminder that your SIP payment for "${
          sip.sipName
        }" is due in ${daysUntilPayment} days.

Payment Details:
- Amount: ₹${sip.amount}
- SIP Name: ${sip.sipName}
- Goal: ${sip.goal}
- Due Date: ${sip.nextPaymentDate.toDateString()}

Plan ahead to ensure timely payment!

Best regards,
Your Investment Tracker Team
        `;
      }

      await sendEmail(sip.user.email, subject, emailBody);
      console.log(`Reminder sent to ${sip.user.email} for SIP: ${sip.sipName}`);
    }

    console.log(
      `SIP reminder check completed. Sent ${upcomingSIPs.length} reminders.`
    );
  } catch (error) {
    console.error("Error in SIP reminder scheduler:", error);
  }
});

// Weekly SIP summary (runs every Sunday at 10 AM)
cron.schedule("0 10 * * 0", async () => {
  console.log("Running weekly SIP summary...");

  try {
    const users = await User.find();

    for (const user of users) {
      const userSIPs = await SIP.find({ user: user._id, isActive: true });

      if (userSIPs.length === 0) continue;

      const weeklyPayments = await Payment.find({
        user: user._id,
        paymentDate: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      });

      const totalInvested = weeklyPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const upcomingThisWeek = userSIPs.filter((sip) => {
        const nextPayment = new Date(sip.nextPaymentDate);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() + 7);
        return nextPayment <= weekEnd;
      });

      const subject = "📊 Your Weekly SIP Summary";
      const emailBody = `
Dear ${user.fullname || user.username},

Here's your weekly SIP summary:

💰 This Week's Activity:
- Total Invested: ₹${totalInvested}
- Payments Made: ${weeklyPayments.length}

📅 Upcoming This Week:
${
  upcomingThisWeek.length > 0
    ? upcomingThisWeek
        .map(
          (sip) =>
            `- ${sip.sipName}: ₹${
              sip.amount
            } (Due: ${sip.nextPaymentDate.toLocaleDateString()})`
        )
        .join("\n")
    : "- No payments due this week"
}

📈 Active SIPs: ${userSIPs.length}

Keep up the great work with your investment journey!

Best regards,
Your Investment Tracker Team
      `;

      await sendEmail(user.email, subject, emailBody);
      console.log(`Weekly summary sent to ${user.email}`);
    }
  } catch (error) {
    console.error("Error in weekly SIP summary:", error);
  }
});

// Check for overdue payments (runs every day at 6 PM)
cron.schedule("0 18 * * *", async () => {
  console.log("Checking for overdue SIP payments...");

  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const overdueSIPs = await SIP.find({
      isActive: true,
      nextPaymentDate: { $lt: today },
    }).populate("user");

    for (const sip of overdueSIPs) {
      const daysOverdue = Math.floor(
        (today - new Date(sip.nextPaymentDate)) / (1000 * 60 * 60 * 24)
      );

      const subject = `🔴 Overdue SIP Payment: ${sip.sipName}`;
      const emailBody = `
Dear ${sip.user.fullname || sip.user.username},

Your SIP payment for "${sip.sipName}" is overdue by ${daysOverdue} day(s).

Payment Details:
- Amount: ₹${sip.amount}
- SIP Name: ${sip.sipName}
- Original Due Date: ${sip.nextPaymentDate.toDateString()}
- Days Overdue: ${daysOverdue}

Please make the payment as soon as possible to stay on track with your investment goals.

Best regards,
Your Investment Tracker Team
      `;

      await sendEmail(sip.user.email, subject, emailBody);
      console.log(
        `Overdue notice sent to ${sip.user.email} for SIP: ${sip.sipName}`
      );
    }

    console.log(
      `Overdue check completed. Sent ${overdueSIPs.length} overdue notices.`
    );
  } catch (error) {
    console.error("Error in overdue payment check:", error);
  }
});
