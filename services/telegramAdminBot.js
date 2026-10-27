/**
 * Telegram Admin Bot Integration (Two-Way Interactive Polling)
 * Allows the store owner to manage products and prices via natural Uzbek Telegram messages.
 */

class TelegramAdminBot {
  constructor(assistantInstance, botToken, adminId) {
    this.assistant = assistantInstance;
    this.botToken = (botToken || process.env.TELEGRAM_BOT_TOKEN || '').trim();
    this.adminId = String(adminId || process.env.TELEGRAM_ADMIN_ID || '7878337508').trim();
    this.isRunning = false;
    this.offset = 0;
  }

  updateConfig(token, adminId) {
    if (token) this.botToken = token.trim();
    if (adminId) this.adminId = String(adminId).trim();
  }

  async sendMessage(chatId, text, parseMode = null) {
    if (!this.botToken || !chatId) return;
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const payload = {
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      };
      if (parseMode) payload.parse_mode = parseMode;

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
            if (!msg || !msg.text) continue;

            const fromId = String(msg.from?.id || '');
            const chatId = msg.chat?.id;

            // 1. SECURITY & AUTHORIZATION CHECK
            const authorizedAdminId = String(this.adminId || process.env.TELEGRAM_ADMIN_ID || '7878337508').trim();
            if (fromId !== authorizedAdminId) {
              console.warn(`⛔ Noma'lum Telegram foydalanuvchisi (${fromId}) botga murojaat qildi! Rad etildi.`);
              await this.sendMessage(chatId, "⛔ Sizda bu magazinni boshqarish huquqi yo‘q.");
              continue;
            }

            // 2. SHOW TYPING INDICATOR
            await this.sendChatAction(chatId, 'typing');

            // 3. PROCESS MESSAGE WITH AI ADMIN ASSISTANT
            const senderName = msg.from?.first_name || 'Admin';
            const sessionId = `tg_${fromId}`;

            try {
              const result = await this.assistant.processAdminMessage({
                text: msg.text,
                adminUser: `${senderName} (${fromId})`,
                channel: 'telegram',
                sessionId
              });

              await this.sendMessage(chatId, result.reply);
            } catch (err) {
              console.error('Error processing telegram message:', err);
              await this.sendMessage(chatId, "⚠️ Xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.");
            }
          }
        }
      } catch (err) {
        // Tarmoq vaqtincha uzilsa yoki abort bo'lsa
        if (err.name !== 'AbortError') {
          console.warn('Telegram polling retry in 5s:', err.message);
        }
        await new Promise(r => setTimeout(r, 4000));
      }

      if (this.isRunning) {
        setTimeout(poll, 600);
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
