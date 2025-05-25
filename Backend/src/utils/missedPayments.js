// utils/missedPayments.js
import { SIP } from '../models/SIP.models.js';
import { Payment } from '../models/Payment.models.js';

export const checkMissedPayments = async () => {
  const sips = await SIP.find({ isActive: true }).populate('user');

  for (const sip of sips) {
    const payment = await Payment.findOne({ sip: sip._id, paymentDate: sip.nextPaymentDate });

    if (!payment) {
      const subject = `Missed SIP Payment: ${sip.sipName}`;
      const text = `Dear ${sip.user.name},\n\nOur records indicate that you missed the SIP payment for "${sip.sipName}" scheduled on ${sip.nextPaymentDate.toDateString()}. Please take necessary action.\n\nBest regards,\nYour Investment App`;

      await sendEmail(sip.user.email, subject, text);
    }
  }
};
