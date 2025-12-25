// src/services/channelScheduler.ts
import TelegramBot from "node-telegram-bot-api";
import { CHANNEL_ID } from "../config/index.js";
import { logger } from "../utils/logger.js";
import { DAILY_POSTS } from "../utils/channelPosts.js";

let postIndex = 0;

/**
 * Send a post to the channel
 */
async function sendPostToChannel(bot: TelegramBot, postText: string): Promise<boolean> {
  try {
    if (!CHANNEL_ID) {
      logger.warn("CHANNEL_ID is not set, skipping channel post");
      return false;
    }

    await bot.sendMessage(CHANNEL_ID, postText, {
      parse_mode: "Markdown",
    });

    logger.info("Post sent to channel successfully", { channelId: CHANNEL_ID });
    return true;
  } catch (error: any) {
    logger.error("Error sending post to channel", {
      error: error.message,
      channelId: CHANNEL_ID,
    });
    return false;
  }
}


/**
 * Schedule daily posts (6 posts per day, every 4 hours)
 */
export function scheduleDailyPosts(bot: TelegramBot): void {
  try {
    // Send posts every 4 hours (6 posts per day)
    const POST_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

    // Calculate time until next post (start from 9:00 AM)
    const now = new Date();
    const nextPostTime = new Date();
    nextPostTime.setHours(9, 0, 0, 0);

    // If it's already past 9 AM, find next 4-hour interval
    while (nextPostTime <= now) {
      nextPostTime.setTime(nextPostTime.getTime() + POST_INTERVAL);
    }

    // If it's past 9 PM (21:00), schedule for tomorrow 9 AM
    if (nextPostTime.getHours() >= 21) {
      nextPostTime.setDate(nextPostTime.getDate() + 1);
      nextPostTime.setHours(9, 0, 0, 0);
    }

    const timeUntilNextPost = nextPostTime.getTime() - now.getTime();

    logger.info("Scheduling daily posts", {
      nextPostTime: nextPostTime.toISOString(),
      timeUntilNextPost: `${Math.round(timeUntilNextPost / 1000 / 60)} minutes`,
      intervalHours: 4,
      postsPerDay: 6,
    });

    // Schedule first post
    setTimeout(() => {
      sendPostToChannel(bot, DAILY_POSTS[postIndex % DAILY_POSTS.length].text);
      postIndex++;

      // Schedule subsequent posts every 4 hours
      setInterval(() => {
        const post = DAILY_POSTS[postIndex % DAILY_POSTS.length];
        sendPostToChannel(bot, post.text);
        postIndex++;

        logger.info("Scheduled post sent", {
          postIndex: postIndex - 1,
          totalPosts: DAILY_POSTS.length,
        });
      }, POST_INTERVAL);
    }, timeUntilNextPost);
  } catch (error: any) {
    logger.error("Error scheduling daily posts", error);
  }
}

/**
 * Initialize channel scheduler
 */
export function initChannelScheduler(bot: TelegramBot): void {
  try {
    if (!CHANNEL_ID) {
      logger.warn("CHANNEL_ID is not set, channel scheduler will not start");
      return;
    }

    logger.info("Initializing channel scheduler");
    scheduleDailyPosts(bot);
  } catch (error: any) {
    logger.error("Error initializing channel scheduler", error);
  }
}

