export function calculateFutureValue(amount, rate, durationMonths) {
  const monthlyRate = rate / 12 / 100;
  return (
    amount *
    (((Math.pow(1 + monthlyRate, durationMonths) - 1) / monthlyRate) * (1 + monthlyRate))
  );
}