// src/utils/formatter.ts

/**
 * Format number with thousand separators
 * Example: 1000 -> "1 000", 25000 -> "25 000"
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Format amount with currency
 * Example: 1000 -> "1 000 so'm"
 */
export function formatAmount(amount: number): string {
  return `${formatNumber(amount)} so'm`;
}

