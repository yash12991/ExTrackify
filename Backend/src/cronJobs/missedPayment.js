// cron/missedPayments.js
import cron from 'node-cron';
import { checkMissedPayments } from '../utils/missedPayments.js';

cron.schedule('0 10 * * *', async () => {
  await checkMissedPayments();
});
