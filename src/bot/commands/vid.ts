// src/bot/commands/vid.ts - Taqdimot/Slayd video qo'llanmasi
import TelegramBot from "node-telegram-bot-api";

const PRESENTATION_VIDEO_ID = process.env.PRESENTATION_VIDEO_ID || "";

export default function vidCommand(bot: TelegramBot) {
  bot.onText(/\/vid/, async (msg) => {
    const chatId = msg.chat.id;

    if (PRESENTATION_VIDEO_ID) {
      try {
        await bot.sendVideo(chatId, PRESENTATION_VIDEO_ID, {
          caption: `📕 *Taqdimot (Slayd) yaratish video qo'llanmasi*

Quyidagi videoda botdan taqdimot yaratishni batafsil o'rganasiz.`,
          parse_mode: "Markdown",
        });
      } catch (error: any) {
        await bot.sendMessage(
          chatId,
          `📕 *Taqdimot (Slayd) yaratish video qo'llanmasi*

Video qo'llanma tez orada qo'shiladi.`
        );
      }
    } else {
      await bot.sendMessage(
        chatId,
        `📕 *Taqdimot (Slayd) yaratish video qo'llanmasi*

Video qo'llanma tez orada qo'shiladi.

📝 *Qisqa qo'llanma:*
1️⃣ "📊 Taqdimot yaratish" tugmasini bosing
2️⃣ Mavzuni to'liq va aniq yozing
3️⃣ Muallif ism-familiyasini kiriting
4️⃣ Sahifalar sonini tanlang (4-16)
5️⃣ Shablon va tilni tanlang
6️⃣ Professional taqdimot oling! 🎉`,
        { parse_mode: "Markdown" }
      );
    }
  });
}

