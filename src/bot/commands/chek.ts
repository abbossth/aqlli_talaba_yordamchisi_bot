import TelegramBot from "node-telegram-bot-api";
import User from "../../models/User";
import { mainMenu } from "../keyboards/mainMenu";
import { formatAmount } from "../../utils/formatter";

const PAYMENT_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 15000, 20000, 25000, 30000];

export default function chekCommand(bot: TelegramBot) {
  bot.onText(/\/chek/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    try {
      if (!userId) {
        return bot.sendMessage(chatId, "❌ Xatolik yuz berdi.");
      }

      const user = await User.findOne({ telegramId: userId });
      if (!user) {
        return bot.sendMessage(chatId, "❌ Foydalanuvchi topilmadi. /start buyrug'ini bosing.");
      }

      // Show amount selection buttons
      const amountButtons = [];
      for (let i = 0; i < PAYMENT_AMOUNTS.length; i += 2) {
        const row = [];
        row.push({
          text: formatAmount(PAYMENT_AMOUNTS[i]),
          callback_data: `select_amount_${PAYMENT_AMOUNTS[i]}`,
        });
        if (i + 1 < PAYMENT_AMOUNTS.length) {
          row.push({
            text: formatAmount(PAYMENT_AMOUNTS[i + 1]),
            callback_data: `select_amount_${PAYMENT_AMOUNTS[i + 1]}`,
          });
        }
        amountButtons.push(row);
      }

      await bot.sendMessage(
        chatId,
        `💰 *To'lov miqdorini tanlang:*

Quyidagi summalardan birini tanlang, keyin to'lov chekini yuboring.`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: amountButtons,
          },
        }
      );
    } catch (error: any) {
      await bot.sendMessage(
        chatId,
        "❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        { ...mainMenu }
      );
    }
  });
}
