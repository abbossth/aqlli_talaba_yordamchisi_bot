// src/index.ts
import 'dotenv/config';         // .env faylidan token va URI o'qish
import mongoose from 'mongoose';
import { logger } from './utils/logger.js';
import './bot/bot.js';

// MongoDB ga ulanish
const mongoUri = process.env.MONGO_URI!;

if (!mongoUri) {
  logger.error('MONGO_URI topilmadi. .env faylni tekshiring.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => logger.info('✅ MongoDB ga ulandi'))
  .catch(err => {
    logger.error('❌ MongoDB xato:', err);
    process.exit(1);
  });

logger.info('🤖 Bot ishga tushdi...');
// Bot allaqachon src/bot/bot.ts da yaratildi va eksport qilindi