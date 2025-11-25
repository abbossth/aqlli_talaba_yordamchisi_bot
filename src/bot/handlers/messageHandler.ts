import TelegramBot, { Message } from "node-telegram-bot-api";
import User from "../../models/User";

export default async function messageHandler(bot: TelegramBot, msg: Message) {
  const chatId = msg.chat.id;
  const text = msg.text!;
  const userId = msg.from!.id;

  const user = await User.findOne({ telegramId: userId });

  if (!user) return;

  if (text === "💰 Balans") {
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💸 To‘lov qilish", callback_data: "payment" }],
          [{ text: "📜 To‘lovlar tarixi", callback_data: "history" }],
        ],
      },
    };

    return bot.sendMessage(chatId, `💰 *Balansingiz:* ${user.balance} ball`, {
      parse_mode: "Markdown",
      ...keyboard,
    });
  }

  if (text === "📘 Qo‘llanma") {
    return bot.sendMessage(
      chatId,
      "Qo‘llanma: Mavzu yuboring va slayd olasiz."
    );
  }

  if (text === "🎁 Referal havola") {
    return bot.sendMessage(
      chatId,
      `🔗 Sizning referal havolangiz:\nhttps://t.me/aqlli_talaba_yordamchisi_Bot?start=${user.telegramId}`
    );
  }

  if (text === "📊 Taqdimot yaratish") {
    return bot.sendMessage(chatId, "📌 Taqdimot mavzusini yuboring.");
  }

  return bot.sendMessage(chatId, `📌 Mavzu qabul qilindi:\n${text}`);
}
