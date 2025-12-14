// src/bot/commands/about.ts
import TelegramBot from "node-telegram-bot-api";

export default function aboutCommand(bot: TelegramBot) {
  bot.onText(/\/about/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(
      chatId,
      `ℹ️ *Aqlli Talaba Yordamchisi Bot*

📚 Ushbu bot talabalar uchun mo‘ljallangan.  
🤖 Sun'iy intellekt yordamida *prezentatsiyalar yaratadi*.  
⚡ Tez, qulay va bepul yordamchi!

Developer: @abbossth`,
      { parse_mode: "Markdown" }
    );
  });
}
