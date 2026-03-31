// utils/formatters.ts
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return "01/01/2025";
  }
};

export const formatCurrency = (amount: number): string => {
  // Format as Indian Rupees with comma separation
  return `Rs ${amount.toLocaleString('en-IN')}`;
};

// For time formatting if needed
export const formatTime = (timeString: string): string => {
  // Ensure time is in HH:MM:SS format
  if (timeString && timeString.includes(':')) {
    const parts = timeString.split(':');
    if (parts.length === 3) return timeString;
    if (parts.length === 2) return `${timeString}:00`;
  }
  return timeString || "00:00:00";
};