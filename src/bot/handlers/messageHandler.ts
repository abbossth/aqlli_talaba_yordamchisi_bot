// src/bot/handlers/messageHandler.ts
import TelegramBot, { Message } from "node-telegram-bot-api";

export default async function messageHandler(bot: TelegramBot, msg: Message) {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  await bot.sendMessage(chatId, `📌 Siz yuborgan mavzu:\n${text}`);
}
