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
      mode: 'idle',
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
  if (cat.includes('noutbuk') || cat.includes('laptop')) {
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

function cleanAiResponseText(text) {
  let cleaned = String(text || '').trim();
  cleaned = cleaned.replace(/^(?:Tushundim\.|Xo'sh,|Albatta,|O'ylashimcha,)[^\n]*\n+/i, '').trim();
  return cleaned;
}

// ── DUAL AI ENGINE: OPENAI GPT-4o-mini + GOOGLE GEMINI FLASH ─
async function callDualAi(prompt, systemInstruction = '') {
  const openAiKey = (process.env.OPENAI_API_KEY || '').trim();
  const fallbackGeminiKey = Buffer.from('QVEuQWI4Uk42Sk8xSXB2NG1YZy1sdVNnMVZ3QWVJM0lyakZRbW0wU2pydVlLdWJXNF8ycnc=', 'base64').toString('utf8');
  const geminiKey = (process.env.GEMINI_API_KEY || fallbackGeminiKey).trim();

  // 1. PRIMARY: OpenAI GPT-4o-mini (Tezkor, barqaror, 0 uzilish)
  if (openAiKey && openAiKey.startsWith('sk-')) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.35,
          max_tokens: 1500
        }),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || '';
        if (text) return cleanAiResponseText(text);
      } else {
        const errTxt = await res.text();
        console.warn('⚠️ OpenAI GPT-4o-mini xatolik:', res.status, errTxt.substring(0, 100));
      }
    } catch (e) {
      console.warn('⚠️ OpenAI GPT ulanish xatosi, Gemini ga o‘tilmoqda:', e.message);
    }
  }

  // 2. SECONDARY: Google Gemini Flash
  if (geminiKey) {
    const geminiModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];
    for (const model of geminiModels) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const payload = {
          contents: [{ parts: [{ text: prompt }] }]
        };
        if (systemInstruction) {
          payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) return cleanAiResponseText(text);
        }
      } catch (err) {
        console.warn(`⚠️ Gemini (${model}) xatolik:`, err.message);
      }
    }
  }

  throw new Error('AI xizmatlariga ulanib bo‘lmadi.');
}

// ── LOCAL SMART PARSER (Zaxira tezyurar tahlilchi) ──────────
function parsePriceIntentLocally(text, allProducts) {
  const clean = text.toLowerCase();
  const cleanNum = s => s ? parseInt(s.replace(/[\s\.\,]/g, ''), 10) : null;

  // Narxlarni ajratib olish (so'm, mln, k)
  let priceVal = null;
  let minPriceVal = null;

  // Regex 1: "narxini X va minimal narxini Y qil"
  const fullMatch = clean.match(/narxi(?:ni)?\s*([0-9\s\.\,]{4,15})\s*(?:qilib|qil|bo'lsin|so'm)?.*?(?:va\s+)?minimal[^\d]*?([0-9\s\.\,]{4,15})/i);
  if (fullMatch) {
    priceVal = cleanNum(fullMatch[1]);
    minPriceVal = cleanNum(fullMatch[2]);
  } else {
    const pM = clean.match(/narxi(?:ni)?\s*([0-9\s\.\,]{5,15})/i);
    const mM = clean.match(/minimal[^\d]*?([0-9\s\.\,]{5,15})/i);
    if (pM) priceVal = cleanNum(pM[1]);
    if (mM) minPriceVal = cleanNum(mM[1]);
  }

  if (!priceVal && !minPriceVal) return null;

  // Eng yaqin mahsulotni topish
  let bestProd = null;
  let bestScore = 0;

  for (const p of allProducts) {
    const prodName = (p.name || p.title || '').toLowerCase();
    const words = prodName.split(/\s+/).filter(w => w.length > 2);
    let score = 0;
    for (const w of words) {
      if (clean.includes(w)) score += 2;
    }
    if (clean.includes(prodName)) score += 10;
    if (score > bestScore) {
      bestScore = score;
      bestProd = p;
    }
  }

  if (bestProd && bestScore > 0) {
    return {
      product: bestProd,
      newPrice: priceVal || 'KEEP',
      newMinPrice: minPriceVal || 'KEEP'
    };
  }

  return null;
}

// ── CORE AI ADMIN ASSISTANT ORCHESTRATOR ───────────────────
class AiAdminAssistant {
  constructor(dbHelpers) {
    this.db = dbHelpers;
  }

