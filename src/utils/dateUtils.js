export const formattingDate = (date) => {
  // 2025-03-01 00:00:00

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // 0-based
  const day = pad(date.getDate());

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const pad = (n) => n.toString().padStart(2, '0');
