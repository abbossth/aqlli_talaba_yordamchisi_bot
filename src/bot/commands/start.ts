// src/bot/commands/start.ts
import TelegramBot from "node-telegram-bot-api";
import User from "../../models/User";

export default function startCommand(bot: TelegramBot) {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const name = msg.from?.first_name || "Foydalanuvchi";

    if (!userId) return;

    try {
      const existing = await User.findOne({ telegramId: userId });

      if (!existing) {
        await User.create({
          telegramId: userId,
          name: name,
        });
      }

      await bot.sendMessage(
        chatId,
        `👋 Salom, *${name}!*  
Men *Aqlli Talaba Yordamchisi* botiman.

🎯 Menga mavzu yuboring — men sizga *sun'iy intellekt yordamida prezentatsiya* tayyorlab beraman.`,
        { parse_mode: "Markdown" }
      );
    } catch (err: unknown) {
      console.error("Start command error:", err);
      bot.sendMessage(chatId, "❌ Xatolik yuz berdi, keyinroq urinib ko‘ring.");
    }
  });
}
