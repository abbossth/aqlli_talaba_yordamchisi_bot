// src/utils/progressBar.ts

/**
 * Generate progress bar emoji string
 * @param current Current step (0-10)
 * @param total Total steps (default 10)
 * @returns Progress bar string
 */
export function generateProgressBar(current: number, total: number = 10): string {
  const filled = Math.min(Math.floor((current / total) * 10), 10);
  const empty = 10 - filled;
  
  return "🟩".repeat(filled) + "⬜️".repeat(empty);
}

/**
 * Update progress bar message
 */
export function getProgressMessage(step: number, total: number = 10): string {
  const progressBar = generateProgressBar(step, total);
  return `Slayd tayyorlanmoqda (3-5 daqiqa kuting)...\n\n${progressBar}`;
}

