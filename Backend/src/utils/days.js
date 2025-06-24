export const getDateRange = (period) => {
  const now = new Date();
  let start;

  switch (period) {
    case "daily":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      break;
    case "weekly":
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      break;
    case "monthly":
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  // Set end to end of current day
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};


