import TelegramBot from "node-telegram-bot-api";
import User from "../../models/User";
import { mainMenu } from "../keyboards/mainMenu";

export default function startCommand(bot: TelegramBot) {
  bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id!;
    const name = msg.from?.first_name || "Foydalanuvchi";

    const referralId = match?.[1] ? Number(match[1]) : null;

    let user = await User.findOne({ telegramId: userId });

    if (!user) {
      user = await User.create({
        telegramId: userId,
        name,
        referredBy: referralId || null,
      });
    }

    await bot.sendMessage(
      chatId,
      `👋 Salom *${name}!*  
Aqlli Talaba Yordamchisi botiga xush kelibsiz.`,
      { parse_mode: "Markdown", ...mainMenu }
    );
  });
}
