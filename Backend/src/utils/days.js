export const getDateRange = (period) => {
  const now = new Date();
  let start;

  if (period === "daily") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "weekly") {
    const day = now.getDay(); // 0 (Sun) - 6 (Sat)
    start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
  } else if (period === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    throw new Error("Invalid period");
  }

  return { start, end: now };
};


