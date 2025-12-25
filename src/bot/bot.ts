// src/bot/bot.ts
import TelegramBot, { Message } from "node-telegram-bot-api";
import startCommand from "./commands/start.js";
import helpCommand from "./commands/help.js";
import aboutCommand from "./commands/about.js";
import vidCommand from "./commands/vid.js";
import videoCommand from "./commands/video.js";
import broadcastCommand, { handleBroadcastCallback } from "./commands/broadcast.js";
import statsCommand from "./commands/stats.js";
import messageHandler from "./handlers/messageHandler.js";
import callbackHandler from "./handlers/callbackHandler.js";
import photoHandler from "./handlers/photoHandler.js";
import chekCommand from "./commands/chek.js";
import addBalanceCommand from "./commands/addBalance.js";
import { logger } from "../utils/logger.js";

// Token borligini TypeScriptga aniq ko'rsatamiz
const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  logger.error("BOT_TOKEN topilmadi. .env faylni tekshiring.");
  throw new Error("❌ BOT_TOKEN topilmadi. .env faylni tekshiring.");
}

// Botni yaratish (polling rejimi)
const bot = new TelegramBot(botToken, {
  polling: true,
});

// --- Komandalarni ro'yxatdan o'tkazamiz ---
startCommand(bot);
helpCommand(bot);
aboutCommand(bot);
vidCommand(bot);
videoCommand(bot);
broadcastCommand(bot);
statsCommand(bot);
chekCommand(bot);
addBalanceCommand(bot);

// --- Oddiy xabarlarni handlerga yuboramiz ---
bot.on("message", async (msg: Message) => {
  const text = msg.text;

  // Komandalar boshlang‘ich belgi: "/", shuning uchun oddiy xabarlarni ajratamiz
  if (text && !text.startsWith("/")) {
    await messageHandler(bot, msg);
  }
});

// CALLBACK HANDLER
bot.on("callback_query", async (query) => {
  await callbackHandler(bot, query);
});

bot.on("photo", async (msg) => {
  await photoHandler(bot, msg);
});

export default bot;
