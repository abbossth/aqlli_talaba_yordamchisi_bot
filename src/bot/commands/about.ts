// src/bot/commands/about.ts
import TelegramBot from "node-telegram-bot-api";

export default function aboutCommand(bot: TelegramBot) {
  bot.onText(/\/about/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(
      chatId,
      `ℹ️ *Talaba AI Bot*

📚 *Talaba AI Bot* - talabalar uchun professional yordamchi bot.

🤖 *Qanday ishlaydi?*
• Sun'iy intellekt yordamida professional taqdimotlar yaratadi
• Referat, mustaqil ish va slaydlar tayyorlaydi
• Bir necha daqiqada tayyor taqdimot oling

✨ *Xususiyatlar:*
• 🎨 Turli shablonlar
• 🌐 Ko'p tilli qo'llab-quvvatlash (O'zbek, Rus, Ingliz, Nemis, Fransuz)
• 📊 PPTX formatida professional taqdimotlar
• ⚡ Tez va qulay

💡 *Foydalanish:*
"📊 Taqdimot yaratish" tugmasini bosing va mavzuni yuboring. Bot sizga professional taqdimot tayyorlab beradi!

Developer: @abbossth`,
      { parse_mode: "Markdown" }
    );
  });
}
