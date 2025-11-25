import TelegramBot from "node-telegram-bot-api";
import Payment from "../../models/Payment";
import { ADMIN_ID } from "../../config";
import User from "../../models/User";

const CARD = "8600 5304 0271 3039";

export default async function callbackHandler(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery
) {
  const chatId = query.message!.chat.id;
  const data = query.data!;

  switch (query.data) {
    case "payment":
      await bot.sendMessage(
        chatId,
        `💳 *To‘lov uchun karta:*  
\`\`\` ${CARD} \`\`\`
\`\`\`Axmedov Abbosbek Xikmat O'g'li\`\`\`\n
📸 To‘lovdan keyin /chek buyrug‘ini bosing.`,
        { parse_mode: "Markdown" }
      );
      break;

    case "history":
      const list = await Payment.find({ userId: query.from.id });

      if (list.length === 0)
        return bot.sendMessage(chatId, "📭 Sizda to‘lovlar tarixi yo‘q.");

      let text = "📜 *To‘lovlar tarixi:*\n\n";
      list.forEach((p) => {
        text += `🧾 ${p._id}\nHolat: ${p.status}\n\n`;
      });

      bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  }

  if (!chatId) return;

  // Faqat admin tugmalarni bosishi mumkin
  if (chatId !== ADMIN_ID) {
    return bot.sendMessage(chatId, "⛔ Bu tugma faqat admin uchun.");
  }

  // ✔️ Tasdiqlash
  if (data.startsWith("approve_")) {
    const paymentId = data.replace("approve_", "");

    const pay = await Payment.findById(paymentId);
    if (!pay) return bot.sendMessage(ADMIN_ID, "❌ Payment topilmadi.");

    const user = await User.findOne({ telegramId: pay.userId });
    if (!user) return bot.sendMessage(ADMIN_ID, "❌ User topilmadi.");

    const amount = 20000;

    user.balance += amount;
    await user.save();

    pay.status = "approved";
    pay.amount = amount;
    await pay.save();

    bot.sendMessage(
      ADMIN_ID,
      `✔️ Tasdiqlandi. ${user.name} +${amount} ball oldi.`
    );
    bot.sendMessage(
      user.telegramId,
      `🎉 To‘lovingiz tasdiqlandi! +${amount} ball tushdi.`
    );
  }

  // ❌ Bekor qilish
  if (data.startsWith("reject_")) {
    const paymentId = data.replace("reject_", "");
    const pay = await Payment.findById(paymentId);

    if (!pay) return bot.sendMessage(ADMIN_ID, "❌ Payment topilmadi.");

    pay.status = "rejected";
    await pay.save();

    bot.sendMessage(ADMIN_ID, "❌ To‘lov bekor qilindi.");
    bot.sendMessage(
      pay.userId,
      "❌ To‘lovingiz admin tomonidan bekor qilindi."
    );
  }
}
