import TelegramBot from "node-telegram-bot-api";

export default function chekCommand(bot: TelegramBot) {
  bot.onText(/\/chek/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(
      chatId,
      "📸 Iltimos, to‘lov chekini rasm ko‘rinishida yuboring."
    );
  });
}
