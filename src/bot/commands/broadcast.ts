// src/bot/commands/broadcast.ts
import TelegramBot from "node-telegram-bot-api";
import { ADMIN_ID } from "../../config/index.js";
import User from "../../models/User.js";
import { logger } from "../../utils/logger.js";

interface BroadcastState {
  photo?: string;
  text?: string;
  link?: string;
  linkText?: string;
}

const broadcastStates = new Map<number, BroadcastState>();

export default function broadcastCommand(bot: TelegramBot) {
  bot.onText(/\/broadcast/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      if (chatId !== ADMIN_ID) {
        return await bot.sendMessage(chatId, "⛔ Siz admin emassiz.");
      }

      broadcastStates.set(chatId, {});
      
      await bot.sendMessage(
        chatId,
        `📢 *Xabar yuborish*

Rasm yuboring yoki "Rasm yo'q" tugmasini bosing:`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "⏭️ Rasm yo'q",
                  callback_data: "broadcast_no_photo",
                },
              ],
            ],
          },
        }
      );
    } catch (error: any) {
      logger.error("Error in /broadcast command", error);
      await bot.sendMessage(chatId, "❌ Xatolik yuz berdi.");
    }
  });

  // Handle photo for broadcast
  bot.on("photo", async (msg) => {
    const chatId = msg.chat.id;

    try {
      if (chatId !== ADMIN_ID) return;
      
      const state = broadcastStates.get(chatId);
      if (!state || state.photo !== undefined) return;

      const photo = msg.photo?.[msg.photo.length - 1];
      if (!photo) return;

      state.photo = photo.file_id;
      broadcastStates.set(chatId, state);

      await bot.sendMessage(
        chatId,
        `✅ Rasm qabul qilindi.\n\n📝 Endi xabar matnini yuboring:`
      );
    } catch (error: any) {
      logger.error("Error handling broadcast photo", error);
    }
  });

  // Handle text for broadcast
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    try {
      if (chatId !== ADMIN_ID) return;
      if (!text || text.startsWith("/")) return;

      const state = broadcastStates.get(chatId);
      if (!state) return;

      // Check if we're waiting for photo
      if (state.photo === undefined && !state.text) {
        // User sent text instead of photo, skip photo
        if (!text.includes("Rasm yo'q")) {
          state.photo = ""; // No photo
          state.text = text;
          broadcastStates.set(chatId, state);
          
          await bot.sendMessage(
            chatId,
            `✅ Xabar matni qabul qilindi.\n\n🔗 Link qo'shmoqchimisiz? Agar ha, link yuboring, aks holda "Link yo'q" tugmasini bosing:`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "⏭️ Link yo'q",
                      callback_data: "broadcast_no_link",
                    },
                  ],
                ],
              },
            }
          );
        }
        return;
      }

      // If we have photo but not text
      if (state.photo !== undefined && state.text === undefined) {
        state.text = text;
        broadcastStates.set(chatId, state);

        await bot.sendMessage(
          chatId,
          `✅ Xabar matni qabul qilindi.\n\n🔗 Link qo'shmoqchimisiz? Agar ha, link yuboring, aks holda "Link yo'q" tugmasini bosing:`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "⏭️ Link yo'q",
                    callback_data: "broadcast_no_link",
                  },
                ],
              ],
            },
          }
        );
        return;
      }

      // If we have text but not link
      if (state.text && state.link === undefined) {
        state.link = text;
        state.linkText = "Batafsil";
        broadcastStates.set(chatId, state);

        await bot.sendMessage(
          chatId,
          `✅ Link qabul qilindi: ${text}\n\n📤 Xabarni yuborishni tasdiqlang:`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "✅ Yuborish",
                    callback_data: "broadcast_confirm",
                  },
                  {
                    text: "❌ Bekor qilish",
                    callback_data: "broadcast_cancel",
                  },
                ],
              ],
            },
          }
        );
      }
    } catch (error: any) {
      logger.error("Error handling broadcast text", error);
    }
  });
}

