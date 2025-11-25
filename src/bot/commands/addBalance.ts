import TelegramBot from "node-telegram-bot-api";
import User from "../../models/User";
import Payment from "../../models/Payment";

const ADMIN_ID = +process.env.ADMIN_ID!; // ADMIN ID

export default function addBalanceCommand(bot: TelegramBot) {
  bot.onText(/\/addbalance (.+) (.+) (.+)/, async (msg, match) => {
    if (msg.chat.id !== ADMIN_ID) return;

    const userId = Number(match![1]);
    const amount = Number(match![2]);
    const payId = match![3];

    const user = await User.findOne({ telegramId: userId });
    const payment = await Payment.findById(payId);

    if (!user || !payment) return bot.sendMessage(ADMIN_ID, "Xatolik!");

    user.balance += amount;
    await user.save();

    payment.status = "approved";
    await payment.save();

    bot.sendMessage(ADMIN_ID, "✔️ Balans qo‘shildi.");
    bot.sendMessage(userId, `🎉 Balansingizga +${amount} ball qo‘shildi!`);
  });
}
