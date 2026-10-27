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
  // Keep last 1000 logs
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

function clearPendingAction(sessionId) {
  const s = getSession(sessionId);
  s.pendingAction = null;
}

// ── UZBEK CURRENCY AND NUMBER PARSER ───────────────────────
function parseUzbekNumber(str) {
  if (!str) return null;
  const s = String(str).toLowerCase().trim().replace(/\s+/g, '');

  // 13.5 mln / 13.5 million / 13.5m / 13,5 mln
  const mlnMatch = s.match(/(\d+(?:[.,]\d+)?)(?:mln|million|m)/);
  if (mlnMatch) {
    const num = parseFloat(mlnMatch[1].replace(',', '.'));
    return Math.round(num * 1000000);
  }

  // 500 ming / 500k
  const mingMatch = s.match(/(\d+(?:[.,]\d+)?)(?:ming|k)/);
  if (mingMatch) {
    const num = parseFloat(mingMatch[1].replace(',', '.'));
    return Math.round(num * 1000);
  }

  // Oddiy raqam (masalan 13500000 yoki 13500000so'm)
  const plainMatch = s.match(/\d+/g);
  if (plainMatch) {
    const combined = plainMatch.join('');
    const val = parseInt(combined, 10);
    if (!isNaN(val) && val > 0) return val;
  }

  return null;
}

function formatSum(num) {
  return Number(num || 0).toLocaleString('uz-UZ') + " so'm";
}

// ── PRODUCT SEARCH LOGIC ───────────────────────────────────
function searchMatchingProducts(products, query) {
  if (!query || !query.trim()) return [];
  const qTokens = query.toLowerCase()
    .replace(/[+,-./()]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !['narxi', 'narxini', 'narx', 'qil', 'qilib', 'ber', 'ga', 'ni', 'so\'m', 'som', 'somga', 'so\'mga'].includes(t));

  if (qTokens.length === 0) return [];

  const scored = products.map(p => {
    let score = 0;
    const pName = (p.name || '').toLowerCase();
    const pBrand = (p.brand || '').toLowerCase();
    const pDesc = (p.description || '').toLowerCase();
    const pSpecs = Array.isArray(p.specs) ? p.specs.join(' ').toLowerCase() : '';
    const fullText = `${pName} ${pBrand} ${pDesc} ${pSpecs}`;

    for (const token of qTokens) {
      if (pName.includes(token)) score += 10;
      else if (pSpecs.includes(token)) score += 7;
      else if (pBrand.includes(token)) score += 5;
      else if (pDesc.includes(token)) score += 2;
    }

    // SIM / eSIM / Rang tokenlari uchun aniq ballar
    if (query.toLowerCase().includes('esim') && pSpecs.includes('esim')) score += 8;
    if (query.toLowerCase().includes('sim+esim') && (pName.includes('sim+esim') || pSpecs.includes('sim+esim'))) score += 15;
    if (query.toLowerCase().includes('burgundy') && (pName.includes('burgundy') || pSpecs.includes('burgundy'))) score += 15;
    if (query.toLowerCase().includes('black') && (pName.includes('black') || pSpecs.includes('black'))) score += 15;
    if (query.toLowerCase().includes('titanium') && (pName.includes('titanium') || pSpecs.includes('titanium'))) score += 15;

    // Raqamli model tokenlari (masalan: s99, s24, 18, 16, 15, m3)
    // Agar foydalanuvchi aniq raqamli model so'rasa va tovar matnida u umuman bo'lmasa, uni rad etamiz!
    const digitModelTokens = qTokens.filter(t => /\d/.test(t));
    for (const dmt of digitModelTokens) {
      if (!fullText.includes(dmt)) {
        score = 0;
        break;
      }
    }

    return { product: p, score };
  });

  const matching = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matching.length === 0) return [];

  // Agar 1-o'rindagi tovar boshqalaridan sezilarli darajada aniqroq bo'lsa
  const topScore = matching[0].score;
  const topMatches = matching.filter(m => m.score >= topScore * 0.85);

  return topMatches.map(m => m.product);
}

