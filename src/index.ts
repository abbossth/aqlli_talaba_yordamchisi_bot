// src/index.ts
import 'dotenv/config';         // .env faylidan token va URI o'qish
import mongoose from 'mongoose';
import './bot/bot';

// MongoDB ga ulanish
const mongoUri = process.env.MONGO_URI!;
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB ga ulandi'))
  .catch(err => console.error('❌ MongoDB xato:', err));

console.log('🤖 Bot ishga tushdi...');
// Bot allaqachon src/bot/bot.ts da yaratildi va eksport qilindi