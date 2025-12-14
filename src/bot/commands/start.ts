import TelegramBot from "node-telegram-bot-api";
import User from "../../models/User";
import { mainMenu } from "../keyboards/mainMenu";
import { logger } from "../../utils/logger";
import { PRESENTATION_COST } from "../../config";
import { formatAmount } from "../../utils/formatter";

export default function startCommand(bot: TelegramBot) {
  bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id!;
    const name = msg.from?.first_name || "Foydalanuvchi";

    try {
      const referralId = match?.[1] ? Number(match[1]) : null;

      let user = await User.findOne({ telegramId: userId });

      if (!user) {
        user = await User.create({
          telegramId: userId,
          name,
          referredBy: referralId || null,
          action: "start",
        });
        
        logger.info("New user registered", { userId, name, referralId });
        
        // If referred, give bonus to referrer
        if (referralId) {
          const referrer = await User.findOne({ telegramId: referralId });
          if (referrer) {
            // Optional: Give referral bonus
            // referrer.balance += 50;
            // await referrer.save();
            logger.info("Referral detected", { newUserId: userId, referrerId: referralId });
          }
        }
      } else {
        await User.findOneAndUpdate(
          { telegramId: userId },
          { name, action: "start" }
        );
      }

      await bot.sendMessage(
        chatId,
        `Assalomu alaykum, ${name}! 👋

📌 Botimiz yordamida REFERAT, TAQDIMOT, MUSTAQIL ISH, SLAYD tayorlashingiz mumkin.

✨ *Qanday ishlaydi:*
1️⃣ "📊 Taqdimot yaratish" tugmasini bosing
2️⃣ Mavzuni yuboring
3️⃣ Professional taqdimot oling!

💰 *Narx:* ${formatAmount(PRESENTATION_COST)} har bir taqdimot uchun

📘 Qo'llanma - botdan qanday foydalanish haqida ma'lumot.`,
        { parse_mode: "Markdown", ...mainMenu }
      );
    } catch (error: any) {
      logger.error("Error in start command", error);
      await bot.sendMessage(
        chatId,
        "❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
      );
    }
  });
}
