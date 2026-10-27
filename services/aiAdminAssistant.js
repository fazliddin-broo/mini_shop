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

function cleanAiResponseText(text) {
  let cleaned = String(text || '').trim();
  // Filter out internal monologue like "Tushundim. Bu foydalanuvchi bilan birinchi marta gaplashish."
  cleaned = cleaned.replace(/^(?:Tushundim\.|Xo'sh,|Albatta,|O'ylashimcha,)[^\n]*\n+/i, '').trim();
  return cleaned;
}

// ── LOCAL SMART PARSER FALLBACK (High Reliability) ──────────
function parsePriceIntentLocally(text, allProducts) {
  const clean = text.toLowerCase();
  const cleanNum = s => s ? parseInt(s.replace(/[\s\.\,]/g, ''), 10) : null;

  // Extract prices
  const priceMatch = clean.match(/narxi(?:ni)?\s*([0-9\s]{5,15})(?:qilib|qil|bo'lsin|so'm)/i);
  const minPriceMatch = clean.match(/minimal[^\d]*?([0-9\s]{5,15})(?:qilib|qil|bo'lsin|so'm)/i);

  const priceVal = priceMatch ? cleanNum(priceMatch[1]) : null;
  const minPriceVal = minPriceMatch ? cleanNum(minPriceMatch[1]) : null;

  if (!priceVal && !minPriceVal) return null;

  // Find product by keyword overlap
  let bestProd = null;
  let bestScore = 0;

  for (const p of allProducts) {
    const prodName = (p.name || p.title || '').toLowerCase();
    const words = prodName.split(/\s+/).filter(w => w.length > 2);
    let score = 0;
    for (const w of words) {
      if (clean.includes(w)) score++;
    }
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

// ── GEMINI API CALLER WITH MULTI-MODEL FALLBACK ────────────
async function callGeminiApi(prompt, systemInstruction = '', apiKey = null) {
  const fallbackKey = Buffer.from('QVEuQWI4Uk42Sk8xSXB2NG1YZy1sdVNnMVZ3QWVJM0lyakZRbW0wU2pydVlLdWJXNF8ycnc=', 'base64').toString('utf8');
  const geminiKey = (apiKey || process.env.GEMINI_API_KEY || fallbackKey).trim();
  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY belgilanmagan!');
  }

  const models = [
    'gemini-3-flash-preview',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite-preview',
    'gemini-2.5-flash'
  ];
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
      if (text) return cleanAiResponseText(text);
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

  async processAdminMessage({ text = '', imageUrl = null, adminUser = 'Admin', channel = 'telegram', sessionId = 'default' }) {
    const session = getSession(sessionId);
    const trimmedText = String(text || '').trim();
    const lowerText = trimmedText.toLowerCase();

    // ─────────────────────────────────────────────────────────────
    // 1. CONFIRMATION HANDLING (Agar tasdiq kutayotgan harakat bo'lsa)
    // ─────────────────────────────────────────────────────────────
    if (session.pendingAction) {
      const isAffirmative = [
        'ha', 'xa', 'albatta', 'tasdiqlayman', 'bajar', 'ok', 'yes', 'mayli',
        'shular', 'ha shular', 'shularmi hammasi ha', 'ha bazaga', 'ha bazaga qo\'shilsin',
        'ha qoshilsin', 'ha qo\'shilsin', 'ha o\'zgartirilsin', 'o\'zgartirilsin', 'qo\'shilsin',
        '✅ ha, tasdiqlayman', '✅ ha, o\'zgartirilsin', '✅ ha, bazaga qo\'shilsin', '✅ ha'
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
                reply: "⚠️ Mahsulotni o‘zgartirishda xatolik yuz berdi. O‘zgarish saqlanmadi.",
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
              reply: `✅ <b>Tayyor!</b> ${action.productName} narxi ${parts.join(' va ')}ga muvaffaqiyatli o‘zgartirildi.`,
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
              reply: `✅ <b>Muvaffaqiyatli qo‘shildi!</b>\n\n` +
                     `🆕 <b>${created.name || created.title}</b> bazaga kiritildi.\n` +
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
          reply: "❌ Bekor qilindi. Baza o‘zgarishsiz qoldi.",
          status: 'cancelled'
        };
      }

      // If in create_product confirmation, and user uploads image or extra info instead of saying yes/no
      if (session.pendingAction.type === 'create_product') {
        const prod = session.pendingAction.productData;
        if (imageUrl) {
          prod.image = imageUrl;
          prod.images = [imageUrl];
        }
        if (trimmedText) {
          // If user gives more info, append or refine description
          prod.description = (prod.description ? (prod.description + ' | ') : '') + trimmedText;
        }

        return {
          reply: `Yangi mahsulot ma’lumotlari yangilandi:\n\n` +
                 `🆕 Nomi: <b>${prod.name}</b>\n` +
                 `🏷 Brend: <b>${prod.brand}</b> | Toifa: <b>${prod.category}</b>\n` +
                 `💰 Sotuv narxi: <b>${formatSum(prod.price)}</b>\n` +
                 `📉 Minimal narx: <b>${formatSum(prod.minPrice)}</b>\n` +
                 `📦 Qoldiq: <b>${prod.stock} ta</b>\n` +
                 `🖼 Rasm: ${prod.image ? 'Yuklandi ✅' : 'Standart rasm'}\n\n` +
                 `Shularmi hammasi? Bazaga qo‘shaymi?`,
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
    // 3. TRY LOCAL PARSING (Instant, Bulletproof for Spikes)
    // ─────────────────────────────────────────────────────────────
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

      const sotuvQatori = localParsed.newPrice !== 'KEEP' ? `💰 Sotuv narxi: ${formatSum(p.price)} ➡️ <b>${formatSum(localParsed.newPrice)}</b>\n` : '';
      const minQatori = localParsed.newMinPrice !== 'KEEP' ? `📉 Minimal narx (AI tushib berishi mumkin bo'lgan chegara): ${formatSum(p.minPrice || p.price)} ➡️ <b>${formatSum(localParsed.newMinPrice)}</b>\n` : '';

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

    // ─────────────────────────────────────────────────────────────
    // 4. CALL GEMINI FOR NATURAL LANGUAGE REASONING
    // ─────────────────────────────────────────────────────────────
    const catalogSummary = (allProducts || []).map(p => {
      const prodName = p.name || p.title || 'Nomsiz tovar';
      const specsStr = Array.isArray(p.specs) ? p.specs.join(', ') : '';
      return `[ID: ${p.id}] ${prodName} | Brend: ${p.brand || 'Boshqa'} | Kategoriya: ${p.category || ''} | Sotuv narxi: ${p.price || 0} so'm | Minimal narx: ${p.minPrice || p.price || 0} so'm | Qoldiq: ${p.stock || 0} ta | Xususiyatlar: ${specsStr}`;
    }).join('\n');

    const systemPrompt = `Siz MiniShop do'konining aqlli, tajribali va do'stona O'zbek tilidagi AI Admin Yordamchisisiz.
Magazin egasining erkin o'zbek tilidagi buyruqlarini tushunib, tovarlar bazasini boshqarasiz.

DO'KON BAZASIDAGI BARCHA TOVARLAR RO'YXATI:
${catalogSummary || "(Hozircha baza bo'sh)"}

MUHIM QOIDALAR:
1. SOTUV VA/YOKI MINIMAL NARXNI (minPrice - AI tushib berishi kerak bo'lgan narx) O'ZGARTIRISH:
   Agar foydalanuvchi mavjud tovarning sotuv narxini, minimal narxini yoki ikkalasini o'zgartirishni aytsa:
   - Tovarni ro'yxatdan toping.
   - Birinchi qatorga FAQAT mana bu direktivani yozing:
     ACTION:PROPOSE_PRICE_UPDATE|<PRODUCT_ID>|<YANGI_SOTUV_NARXI_YOKI_KEEP>|<YANGI_MIN_NARXI_YOKI_KEEP>
   (Masalan: ACTION:PROPOSE_PRICE_UPDATE|prod-106|3100000|3000000)
   - Keyingi qatorlarda esa o'zbekcha yozing:
     Men quyidagi mahsulotni topdim:

     📱 [Tovar nomi]
     💰 Yangi sotuv narxi: [Yangi sotuv narxi] so'm
     📉 Yangi minimal narx: [Yangi minimal narx] so'm

     Narxlarni o‘zgartiraymi?

2. YANGI MAHSULOT QO'SHISH:
   Agar foydalanuvchi yangi mahsulot ma'lumotlarini kiritsa:
   - Birinchi qatorga FAQAT mana bu direktivani JSON ko'rinishida yozing:
     ACTION:PROPOSE_CREATE_PRODUCT|{"name":"...","brand":"...","category":"...","price":...,"minPrice":...,"stock":...,"description":"...","specs":["..."]}
   - Keyingi qatorlarda foydalanuvchidan tasdiq so'rang:
     Yangi mahsulot ma’lumotlarini tayyorladim:

     🆕 Nomi: [Nomi]
     🏷 Brend: [Brend] | Toifa: [Toifa]
     💰 Sotuv narxi: [Narx] so'm
     📉 Minimal narx: [Min narx] so'm
     📦 Qoldiq: [Qoldiq] ta
     📝 Tavsif/Xususiyatlar: [Tavsif]

     Shularmi hammasi? Bazaga qo‘shaymi yoki yana biror ma’lumot (yoki rasm) qo‘shasizmi?

3. Qisqa salomlashilsa do'stona salom berib, 2 ta asosiy imkoniyatni ayting.
4. Ichki monolog (masalan: "Tushundim. Bu foydalanuvchi...") yozmang, to'g'ridan-to'g'ri o'zbekcha javob bering.`;

    try {
      const aiReply = await callGeminiApi(`Foydalanuvchi xabari: "${trimmedText}"`, systemPrompt);

      // --- 4.1 PRICE UPDATE DIRECTIVE ---
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

      // --- 4.2 CREATE PRODUCT DIRECTIVE ---
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
      console.warn("AI processing warning:", err.message);

      return {
        reply: "Assalomu alaykum! Men MiniShop AI Yordamchingizman. Mahsulot va minimal narxlarni o‘zgartirish yoki yangi tovar qo‘shishda yordam beraman.",
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
