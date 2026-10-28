/**
 * Telegram Admin Bot Integration (Smart AI-Powered Store Manager)
 * Dual-AI Backend (OpenAI + Gemini)
 * Features:
 * 1. Webhook purger (removes unauthorized webhooks like A-ToolsX)
 * 2. Conversational price & minPrice updates
 * 3. New product creation (text & photo uploads)
 * 4. Realtime inventory lists & store analytics
 */

class TelegramAdminBot {
  constructor(assistantInstance, botToken, adminId) {
    this.assistant = assistantInstance;
    this.botToken = (botToken || process.env.TELEGRAM_BOT_TOKEN || '8774427252:AAF5urz9dAKom8Zh_cJOlwG7EED5nr0DXJc').trim();
    this.adminId = String(adminId || process.env.TELEGRAM_ADMIN_ID || '7878337508').trim();
    this.isRunning = false;
    this.offset = 0;
  }

  updateConfig(token, adminId) {
    if (token) this.botToken = token.trim();
    if (adminId) this.adminId = String(adminId).trim();
  }

  async getFileUrl(fileId) {
    if (!this.botToken || !fileId) return null;
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/getFile?file_id=${fileId}`);
      const data = await res.json();
      if (data.ok && data.result?.file_path) {
        return `https://api.telegram.org/file/bot${this.botToken}/${data.result.file_path}`;
      }
    } catch (e) {
      console.error('getFileUrl error:', e.message);
    }
    return null;
  }

  async sendMessage(chatId, text, options = {}) {
    if (!this.botToken || !chatId) return;
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const payload = {
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
        ...options
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      console.error('Telegram sendMessage error:', err.message);
    }
  }

  async sendChatAction(chatId, action = 'typing') {
    if (!this.botToken || !chatId) return;
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendChatAction`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, action })
      });
    } catch (_) { }
  }

  getMainKeyboard() {
    return {
      keyboard: [
        [{ text: "🏷 Mahsulot va minimal narxlarni o'zgartirish" }],
        [{ text: "➕ Yangi mahsulot qo'shish" }]
      ],
      resize_keyboard: true
    };
  }

  getPriceConfirmationKeyboard() {
    return {
      keyboard: [
        [{ text: "✅ Ha, o'zgartirilsin" }, { text: "❌ Bekor qilish" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    };
  }

  getCreateConfirmationKeyboard() {
    return {
      keyboard: [
        [{ text: "✅ Ha, bazaga qo'shilsin" }, { text: "❌ Bekor qilish" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    };
  }

  async purgeLingeringWebhooks() {
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/deleteWebhook?drop_pending_updates=true`);
      const data = await res.json();
      console.log('🧹 [SECURITY] Begona Telegram Webhook o‘chirildi va tozalandi:', data?.description || data);
    } catch (err) {
      console.warn('⚠️ Webhook tozalashda ogohlantirish:', err.message);
    }
  }

  async startPolling() {
    if (this.isRunning) return;
    if (!this.botToken) {
      console.warn('⚠️ Telegram Admin Bot: botToken mavjud emas, polling boshlanmadi.');
      return;
    }

    // 1. BEGONA VA ESKI WEBHOOKLARNI BUTUNLAY O'CHIRISH (A-ToolsX kabi begona servislarni uzish)
    await this.purgeLingeringWebhooks();

    this.isRunning = true;
    console.log(`🤖 Telegram Admin Bot (Smart AI) tinglovchisi ishga tushdi! (Admin ID: ${this.adminId})`);

    const poll = async () => {
      if (!this.isRunning) return;
      try {
        const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${this.offset}&timeout=25`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 35000);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        const data = await res.json();
        if (data && data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            this.offset = Math.max(this.offset, update.update_id + 1);

            const msg = update.message;
            if (!msg) continue;

            const fromId = String(msg.from?.id || '');
            const chatId = msg.chat?.id;

            // 1. XAVFSIZLIK VA AVTORIZATSIYA
            const authorizedAdminId = String(this.adminId || process.env.TELEGRAM_ADMIN_ID || '7878337508').trim();
            if (fromId !== authorizedAdminId) {
              console.warn(`⛔ Begona foydalanuvchi (${fromId}) botga murojaat qildi. Kirish rad etildi.`);
              await this.sendMessage(chatId, "⛔ Sizda ushbu do'konni boshqarish huquqi mavjud emas.");
              continue;
            }

            // Extract photo if present
            let imageUrl = null;
            if (Array.isArray(msg.photo) && msg.photo.length > 0) {
              const bestPhoto = msg.photo[msg.photo.length - 1];
              imageUrl = await this.getFileUrl(bestPhoto.file_id);
            }

            const rawText = msg.text || msg.caption || '';
            const t = rawText.trim().toLowerCase();

            // Typing indikatori
            await this.sendChatAction(chatId, 'typing');

            // /start yoki /help
            if (t === '/start' || t === '/help') {
              const welcome = `Assalomu alaykum, hurmatli do‘kon egasi! 👑\n\n` +
                `Men sizning shaxsiy <b>AI Admin Yordamchingizman</b>. Menga oddiy odamdek erkin o‘zbek tilida yozishingiz mumkin:\n\n` +
                `📌 <b>Asosiy vazifalarim:</b>\n` +
                `• <b>Narx va Minimal narxlarni o‘zgartirish:</b>\n` +
                `  <i>«Asus expertbook sotuv narxini 3 300 000, minimalini 3 200 000 qil»</i>\n\n` +
                `• <b>Yangi mahsulot qo‘shish:</b>\n` +
                `  <i>«Yangi tovar: iPhone 16 Pro 256GB Desert, narxi 1400$, min narxi 1350$, qoldiq 5 ta»</i> (rasm bilan birga yuborishingiz ham mumkin)\n\n` +
                `Quyidagi tugmalardan foydalanishingiz yoki to‘g‘ridan-to‘g‘ri yozishingiz mumkin:`;

              await this.sendMessage(chatId, welcome, {
                parse_mode: 'HTML',
                reply_markup: this.getMainKeyboard()
              });
              continue;
            }

            // Narxlarni o'zgartirish tugmasi bosilganda
            if (t === '🏷 mahsulot va minimal narxlarni o\'zgartirish') {
              const hint = `Qaysi mahsulotning narxini o‘zgartiramiz?\n\n` +
                `Masalan, shunchaki quyidagicha yozing:\n` +
                `✍️ <i>«Asus expertbook narxini 3 300 000 qil va minimal narxni esa 3 200 000 qil»</i>\n\n` +
                `<i>(Sotuv narxi — bu saytdagi ko‘rinadigan narx, Minimal narx esa AI savdogar xaridor bilan savdolashganda tushishi mumkin bo‘lgan eng oxirgi chegara).</i>`;

              await this.sendMessage(chatId, hint, {
                parse_mode: 'HTML',
                reply_markup: this.getMainKeyboard()
              });
              continue;
            }

            // Yangi tovar qo'shish tugmasi bosilganda
            if (t === '➕ yangi mahsulot qo\'shish') {
              const addHint = `Yangi mahsulot qo‘shish uchun uning ma’lumotlarini yozing (agar rasmi bo‘lsa, rasm bilan birga yuboring):\n\n` +
                `✍️ <b>Misol:</b>\n` +
                `<i>«Yangi tovar: MacBook Air M3 16/512 Midnight, narxi 14 500 000 so‘m, min narxi 14 000 000 so‘m, qoldiq 4 ta»</i>`;

              await this.sendMessage(chatId, addHint, {
                parse_mode: 'HTML',
                reply_markup: this.getMainKeyboard()
              });
              continue;
            }

            // 4. PROCESS THROUGH AI ADMIN ASSISTANT (Dual-AI NLP Engine)
            const senderName = msg.from?.first_name || 'Admin';
            const sessionId = `tg_${fromId}`;

            try {
              const result = await this.assistant.processAdminMessage({
                text: rawText,
                imageUrl,
                adminUser: `${senderName} (${fromId})`,
                channel: 'telegram',
                sessionId
              });

              if (result.status === 'price_confirmation_required') {
                await this.sendMessage(chatId, result.reply, {
                  parse_mode: 'HTML',
                  reply_markup: this.getPriceConfirmationKeyboard()
                });
              } else if (result.status === 'create_confirmation_required') {
                await this.sendMessage(chatId, result.reply, {
                  parse_mode: 'HTML',
                  reply_markup: this.getCreateConfirmationKeyboard()
                });
              } else {
                await this.sendMessage(chatId, result.reply, {
                  parse_mode: 'HTML',
                  reply_markup: this.getMainKeyboard()
                });
              }
            } catch (err) {
              console.error('Error processing telegram message:', err);
              await this.sendMessage(chatId, "Qanday yordam bera olaman? Quyidagi tugmalardan birini tanlang yoki to‘g‘ridan-to‘g‘ri yozing:", {
                reply_markup: this.getMainKeyboard()
              });
            }
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Telegram polling retry in 2s:', err.message);
        }
        await new Promise(r => setTimeout(r, 2000));
      }

      if (this.isRunning) {
        setTimeout(poll, 400);
      }
    };

    poll();
  }

  stopPolling() {
    this.isRunning = false;
  }
}

module.exports = {
  TelegramAdminBot
};