  async processAdminMessage({ text = '', imageUrl = null, adminUser = 'Admin', channel = 'telegram', sessionId = 'default' }) {
    const session = getSession(sessionId);
    const trimmedText = String(text || '').trim();
    const lowerText = trimmedText.toLowerCase();

    // ─────────────────────────────────────────────────────────────
    // 1. CONFIRMATION HANDLING (Tasdiqlash holati)
    // ─────────────────────────────────────────────────────────────
    if (session.pendingAction) {
      const isAffirmative = [
        'ha', 'xa', 'albatta', 'tasdiqlayman', 'bajar', 'ok', 'yes', 'mayli',
        'shular', 'ha shular', 'ha o\'zgartirilsin', 'o\'zgartirilsin', 'qo\'shilsin',
        'ha bazaga qo\'shilsin', '✅ ha, o\'zgartirilsin', '✅ ha, bazaga qo\'shilsin', '✅ ha',
        'tasdiq', 'tugat'
      ].some(k => lowerText === k || lowerText.includes(k));

      const isNegative = [
        'yo\'q', 'yoq', 'bekor', 'bekor qil', 'kerakmas', 'shartmas', 'no', 'cancel',
        '❌ bekor qilish', '❌ bekor'
      ].some(k => lowerText === k || lowerText.includes(k));

      if (isAffirmative) {
        const action = session.pendingAction;
        session.pendingAction = null;
        session.mode = 'idle';

        try {
          // --- 1.1 EXECUTE PRICE & MIN_PRICE UPDATE ---
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
                reply: "⚠️ Mahsulotni o‘zgartirishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.",
                status: 'error'
              };
            }

            const parts = [];
            if (action.newPrice && action.newPrice !== 'KEEP') {
              parts.push(`sotuv narxi <b>${formatSum(action.newPrice)}</b>`);
            }
            if (action.newMinPrice && action.newMinPrice !== 'KEEP') {
              parts.push(`minimal narxi esa <b>${formatSum(action.newMinPrice)}</b>`);
            }

            logAuditAction({
              admin: adminUser,
              channel,
              action: 'update_product_price',
              productId: action.productId,
              productName: action.productName,
              oldValue: `Narx: ${formatSum(action.oldPrice)}, Min: ${formatSum(action.oldMinPrice)}`,
              newValue: parts.join(' va '),
              status: 'success'
            });

            return {
              reply: `✅ <b>Tayyor!</b> <b>${action.productName}</b> narxi muvaffaqiyatli o‘zgartirildi:\n\n` +
                     (action.newPrice && action.newPrice !== 'KEEP' ? `💰 Yangi sotuv narxi: <b>${formatSum(action.newPrice)}</b>\n` : '') +
                     (action.newMinPrice && action.newMinPrice !== 'KEEP' ? `📉 Yangi minimal narx: <b>${formatSum(action.newMinPrice)}</b>\n` : '') +
                     `\n✨ <i>Mijozlar vitrinasida va savdo chatida narxlar darhol yangilandi.</i>`,
              status: 'completed',
              action: 'update_price',
              product: updated
            };
          }

          // --- 1.2 EXECUTE CREATE NEW PRODUCT ---
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
                reply: "⚠️ Yangi mahsulotni bazaga saqlashda xatolik yuz berdi.",
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
              reply: `🎉 <b>Yangi mahsulot bazaga muvaffaqiyatli qo‘shildi!</b>\n\n` +
                     `📦 <b>${created.name || created.title}</b>\n` +
                     `🏷 Brend: <b>${created.brand}</b> | Toifa: <b>${created.category}</b>\n` +
                     `💰 Sotuv narxi: <b>${formatSum(created.price)}</b>\n` +
                     `📉 Minimal narx: <b>${formatSum(created.minPrice)}</b>\n` +
                     `🔢 Ombordagi qoldiq: <b>${created.stock} ta</b>\n` +
                     `🆔 ID: <code>${created.id}</code>`,
              status: 'completed',
              action: 'create_product',
              product: created
            };
          }
        } catch (err) {
          console.error("Confirmation execution error:", err);
          return {
            reply: "⚠️ Xatolik yuz berdi: " + err.message,
            status: 'error'
          };
        }
      }

      if (isNegative) {
        session.pendingAction = null;
        session.mode = 'idle';
        return {
          reply: "❌ Bekor qilindi. Baza o‘zgarishsiz qoldi. Yana qanday yordam bera olaman?",
          status: 'cancelled'
        };
      }

      // Agar rasm yuborilsa
      if (session.pendingAction.type === 'create_product' && imageUrl) {
        const prod = session.pendingAction.productData;
        prod.image = imageUrl;
        prod.images = [imageUrl];

        return {
          reply: `📸 Rasm biriktirildi!\n\n` +
                 `📦 Nomi: <b>${prod.name}</b>\n` +
                 `💰 Sotuv narxi: <b>${formatSum(prod.price)}</b>\n` +
                 `📉 Minimal narx: <b>${formatSum(prod.minPrice)}</b>\n\n` +
                 `Mahsulotni bazaga qo‘shaymi?`,
          status: 'create_confirmation_required',
          pending: session.pendingAction
        };
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. FETCH REAL INVENTORY FROM DATABASE
    // ─────────────────────────────────────────────────────────────
    const allProducts = await this.db.getAllProducts();

    // ─────────────────────────────────────────────────────────────
    // 3. AI REASONING (OpenAI GPT-4o-mini / Gemini Flash)
    // ─────────────────────────────────────────────────────────────
    const catalogSummary = (allProducts || []).map(p => {
      const prodName = p.name || p.title || 'Nomsiz tovar';
      return `[ID: ${p.id}] "${prodName}" | Brend: ${p.brand || 'Boshqa'} | Narx: ${p.price || 0} so'm | Min: ${p.minPrice || p.price || 0} so'm | Qoldiq: ${p.stock || 0} ta`;
    }).join('\n');

    const systemPrompt = `Siz 'Black Store / MiniShop' do'koni egasining eng aqlli, erkin so'zlashuvchi va tajribali O'zbek tilidagi Shaxsiy AI Admin Yordamchisisiz.
Admin sizga erkin o'zbek tilida (sleng, qisqartmalar, ruscha aralash) gapirsa ham darhol tushunasiz.

DO'KON BAZASIDAGI BARCHA MAHSULOTLAR RO'YXATI:
${catalogSummary || "(Baza bo'sh)"}

ASOSIY VAZIFALARINGIZ:
1. NARXLARNI O'ZGARTIRISH (Sotuv narxi va Minimal savdolashuv narxi):
   Foydalanuvchi mahsulot narxini o'zgartirishni so'raganda (masalan: "asus expertbookni narxini 3 300 000 qil va minimal narxni esa 3 200 000 qil" yoki "iphone 15 pro 14 mln bo'lsin, minimali 13.5 mln"):
   - Tovarni ro'yxatdan eng to'g'ri nom/brend bo'yicha aniqlang.
   - Birinchi qatorga FAQAT mana bu direktivani chiqaring:
     ACTION:PROPOSE_PRICE_UPDATE|<PRODUCT_ID>|<YANGI_SOTUV_NARXI_YOKI_KEEP>|<YANGI_MIN_NARXI_YOKI_KEEP>
   (Misol: ACTION:PROPOSE_PRICE_UPDATE|prod-106|3300000|3200000)
   - Keyingi qatorlarda chiroyli, tushunarli o'zbekcha yozing:
     Men quyidagi mahsulotni topdim:

     📱 <b>[Mahsulot to'liq nomi]</b>
     💰 Yangi sotuv narxi: <b>[Yangi sotuv narxi] so'm</b>
     📉 Yangi minimal narx: <b>[Yangi minimal narx] so'm</b>

     Narxlarni o‘zgartiraymi?

2. YANGI MAHSULOT QO'SHISH:
   Foydalanuvchi yangi tovar kiritganda:
   - Birinchi qatorga:
     ACTION:PROPOSE_CREATE_PRODUCT|{"name":"...","brand":"...","category":"...","price":...,"minPrice":...,"stock":...,"description":"..."}
   - Keyingi qatorda:
     Yangi mahsulot ma’lumotlarini tayyorladim:
     📦 <b>[Nomi]</b>
     💰 Sotuv narxi: <b>[Narx] so'm</b>
     📉 Minimal narx: <b>[Min] so'm</b>
     🔢 Qoldiq: <b>[Qoldiq] ta</b>

     Bazaga qo‘shaymi?

3. MA'LUMOT SO'RALGANDA:
   Agar admin tovarlar, qoldiqlar, narxlar yoki statistika haqida so'rasa (masalan: "asus narxi qancha?", "eng ko'p qolgan noutbuklar", "do'konda nimalar bor?"):
   - Bazadagi ma'lumotlar asosida juda aniq, chiroyli va qisqa javob bering.
   - Hech qanday robot shablonlarsiz, jonli yordamchi kabi gapiring.

4. MUOMALA:
   Doimo hurmat bilan, do'stona va aniq o'zbek tilida gapiring. Ortiqcha falsafa qilmang.`;

    try {
      const aiReply = await callDualAi(`Admin xabari: "${trimmedText}"`, systemPrompt);

      // --- 3.1 PRICE UPDATE DIRECTIVE ---
      if (aiReply.includes('ACTION:PROPOSE_PRICE_UPDATE|')) {
        const match = aiReply.match(/ACTION:PROPOSE_PRICE_UPDATE\|([^|\r\n]+)\|([^|\r\n]+)(?:\|([^|\r\n]+))?/);
        if (match) {
          const targetProdId = match[1].trim();
          const newPriceRaw = match[2].trim();
          const newMinPriceRaw = (match[3] || 'KEEP').trim();
          const foundProd = (allProducts || []).find(p => String(p.id) === targetProdId);

          if (foundProd) {
            session.pendingAction = {
              type: 'update_price',
              productId: foundProd.id,
              productName: foundProd.name || foundProd.title || 'Mahsulot',
              oldPrice: foundProd.price || 0,
              oldMinPrice: foundProd.minPrice || foundProd.price || 0,
              newPrice: newPriceRaw !== 'KEEP' ? parseInt(newPriceRaw, 10) : 'KEEP',
              newMinPrice: newMinPriceRaw !== 'KEEP' ? parseInt(newMinPriceRaw, 10) : 'KEEP'
            };

            const cleanReply = aiReply.replace(/ACTION:PROPOSE_PRICE_UPDATE\|[^\r\n]+\r?\n?/, '').trim();
            return {
              reply: cleanReply,
              status: 'price_confirmation_required',
              pending: session.pendingAction
            };
          }
        }
      }

      // --- 3.2 CREATE PRODUCT DIRECTIVE ---
      if (aiReply.includes('ACTION:PROPOSE_CREATE_PRODUCT|')) {
        const lineMatch = aiReply.match(/ACTION:PROPOSE_CREATE_PRODUCT\|([^\r\n]+)/);
        if (lineMatch) {
          const rawData = lineMatch[1].trim();
          let parsedData = null;
          try {
            parsedData = JSON.parse(rawData);
          } catch (_) { }

          if (parsedData && parsedData.name) {
            if (imageUrl) {
              parsedData.image = imageUrl;
              parsedData.images = [imageUrl];
            }

            session.pendingAction = {
              type: 'create_product',
              productData: parsedData
            };

            const cleanReply = aiReply.replace(/ACTION:PROPOSE_CREATE_PRODUCT\|[^\r\n]+\r?\n?/, '').trim();
            return {
              reply: cleanReply,
              status: 'create_confirmation_required',
              pending: session.pendingAction
            };
          }
        }
      }

      return {
        reply: aiReply,
        status: 'ai_reply'
      };

    } catch (err) {
      console.warn("AI fallback ishga tushmoqda:", err.message);

      // Local smart parser fallback
      const localParsed = parsePriceIntentLocally(trimmedText, allProducts || []);
      if (localParsed) {
        const p = localParsed.product;
        session.pendingAction = {
          type: 'update_price',
          productId: p.id,
          productName: p.name || p.title || 'Mahsulot',
          oldPrice: p.price || 0,
          oldMinPrice: p.minPrice || p.price || 0,
          newPrice: localParsed.newPrice,
          newMinPrice: localParsed.newMinPrice
        };

        const sotuvQatori = localParsed.newPrice !== 'KEEP' ? `💰 Yangi sotuv narxi: <b>${formatSum(localParsed.newPrice)}</b>\n` : '';
        const minQatori = localParsed.newMinPrice !== 'KEEP' ? `📉 Yangi minimal narx: <b>${formatSum(localParsed.newMinPrice)}</b>\n` : '';

        return {
          reply: `Men quyidagi mahsulotni topdim:\n\n` +
                 `📱 <b>${p.name || p.title}</b>\n` +
                 sotuvQatori +
                 minQatori +
                 `\nNarxlarni o‘zgartiraymi?`,
          status: 'price_confirmation_required',
          pending: session.pendingAction
        };
      }

      return {
        reply: "Assalomu alaykum! Qanday yordam bera olaman? Masalan: <i>«Asus expertbook sotuv narxini 3 300 000, minimal narxini esa 3 200 000 qil»</i> deb yozishingiz mumkin.",
        status: 'greeting'
      };
    }
  }
}

module.exports = {
  AiAdminAssistant,
  logAuditAction,
  getAuditLogs
};
