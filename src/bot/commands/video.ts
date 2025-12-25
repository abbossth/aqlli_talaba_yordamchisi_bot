// src/bot/commands/video.ts - Referat/Mustaqil ish video qo'llanmasi
import TelegramBot from "node-telegram-bot-api";

const REFERAT_VIDEO_ID = process.env.REFERAT_VIDEO_ID || "";

export default function videoCommand(bot: TelegramBot) {
  bot.onText(/\/video/, async (msg) => {
    const chatId = msg.chat.id;

    if (REFERAT_VIDEO_ID) {
      try {
        await bot.sendVideo(chatId, REFERAT_VIDEO_ID, {
          caption: `📘 *Referat/Mustaqil ish yaratish video qo'llanmasi*

Quyidagi videoda botdan referat yaratishni batafsil o'rganasiz.`,
          parse_mode: "Markdown",
        });
      } catch (error: any) {
        await bot.sendMessage(
          chatId,
          `📘 *Referat/Mustaqil ish yaratish video qo'llanmasi*

Video qo'llanma tez orada qo'shiladi.`
        );
      }
    } else {
      await bot.sendMessage(
        chatId,
        `📘 *Referat/Mustaqil ish yaratish video qo'llanmasi*

Video qo'llanma tez orada qo'shiladi.

💡 *Eslatma:* Hozircha faqat taqdimot (slayd) yaratish funksiyasi mavjud. Referat funksiyasi tez orada qo'shiladi.`,
        { parse_mode: "Markdown" }
      );
    }
  });
}

