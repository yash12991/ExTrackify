// controllers/adminController.js
import { SIP } from '../models/SIP.models.js';
import { Payment } from '../models/Payment.models.js';
import { User } from '../models/Users.models.js';


export const getAdminDashboardData = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalSIPs = await SIP.countDocuments();
  const totalPayments = await Payment.countDocuments();
  const totalInvested = await Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalSIPs,
      totalPayments,
      totalInvested: totalInvested[0]?.total || 0,
    },
  });
};
