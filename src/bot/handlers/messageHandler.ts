import TelegramBot, { Message } from "node-telegram-bot-api";
import User from "../../models/User.js";
import { generatePresentation } from "../../services/aiService.js";
import { deductBalance } from "../../services/balanceService.js";
import { PRESENTATION_COST, ADMIN_ID } from "../../config/index.js";
import { logger } from "../../utils/logger.js";
import { mainMenu } from "../keyboards/mainMenu.js";
import { formatAmount } from "../../utils/formatter.js";
import { generatePPTX } from "../../services/pptxService.js";
import { getProgressMessage } from "../../utils/progressBar.js";
import { checkSubscription, getSubscriptionMessage } from "../../utils/subscriptionCheck.js";
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

      return bot.sendMessage(chatId, `💰 *Balansingiz:* ${formatAmount(user.balance)}`, {
        parse_mode: "Markdown",
        ...keyboard,
      });
    }

    if (text === "📘 Qo'llanma") {
      return bot.sendMessage(
        chatId,
        `📘 *Qo'llanma*

Botdan foydalanish juda oson:

1️⃣ "📊 Taqdimot yaratish" tugmasini bosing
2️⃣ Mavzuni to'liq va tushunarli yuboring
3️⃣ Muallif ism-familiyasini kiriting
4️⃣ Sahifalar sonini tanlang (4-16)
5️⃣ Shablon va tilni tanlang
6️⃣ Professional taqdimot oling!

💡 *Maslahat:* Mavzuni aniq va to'liq yozing.

💰 *Narx:* ${formatAmount(PRESENTATION_COST)} har bir taqdimot uchun`,
        { parse_mode: "Markdown" }
      );
    }

    if (text === "🎁 Referal havola") {
      return bot.sendMessage(
        chatId,
        `🔗 Sizning referal havolangiz:\nhttps://t.me/${BOT_USERNAME}?start=${user.telegramId}`
      );
    }

    if (text === "📊 Taqdimot yaratish") {
      // Check subscription before allowing presentation creation
      const isSubscribed = await checkSubscription(bot, userId);
      
      if (!isSubscribed) {
        const subscriptionMsg = getSubscriptionMessage();
        if (subscriptionMsg) {
          const channelUsername = process.env.REQUIRED_CHANNEL_USERNAME || "";
          return bot.sendMessage(
            chatId,
            subscriptionMsg,
            {
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "📢 Kanalga o'tish",
                      url: channelUsername ? `https://t.me/${channelUsername}` : undefined,
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
            }
          );
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
        { parse_mode: "Markdown" }
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
          `❌ *Balans yetarli emas*\n\n💰 Balansingiz: ${formatAmount(user.balance)}\n💵 Kerak: ${formatAmount(PRESENTATION_COST)}\n\nIltimos, balansingizni to'ldiring.`,
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
                { text: "2️⃣ Tabiiy yashil", callback_data: `select_template_2` },
              ],
              [
                { text: "3️⃣ Zamonaviy pushti", callback_data: `select_template_3` },
                { text: "4️⃣ Javobgar to'q sariq", callback_data: `select_template_4` },
              ],
              [
                { text: "5️⃣ Elegant binafsha", callback_data: `select_template_5` },
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
