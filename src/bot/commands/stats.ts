// src/bot/commands/stats.ts
import TelegramBot from "node-telegram-bot-api";
import { ADMIN_ID } from "../../config/index.js";
import User from "../../models/User.js";
import { logger } from "../../utils/logger.js";

export default function statsCommand(bot: TelegramBot) {
  bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      if (chatId !== ADMIN_ID) {
        return await bot.sendMessage(chatId, "⛔ Siz admin emassiz.");
      }

      // Get total users
      const totalUsers = await User.countDocuments({});

      // Get active users
      const activeUsers = await User.countDocuments({ active: true });

      // Get inactive users
      const inactiveUsers = await User.countDocuments({ active: false });

      // Get users who used bot today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayUsers = await User.countDocuments({
        updatedAt: { $gte: today },
      });

      await bot.sendMessage(
        chatId,
        `📊 *Bot Statistikalari*

👥 *Umumiy foydalanuvchilar:* ${totalUsers}
✅ *Active foydalanuvchilar:* ${activeUsers}
❌ *Active bo'lmagan foydalanuvchilar:* ${inactiveUsers}
📅 *Bugun foydalanganlar:* ${todayUsers}

📈 *Foizlar:*
✅ Active: ${totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0}%
❌ Inactive: ${totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(1) : 0}%`,
        { parse_mode: "Markdown" }
      );
    } catch (error: any) {
      logger.error("Error in /stats command", error);
      await bot.sendMessage(chatId, "❌ Xatolik yuz berdi.");
    }
  });
}

