// src/bot/bot.ts
import TelegramBot, { Message } from "node-telegram-bot-api";
import startCommand from "./commands/start";
import helpCommand from "./commands/help";
import aboutCommand from "./commands/about";
import messageHandler from "./handlers/messageHandler";

// Token borligini TypeScriptga aniq ko‘rsatamiz
const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  throw new Error("❌ BOT_TOKEN topilmadi. .env faylni tekshiring.");
}

// Botni yaratish (polling rejimi)
const bot = new TelegramBot(botToken, {
  polling: true,
});

// --- Komandalarni ro‘yxatdan o‘tkazamiz ---
startCommand(bot);
helpCommand(bot);
aboutCommand(bot);

// --- Oddiy xabarlarni handlerga yuboramiz ---
bot.on("message", async (msg: Message) => {
  const text = msg.text;

  // Komandalar boshlang‘ich belgi: "/", shuning uchun oddiy xabarlarni ajratamiz
  if (text && !text.startsWith("/")) {
    await messageHandler(bot, msg);
  }
});

export default bot;
