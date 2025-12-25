// src/utils/subscriptionCheck.ts
import TelegramBot from "node-telegram-bot-api";
import { REQUIRED_CHANNEL_ID, REQUIRED_CHANNEL_USERNAME } from "../config/index.js";
import { logger } from "./logger.js";

/**
 * Check if user is subscribed to required channel
 */
export async function checkSubscription(
  bot: TelegramBot,
  userId: number
): Promise<boolean> {
  try {
    if (!REQUIRED_CHANNEL_ID && !REQUIRED_CHANNEL_USERNAME) {
      // No required channel, allow access
      return true;
    }

    const chatId = REQUIRED_CHANNEL_ID || REQUIRED_CHANNEL_USERNAME;
    
    if (!chatId) {
      return true; // No required channel
    }
    
    try {
      const member = await bot.getChatMember(chatId, userId);
      
      // Check if user is member, administrator, or creator
      const isSubscribed = 
        member.status === "member" ||
        member.status === "administrator" ||
        member.status === "creator";
      
      return isSubscribed;
    } catch (error: any) {
      // If bot can't check (e.g., not admin in channel), log and allow
      logger.warn("Could not check subscription status", {
        userId,
        chatId,
        error: error.message,
      });
      return true; // Allow access if check fails
    }
  } catch (error: any) {
    logger.error("Error checking subscription", error);
    return true; // Allow access on error
  }
}

/**
 * Send subscription required message
 */
export function getSubscriptionMessage(): string {
  const channelUsername = REQUIRED_CHANNEL_USERNAME;
  const channelId = REQUIRED_CHANNEL_ID;
  
  if (!channelUsername && !channelId) {
    return "";
  }

  const channelDisplay = channelUsername 
    ? `@${channelUsername}` 
    : (channelId ? `https://t.me/${channelId}` : "");

  if (!channelDisplay) {
    return "";
  }

  return `🔔 *Majburiy kanalga obuna bo'ling*

Botdan foydalanish uchun quyidagi kanalga obuna bo'lishingiz kerak:

${channelDisplay}

Obuna bo'lgach, "✅ Obuna bo'ldim" tugmasini bosing.`;
}