export async function handleBroadcastCallback(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery
) {
  const chatId = query.message!.chat.id;
  const data = query.data!;

  try {
    if (chatId !== ADMIN_ID) {
      return await bot.answerCallbackQuery(query.id, { text: "⛔ Siz admin emassiz" });
    }

    const state = broadcastStates.get(chatId);
    if (!state) {
      return await bot.answerCallbackQuery(query.id, { text: "❌ Xabar topilmadi" });
    }

    if (data === "broadcast_no_photo") {
      state.photo = ""; // No photo
      broadcastStates.set(chatId, state);

      await bot.answerCallbackQuery(query.id, { text: "✅ Rasm o'tkazib yuborildi" });
      await bot.deleteMessage(chatId, query.message!.message_id!);
      
      await bot.sendMessage(
        chatId,
        `✅ Rasm o'tkazib yuborildi.\n\n📝 Xabar matnini yuboring:`
      );
    } else if (data === "broadcast_no_link") {
      state.link = "";
      broadcastStates.set(chatId, state);

      await bot.answerCallbackQuery(query.id, { text: "✅ Link o'tkazib yuborildi" });
      await bot.deleteMessage(chatId, query.message!.message_id!);

      await bot.sendMessage(
        chatId,
        `✅ Link o'tkazib yuborildi.\n\n📤 Xabarni yuborishni tasdiqlang:`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Yuborish",
                  callback_data: "broadcast_confirm",
                },
                {
                  text: "❌ Bekor qilish",
                  callback_data: "broadcast_cancel",
                },
              ],
            ],
          },
        }
      );
    } else if (data === "broadcast_confirm") {
      await bot.answerCallbackQuery(query.id, { text: "⏳ Xabar yuborilmoqda..." });
      
      const users = await User.find({});
      const totalUsers = users.length;
      let successCount = 0;
      let failedCount = 0;

      // Prepare message
      const messageOptions: any = {
        parse_mode: "Markdown" as const,
      };

      if (state.link) {
        messageOptions.reply_markup = {
          inline_keyboard: [
            [
              {
                text: state.linkText || "Batafsil",
                url: state.link,
              },
            ],
          ],
        };
      }

      // Send to all users
      for (const user of users) {
        try {
          if (state.photo && state.photo !== "") {
            await bot.sendPhoto(user.telegramId, state.photo, {
              caption: state.text || "",
              ...messageOptions,
            });
          } else {
            await bot.sendMessage(user.telegramId, state.text || "", messageOptions);
          }

          // Mark as active
          user.active = true;
          await user.save();
          successCount++;

          // Small delay to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 50));
        } catch (error: any) {
          logger.warn(`Failed to send broadcast to user ${user.telegramId}`, error);
          
          // Mark as inactive
          user.active = false;
          await user.save();
          failedCount++;
        }
      }

      // Send statistics to admin
      const activeUsers = await User.countDocuments({ active: true });
      const inactiveUsers = await User.countDocuments({ active: false });

      await bot.sendMessage(
        chatId,
        `✅ *Xabar yuborildi!*

📊 *Statistika:*
👥 Jami foydalanuvchilar: ${totalUsers}
✅ Muvaffaqiyatli yuborildi: ${successCount}
❌ Yuborishda xatolik: ${failedCount}

📈 *Umumiy statistikalar:*
✅ Active foydalanuvchilar: ${activeUsers}
❌ Active bo'lmagan: ${inactiveUsers}`,
        { parse_mode: "Markdown" }
      );

      // Clear state
      broadcastStates.delete(chatId);
      
      await bot.deleteMessage(chatId, query.message!.message_id!);
    } else if (data === "broadcast_cancel") {
      broadcastStates.delete(chatId);
      await bot.answerCallbackQuery(query.id, { text: "❌ Bekor qilindi" });
      await bot.deleteMessage(chatId, query.message!.message_id!);
      await bot.sendMessage(chatId, "❌ Xabar yuborish bekor qilindi.");
    }
  } catch (error: any) {
    logger.error("Error handling broadcast callback", error);
    await bot.answerCallbackQuery(query.id, { text: "❌ Xatolik yuz berdi" });
  }
}

