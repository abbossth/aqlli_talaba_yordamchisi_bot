import TelegramBot from "node-telegram-bot-api";
import User from "../../models/User.js";
import Payment from "../../models/Payment.js";
import { ADMIN_ID } from "../../config/index.js";
import { formatAmount } from "../../utils/formatter.js";

export default function addBalanceCommand(bot: TelegramBot) {
  bot.onText(/\/addbalance (.+) (.+) (.+)/, async (msg, match) => {
    if (msg.chat.id !== ADMIN_ID)
      return bot.sendMessage(msg.chat.id, "⛔ Siz admin emassiz.");

    const userChatId = Number(match![1]);
    const amount = Number(match![2]);
    const paymentId = match![3];

    const user = await User.findOne({ telegramId: userChatId });
    const pay = await Payment.findById(paymentId);

    if (!user || !pay)
      return bot.sendMessage(
        ADMIN_ID,
        "❌ Foydalanuvchi yoki payment topilmadi."
      );

    user.balance += amount;
    await user.save();

    pay.status = "approved";
    pay.amount = amount;
    await pay.save();

    bot.sendMessage(
      ADMIN_ID,
      `✔️ ${user.name} balansiga +${formatAmount(amount)} qo'shildi.`
    );
    bot.sendMessage(userChatId, `🎉 Balansingiz +${formatAmount(amount)} ga oshdi!\n\n💰 Yangi balansingiz: ${formatAmount(user.balance)}`);
  });
}
