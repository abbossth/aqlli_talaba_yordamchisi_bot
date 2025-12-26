// src/utils/guideMessages.ts
import { formatAmount } from "./formatter.js";
import { PRESENTATION_COST, REFERRAL_BONUS, INITIAL_BALANCE } from "../config/index.js";

const BOT_USERNAME = process.env.BOT_USERNAME || "talaba_ai_robot";

export const GUIDE_PAGES = [
  {
    text: `📘 *Qo'llanma - Talaba AI Bot* (1/5)

🤖 *Bot Haqida:*
Talabalar uchun professional AI yordamchi bot. Professional taqdimotlar, referatlar va mustaqil ishlarni 3-5 daqiqada tayyorlaydi.

📊 *Asosiy Funksiyalar:*
• PPTX formatida professional taqdimotlar
• 5 xil chiroyli dizayn shablonlar
• Har bir slaydda professional rasmlar
• 5 xil til: O'zbek, Rus, Ingliz, Nemis, Fransuz
• 3-5 daqiqada tayyor taqdimot

🎨 *Shablonlar:*
1️⃣ Klassik ko'k - Gradient dizayn
2️⃣ Tabiiy yashil - Markazlashgan dizayn
3️⃣ Zamonaviy pushti - Minimal dizayn
4️⃣ Javobgar to'q sariq - Qalin dizayn
5️⃣ Elegant binafsha - Gradient minimal`,
  },
  {
    text: `📋 *Taqdimot Yaratish - Qadamlari* (2/5)

1️⃣ "📊 Taqdimot yaratish" tugmasini bosing

2️⃣ *Mavzuni yuboring* (to'liq va aniq)
   📝 Misol: "Sun'iy intellekt va uning zamonaviy jamiyatdagi o'rni"

3️⃣ *Muallif ismini kiriting* yoki "⏭️ Ismsiz davom ettirish"

4️⃣ *Sahifalar sonini tanlang* (4-16 orasida)

5️⃣ *Shablonni tanlang* (5 xil shablon)

6️⃣ *Tilni tanlang* (5 xil til)

7️⃣ "Tayyorlash" tugmasini bosing va 3-5 daqiqada taqdimot oling! 🎉`,
  },
  {
    text: `💰 *Balans va To'lov* (3/5)

💰 *Boshlang'ich balans:* ${formatAmount(INITIAL_BALANCE)}
💰 *Taqdimot narxi:* ${formatAmount(PRESENTATION_COST)} har bir taqdimot uchun

💳 *To'lov qilish:*
1️⃣ "💰 Balans" tugmasini bosing
2️⃣ "💸 To'lov qilish" tugmasini bosing
3️⃣ Summani tanlang (1 000 - 30 000 so'm)
4️⃣ To'lov cheki rasmini yuboring
5️⃣ Admin tasdiqlagach, balans to'ldiriladi ✅

💳 *To'lov summalari:*
1 000, 2 000, 3 000, 5 000, 10 000, 15 000, 20 000, 25 000, 30 000 so'm`,
  },
  {
    text: `🎁 *Referal Tizimi* (4/5)

Do'stlaringizni taklif qiling va ${formatAmount(REFERRAL_BONUS)} mukofot oling!

*Qanday ishlaydi:*
1️⃣ "🎁 Referal havola" tugmasini bosing
2️⃣ Havolani do'stlaringizga yuboring
3️⃣ Do'stingiz /start bosganda, sizga ${formatAmount(REFERRAL_BONUS)} mukofot puli qo'shiladi!
4️⃣ Do'stingiz ham ${formatAmount(INITIAL_BALANCE)} boshlang'ich balans oladi

✅ Cheksiz do'stlarni taklif qilishingiz mumkin
✅ Mukofot puli darhol balansingizga qo'shiladi
✅ Mukofot haqida sizga avtomatik xabar keladi`,
  },
  {
    text: `💡 *Maslahatlar va Buyruqlar* (5/5)

💡 *Professional Taqdimot Yaratish:*
• Mavzuni aniq va batafsil yozing
• To'liq jumlalar bilan ifodalang
• To'g'ri shablonni tanlang
• Taqdimot tayyorlash 3-5 daqiqaga cho'zilishi mumkin

📋 *Bot Buyruqlari:*
/start - Botni ishga tushirish
/help - Qo'llanma
/about - Bot haqida
/vid - Video qo'llanma (taqdimot)
/video - Video qo'llanma (referat)
/chek - To'lov cheki yuborish

🤖 @${BOT_USERNAME.replace(/_/g, '\\_')}`,
  },
];

export function getGuideKeyboard(pageIndex: number) {
  const totalPages = GUIDE_PAGES.length;
  const isFirst = pageIndex === 0;
  const isLast = pageIndex === totalPages - 1;

  const keyboard: any[] = [];

  if (isFirst) {
    keyboard.push([
      {
        text: "➡️ Keyingi",
        callback_data: `guide_next_${pageIndex}`,
      },
    ]);
  } else if (isLast) {
    keyboard.push([
      {
        text: "⬅️ Oldingi",
        callback_data: `guide_prev_${pageIndex}`,
      },
    ]);
  } else {
    keyboard.push([
      {
        text: "⬅️ Oldingi",
        callback_data: `guide_prev_${pageIndex}`,
      },
      {
        text: "➡️ Keyingi",
        callback_data: `guide_next_${pageIndex}`,
      },
    ]);
  }

  return {
    reply_markup: {
      inline_keyboard: keyboard,
    },
  };
}

