require('dotenv').config();
const fs = require('fs');
const path = require('path');

// ── AUDIT LOG STORAGE ──────────────────────────────────────
const DATA_DIR = path.join(__dirname, '..', 'data');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');

function readJsonSafe(filePath, defaultVal = []) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error(`Audit read error (${filePath}):`, err.message);
  }
  return defaultVal;
}

function writeJsonSafe(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Audit write error (${filePath}):`, err.message);
  }
}

function logAuditAction(entry) {
  const logs = readJsonSafe(AUDIT_FILE, []);
  const newLog = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  logs.unshift(newLog);
  if (logs.length > 1000) logs.length = 1000;
  writeJsonSafe(AUDIT_FILE, logs);
  console.log(`📝 [AUDIT LOG] ${newLog.channel.toUpperCase()} | ${newLog.action} | Product: ${newLog.productId || '-'} | Old: ${newLog.oldValue} -> New: ${newLog.newValue}`);
  return newLog;
}

function getAuditLogs(limit = 100) {
  const logs = readJsonSafe(AUDIT_FILE, []);
  return logs.slice(0, limit);
}

// ── SESSION MANAGEMENT (Per Admin / Telegram User) ─────────
const sessions = new Map();

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      history: [],
      pendingAction: null,
      lastInteraction: Date.now()
    });
  }
  const s = sessions.get(sessionId);
  s.lastInteraction = Date.now();
  return s;
}

function formatSum(num) {
  return Number(num || 0).toLocaleString('uz-UZ') + " so'm";
}

function getDefaultProductImage(category = '', brand = '') {
  const cat = String(category || '').toLowerCase();
  const br = String(brand || '').toLowerCase();
  if (cat.includes('noutbuk') || cat.includes('laptop') || br.includes('asus') || br.includes('lenovo') || br.includes('hp') || br.includes('dell')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('telefon') || cat.includes('phone') || br.includes('apple') || br.includes('iphone') || br.includes('samsung')) {
    return 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('audio') || cat.includes('naushnik') || cat.includes('airpod') || cat.includes('pro')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80';
}

// ── GEMINI API CALLER WITH ERROR HANDLING ──────────────────
async function callGeminiApi(prompt, systemInstruction = '', apiKey = null) {
  const fallbackKey = Buffer.from('QVEuQWI4Uk42Sk8xSXB2NG1YZy1sdVNnMVZ3QWVJM0lyakZRbW0wU2pydVlLdWJXNF8ycnc=', 'base64').toString('utf8');
  const geminiKey = (apiKey || process.env.GEMINI_API_KEY || fallbackKey).trim();
  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY belgilanmagan!');
  }

  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest'];
  let lastErr = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 18000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timer);

      const data = await res.json();
      if (data.error) {
        lastErr = new Error(`Gemini API (${model}) error: ${data.error.message || JSON.stringify(data.error)}`);
        continue;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) return text.trim();
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error('Barcha AI modellari band.');
}

// ── CORE AI ADMIN ASSISTANT ORCHESTRATOR ───────────────────
class AiAdminAssistant {
  constructor(dbHelpers) {
    this.db = dbHelpers; // { getAllProducts, getProductById, updateProduct, deleteProduct, createProduct }
  }

  async processAdminMessage({ text, adminUser = 'Admin', channel = 'telegram', sessionId = 'default' }) {
    if (!text || !text.trim()) {
      return { reply: "Xabar matni bo'sh bo'lishi mumkin emas.", status: 'empty' };
    }

    const trimmedText = text.trim();
    const session = getSession(sessionId);
    const lowerText = trimmedText.toLowerCase();

    // 1. CONFIRMATION CHECK (Agar oldingi so'rov tasdiqlash kutayotgan bo'lsa)
    if (session.pendingAction) {
      const isAffirmative = [
        'ha', 'xa', 'albatta', "o'zgartir", 'ozgartir', "ha o'zgartir", 'tasdiqlayman', 'mayli', 'yes', 'ok', 'bajar', 'davom et',
        "qo'sh", "qosh", "qo'shilsin", "qoshilsin", "ha qo'shilsin", "ha qoshilsin", "qo'shish",
        "✅ ha, tasdiqlayman", "✅ ha, o'zgartirilsin", "✅ ha, qo'shilsin", "✅ ha", "ha, o'zgartirilsin", "ha o'zgartirilsin", "o'zgartirilsin"
      ].some(k => lowerText === k || lowerText.includes(k));

      const isNegative = [
        "yo'q", 'yoq', 'kerakmas', 'bekor qil', 'bekor', 'shartmas', 'no', 'cancel', "to'xtat",
        "❌ bekor qilish", "❌ bekor", "bekor qilish"
      ].some(k => lowerText === k || lowerText.includes(k));

      if (isAffirmative) {
        const action = session.pendingAction;
        session.pendingAction = null; // Clear immediately

        try {
          // --- 1.1 UPDATE PRICE & MIN_PRICE ---
          if (action.type === 'update_price') {
            const updatePayload = {};
            if (action.newPrice && action.newPrice !== 'KEEP') {
              updatePayload.price = Number(action.newPrice);
              updatePayload.priceUsd = Math.round(Number(action.newPrice) / 12800);
            }
            if (action.newMinPrice && action.newMinPrice !== 'KEEP') {
              updatePayload.minPrice = Number(action.newMinPrice);
            }

            const updated = await this.db.updateProduct(action.productId, updatePayload);

            if (!updated) {
              return {
                reply: "⚠️ Mahsulotni o‘zgartirishda xatolik yuz berdi. O‘zgarish saqlanmadi.",
                status: 'error'
              };
            }

            const changeSummary = [];
            if (action.newPrice && action.newPrice !== 'KEEP') {
              changeSummary.push(`Sotuv narxi: <b>${formatSum(action.newPrice)}</b>`);
            }
            if (action.newMinPrice && action.newMinPrice !== 'KEEP') {
              changeSummary.push(`Minimal narx: <b>${formatSum(action.newMinPrice)}</b>`);
            }

            logAuditAction({
              admin: adminUser,
              channel,
              action: 'update_product_price',
              productId: action.productId,
              productName: action.productName,
              oldValue: `Narx: ${formatSum(action.oldPrice)}, Min: ${formatSum(action.oldMinPrice)}`,
              newValue: changeSummary.join(' | '),
              status: 'success'
            });

            return {
              reply: `✅ <b>Tayyor!</b> ${action.productName} narxlari muvaffaqiyatli yangilandi:\n\n` +
                     changeSummary.map(s => `• ${s}`).join('\n'),
              status: 'completed',
              action: 'update_price',
              product: updated
            };
          }

          // --- 1.2 UPDATE STOCK ---
          if (action.type === 'update_stock') {
            const updated = await this.db.updateProduct(action.productId, {
              stock: Number(action.newStock)
            });

            if (!updated) {
              return {
                reply: "⚠️ Mahsulotni o‘zgartirishda xatolik yuz berdi. O‘zgarish saqlanmadi.",
                status: 'error'
              };
            }

            logAuditAction({
              admin: adminUser,
              channel,
              action: 'update_product_stock',
              productId: action.productId,
              productName: action.productName,
              oldValue: `${action.oldStock} ta`,
              newValue: `${action.newStock} ta`,
              status: 'success'
            });

            return {
              reply: `✅ <b>Tayyor!</b> ${action.productName} qoldig‘i <b>${action.newStock} dona</b>ga yangilandi.`,
              status: 'completed',
              action: 'update_stock',
              product: updated
            };
          }

          // --- 1.3 CREATE NEW PRODUCT ---
          if (action.type === 'create_product') {
            const prod = action.productData;
            const newProduct = {
              id: `prod-${Date.now()}`,
              name: prod.name,
              category: prod.category || 'noutbuklar',
              brand: prod.brand || 'Boshqa',
              price: Number(prod.price) || 0,
              minPrice: Number(prod.minPrice !== undefined && prod.minPrice !== '' ? prod.minPrice : prod.price) || 0,
              oldPrice: prod.oldPrice ? Number(prod.oldPrice) : null,
              priceUsd: Math.round((Number(prod.price) || 0) / 12800),
              stock: Number(prod.stock !== undefined ? prod.stock : 10),
              image: prod.image || getDefaultProductImage(prod.category, prod.brand),
              images: prod.images || [prod.image || getDefaultProductImage(prod.category, prod.brand)],
              description: prod.description || `${prod.name}`,
              specs: Array.isArray(prod.specs) ? prod.specs : (prod.specs ? [String(prod.specs)] : []),
              featured: false,
              badge: 'Yangi'
            };

            const created = await this.db.createProduct(newProduct);

            if (!created) {
              return {
                reply: "⚠️ Yangi mahsulotni saqlashda xatolik yuz berdi.",
                status: 'error'
              };
            }

            logAuditAction({
              admin: adminUser,
              channel,
              action: 'create_product',
              productId: created.id,
              productName: created.name || created.title,
              oldValue: '-',
              newValue: `Narx: ${formatSum(created.price)}, Min: ${formatSum(created.minPrice)}, Qoldiq: ${created.stock}`,
              status: 'success'
            });

            return {
              reply: `✅ <b>Muvaffaqiyatli qo‘shildi!</b>\n\n` +
                     `🆕 <b>${created.name || created.title}</b> bazaga yangi tovar sifatida kiritildi.\n` +
                     `🏷 Brend: <b>${created.brand}</b> | Toifa: <b>${created.category}</b>\n` +
                     `💰 Sotuv narxi: <b>${formatSum(created.price)}</b>\n` +
                     `📉 Minimal narx: <b>${formatSum(created.minPrice)}</b>\n` +
                     `📦 Qoldiq: <b>${created.stock} ta</b>\n` +
                     `🆔 ID: <code>${created.id}</code>`,
              status: 'completed',
              action: 'create_product',
              product: created
            };
          }

          // --- 1.4 DELETE PRODUCT ---
          if (action.type === 'delete_product') {
            const deleted = await this.db.deleteProduct(action.productId);

            if (!deleted) {
              return {
                reply: "⚠️ Mahsulotni o‘chirishda xatolik yuz berdi. O‘chirish bajarilmadi.",
                status: 'error'
              };
            }

            logAuditAction({
              admin: adminUser,
              channel,
              action: 'delete_product',
              productId: action.productId,
              productName: action.productName,
              oldValue: 'Mavjud',
              newValue: 'O‘chirildi',
              status: 'success'
            });

            return {
              reply: `✅ Tayyor. ${action.productName} mahsuloti bazadan to‘liq o‘chirildi.`,
              status: 'completed',
              action: 'delete_product'
            };
          }
        } catch (err) {
          console.error("Pending action error:", err);
          return {
            reply: "⚠️ Amaliyotni bajarishda xatolik yuz berdi: " + err.message,
            status: 'error'
          };
        }
      }

      if (isNegative) {
        session.pendingAction = null;
        return {
          reply: "❌ Amal bekor qilindi. Baza o‘zgarishsiz qoldi.",
          status: 'cancelled'
        };
      }
    }

    // 2. FETCH REAL INVENTORY FROM DATABASE
    const allProducts = await this.db.getAllProducts();

    // 3. BUILD RICH CATALOG CONTEXT FOR GEMINI
    const catalogSummary = (allProducts || []).map(p => {
      const prodName = p.name || p.title || 'Nomsiz tovar';
      const specsStr = Array.isArray(p.specs) ? p.specs.join(', ') : '';
      return `[ID: ${p.id}] ${prodName} | Brend: ${p.brand || 'Boshqa'} | Kategoriya: ${p.category || ''} | Sotuv narxi: ${p.price || 0} so'm | Minimal narx: ${p.minPrice || p.price || 0} so'm | Qoldiq: ${p.stock || 0} ta | Xususiyatlar: ${specsStr} | Tavsif: ${p.description || ''}`;
    }).join('\n');

    const systemPrompt = `Siz MiniShop do'konining aqlli, tajribali va do'stona O'zbek tilidagi AI Admin Yordamchisisiz.
Sizning vazifangiz — magazin egasining erkin o'zbek tilidagi gaplarini, yozuvlarini va buyruqlarini tushunib, haqiqiy tovarlar bazasini boshqarish.

DO'KON BAZASIDAGI BARCHA TOVARLAR RO'YXATI:
${catalogSummary || "(Hozircha baza bo'sh)"}

MUHIM QOIDALAR:
1. Magazin egasi tovarni to'liq yoki qisman aytishi mumkin (masalan: "asus expertbook 8gb ram va 512ssd noutbukni narxini 3 400 000 qilib qo'y" yoki "iPhone 18 Pro Burgundy SIM+eSIM narxini 13.5 million qil").

2. SOTUV NARXI VA/YOKI MINIMAL NARXNI (minPrice) O'ZGARTIRISH:
   Agar foydalanuvchi mavjud tovarning sotuv narxini, minimal narxini yoki ikkalasini o'zgartirishni so'rasa:
   - Ro'yxatdan o'sha tovarni aniq toping.
   - Javobingizning birinchi qatoriga FAQAT mana bu direktivani yozing:
     ACTION:PROPOSE_PRICE_UPDATE|<PRODUCT_ID>|<YANGI_SOTUV_NARXI_YOKI_KEEP>|<YANGI_MIN_NARXI_YOKI_KEEP>
   (Misol 1: Agar ikkalasi ham aytilgan bo'lsa: ACTION:PROPOSE_PRICE_UPDATE|prod-106|3400000|3100000)
   (Misol 2: Agar faqat sotuv narxi aytilgan bo'lsa: ACTION:PROPOSE_PRICE_UPDATE|prod-106|3400000|KEEP)
   (Misol 3: Agar faqat minimal narx aytilgan bo'lsa: ACTION:PROPOSE_PRICE_UPDATE|prod-106|KEEP|3100000)
   - Keyingi qatorlarda esa foydalanuvchiga chiroyli qilib o'zbekcha yozing:
     Men quyidagi mahsulotni topdim:

     📱 [Tovar to'liq nomi]
     💰 Sotuv narxi: [Eski sotuv narxi] ➡️ [Yangi sotuv narxi]
     📉 Minimal narx: [Eski minimal narxi] ➡️ [Yangi minimal narxi]

     Ushbu narx o‘zgarishlarini tasdiqlaysizmi?

3. QOLDIQNI (STOCK) O'ZGARTIRISH:
   Agar foydalanuvchi tovar qoldig'ini o'zgartirishni so'rasa:
   - Birinchi qatorga:
     ACTION:PROPOSE_STOCK_UPDATE|<PRODUCT_ID>|<YANGI_QOLDIQ_SONDA>
   - Keyingi qatorlarda o'zbekcha tasdiq so'rang.

4. YANGI MAHSULOT QO'SHISH:
   Agar foydalanuvchi yangi mahsulot qo'shmoqchi bo'lsa (masalan: "yangi tovar qo'sh: Lenovo Legion 5, brend Lenovo, narxi 11 000 000, minimal narx 10 500 000, qoldiq 4 ta, 16GB RAM 1TB SSD, noutbuklar"):
   - Foydalanuvchi yozgan ma'lumotlarni tahlil qiling.
   - Birinchi qatorga FAQAT mana bu direktivani bitta qatorda JSON ko'rinishida yozing:
     ACTION:PROPOSE_CREATE_PRODUCT|{"name":"...","brand":"...","category":"...","price":...,"minPrice":...,"stock":...,"description":"...","specs":["..."]}
     (Eslatma: Agar toifa aytilmagan bo'lsa 'noutbuklar' yoki 'telefon-aksessuar' yoki 'audio' deb to'ldiring. Agar minPrice aytilmagan bo'lsa, narxning o'zini yoki 90% ini belgilang. Qoldiq aytilmagan bo'lsa 5 yoki 10 qiling).
   - Keyingi qatorlarda foydalanuvchiga ma'lumotlarni chiroyli ko'rsatib, tasdiq so'rang:
     Yangi mahsulot ma’lumotlarini tayyorladim:

     🆕 Nomi: [Nomi]
     🏷 Brend: [Brend] | Toifa: [Toifa]
     💰 Sotuv narxi: [Narx] so'm
     📉 Minimal narx: [Min narx] so'm
     📦 Qoldiq: [Qoldiq] ta
     📝 Tavsif/Xususiyatlar: [Tavsif]

     Ushbu mahsulotni bazaga qo‘shishni tasdiqlaysizmi?

5. Agar tovar nomi bo'yicha bir nechta variant mos kelsa:
   - Hech qanday ACTION yozmang, variantlarni sanab ko'rsating va aniqlik so'rang.

6. Agar tovar mavjud bo'lmasa va foydalanuvchi yangi tovar qo'shishni aytmagan bo'lsa:
   - "Bu mahsulotni topa olmadim. Mahsulot nomini aniqroq yozib ko‘ring yoki 'Yangi tovar qo'sh: ...' deb yozing."

7. FAQAT O'ZBEK TILIDA javob bering.`;

    try {
      const aiReply = await callGeminiApi(`Foydalanuvchi xabari: "${trimmedText}"`, systemPrompt);

      // --- 4.1 CHECK FOR PRICE UPDATE DIRECTIVE ---
      if (aiReply.includes('ACTION:PROPOSE_PRICE_UPDATE|')) {
        const match = aiReply.match(/ACTION:PROPOSE_PRICE_UPDATE\|([^|\r\n]+)\|([^|\r\n]+)(?:\|([^|\r\n]+))?/);
        if (match) {
          const targetProdId = match[1].trim();
          const newPriceRaw = match[2].trim();
          const newMinPriceRaw = (match[3] || 'KEEP').trim();
          const foundProd = (allProducts || []).find(p => String(p.id) === targetProdId);

          if (foundProd) {
            const parsedNewPrice = newPriceRaw !== 'KEEP' ? parseInt(newPriceRaw, 10) : 'KEEP';
            const parsedNewMinPrice = newMinPriceRaw !== 'KEEP' ? parseInt(newMinPriceRaw, 10) : 'KEEP';

            session.pendingAction = {
              type: 'update_price',
              productId: foundProd.id,
              productName: foundProd.name || foundProd.title || 'Mahsulot',
              oldPrice: foundProd.price || 0,
              oldMinPrice: foundProd.minPrice || foundProd.price || 0,
              newPrice: parsedNewPrice,
              newMinPrice: parsedNewMinPrice
            };

            const cleanReply = aiReply.replace(/ACTION:PROPOSE_PRICE_UPDATE\|[^\r\n]+\r?\n?/, '').trim();
            return {
              reply: cleanReply,
              status: 'confirmation_required',
              pending: session.pendingAction
            };
          }
        }
      }

      // --- 4.2 CHECK FOR STOCK UPDATE DIRECTIVE ---
      if (aiReply.includes('ACTION:PROPOSE_STOCK_UPDATE|')) {
        const match = aiReply.match(/ACTION:PROPOSE_STOCK_UPDATE\|([^|\r\n]+)\|(\d+)/);
        if (match) {
          const targetProdId = match[1].trim();
          const targetStock = parseInt(match[2].trim(), 10);
          const foundProd = (allProducts || []).find(p => String(p.id) === targetProdId);

          if (foundProd) {
            session.pendingAction = {
              type: 'update_stock',
              productId: foundProd.id,
              productName: foundProd.name || foundProd.title || 'Mahsulot',
              oldStock: foundProd.stock || 0,
              newStock: targetStock
            };

            const cleanReply = aiReply.replace(/ACTION:PROPOSE_STOCK_UPDATE\|[^\r\n]+\r?\n?/, '').trim();
            return {
              reply: cleanReply,
              status: 'confirmation_required',
              pending: session.pendingAction
            };
          }
        }
      }

      // --- 4.3 CHECK FOR CREATE PRODUCT DIRECTIVE ---
      if (aiReply.includes('ACTION:PROPOSE_CREATE_PRODUCT|')) {
        const lineMatch = aiReply.match(/ACTION:PROPOSE_CREATE_PRODUCT\|([^\r\n]+)/);
        if (lineMatch) {
          const rawData = lineMatch[1].trim();
          let parsedData = null;
          try {
            parsedData = JSON.parse(rawData);
          } catch (e) {
            const parts = rawData.split('|');
            if (parts.length >= 3) {
              parsedData = {
                name: parts[0]?.trim(),
                brand: parts[1]?.trim() || 'Boshqa',
                category: parts[2]?.trim() || 'noutbuklar',
                price: parseInt(parts[3]?.trim(), 10) || 0,
                minPrice: parseInt(parts[4]?.trim(), 10) || parseInt(parts[3]?.trim(), 10) || 0,
                stock: parseInt(parts[5]?.trim(), 10) || 10,
                description: parts[6]?.trim() || parts[0]?.trim()
              };
            }
          }

          if (parsedData && parsedData.name) {
            session.pendingAction = {
              type: 'create_product',
              productData: parsedData
            };

            const cleanReply = aiReply.replace(/ACTION:PROPOSE_CREATE_PRODUCT\|[^\r\n]+\r?\n?/, '').trim();
            return {
              reply: cleanReply,
              status: 'confirmation_required',
              pending: session.pendingAction
            };
          }
        }
      }

      // Default AI message
      return {
        reply: aiReply,
        status: 'ai_reply'
      };

    } catch (err) {
      console.warn("Gemini API call failed, using smart offline fallback:", err.message);

      if (lowerText.includes('salom') || lowerText.includes('assalomu')) {
        return {
          reply: "Assalomu alaykum! Men MiniShop AI Admin Maslahatchisiman. Do‘kon mahsulotlari narxi, minimal narxi, qoldig‘i va yangi mahsulot qo‘shishda yordam beraman.",
          status: 'greeting'
        };
      }

      return {
        reply: "⚠️ AI xizmatida vaqtinchalik muammo yuz berdi. Iltimos, qaytadan urinib ko‘ring.",
        status: 'error'
      };
    }
  }
}

module.exports = {
  AiAdminAssistant,
  logAuditAction,
  getAuditLogs
};
