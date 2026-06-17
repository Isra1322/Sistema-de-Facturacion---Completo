/**
 * Helper formatters for common data structures
 */

/**
 * Formats a number as a currency string (e.g., $10.00)
 * @param {number} value 
 * @returns {string}
 */
export function formatCurrency(value) {
  const num = typeof value === 'number' ? value : parseFloat(value || 0);
  return `$${num.toFixed(2)}`;
}

/**
 * Formats a date into a localized Ecuadorian format (DD/MM/YYYY)
 * @param {Date|string} date 
 * @returns {string}
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString("es-EC", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric" 
  });
}

/**
 * Formats time in localized US format with 12 hour cycle (HH:MM:SS AM/PM)
 * @param {Date} date 
 * @returns {string}
 */
export function formatTime(date) {
  const d = date instanceof Date ? date : new Date();
  return d.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit", 
    hour12: true 
  });
}
