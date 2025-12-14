// src/bot/commands/help.ts
import TelegramBot from "node-telegram-bot-api";
import { PRESENTATION_COST } from "../../config";
import { formatAmount } from "../../utils/formatter";

export default function helpCommand(bot: TelegramBot) {
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(
      chatId,
      `🆘 *Yordam bo'limi*

Botdan foydalanish juda oson:

1️⃣ "📊 Taqdimot yaratish" tugmasini bosing
2️⃣ Mavzuni yuboring (masalan: "Sun'iy intellekt nima?")
3️⃣ Bot sizga professional taqdimot tayyorlab beradi

💰 *Narx:* ${formatAmount(PRESENTATION_COST)} har bir taqdimot uchun

💡 *Maslahat:* Mavzuni aniq va to'liq yozing.

📘 Qo'llanma tugmasini bosib batafsil ma'lumot oling.`,
      { parse_mode: "Markdown" }
    );
  });
}
