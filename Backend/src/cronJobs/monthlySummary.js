// cron/monthlySummary.js
import cron from 'node-cron';
import { User } from '../models/User.models.js';
import { generateMonthlySummary } from '../utils/sipSummary.js';
import { sendEmail } from '../utils/emailService.js';

cron.schedule('0 9 1 * *', async () => {
  const users = await User.find();

  for (const user of users) {
    const summary = await generateMonthlySummary(user._id);
    const subject = 'Your Monthly SIP Summary';
    const text = `Dear ${user.name},\n\nHere is your SIP summary for the month:\n\n${JSON.stringify(summary, null, 2)}\n\nBest regards,\nYour Investment App`;

    await sendEmail(user.email, subject, text);
  }
});
