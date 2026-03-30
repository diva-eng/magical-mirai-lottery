export const retry = async (task, attempts = 3) => {
  let lastError;

  for (let i = 0; i < attempts; i++) {
    try {
      // Attempt to execute the provided async task
      return await task();
    } catch (error) {
      // Keep track of the last error encountered
      lastError = error;
      // Log the retry attempt (optional)
      console.error(`Attempt ${i + 1} failed: ${error.message}. Retrying...`);
    }
  }

  // If no successful attempt, throw the last error encountered
  throw lastError;
};

export const trimSummary = (summary) => {
  return summary
    .replace(/ {2}|\t|\r\n|\n|\r|▼|●/gm, "")
    .replace("【", "[")
    .replace("】", "]");
};

export const splitDate = (dateString) => {
  const parts = dateString.split("-");
  if (parts.length !== 3) {
    throw new Error("Invalid date format. Please use 'YYYY-MM-DD'.");
  }
  const [year, month, day] = parts;
  return { year, month, day };
};

export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const truncatePhoneNumber = (phone, maxLength) => {
  return phone.slice(maxLength * -1);
};

export const splitPhoneNumber = (phone) => {
  return truncatePhoneNumber(phone, 11)
    .replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3")
    .split(" ");
};

export const isEmptyOrNullString = (str) => {
  return !str || str.length === 0;
};

export const randomMouseMove = (page) => {
  // Simulate mouse move with added randomness to simulate human behavior
  const x = Math.floor(Math.random() * 100) + 1;
  const y = Math.floor(Math.random() * 100) + 1;

  // Simulate a mouse move event
  page.mouse.move(x, y, {
    steps: Math.floor(Math.random() * 10) + 1,
  });
};
