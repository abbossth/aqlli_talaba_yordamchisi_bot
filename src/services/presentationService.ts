// src/services/presentationService.ts
import { PresentationData } from "./aiService";
import { logger } from "../utils/logger";

/**
 * Format presentation data into a readable text format for Telegram
 */
export function formatPresentationForTelegram(data: PresentationData): string {
  let formatted = `📊 *${data.title}*\n\n`;
  
  data.slides.forEach((slide, index) => {
    formatted += `*${index + 1}. ${slide.title}*\n`;
    slide.content.forEach((point, pointIndex) => {
      formatted += `   ${pointIndex + 1}) ${point}\n`;
    });
    formatted += `\n`;
  });
  
  return formatted;
}

/**
 * Format presentation as a simple text document
 */
export function formatPresentationAsText(data: PresentationData): string {
  let text = `${data.title}\n`;
  text += "=".repeat(data.title.length) + "\n\n";
  
  data.slides.forEach((slide, index) => {
    text += `${index + 1}. ${slide.title}\n`;
    slide.content.forEach((point) => {
      text += `   • ${point}\n`;
    });
    text += `\n`;
  });
  
  return text;
}

/**
 * Split long messages into chunks (Telegram has 4096 character limit)
 */
export function splitMessage(message: string, maxLength: number = 4000): string[] {
  const chunks: string[] = [];
  
  if (message.length <= maxLength) {
    return [message];
  }
  
  // Try to split by newlines first
  const lines = message.split("\n");
  let currentChunk = "";
  
  for (const line of lines) {
    if ((currentChunk + line + "\n").length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      
      // If single line is too long, split it
      if (line.length > maxLength) {
        let remainingLine = line;
        while (remainingLine.length > maxLength) {
          chunks.push(remainingLine.substring(0, maxLength));
          remainingLine = remainingLine.substring(maxLength);
        }
        currentChunk = remainingLine + "\n";
      } else {
        currentChunk = line + "\n";
      }
    } else {
      currentChunk += line + "\n";
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Create a summary message for the presentation
 */
export function createPresentationSummary(data: PresentationData): string {
  return `✅ *Taqdimot tayyorlandi!*\n\n📊 *${data.title}*\n📄 Slaydlar soni: ${data.slides.length}\n\nQuyidagi slaydlarni ko'rishingiz mumkin:`;
}


