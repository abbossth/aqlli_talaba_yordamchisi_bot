import TelegramBot, { Message } from "node-telegram-bot-api";
import User from "../../models/User.js";
import Payment from "../../models/Payment.js";
import { ADMIN_ID } from "../../config/index.js";
import { logger } from "../../utils/logger.js";
import { formatAmount } from "../../utils/formatter.js";

export default async function photoHandler(bot: TelegramBot, msg: Message) {
  if (!msg.photo) return;

  const userId = msg.from!.id;
  const chatId = msg.chat.id;

  try {
    // Broadcast handler will check if it's admin and broadcast photo
    // We only handle payment photos here
    
    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      logger.warn("Photo received from unknown user", { userId });
      return;
    }

    // Check if user is in payment flow
    if (!user.action || !user.action.startsWith("payment_amount:")) {
      // Not in payment flow, ignore photo
      return;
    }

    // Extract amount from user action
    const amountMatch = user.action.match(/payment_amount:(\d+)/);
    if (!amountMatch) {
      await bot.sendMessage(
        chatId,
        "❌ Xatolik yuz berdi. Iltimos, to'lov miqdorini qayta tanlang."
      );
      user.action = "start";
      await user.save();
      return;
    }

    const selectedAmount = Number(amountMatch[1]);

    // Check if user has a pending payment
    const existingPendingPayment = await Payment.findOne({
      userId,
      status: "pending",
    });

    if (existingPendingPayment) {
      await bot.sendMessage(
        chatId,
        "⏳ Sizda allaqachon tasdiqlanishi kutilayotgan to'lov cheki bor. Iltimos, kuting."
      );
      return;
    }

    const fileId = msg.photo[msg.photo.length - 1].file_id;

    // Create payment with selected amount
    const payment = await Payment.create({
      userId,
      fileId,
      amount: selectedAmount,
      status: "pending",
    });

    // Reset user action
    user.action = "start";
    await user.save();

    await bot.sendMessage(
      chatId,
      `✅ Chekingiz qabul qilindi. Admin tasdiqlashini kuting.\n\n💰 Tanlangan summa: ${formatAmount(selectedAmount)}`
    );

    try {
      await bot.sendPhoto(ADMIN_ID, fileId, {
        caption: `🧾 *Yangi to'lov cheki*  

ID: ${payment._id}
👤 ${user.name}
🆔 Telegram ID: ${user.telegramId}
💰 Tanlangan summa: *${formatAmount(selectedAmount)}*
💵 Joriy balans: ${formatAmount(user.balance)}

👇 Quyidagilardan birini tanlang:`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✔️ Tasdiqlash",
                callback_data: `approve_${payment._id}`,
              },
            ],
            [
              {
                text: "❌ Bekor qilish",
                callback_data: `reject_${payment._id}`,
              },
            ],
          ],
        },
      });

      logger.info("Payment receipt received", {
        paymentId: payment._id,
        userId,
        userName: user.name,
        amount: selectedAmount,
      });
    } catch (error: any) {
      logger.error("Error sending payment to admin", error);
      await bot.sendMessage(
        chatId,
        "❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
      );
    }
  } catch (error: any) {
    logger.error("Error in photo handler", error);
    await bot.sendMessage(
      chatId,
      "❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
    );
  }
}
