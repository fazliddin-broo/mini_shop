/**
 * Telegram Admin Bot Integration (Clean Conversational AI Assistant)
 * Focused strictly on:
 * 1. Price & MinPrice updates
 * 2. New product creation (text & photo uploads)
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

  async startPolling() {
    if (this.isRunning) return;
    if (!this.botToken) {
      console.warn('⚠️ Telegram Admin Bot: botToken mavjud emas, polling boshlanmadi.');
      return;
    }

    this.isRunning = true;
    console.log(`🤖 Telegram Admin Bot tinglovchisi ishga tushdi! (Admin ID: ${this.adminId})`);

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

            // 1. SECURITY & AUTHORIZATION CHECK
            const authorizedAdminId = String(this.adminId || process.env.TELEGRAM_ADMIN_ID || '7878337508').trim();
            if (fromId !== authorizedAdminId) {
              console.warn(`⛔ Noma'lum Telegram foydalanuvchisi (${fromId}) botga murojaat qildi! Rad etildi.`);
              await this.sendMessage(chatId, "⛔ Sizda bu magazinni boshqarish huquqi yo‘q.");
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

            // 2. SHOW TYPING INDICATOR
            await this.sendChatAction(chatId, 'typing');

            // 3. HANDLE 2 MAIN BUTTONS
            if (t === '/start' || t === '/help') {
              const welcome = `Assalomu alaykum! Men MiniShop AI Yordamchingizman.\n\nQuyidagi tugmalardan birini tanlang yoki to‘g‘ridan-to‘g‘ri yozing:`;
              await this.sendMessage(chatId, welcome, {
                reply_markup: this.getMainKeyboard()
              });
              continue;
            }

            if (t.includes('narxlarni o\'zgartirish') || t.includes('minimal narxlarni') || t === 'narx') {
              await this.sendMessage(chatId, "Qaysi mahsulotning narxini alishtiramiz? Mahsulot nomi, yangi sotuv narxi va minimal narxini yozing.", {
                reply_markup: this.getMainKeyboard()
              });
              continue;
            }

            if (t.includes('yangi mahsulot qo\'shish') || t === 'yangi tovar' || t === '/add') {
              await this.sendMessage(chatId, "Qanday mahsulot qo‘shamiz? Mahsulot ma’lumotlarini (nomi, narxi, minimal narxi, qoldig‘i) va rasmini yuboring.", {
                reply_markup: this.getMainKeyboard()
              });
              continue;
            }

            // 4. PROCESS THROUGH AI ADMIN ASSISTANT
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
              await this.sendMessage(chatId, "Qanday yordam bera olaman? Quyidagi tugmalardan birini tanlang:", {
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
