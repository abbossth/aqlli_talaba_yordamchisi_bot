# Talaba AI Bot

Telegram bot - talabalar uchun professional taqdimotlar yaratish. Sun'iy intellekt yordamida referat, taqdimot, mustaqil ish va slaydlar tayyorlaydi.

## O'rnatish

1. **Dependencies o'rnatish:**
```bash
npm install
```

2. **Environment variables (.env fayl yaratish):**
```env
BOT_TOKEN=your_telegram_bot_token
MONGO_URI=your_mongodb_connection_string
ADMIN_ID=your_telegram_user_id
OPENAI_API_KEY=your_openai_api_key
PRESENTATION_COST=100
BOT_USERNAME=your_bot_username

# Optional: Image service (for better presentations)
PEXELS_API_KEY=your_pexels_api_key

# Optional: Required channel subscription
REQUIRED_CHANNEL_ID=your_channel_id
REQUIRED_CHANNEL_USERNAME=your_channel_username

# Optional: Video tutorial IDs
PRESENTATION_VIDEO_ID=your_presentation_video_file_id
REFERAT_VIDEO_ID=your_referat_video_file_id
```

3. **Build qilish:**
```bash
npm run build
```

4. **Ishga tushirish:**
```bash
npm start
```

## Development

Development rejimida ishlatish:
```bash
npm run dev
```

## Serverga joylash

1. Build qilingan `dist` papkasini serverni ko'chiring
2. `node_modules` va `.env` faylini ham ko'chiring
3. Serverni ishga tushiring: `npm start`

## Struktura

- `src/bot/` - Bot komandalari va handlerlar
- `src/models/` - MongoDB modellari
- `src/services/` - AI va PPTX servislari
- `src/utils/` - Yordamchi funksiyalar

## Eslatmalar

- `temp/` papkasi PPTX fayllarini yaratish uchun ishlatiladi
- MongoDB ulanishi zarur
- OpenAI API key zarur

