// src/bot/commands/help.ts
import TelegramBot from "node-telegram-bot-api";
import { PRESENTATION_COST } from "../../config/index.js";
import { formatAmount } from "../../utils/formatter.js";

export default function helpCommand(bot: TelegramBot) {
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      await bot.sendMessage(
        chatId,
        `📘 *Qo'llanma - Talaba AI Bot*

*Bot Buyruqlari:*

🔹 */start* - Botni ishga tushirish va bosh menyuni ko'rish
🔹 */help* - Qo'llanma va yordam olish
🔹 */about* - Bot haqida ma'lumot
🔹 */vid* - Taqdimot (Slayd) yaratish video qo'llanmasi
🔹 */video* - Referat/Mustaqil ish yaratish video qo'llanmasi
🔹 */chek* - To'lov cheki yuborish

*Bot Tugmalari:*

📊 *Taqdimot yaratish* - Professional taqdimot yaratish
💰 *Balans* - Balansingizni ko'rish va to'ldirish
📘 *Qo'llanma* - Botdan foydalanish bo'yicha ma'lumot
🎁 *Referal havola* - Do'stlaringizni taklif qilish uchun havola
ℹ️ *About* - Bot haqida ma'lumot

*Taqdimot yaratish qadamlari:*

1️⃣ "📊 Taqdimot yaratish" tugmasini bosing
2️⃣ Mavzuni to'liq, bexato va tushunarli yuboring
   📝 Misol: "Sun'iy intellekt va uning zamonaviy jamiyatdagi o'rni"
3️⃣ Muallif ism-familiyasini kiriting yoki "⏭️ Ismsiz davom ettirish" tugmasini bosing
4️⃣ Sahifalar sonini tanlang (4-16 orasida)
5️⃣ Shablonni tanlang (5 xil shablon mavjud)
6️⃣ Tilni tanlang (O'zbek, Rus, Ingliz, Nemis, Fransuz)
7️⃣ "Tayyorlash" tugmasini bosing va professional taqdimot oling! 🎉

*To'lov qilish:*

1️⃣ "💰 Balans" tugmasini bosing
2️⃣ "💸 To'lov qilish" tugmasini bosing
3️⃣ To'lov miqdorini tanlang (1 000 - 30 000 so'm)
4️⃣ To'lov chekini rasm sifatida yuboring
5️⃣ Admin to'lovni tasdiqlagach, balansingiz to'ldiriladi

💰 *Narx:* ${formatAmount(PRESENTATION_COST)} har bir taqdimot uchun

*Maslahatlar:*

💡 Mavzuni aniq va batafsil yozing
💡 To'liq jumlalar bilan ifodalang
💡 Mavzu nomini tushunarli qilib yozing
💡 Taqdimot tayyorlash 3-5 daqiqaga cho'zilishi mumkin

*Qo'shimcha ma'lumot:*

📹 Video qo'llanmalar: /vid va /video
📞 Yordam kerak bo'lsa: /help
ℹ️ Bot haqida: /about`,
        { parse_mode: "Markdown" }
      );
    } catch (error: any) {
      console.error("Error in help command:", error);
    }
  });
}
