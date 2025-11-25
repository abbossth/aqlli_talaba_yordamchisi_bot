import TelegramBot from "node-telegram-bot-api";
import Payment from "../../models/Payment";

const CARD = "8600 5304 0271 3039";

export default async function callbackHandler(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery
) {
  const chatId = query.message!.chat.id;

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
}
