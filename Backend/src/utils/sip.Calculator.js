export function calculateFutureValue(amount, rate, durationMonths) {
  const monthlyRate = rate / 12 / 100;
  return (
    amount *
    (((Math.pow(1 + monthlyRate, durationMonths) - 1) / monthlyRate) *
      (1 + monthlyRate))
  );
}

/**
 * Calculate the next payment date based on start date and frequency
 * @param {Date} startDate - The SIP start date
 * @param {string} frequency - The payment frequency ('monthly', 'quarterly', 'yearly')
 * @returns {Date} - The next payment date
 */
export function calculateNextPaymentDate(startDate, frequency) {
  const start = new Date(startDate);
  const today = new Date();

  // If start date is in the future, return the start date
  if (start > today) {
    return start;
  }

  let nextPayment = new Date(start);

  // Keep adding intervals until we get a future date
  while (nextPayment <= today) {
    switch (frequency) {
      case "monthly":
        nextPayment.setMonth(nextPayment.getMonth() + 1);
        break;
      case "quarterly":
        nextPayment.setMonth(nextPayment.getMonth() + 3);
        break;
      case "yearly":
        nextPayment.setFullYear(nextPayment.getFullYear() + 1);
        break;
      default:
        nextPayment.setMonth(nextPayment.getMonth() + 1);
    }
  }

  return nextPayment;
}

/**
 * Calculate the total number of payments based on frequency and duration
 * @param {number} durationInMonths - Duration in months
 * @param {string} frequency - The payment frequency
 * @returns {number} - Total number of payments
 */
export function calculateTotalPayments(durationInMonths, frequency) {
  switch (frequency) {
    case "monthly":
      return durationInMonths;
    case "quarterly":
      return Math.ceil(durationInMonths / 3);
    case "yearly":
      return Math.ceil(durationInMonths / 12);
    default:
      return durationInMonths;
  }
}

/**
 * Calculate SIP maturity value with proper frequency consideration
 * @param {number} amount - Payment amount per installment
 * @param {number} rate - Annual rate of return (percentage)
 * @param {number} durationInMonths - Duration in months
 * @param {string} frequency - Payment frequency
 * @returns {number} - Expected maturity value
 */
export function calculateSIPMaturityValue(
  amount,
  rate,
  durationInMonths,
  frequency
) {
  const totalPayments = calculateTotalPayments(durationInMonths, frequency);
  const monthlyRate = rate / 12 / 100;

  let maturityValue = 0;

  switch (frequency) {
    case "monthly":
      maturityValue =
        amount *
        (((Math.pow(1 + monthlyRate, durationInMonths) - 1) / monthlyRate) *
          (1 + monthlyRate));
      break;
    case "quarterly":
      const quarterlyRate = rate / 4 / 100;
      const quarterlyDuration = Math.ceil(durationInMonths / 3);
      maturityValue =
        amount *
        (((Math.pow(1 + quarterlyRate, quarterlyDuration) - 1) /
          quarterlyRate) *
          (1 + quarterlyRate));
      break;
    case "yearly":
      const annualRate = rate / 100;
      const yearlyDuration = Math.ceil(durationInMonths / 12);
      maturityValue =
        amount *
        (((Math.pow(1 + annualRate, yearlyDuration) - 1) / annualRate) *
          (1 + annualRate));
      break;
    default:
      maturityValue = calculateFutureValue(amount, rate, durationInMonths);
  }

  return maturityValue;
}
