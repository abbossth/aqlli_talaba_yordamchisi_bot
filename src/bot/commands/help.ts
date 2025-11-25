// src/bot/commands/help.ts
import TelegramBot from "node-telegram-bot-api";

export default function helpCommand(bot: TelegramBot) {
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(
      chatId,
      `🆘 *Yordam bo‘limi*

Botdan foydalanish juda oson:

1️⃣ Menga biror mavzu yuboring  
2️⃣ Men sizga shu mavzu bo‘yicha *prezentatsiya slaydlari*ni yaratib beraman  
3️⃣ Kerak bo‘lsa *PDF* yoki *PPTX* fayl ham tayyorlab beraman  

Misol:  
_“Sun'iy intellekt nima?”_`,
      { parse_mode: "Markdown" }
    );
  });
}
