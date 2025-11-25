import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import mongoose from 'mongoose';

const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: true });

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB ga ulandi'))
  .catch(err => console.log('MongoDB xato:', err));

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Salom ${msg.from?.first_name}! Men Aqlli Talaba Yordamchisi botiman 😊`);
});
