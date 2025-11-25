import TelegramBot, { Message } from "node-telegram-bot-api";
import User from "../../models/User";
import Payment from "../../models/Payment";

const ADMIN_ID = process.env.ADMIN_ID!; // ADMIN ID

export default async function photoHandler(bot: TelegramBot, msg: Message) {
  const photo = msg.photo;
  const userId = msg.from!.id;

  if (!photo) return;

  const fileId = photo[photo.length - 1].file_id;
  const user = await User.findOne({ telegramId: userId });

  const pay = await Payment.create({
    userId,
    fileId,
    status: "pending"
  });

  await bot.sendMessage(msg.chat.id, "✅ Chek qabul qilindi, admin tasdiqlaydi.");

  await bot.sendPhoto(ADMIN_ID, fileId, {
    caption: `🧾 *Yangi to‘lov cheki*\n\n👤 ${user!.name}\n🆔 ID: ${user!.telegramId}\nPayID: ${pay._id}`,
    parse_mode: "Markdown"
  });
}
