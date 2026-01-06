import TelegramBot, { Message } from "node-telegram-bot-api";
import User from "../../models/User.js";
import { generatePresentation } from "../../services/aiService.js";
import { deductBalance } from "../../services/balanceService.js";
import {
  PRESENTATION_COST,
  ADMIN_ID,
  REFERRAL_BONUS,
} from "../../config/index.js";
import { logger } from "../../utils/logger.js";
import { mainMenu } from "../keyboards/mainMenu.js";
import { formatAmount } from "../../utils/formatter.js";
import { generatePPTX } from "../../services/pptxService.js";
import { getProgressMessage } from "../../utils/progressBar.js";
import {
  checkSubscription,
  getSubscriptionMessage,
} from "../../utils/subscriptionCheck.js";
import fs from "fs";
import path from "path";

const BOT_USERNAME = process.env.BOT_USERNAME || "talaba_ai_robot";

export default async function messageHandler(bot: TelegramBot, msg: Message) {
  const chatId = msg.chat.id;
  const text = msg.text!;
  const userId = msg.from!.id;

  try {
    const user = await User.findOne({ telegramId: userId });

    if (!user) {
      logger.warn("User not found", { userId });
      return;
    }

    // Handle menu buttons
    if (text === "💰 Balans") {
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "💸 To'lov qilish", callback_data: "payment" }],
          ],
        },
      };

      return bot.sendMessage(
        chatId,
        `💰 *Balansingiz:* ${formatAmount(user.balance)}`,
        {
          parse_mode: "Markdown",
          ...keyboard,
        }
      );
    }

    if (text === "📘 Qo'llanma") {
      const { GUIDE_PAGES, getGuideKeyboard } = await import(
        "../../utils/guideMessages.js"
      );

      await bot.sendMessage(chatId, GUIDE_PAGES[0].text, {
        parse_mode: "Markdown",
        ...getGuideKeyboard(0),
      });
      return;
    }

    if (text === "🎁 Referal havola") {
      return bot.sendMessage(
        chatId,
        `🎁 *Referal Tizimi*

🔗 *Sizning referal havolangiz:*
\`https://t.me/${BOT_USERNAME}?start=${user.telegramId}\`

💎 *Qanday Ishlaydi:*

1️⃣ Havolani do'stlaringizga yuboring
2️⃣ Do'stingiz botni bosib, /start buyrug'ini bosing
3️⃣ Do'stingiz botdan foydalanishni boshlagach, sizga avtomatik ${formatAmount(
          REFERRAL_BONUS
        )} mukofot puli qo'shiladi!

💰 *Afzalliklari:*
✅ Har bir taklif qilingan do'st uchun ${formatAmount(REFERRAL_BONUS)} mukofot
✅ Cheksiz do'stlarni taklif qilishingiz mumkin
✅ Mukofot puli darhol balansingizga qo'shiladi
✅ Do'stingiz ham ${formatAmount(8000)} boshlang'ich balans bilan boshlaydi

📤 *Havolani yuborish:*
Havolani nusxalab, do'stlaringizga yuboring yoki Telegram orqali ulashib yuboring!`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "📋 Havolani nusxalash",
                  url: `https://t.me/${BOT_USERNAME}?start=${user.telegramId}`,
                },
              ],
            ],
          },
        }
      );
    }

    if (text === "📊 Taqdimot yaratish") {
      // Check subscription before allowing presentation creation
      const isSubscribed = await checkSubscription(bot, userId);

      if (!isSubscribed) {
        const subscriptionMsg = getSubscriptionMessage();
        if (subscriptionMsg) {
          const channelUsername = process.env.REQUIRED_CHANNEL_USERNAME || "";
          return bot.sendMessage(chatId, subscriptionMsg, {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "📢 Kanalga o'tish",
                    url: channelUsername
                      ? `https://t.me/${channelUsername}`
                      : undefined,
                  },
                ],
                [
                  {
                    text: "✅ Obuna bo'ldim",
                    callback_data: "check_subscription",
                  },
                ],
              ],
            },
          });
        }
      }

      // Initialize presentation state
      user.action = "waiting_for_topic";
      user.presentationState = {};
      await user.save();
      return bot.sendMessage(
        chatId,
        `📌 *Taqdimot yaratish*

Iltimos, mavzuni *to'liq, bexato va tushunarli* xolatda yuboring.

💡 *Maslahat:*
• Mavzuni aniq va batafsil yozing
• Misol: "Sun'iy intellekt va uning zamonaviy jamiyatdagi o'rni"
• Yoki: "Global iqlim o'zgarishi: sabablari va oqibatlari"

💰 Narx: ${formatAmount(PRESENTATION_COST)}`,
        {
          parse_mode: "Markdown",
        }
      );
    }

    // Step 1: Waiting for topic
    if (user.action === "waiting_for_topic" && text && text.length > 5) {
      // Check balance
      if (user.balance < PRESENTATION_COST) {
        user.action = "start";
        user.presentationState = {};
        await user.save();

        return bot.sendMessage(
          chatId,
          `❌ *Balans yetarli emas*\n\n💰 Balansingiz: ${formatAmount(
            user.balance
          )}\n💵 Kerak: ${formatAmount(
            PRESENTATION_COST
          )}\n\nIltimos, balansingizni to'ldiring.`,
          { parse_mode: "Markdown", ...mainMenu }
        );
      }

      // Save topic and move to next step
      if (!user.presentationState) {
        user.presentationState = {};
      }
      user.presentationState.topic = text;
      user.action = "waiting_for_author";
      await user.save();

      return bot.sendMessage(
        chatId,
        `✅ Mavzu qabul qilindi: *${text}*

🧑‍🎓 Endi taqdimot uchun *muallif ism-familiyasini* to'liq kiritishingizni so'raymiz.

Misol: "Axmedov Abbosbek" yoki "Ivanov Ivan Petrovich"`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "⏭️ Ismsiz davom ettirish",
                  callback_data: "skip_author",
                },
              ],
            ],
          },
        }
      );
    }

    // Step 2: Waiting for author
    if (user.action === "waiting_for_author" && text && text.length > 2) {
      if (!user.presentationState) {
        user.presentationState = {};
      }
      user.presentationState.author = text;
      user.action = "waiting_for_pages";
      await user.save();

      return bot.sendMessage(
        chatId,
        `✅ Muallif: *${text}*

🧮 Endi *taqdimot sahifalar sonini* kiritishingizni so'raymiz.

📄 Sahifalar soni: *4-16* orasida bo'lishi kerak.

Raqam yuboring (masalan: 8, 10, 12):`,
        { parse_mode: "Markdown" }
      );
    }

    // Step 3: Waiting for pages
    if (user.action === "waiting_for_pages" && text) {
      const pages = parseInt(text);

      if (isNaN(pages) || pages < 4 || pages > 16) {
        return bot.sendMessage(
          chatId,
          `❌ Noto'g'ri raqam!\n\n📄 Iltimos, *4-16* orasida raqam kiriting.\n\nMisol: 8, 10, 12, 15`
        );
      }

      if (!user.presentationState) {
        user.presentationState = {};
      }
      user.presentationState.pages = pages;
      user.action = "waiting_for_template";
      await user.save();

      // Show template selection
      return bot.sendMessage(
        chatId,
        `✅ Sahifalar soni: *${pages}*

📐 Endi *shablon* tanlang:

Quyidagi shablonlardan birini tanlang:

1️⃣ *Klassik ko'k* - Gradient dizayn
2️⃣ *Tabiiy yashil* - Markazlashgan dizayn  
3️⃣ *Zamonaviy pushti* - Minimal dizayn
4️⃣ *Javobgar to'q sariq* - Qalin dizayn
5️⃣ *Elegant binafsha* - Gradient minimal`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "1️⃣ Klassik ko'k", callback_data: `select_template_1` },
                {
                  text: "2️⃣ Tabiiy yashil",
                  callback_data: `select_template_2`,
                },
              ],
              [
                {
                  text: "3️⃣ Zamonaviy pushti",
                  callback_data: `select_template_3`,
                },
                {
                  text: "4️⃣ Javobgar to'q sariq",
                  callback_data: `select_template_4`,
                },
              ],
              [
                {
                  text: "5️⃣ Elegant binafsha",
                  callback_data: `select_template_5`,
                },
              ],
            ],
          },
        }
      );
    }

    // Default response
    if (user.action && user.action.startsWith("waiting_for_")) {
      return bot.sendMessage(
        chatId,
        `Iltimos, so'ralgan ma'lumotni to'g'ri yuboring.`,
        { ...mainMenu }
      );
    }

    // If user sends random text and not in any waiting state, show menu
    return bot.sendMessage(
      chatId,
      `Men sizga qanday yordam bera olaman?\n\nQuyidagi tugmalardan birini tanlang:`,
      { ...mainMenu }
    );
  } catch (error: any) {
    logger.error("Error in message handler", error);
    bot.sendMessage(
      chatId,
      `❌ Botda kutilmagan xatolik yuz berdi. Iltimos, birozdan keyin /start tugmasini bosib ko'ring...`
    );
  }
}
