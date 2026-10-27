/**
 * Telegram Admin Bot Integration (Two-Way Interactive Polling with Custom Keyboards)
 * Allows the store owner to manage products, prices, and stock via natural Uzbek Telegram messages.
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
        [{ text: "📦 Mahsulotlar ro'yxati" }, { text: "📊 Do'kon statistikasi" }],
        [{ text: "❓ Yordam / Qanday ishlatish" }]
      ],
      resize_keyboard: true
    };
  }

  getConfirmationKeyboard() {
    return {
      keyboard: [
        [{ text: "✅ Ha, o'zgartirilsin" }, { text: "❌ Bekor qilish" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    };
  }

  async handleQuickCommand(text, chatId) {
    const t = text.trim().toLowerCase();

    // /start yoki Yordam
    if (t === '/start' || t === '/help' || t.includes('yordam')) {
      const welcomeMsg = `👋 <b>Assalomu alaykum, Hurmatli Boshqaruvchi!</b>\n\n` +
        `🤖 Men sizning do'koningizning <b>AI Admin Maslahatchisiman</b>.\n\n` +
        `Siz menga oddiy o'zbek tilida bemalol buyruq berishingiz mumkin, masalan:\n` +
        `🔹 <i>"Asus expertbook narxini 3 400 000 qil"</i>\n` +
        `🔹 <i>"Asus noutbuk qoldig'ini 15 ta qil"</i>\n` +
        `🔹 <i>"iPhone 18 Pro narxini 13.5 million qil"</i>\n\n` +
        `Men kerakli tovarni bazadan topib, tasdiqlash uchun tugmalarni chiqaraman. Tasdiqlashingiz bilan narx yoki qoldiq haqiqiy bazada darhol yangilanadi! ⚡️`;

      await this.sendMessage(chatId, welcomeMsg, {
        parse_mode: 'HTML',
        reply_markup: this.getMainKeyboard()
      });
      return true;
    }

    // Mahsulotlar ro'yxati
    if (t.includes('mahsulotlar') || t === '/products') {
      try {
        const products = await this.assistant.db.getAllProducts();
        if (!products || products.length === 0) {
          await this.sendMessage(chatId, "📦 Hozircha bazada mahsulotlar mavjud emas.", {
            reply_markup: this.getMainKeyboard()
          });
          return true;
        }

        let msg = `📦 <b>DO'KON BAZASIDAGI MAHSULOTLAR (Jami: ${products.length} ta):</b>\n\n`;
        products.slice(0, 15).forEach((p, idx) => {
          const name = p.name || p.title || 'Nomsiz mahsulot';
          const price = Number(p.price || 0).toLocaleString('uz-UZ');
          const stock = p.stock || 0;
          msg += `${idx + 1}. <b>${name}</b>\n   💰 Narxi: ${price} so'm | Qoldiq: ${stock} ta\n\n`;
        });

        if (products.length > 15) {
          msg += `<i>...va yana ${products.length - 15} ta tovar.</i>\n\n`;
        }

        msg += `💡 <i>Narx yoki qoldiqni o'zgartirish uchun tovar nomini va yangi qiymatini yozing.</i>`;

        await this.sendMessage(chatId, msg, {
          parse_mode: 'HTML',
          reply_markup: this.getMainKeyboard()
        });
        return true;
      } catch (err) {
        console.error('Error listing products for TG:', err);
      }
    }

    // Statistika
    if (t.includes('statistika') || t === '/stats') {
      try {
        const products = await this.assistant.db.getAllProducts();
        const totalProds = products.length;
        const totalStock = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);

        const statsMsg = `📊 <b>DO'KON STATISTIKASI:</b>\n\n` +
          `📦 Mahsulot turlari: <b>${totalProds} ta</b>\n` +
          `🔢 Ombordagi jami qoldiq: <b>${totalStock} dona</b>\n` +
          `⚡️ AI holati: <b>Faol (100% Online)</b>\n` +
          `🛡 Boshqaruvchi: <b>Admin (#${this.adminId})</b>`;

        await this.sendMessage(chatId, statsMsg, {
          parse_mode: 'HTML',
          reply_markup: this.getMainKeyboard()
        });
        return true;
      } catch (err) {
        console.error('Error getting stats for TG:', err);
      }
    }

    return false;
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

            // 3. CHECK QUICK MENU / COMMANDS
            const handledQuick = await this.handleQuickCommand(msg.text, chatId);
            if (handledQuick) continue;

            // 4. PROCESS MESSAGE WITH AI ADMIN ASSISTANT
            const senderName = msg.from?.first_name || 'Admin';
            const sessionId = `tg_${fromId}`;

            try {
              const result = await this.assistant.processAdminMessage({
                text: msg.text,
                adminUser: `${senderName} (${fromId})`,
                channel: 'telegram',
                sessionId
              });

              // Send appropriate keyboard depending on status
              if (result.status === 'confirmation_required') {
                await this.sendMessage(chatId, result.reply, {
                  reply_markup: this.getConfirmationKeyboard()
                });
              } else if (result.status === 'completed' || result.status === 'cancelled') {
                await this.sendMessage(chatId, result.reply, {
                  reply_markup: this.getMainKeyboard()
                });
              } else {
                await this.sendMessage(chatId, result.reply, {
                  reply_markup: this.getMainKeyboard()
                });
              }
            } catch (err) {
              console.error('Error processing telegram message:', err);
              await this.sendMessage(chatId, "⚠️ Xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.", {
                reply_markup: this.getMainKeyboard()
              });
            }
          }
        }
      } catch (err) {
        // Tarmoq vaqtincha uzilsa yoki abort bo'lsa
        if (err.name !== 'AbortError') {
          console.warn('Telegram polling retry in 3s:', err.message);
        }
        await new Promise(r => setTimeout(r, 3000));
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