// ── GEMINI API CALLER WITH ERROR HANDLING ──────────────────
async function callGeminiApi(prompt, systemInstruction = '', apiKey = null) {
  const geminiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY belgilanmagan!');
  }

  const model = 'gemini-2.5-flash';
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
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timer);

    const data = await res.json();
    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text.trim();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ── CORE AI ADMIN ASSISTANT ORCHESTRATOR ───────────────────
class AiAdminAssistant {
  constructor(dbHelpers) {
    this.db = dbHelpers; // { getAllProducts, getProductById, updateProduct, deleteProduct, createProduct }
  }

  async processAdminMessage({ text, adminUser = 'Admin', channel = 'dashboard', sessionId = 'default' }) {
    if (!text || !text.trim()) {
      return { reply: "Xabar matni bo'sh bo'lishi mumkin emas.", status: 'empty' };
    }

    const trimmedText = text.trim();
    const session = getSession(sessionId);
    const lowerText = trimmedText.toLowerCase();

    // 1. CONFIRMATION CHECK (Agar oldingi so'rov tasdiqlash kutayotgan bo'lsa)
    if (session.pendingAction) {
      const isAffirmative = [
        'ha', 'xa', 'albatta', 'o\'zgartir', 'ozgartir', 'ha o\'zgartir', 'tasdiqlayman', 'mayli', 'yes', 'ok', 'bajar', 'davom et'
      ].some(k => lowerText === k || lowerText.startsWith(k + ' ') || lowerText.endsWith(' ' + k));

      const isNegative = [
        'yo\'q', 'yoq', 'kerakmas', 'bekor qil', 'bekor', 'shartmas', 'no', 'cancel', 'to\'xtat'
      ].some(k => lowerText === k || lowerText.startsWith(k + ' '));

      if (isAffirmative) {
        const action = session.pendingAction;
        session.pendingAction = null; // Clear immediately

        try {
          if (action.type === 'update_price') {
            const updated = await this.db.updateProduct(action.productId, {
              price: action.newPrice,
              priceUsd: Math.round(action.newPrice / 12800)
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
              action: 'update_product_price',
              productId: action.productId,
              productName: action.productName,
              oldValue: formatSum(action.oldPrice),
              newValue: formatSum(action.newPrice),
              status: 'success'
            });

            return {
              reply: `✅ Tayyor. ${action.productName} narxi ${formatSum(action.newPrice)}ga o‘zgartirildi.`,
              status: 'completed',
              action: 'update_price',
              product: updated
            };
          }

          if (action.type === 'update_stock') {
            const updated = await this.db.updateProduct(action.productId, {
              stock: action.newStock
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
              reply: `✅ Tayyor. ${action.productName} qoldig‘i (stock) ${action.newStock} taga yangilandi.`,
              status: 'completed',
              action: 'update_stock',
              product: updated
            };
          }

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
            reply: "⚠️ Mahsulotni o‘zgartirishda xatolik yuz berdi. O‘zgarish saqlanmadi.",
            status: 'error'
          };
        }
      }

      if (isNegative) {
        session.pendingAction = null;
        return {
          reply: "❌ Amal bekor qilindi. Hech qanday o‘zgarish kiritilmadi.",
          status: 'cancelled'
        };
      }
    }

    // 2. PARSE INTENT (Natural Language Uzbek Analysis)
    const allProducts = await this.db.getAllProducts();

    // Maxsus: narx o'zgartirish buyruqlari ("... narxini 13.5 mln qil")
    const isPriceChangeIntent = [
      'narx', 'narxini', 'narxini o\'zgartir', 'qil', 'tushir', 'kotar', "ko'tar", 'qoy', "qo'y"
    ].some(k => lowerText.includes(k));

    const detectedPrice = parseUzbekNumber(trimmedText);

    // A) Narxni aniq o'zgartirish oqimi
    if (detectedPrice && isPriceChangeIntent) {
      // Mahsulot nomini ajratib olish (narx va buyruq so'zlarini tozalab, lekin model raqamlarini saqlab qolgan holda)
      const cleanedQuery = trimmedText
        .replace(/(?:\b\d+(?:[.,]\d+)?\s*(?:mln|million|ming|so'?m)\b|\b\d{6,}\b)/gi, '')
        .replace(/(?:\bnarxini\b|\bnarxi\b|\bnarx\b|\bqil\b|\bqilib\b|\bber\b|\btushir\b|\bko'tar\b|\bkotar\b|\bo'zgartir\b|\bozgartir\b|\bga\b|\bni\b)/gi, '')
        .trim();

      const matches = searchMatchingProducts(allProducts, cleanedQuery || trimmedText);

      if (matches.length === 0) {
        return {
          reply: "Bu mahsulotni topa olmadim. Mahsulot nomini yoki variantini aniqroq yozib ko‘ring.",
          status: 'not_found'
        };
      }

      if (matches.length === 1) {
        const prod = matches[0];
        const oldPrice = prod.price || 0;

        // Extract specs highlights (color, SIM)
        let color = '';
        let sim = '';
        if (Array.isArray(prod.specs)) {
          prod.specs.forEach(s => {
            const sl = s.toLowerCase();
            if (sl.includes('rang:')) color = s.replace(/rang:/i, '').trim();
            if (sl.includes('sim:')) sim = s.replace(/sim:/i, '').trim();
          });
        }
        if (!color) {
          if (prod.name.toLowerCase().includes('burgundy')) color = 'Burgundy';
          else if (prod.name.toLowerCase().includes('black')) color = 'Black';
          else if (prod.name.toLowerCase().includes('titanium')) color = 'Natural Titanium';
        }
        if (!sim) {
          if (prod.name.toLowerCase().includes('sim+esim')) sim = 'SIM + eSIM';
          else if (prod.name.toLowerCase().includes('esim')) sim = 'eSIM';
          else if (prod.name.toLowerCase().includes('sim')) sim = 'Fizik SIM';
        }

        // Save to pendingAction
        session.pendingAction = {
          type: 'update_price',
          productId: prod.id,
          productName: prod.name,
          oldPrice: oldPrice,
          newPrice: detectedPrice
        };

        const specsDetails = [
          `📱 ${prod.name}`,
          color ? `🎨 ${color}` : null,
          sim ? `🔌 ${sim}` : null,
          `💰 Hozirgi narx: ${formatSum(oldPrice)}`,
          `➡️ Yangi narx: ${formatSum(detectedPrice)}`
        ].filter(Boolean).join('\n');

        return {
          reply: `Men quyidagi mahsulotni topdim:\n\n${specsDetails}\n\nNarxni o‘zgartiraymi?`,
          status: 'confirmation_required',
          pending: session.pendingAction
        };
      }

      if (matches.length > 1) {
        const listText = matches.slice(0, 5).map((p, idx) => {
          let specStr = Array.isArray(p.specs) ? p.specs.slice(0, 2).join(' — ') : '';
          return `${idx + 1}. ${p.name}${specStr ? ' (' + specStr + ')' : ''} — ${formatSum(p.price)}`;
        }).join('\n');

        return {
          reply: `${matches.length} ta mahsulot topdim:\n\n${listText}\n\nQaysi birini o‘zgartiray? Iltimos, aniqroq variantini yozing.`,
          status: 'clarification_required',
          options: matches.map(m => ({ id: m.id, name: m.name, price: m.price }))
        };
      }
    }

    // B) Mahsulotni o'chirish buyrug'i
    if (lowerText.includes('o\'chir') || lowerText.includes('ochir') || lowerText.includes('delete')) {
      const cleanedQuery = trimmedText.replace(/(?:o'chir|ochir|delete|tashla|olib tashla|mahsulotni|ni)/gi, '').trim();
      const matches = searchMatchingProducts(allProducts, cleanedQuery);

      if (matches.length === 0) {
        return {
          reply: "O‘chirish uchun mahsulot topilmadi. Mahsulot nomini aniqroq yozing.",
          status: 'not_found'
        };
      }

      if (matches.length === 1) {
        const prod = matches[0];
        session.pendingAction = {
          type: 'delete_product',
          productId: prod.id,
          productName: prod.name
        };

        return {
          reply: `⚠️ DIQQAT: Siz "${prod.name}" (${formatSum(prod.price)}) mahsulotini bazadan butunlay o‘chirmoqchisiz.\n\nDavom etaymi? (Ha / Yo‘q)`,
          status: 'confirmation_required',
          pending: session.pendingAction
        };
      }

      if (matches.length > 1) {
        const listText = matches.slice(0, 5).map((p, idx) => `${idx + 1}. ${p.name} (${formatSum(p.price)})`).join('\n');
        return {
          reply: `Bir nechta mos mahsulot topildi:\n\n${listText}\n\nQaysi birini o‘chirmoqchisiz?`,
          status: 'clarification_required'
        };
      }
    }

    // C) Umumiy qidiruv yoki noaniq so'rov (Masalan: "iPhone 18 Pro narxini o'zgartir")
    const searchMatches = searchMatchingProducts(allProducts, trimmedText);

    if (searchMatches.length > 1) {
      const listText = searchMatches.slice(0, 5).map((p, idx) => {
        let specStr = Array.isArray(p.specs) ? p.specs.slice(0, 2).join(' — ') : '';
        return `${idx + 1}. ${p.name}${specStr ? ' (' + specStr + ')' : ''} — ${formatSum(p.price)}`;
      }).join('\n');

      return {
        reply: `${searchMatches.length} ta mahsulot topdim:\n\n${listText}\n\nQaysi birini o‘zgartiray?`,
        status: 'clarification_required',
        options: searchMatches.map(m => ({ id: m.id, name: m.name, price: m.price }))
      };
    }

    if (searchMatches.length === 1 && !isPriceChangeIntent) {
      const p = searchMatches[0];
      return {
        reply: `📱 Topilgan mahsulot: ${p.name}\n💰 Narxi: ${formatSum(p.price)}\n📦 Qoldiq: ${p.stock || 0} ta\nBu mahsulot bo‘yicha nima amal bajarmoqchisiz? (Masalan: "Narxini 13.5 mln qil" yoki "Qoldiqni 20 ta qil")`,
        status: 'found_single',
        product: p
      };
    }

    // D) GEMINI AI NATURAL CONVERSATION FALLBACK
    try {
      const systemInstruction = `Siz MiniShop do'koni uchun aqlli, professional va do'stona O'zbek tilidagi AI Admin Yordamchisisiz.
Vazifangiz: Magazin egasiga mahsulotlar, narxlar va qoldiqlarni boshqarishda yordam berish.
QOIDALAR:
1. FAQAT O'ZBEK TILIDA javob bering. Ingliz yoki rus so'zlarini ishlatmang.
2. Hech qachon yolg'on gapirmang yoki bazada o'zgartirildi deb aldamang.
3. Agar foydalanuvchi narx yoki mahsulotni o'zgartirmoqchi bo'lsa, mahsulot nomi va yangi qiymatni aniq qilib so'rang.
4. Javoblaringiz lo'nda, aniq va professional bo'lsin.
Mavjud tovarlar ro'yxatidan qisqa namunalar:
${allProducts.slice(0, 10).map(p => `- ${p.name}: ${formatSum(p.price)} (${p.stock || 0} ta)`).join('\n')}`;

      const aiReply = await callGeminiApi(trimmedText, systemInstruction);
      return {
        reply: aiReply,
        status: 'ai_reply'
      };
    } catch (err) {
      console.warn("Gemini call fallback error:", err.message);
      // Agar Gemini da tarmoq xatosi bo'lsa
      if (trimmedText.toLowerCase().includes('salom') || trimmedText.toLowerCase().includes('assalomu')) {
        return {
          reply: "Assalomu alaykum! Men MiniShop AI Admin Maslahatchisiman. Do‘kon mahsulotlari narxi, qoldig‘i va ma’lumotlarini o‘zgartirishda yordam bera olaman. Masalan: 'iPhone 18 Pro Burgundy narxini 13.5 mln qil'.",
          status: 'greeting'
        };
      }
      return {
        reply: "⚠️ AI xizmatida vaqtinchalik muammo yuz berdi. Iltimos, buyruqni qaytadan yuboring.",
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
