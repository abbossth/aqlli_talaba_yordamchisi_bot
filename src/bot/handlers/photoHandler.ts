import TelegramBot, { Message } from "node-telegram-bot-api";
import User from "../../models/User";
import Payment from "../../models/Payment";
import { ADMIN_ID } from "../../config/index";

export default async function photoHandler(bot: TelegramBot, msg: Message) {
  if (!msg.photo) return;

  const userId = msg.from!.id;
  const chatId = msg.chat.id;

  const user = await User.findOne({ telegramId: userId });
  if (!user) return;

  const fileId = msg.photo[msg.photo.length - 1].file_id;

  // Payment yaratamiz
  const payment = await Payment.create({
    userId,
    fileId,
    status: "pending",
  });

  await bot.sendMessage(
    chatId,
    "✅ Chekingiz qabul qilindi. Admin tasdiqlashini kuting."
  );

  await bot.sendPhoto(ADMIN_ID, fileId, {
    caption: `🧾 *Yangi to‘lov cheki*  

ID: ${payment._id}
👤 ${user.name}
🆔 Telegram ID: ${user.telegramId}

👇 Quyidagilardan birini tanlang:`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "✔️ Tasdiqlash", callback_data: `approve_${payment._id}` }],
        [{ text: "❌ Bekor qilish", callback_data: `reject_${payment._id}` }],
      ],
    },
  });
}
