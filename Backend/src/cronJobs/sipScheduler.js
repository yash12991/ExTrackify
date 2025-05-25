import cron from "node-cron";
import { SIP } from "../models/SIP.models.js";
import { Payment } from "../models/Payment.models.js";

cron.schedule("0 0 * * *", async () => {
  const today = new Date();
  const sips = await SIP.find({ isActive: true, nextPaymentDate: { $lte: today } });

  for (const sip of sips) {
      const userEmail = sip.user.email;
    const subject = `SIP Payment Due: ${sip.sipName}`;
    const text = `Dear ${sip.user.name},\n\nYour SIP "${sip.sipName}" is due on ${sip.nextPaymentDate.toDateString()}. Please ensure timely payment to continue your investment plan.\n\nBest regards,\nYour Investment App`;
       await sendEmail(userEmail, subject, text);
    await Payment.create({
      sip: sip._id,
      user: sip.user,
      amount: sip.amount,
      paymentDate: sip.nextPaymentDate,
      status: "paid",
    });

    const next = new Date(sip.nextPaymentDate);
    if (sip.frequency === "monthly") next.setMonth(next.getMonth() + 1);
    else if (sip.frequency === "weekly") next.setDate(next.getDate() + 7);

    sip.nextPaymentDate = next;
    await sip.save();
  }
});
