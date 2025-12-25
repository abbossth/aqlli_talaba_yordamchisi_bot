# Serverga Joylash Qo'llanmasi

## Muammo
Serverda Node.js versiyasi eski bo'lsa, TypeScript build qilishda xatolik yuz beradi.

## Yechim

### Variant 1: Localda Build Qilish (Tavsiya etiladi)

1. **Local mashinada build qiling:**
```bash
npm run build
```

2. **Serverga quyidagi papka va fayllarni yuboring:**
   - `dist/` papkasi (barcha build qilingan fayllar)
   - `node_modules/` papkasi
   - `.env` fayl
   - `package.json` fayl
   - `temp/` papkasi (yoki serverni ishga tushirganda avtomatik yaratiladi)

3. **Serverni ishga tushiring:**
```bash
npm start
```

### Variant 2: Serverni Node.js Versiyasini Yangilash

1. **Node.js versiyasini tekshiring:**
```bash
node --version
```

2. **Node.js 18+ o'rnatish (nvm yordamida):**
```bash
# nvm o'rnatish (agar yo'q bo'lsa)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Node.js 18 o'rnatish
nvm install 18
nvm use 18
nvm alias default 18

# Tekshirish
node --version
```

3. **Keyin build qiling:**
```bash
npm install
npm run build
npm start
```

### Variant 3: PM2 bilan Ishga Tushirish

```bash
# PM2 o'rnatish
npm install -g pm2

# Botni ishga tushirish
pm2 start dist/index.js --name bot

# Loglarni ko'rish
pm2 logs bot

# Botni to'xtatish
pm2 stop bot

# Botni qayta ishga tushirish
pm2 restart bot
```

## Eslatmalar

- Serverni Node.js versiyasi 18+ bo'lishi kerak
- MongoDB ulanishi zarur
- `.env` fayl to'g'ri sozlangan bo'lishi kerak
- `temp/` papkasi yozish huquqiga ega bo'lishi kerak

