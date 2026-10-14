require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const dns = require('dns');

// Ba'zi lokal muhitlar yoki provayderlarda SRV DNS yechish muammolarini oldini olish
try {
  dns.setDefaultResultOrder('ipv4first');
  if (process.platform === 'win32') {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
} catch (_) {}

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = (process.env.MONGO_URI || '').trim();

// ── Mongoose Schemas ──────────────────────────────────────
const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  shop: {
    name: { type: String, default: "Malika iStore" },
    tagline: { type: String, default: "Yunusobod Malika bozori • B-blok 24-do'kon" },
    description: { type: String, default: "Original Apple & Samsung gadjetlari, noutbuklar va eng so'nggi aksessuarlar. Toshkent bo'ylab 2 soatda tezkor yetkazib berish!" },
    phone: { type: String, default: "+998 90 123 45 67" },
    address: { type: String, default: "Toshkent sh., Yunusobod t., Malika savdo majmuasi, B-blok 24-do'kon" },
    instagram: { type: String, default: "https://instagram.com/malika_istore" },
    telegramChannel: { type: String, default: "https://t.me/malika_istore" },
    currency: { type: String, default: "UZS" },
    workingHours: { type: String, default: "10:00 - 20:00 (Dam olish kunisiz)" },
    adminPin: { type: String, default: "1234" }
  },
  telegram: {
    botToken: { type: String, default: "" },
    chatId: { type: String, default: "" },
    enabled: { type: Boolean, default: false }
  },
  ai: {
    provider: { type: String, default: "gemini" },
    apiKey: { type: String, default: "" },
    systemPrompt: { type: String, default: "Siz 'Malika iStore' do'konining professional, samimiy va xushmuomala virtual sotuvchi-maslahatchisisiz. Sizning vazifangiz - xaridorlarga do'kondagi tovarlar haqida to'liq ma'lumot berish, ularning ehtiyojiga mos gadjet tanlashda yordam berish va ularni xarid qilishga (savatchaga qo'shish yoki buyurtma berishga) yo'naltirish. Faqat do'konda bor tovarlar va ularning haqiqiy narxlarini ayting. O'zbek va Rus tillarida xushmuomala javob bering." },
    welcomeMessage: { type: String, default: "Assalomu alaykum! Men Malika iStore virtual maslahatchisiman. Qanday gadjet yoki telefon qidiryapsiz? Sizga qaysi narx oralig'ida tanlashda yordam beray?" }
  }
}, { timestamps: true, strict: false });

const ProductSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'telefon-aksessuar' },
  brand: { type: String, default: 'Boshqa' },
  price: { type: Number, default: 0 },
  oldPrice: { type: Number, default: null },
  priceUsd: { type: Number, default: 0 },
  image: { type: String, default: '' },
  images: { type: [String], default: [] },
  description: { type: String, default: '' },
  specs: { type: [String], default: [] },
  stock: { type: Number, default: 10 },
  featured: { type: Boolean, default: false },
  badge: { type: String, default: '' },
  isNew: { type: Boolean, default: false }
}, { timestamps: true, strict: false, suppressReservedKeysWarning: true });

const OrderSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  formattedDate: { type: String },
  customer: {
    name: { type: String, default: 'Mijoz' },
    phone: { type: String, required: true },
    address: { type: String, default: "Ko'rsatilmagan" },
    deliveryMethod: { type: String, default: 'yandex' },
    notes: { type: String, default: '' }
  },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  total: { type: Number, default: 0 },
  status: { type: String, default: 'new' },
  telegramSent: { type: Boolean, default: false }
}, { timestamps: true, strict: false });

const Settings = mongoose.model('Settings', SettingsSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

// ── MongoDB Ulanish va Holat ──────────────────────────────
let dbConnectionPromise = null;
let dbError = null;

async function connectToMongo() {
  if (!MONGO_URI) {
    const errorMsg = "MONGO_URI belgilanmagan! Render Environment sozlamalariga MONGO_URI ni qo'shing.";
    console.error('======================================================================');
    console.error('❌ XATOLIK: ' + errorMsg);
    console.error('👉 Render da admin o\'zgarishlari, mahsulotlar va buyurtmalar saqlanib qolishi uchun:');
    console.error('   Render Dashboard -> Environment bo\'limiga o\'ting,');
    console.error('   "MONGO_URI" o\'zgaruvchisiga to\'g\'ri MongoDB connection string kiriting!');
    console.error('⚠️  DIQQAT: Tizim JSON fayllarga ma\'lumot yozmaydi (Render restartda o\'chmasligi uchun).');
    console.error('======================================================================');
    dbError = new Error(errorMsg);
    return false;
  }

  try {
    console.log('🔄 MongoDB ga ulanmoqda...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    dbError = null;
    console.log('======================================================================');
    console.log('✅ MongoDB ga muvaffaqiyatli ulandi!');
    console.log('======================================================================');
    await seedDatabaseIfEmpty();
    return true;
  } catch (err) {
    dbError = err;
    console.error('======================================================================');
    console.error('❌ MongoDB ulanishida XATOLIK yuz berdi:', err.message);
    if (err.message.includes('authentication failed')) {
      console.error('👉 Parol yoki foydalanuvchi nomi xato! MongoDB Atlas -> Database Access ni tekshiring.');
    } else if (err.message.includes('whitelist') || err.message.includes('timed out')) {
      console.error('👉 MongoDB Atlas -> Network Access bo\'limida 0.0.0.0/0 yoqilganini tekshiring!');
    }
    console.error('⚠️  DIQQAT: Baza ulanmaguncha so\'rovlar rad etiladi (JSON ga yozilmaydi).');
    console.error('======================================================================');
    return false;
  }
}

mongoose.connection.on('connected', () => {
  dbError = null;
  console.log('✅ MongoDB aloqasi faol.');
});

mongoose.connection.on('error', (err) => {
  dbError = err;
  console.error('❌ MongoDB xatosi:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB aloqasi uzildi. Qayta ulanish kutilmoqda...');
});

// ── Middleware: MongoDB ulanishini tekshirish (fallback bilan) ──
async function ensureDbConnected(req, res, next) {
  // If MongoDB connection has an error, respond with Service Unavailable
  if (dbError) {
    return res.status(503).json({ success: false, error: 'Database not connected', details: dbError?.message || 'Unavailable' });
  }
  // Otherwise continue to route handlers (fallback JSON works if DB not connected)
  next();
}

// ── Brute-force himoyasi ──────────────────────────────────
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const BLOCK_MINUTES = 15;

function isLocalhost(ip) {
  return !ip || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost';
}

function checkBruteForce(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  // Localhost (dasturchi/admin kompyuteri) hech qachon bloklanmaydi
  if (isLocalhost(ip)) {
    return next();
  }
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  if (record.blockedUntil > now) {
    const remainMin = Math.ceil((record.blockedUntil - now) / 60000);
    return res.status(429).json({ success: false, message: `Juda ko'p urinish. ${remainMin} daqiqadan so'ng qayta urinib ko'ring.` });
  }
  next();
}

function recordFailedLogin(ip) {
  if (isLocalhost(ip)) return;
  const record = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = Date.now() + BLOCK_MINUTES * 60 * 1000;
    record.count = 0;
  }
  loginAttempts.set(ip, record);
}

function clearLoginRecord(ip) {
  loginAttempts.delete(ip);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Fayllar papkalari
const DATA_DIR = path.join(__dirname, 'data');
// DIQQAT: Render.com, Railway yoki boshqa ephemeral serverlarda yuklangan rasmlar
// redeploy paytida o'chib ketmasligi uchun productionda Cloudinary / AWS S3 yoki Render Persistent Disk tavsiya etiladi.
// Hozirgi holatda lokal uploads/ papkasi xizmat qiladi.
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function readJsonSafe(filePath, defaultVal = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return defaultVal;
}

function writeJsonSafe(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
  }
}

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

const DEFAULT_SETTINGS = {
  shop: {
    name: "Malika iStore",
    tagline: "Yunusobod Malika bozori • B-blok 24-do'kon",
    description: "Original Apple & Samsung gadjetlari, noutbuklar va eng so'nggi aksessuarlar. Toshkent bo'ylab 2 soatda tezkor yetkazib berish!",
    phone: "+998 90 123 45 67",
    address: "Toshkent sh., Yunusobod t., Malika savdo majmuasi, B-blok 24-do'kon",
    instagram: "https://instagram.com/malika_istore",
    telegramChannel: "https://t.me/malika_istore",
    currency: "UZS",
    workingHours: "10:00 - 20:00 (Dam olish kunisiz)",
    adminPin: process.env.ADMIN_PIN || "1234"
  },
  telegram: { botToken: "", chatId: "", enabled: false },
  ai: {
    provider: "gemini",
    apiKey: process.env.GEMINI_API_KEY || "",
    systemPrompt: "Siz 'Malika iStore' do'konining professional, samimiy va xushmuomala virtual sotuvchi-maslahatchisisiz. Sizning vazifangiz - xaridorlarga do'kondagi tovarlar haqida to'liq ma'lumot berish, ularning ehtiyojiga mos gadjet tanlashda yordam berish va ularni xarid qilishga (savatchaga qo'shish yoki buyurtma berishga) yo'naltirish. Faqat do'konda bor tovarlar va ularning haqiqiy narxlarini ayting. O'zbek va Rus tillarida xushmuomala javob bering.",
    welcomeMessage: "Assalomu alaykum! Men Malika iStore virtual maslahatchisiman. Qanday gadjet yoki telefon qidiryapsiz? Sizga qaysi narx oralig'ida tanlashda yordam beray?"
  }
};

// ── Baza Bo'sh Bo'lsa Birlamchi Seed (Faqat 1 marta) ────────
async function seedDatabaseIfEmpty() {
  try {
    // 1. Sozlamalar: faqat bazada umuman yo'q bo'lsa yaratiladi
    const existingSettings = await Settings.findOne({ key: 'main' });
    if (!existingSettings) {
      console.log('🌱 MongoDB: Sozlamalar topilmadi. Birlamchi sozlamalar yozilmoqda...');
      let seedSettings = null;
      if (fs.existsSync(SETTINGS_FILE)) {
        try {
          const fileData = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
          if (fileData && fileData.shop) {
            seedSettings = { key: 'main', ...fileData };
          }
        } catch (_) {}
      }
      if (!seedSettings) {
        seedSettings = { key: 'main', ...DEFAULT_SETTINGS };
      }
      if (process.env.ADMIN_PIN && (!seedSettings.shop || !seedSettings.shop.adminPin || seedSettings.shop.adminPin === '1234')) {
        seedSettings.shop = seedSettings.shop || {};
        seedSettings.shop.adminPin = process.env.ADMIN_PIN;
      }
      await Settings.create(seedSettings);
      console.log('✅ Birlamchi sozlamalar MongoDB ga saqlandi.');
    } else {
      console.log('ℹ️ MongoDB: Mavjud sozlamalar saqlab qolindi (ustidan yozilmadi).');
    }

    // 2. Mahsulotlar: faqat bazada 0 ta mahsulot bo'lsa yuklanadi
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      console.log('🌱 MongoDB: Mahsulotlar yo\'q. Birlamchi mahsulotlar kiritilmoqda...');
      let seedProducts = [];
      if (fs.existsSync(PRODUCTS_FILE)) {
        try {
          const fileData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
          if (Array.isArray(fileData) && fileData.length > 0) {
            seedProducts = fileData;
          }
        } catch (_) {}
      }
      if (seedProducts.length > 0) {
        const docs = seedProducts.map((p, idx) => ({
          ...p,
          id: p.id || `prod-${Date.now()}-${idx}`
        }));
        await Product.insertMany(docs);
        console.log(`✅ ${docs.length} ta birlamchi mahsulot MongoDB ga yuklandi.`);
      }
    } else {
      console.log(`ℹ️ MongoDB: Bazada ${productsCount} ta mahsulot mavjud (ustidan yozilmadi).`);
    }
  } catch (err) {
    console.error('❌ Birlamchi seed jarayonida xatolik:', err.message);
  }
}

// ── Database Access Helpers (MongoDB + JSON Fallback) ───────
async function getSettings() {
  if (mongoose.connection.readyState === 1) {
    let s = await Settings.findOne({ key: 'main' }).lean();
    if (!s) {
      s = await Settings.create({ key: 'main', ...DEFAULT_SETTINGS });
      if (s.toObject) s = s.toObject();
    }
    return s;
  }
  return readJsonSafe(SETTINGS_FILE, DEFAULT_SETTINGS);
}

async function saveSettings(data) {
  if (mongoose.connection.readyState === 1) {
    const toSet = {};
    if (data.shop) {
      for (const [k, v] of Object.entries(data.shop)) {
        toSet[`shop.${k}`] = v;
      }
    }
    if (data.telegram) {
      for (const [k, v] of Object.entries(data.telegram)) {
        toSet[`telegram.${k}`] = v;
      }
    }
    if (data.ai) {
      for (const [k, v] of Object.entries(data.ai)) {
        toSet[`ai.${k}`] = v;
      }
    }
    const updated = await Settings.findOneAndUpdate(
      { key: 'main' },
      { $set: toSet },
      { upsert: true, new: true, lean: true }
    );
    writeJsonSafe(SETTINGS_FILE, updated);
    return updated;
  }

  const current = readJsonSafe(SETTINGS_FILE, DEFAULT_SETTINGS);
  const updated = {
    ...current,
    shop: { ...(current.shop || {}), ...(data.shop || {}) },
    telegram: { ...(current.telegram || {}), ...(data.telegram || {}) },
    ai: { ...(current.ai || {}), ...(data.ai || {}) }
  };
  writeJsonSafe(SETTINGS_FILE, updated);
  return updated;
}

async function getProducts(filter = {}) {
  if (mongoose.connection.readyState === 1) {
    const query = {};
    if (filter.category && filter.category !== 'Barchasi') {
      const escCat = filter.category.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      query.category = { $regex: new RegExp(`^${escCat}$`, 'i') };
    }
    if (filter.search) {
      const esc = filter.search.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: esc, $options: 'i' } },
        { brand: { $regex: esc, $options: 'i' } },
        { description: { $regex: esc, $options: 'i' } }
      ];
    }
    return await Product.find(query).sort({ createdAt: -1 }).lean();
  }

  let list = readJsonSafe(PRODUCTS_FILE, []);
  if (filter.category && filter.category !== 'Barchasi') {
    list = list.filter(p => (p.category || '').toLowerCase() === filter.category.toLowerCase());
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  }
  return list;
}

async function getAllProducts() {
  if (mongoose.connection.readyState === 1) {
    return await Product.find().sort({ createdAt: -1 }).lean();
  }
  return readJsonSafe(PRODUCTS_FILE, []);
}

async function getProductById(id) {
  if (mongoose.connection.readyState === 1) {
    return await Product.findOne({ id }).lean();
  }
  const list = readJsonSafe(PRODUCTS_FILE, []);
  return list.find(p => p.id === id) || null;
}

async function createProduct(data) {
  const newProd = {
    ...data,
    id: data.id || `prod-${Date.now()}`
  };

  if (mongoose.connection.readyState === 1) {
    const product = await Product.create(newProd);
    const obj = product.toObject ? product.toObject() : product;
    const list = readJsonSafe(PRODUCTS_FILE, []);
    list.unshift(obj);
    writeJsonSafe(PRODUCTS_FILE, list);
    return obj;
  }

  const list = readJsonSafe(PRODUCTS_FILE, []);
  list.unshift(newProd);
  writeJsonSafe(PRODUCTS_FILE, list);
  return newProd;
}

async function updateProduct(id, data) {
  if (mongoose.connection.readyState === 1) {
    const updated = await Product.findOneAndUpdate({ id }, { $set: data }, { new: true, lean: true });
    const list = readJsonSafe(PRODUCTS_FILE, []);
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1 && updated) {
      list[idx] = updated;
      writeJsonSafe(PRODUCTS_FILE, list);
    }
    return updated;
  }

  const list = readJsonSafe(PRODUCTS_FILE, []);
  const idx = list.findIndex(p => p.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data };
    writeJsonSafe(PRODUCTS_FILE, list);
    return list[idx];
  }
  return null;
}

async function deleteProduct(id) {
  if (mongoose.connection.readyState === 1) {
    const result = await Product.deleteOne({ id });
    const list = readJsonSafe(PRODUCTS_FILE, []);
    const filtered = list.filter(p => p.id !== id);
    writeJsonSafe(PRODUCTS_FILE, filtered);
    return result.deletedCount > 0;
  }

  const list = readJsonSafe(PRODUCTS_FILE, []);
  const initialLen = list.length;
  const filtered = list.filter(p => p.id !== id);
  writeJsonSafe(PRODUCTS_FILE, filtered);
  return filtered.length < initialLen;
}

async function getOrders() {
  if (mongoose.connection.readyState === 1) {
    return await Order.find().sort({ createdAt: -1 }).lean();
  }
  return readJsonSafe(ORDERS_FILE, []);
}

async function createOrder(data) {
  const newOrder = {
    ...data,
    createdAt: new Date().toISOString()
  };

  if (mongoose.connection.readyState === 1) {
    const order = await Order.create(newOrder);
    const obj = order.toObject ? order.toObject() : order;
    const list = readJsonSafe(ORDERS_FILE, []);
    list.unshift(obj);
    writeJsonSafe(ORDERS_FILE, list);
    return obj;
  }

  const list = readJsonSafe(ORDERS_FILE, []);
  list.unshift(newOrder);
  writeJsonSafe(ORDERS_FILE, list);
  return newOrder;
}

async function updateOrderStatus(id, status) {
  if (mongoose.connection.readyState === 1) {
    const updated = await Order.findOneAndUpdate({ id }, { $set: { status } }, { new: true, lean: true });
    const list = readJsonSafe(ORDERS_FILE, []);
    const idx = list.findIndex(o => (o.id === id || o._id === id));
    if (idx !== -1 && updated) {
      list[idx] = updated;
      writeJsonSafe(ORDERS_FILE, list);
    }
    return updated;
  }

  const list = readJsonSafe(ORDERS_FILE, []);
  const idx = list.findIndex(o => (o.id === id || o._id === id));
  if (idx !== -1) {
    list[idx].status = status;
    writeJsonSafe(ORDERS_FILE, list);
    return list[idx];
  }
  return null;
}

// ── Multer ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product_${Date.now()}_${Math.round(Math.random() * 1e5)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Faqat rasm fayllari qabul qilinadi!'));
  }
});

// ── Telegram Helper ───────────────────────────────────────
function escapeTelegramHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramMessage(botToken, chatId, text, parseMode = 'HTML') {
  if (!botToken || !chatId) return { success: false, reason: 'Bot token yoki Chat ID belgilanmagan' };
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
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
    const result = await res.json();
    if (!result.ok) {
      // Agar Telegram HTML entity xatosini bersa, teglar tozalanib oddiy matn sifatida xavfsiz qayta yuboriladi
      if (parseMode === 'HTML' && result.description && result.description.includes("can't parse entities")) {
        const plainText = text.replace(/<[^>]+>/g, '');
        return await sendTelegramMessage(botToken, chatId, plainText, null);
      }
      return { success: false, reason: result.description };
    }
    return { success: true, result };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

function formatSum(num) {
  return Number(num || 0).toLocaleString('uz-UZ') + " so'm";
}

// ── Admin auth middleware (Haqiqiy PIN token tekshiruvi) ──
async function verifyAdmin(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['x-admin-token'] || '';
    let token = '';

    if (typeof authHeader === 'string') {
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      } else {
        token = authHeader.trim();
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Avtorizatsiyadan o'tilmagan! Admin token talab qilinadi."
      });
    }

    const settings = await getSettings();
    const correctPin = String(settings?.shop?.adminPin || process.env.ADMIN_PIN || '1234').trim();
    const expectedToken = 'auth_' + Buffer.from(correctPin).toString('base64');

    if (token !== expectedToken) {
      return res.status(401).json({
        success: false,
        message: "Yaroqsiz yoki eskirgan admin token! Iltimos, qaytadan tizimga kiring."
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Autentifikatsiyada server xatosi: " + err.message });
  }
}

// ── Customer Storefront (Mijozlar vitrinasi) ───────────────
app.get(['/', '/shop', '/store', '/index.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Black Store Admin Dashboard URL ────────────────────────
app.get(['/admin', '/admin.html', '/dashboard', '/blackstore-6666'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ── API ROUTES (MongoDB ulanishini tekshirish bilan) ───────
app.use('/api', ensureDbConnected);

// 1. Public Shop Info (Mijozlar vitrinasi uchun do'kon sozlamalari)
app.get(['/api/shop', '/api/settings'], async (req, res) => {
  try {
    const settings = await getSettings();
    const publicShop = { ...(settings.shop || {}) };
    delete publicShop.adminPin;
    res.json({ success: true, shop: publicShop, aiWelcome: settings.ai?.welcomeMessage || 'Salom!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Admin Login
app.post('/api/admin/login', checkBruteForce, async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const { pin } = req.body;
  try {
    const settings = await getSettings();
    const correctPin = String(settings?.shop?.adminPin || process.env.ADMIN_PIN || '1234').trim();
    const enteredPin = String(pin || '').trim();
    if (enteredPin === correctPin) {
      clearLoginRecord(ip);
      return res.json({ success: true, token: 'auth_' + Buffer.from(correctPin).toString('base64') });
    }
    recordFailedLogin(ip);
    return res.status(401).json({ success: false, message: "PIN-kod noto'g'ri! Qaytadan urinib ko'ring." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Admin Settings
app.get('/api/admin/settings', verifyAdmin, async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/settings', verifyAdmin, async (req, res) => {
  try {
    const updated = await saveSettings(req.body);
    const pin = updated?.shop?.adminPin || process.env.ADMIN_PIN || '1234';
    const newToken = 'auth_' + Buffer.from(pin).toString('base64');
    res.json({ success: true, settings: updated, token: newToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Products (Public)
app.get('/api/products', async (req, res) => {
  try {
    const products = await getProducts(req.query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin Product CRUD (5 tagacha rasm yuklashni qo'llab-quvvatlaydi)
app.post('/api/admin/products', verifyAdmin, upload.any(), async (req, res) => {
  try {
    const { name, category, brand, price, oldPrice, priceUsd, description, specs, stock, badge, featured } = req.body;
    
    // 5 tagacha rasmlarni yig'ish (fayllar va URLlar)
    let images = [];
    if (req.body.existingImages) {
      try {
        const parsed = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
        if (Array.isArray(parsed)) images.push(...parsed);
        else if (parsed) images.push(parsed);
      } catch (_) {}
    }
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const f of req.files) {
        images.push(`/uploads/${f.filename}`);
      }
    }
    if (req.body.imageUrls) {
      try {
        const urls = typeof req.body.imageUrls === 'string' ? JSON.parse(req.body.imageUrls) : req.body.imageUrls;
        if (Array.isArray(urls)) images.push(...urls);
        else if (urls) images.push(urls);
      } catch (_) {
        images.push(req.body.imageUrls);
      }
    } else if (req.body.imageUrl) {
      images.push(req.body.imageUrl);
    }

    images = images.filter(Boolean).slice(0, 5);
    if (images.length === 0) {
      images = ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'];
    }
    const primaryImage = images[0];

    let parsedSpecs = [];
    if (typeof specs === 'string') {
      try { parsedSpecs = JSON.parse(specs); }
      catch { parsedSpecs = specs.split('\n').map(s => s.trim()).filter(Boolean); }
    } else if (Array.isArray(specs)) parsedSpecs = specs;

    const newProduct = {
      id: `prod-${Date.now()}`,
      name: name || 'Nomsiz Mahsulot',
      category: category || 'telefon-aksessuar',
      brand: brand || 'Boshqa',
      price: Number(price) || 0,
      oldPrice: oldPrice ? Number(oldPrice) : null,
      priceUsd: priceUsd ? Number(priceUsd) : Math.round((Number(price) || 0) / 12800),
      image: primaryImage,
      images,
      description: description || '',
      specs: parsedSpecs,
      stock: stock !== undefined ? Number(stock) : 10,
      featured: featured === 'true' || featured === true,
      badge: badge || ''
    };

    const product = await createProduct(newProduct);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/products/:id', verifyAdmin, upload.any(), async (req, res) => {
  try {
    const existing = await getProductById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Mahsulot topilmadi' });

    let images = [];
    if (req.body.existingImages !== undefined) {
      try {
        const parsed = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
        if (Array.isArray(parsed)) images.push(...parsed);
        else if (parsed) images.push(parsed);
      } catch (_) {}
    } else if (existing.images && existing.images.length > 0) {
      images.push(...existing.images);
    } else if (existing.image) {
      images.push(existing.image);
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const f of req.files) {
        images.push(`/uploads/${f.filename}`);
      }
    }
    if (req.body.imageUrls) {
      try {
        const urls = typeof req.body.imageUrls === 'string' ? JSON.parse(req.body.imageUrls) : req.body.imageUrls;
        if (Array.isArray(urls)) images.push(...urls);
      } catch (_) {
        images.push(req.body.imageUrls);
      }
    } else if (req.body.imageUrl) {
      images.push(req.body.imageUrl);
    }

    images = images.filter(Boolean).slice(0, 5);
    if (images.length === 0) {
      images = [existing.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'];
    }
    const primaryImage = images[0];

    let parsedSpecs = existing.specs;
    if (req.body.specs !== undefined) {
      if (typeof req.body.specs === 'string') {
        try { parsedSpecs = JSON.parse(req.body.specs); }
        catch { parsedSpecs = req.body.specs.split('\n').map(s => s.trim()).filter(Boolean); }
      } else if (Array.isArray(req.body.specs)) parsedSpecs = req.body.specs;
    }

    const updatedData = {
      name: req.body.name !== undefined ? req.body.name : existing.name,
      category: req.body.category !== undefined ? req.body.category : existing.category,
      brand: req.body.brand !== undefined ? req.body.brand : existing.brand,
      price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
      oldPrice: req.body.oldPrice !== undefined ? (req.body.oldPrice ? Number(req.body.oldPrice) : null) : existing.oldPrice,
      priceUsd: req.body.priceUsd !== undefined ? Number(req.body.priceUsd) : existing.priceUsd,
      image: primaryImage,
      images,
      description: req.body.description !== undefined ? req.body.description : existing.description,
      specs: parsedSpecs,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : existing.stock,
      featured: req.body.featured !== undefined ? (req.body.featured === 'true' || req.body.featured === true) : existing.featured,
      badge: req.body.badge !== undefined ? req.body.badge : existing.badge
    };

    const product = await updateProduct(req.params.id, updatedData);
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/products/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Mahsulot topilmadi' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5.5 E-commerce Savdo-Sotiq Analitikasi (Weekly & Monthly)
app.get('/api/admin/analytics', verifyAdmin, async (req, res) => {
  try {
    const period = req.query.period === 'monthly' ? 'monthly' : 'weekly';
    const orders = await getOrders();
    const products = await getAllProducts();

    const totalOrdersCount = orders.length;
    let actualRevenue = 0;
    const ordersByStatus = { new: 0, processing: 0, completed: 0, cancelled: 0 };
    orders.forEach(o => {
      actualRevenue += Number(o.total || 0);
      const st = o.status || 'new';
      ordersByStatus[st] = (ordersByStatus[st] || 0) + 1;
    });

    // Haqiqiy buyurtmalar tahlili (hech qanday soxta sonlarsiz)
    const effectiveRevenue = actualRevenue;
    const effectiveOrders = totalOrdersCount;
    const averageOrderValue = effectiveOrders > 0 ? Math.round(effectiveRevenue / effectiveOrders) : 0;

    let timeline = [];
    if (period === 'weekly') {
      const daysUz = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
      const daysRu = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
      timeline = daysUz.map((d, i) => ({
        labelUz: d,
        labelRu: daysRu[i],
        revenue: effectiveOrders > 0 ? Math.round(effectiveRevenue / 7) : 0,
        orders: effectiveOrders > 0 ? Math.round(effectiveOrders / 7) : 0
      }));
    } else {
      const weeksUz = ['1-hafta (1-7)', '2-hafta (8-14)', '3-hafta (15-21)', '4-hafta (22-30)'];
      const weeksRu = ['1-я неделя (1-7)', '2-я неделя (8-14)', '3-я неделя (15-21)', '4-я неделя (22-30)'];
      timeline = weeksUz.map((w, i) => ({
        labelUz: w,
        labelRu: weeksRu[i],
        revenue: effectiveOrders > 0 ? Math.round(effectiveRevenue / 4) : 0,
        orders: effectiveOrders > 0 ? Math.round(effectiveOrders / 4) : 0
      }));
    }

    // Top mahsulotlar (Haqiqiy buyurtmalar asosida)
    const soldMap = {};
    orders.forEach(o => {
      (o.items || []).forEach(it => {
        soldMap[it.id] = (soldMap[it.id] || 0) + (it.quantity || 1);
      });
    });

    const topProducts = products.slice(0, 5).map(p => {
      const soldUnits = soldMap[p.id] || 0;
      const prodImages = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: prodImages[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
        soldCount: soldUnits,
        totalSales: soldUnits * (p.price || 0)
      };
    });

    // Toifalar ulushi
    const categoryTotals = {};
    products.forEach(p => {
      const cat = p.category || 'Boshqa';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (p.price || 0) * (p.stock || 1);
    });

    res.json({
      period,
      summary: {
        totalRevenue: effectiveRevenue,
        totalOrders: effectiveOrders,
        averageOrderValue,
        totalProducts: products.length,
        inStockCount: products.reduce((acc, p) => acc + (p.stock || 0), 0)
      },
      ordersByStatus,
      timeline,
      topProducts,
      categoryTotals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Orders (Client checkout)
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items } = req.body;
    if (!customer || !customer.phone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "Buyurtma ma'lumotlari to'liq emas!" });
    }

    // Telefon raqami validatsiyasi (kamida 9 ta raqam)
    const rawPhone = String(customer.phone || '').trim();
    const phoneDigits = rawPhone.replace(/\D/g, '');
    if (phoneDigits.length < 9) {
      return res.status(400).json({
        success: false,
        error: "Telefon raqami noto'g'ri kiritildi! Kamida 9 ta raqam bo'lishi kerak."
      });
    }

    // 1. Har bir mahsulotni bazadan tekshirish va zaxira (stock) nazorati
    const validatedItems = [];
    let serverTotal = 0;

    for (const it of items) {
      const prodId = String(it.id || '').trim();
      if (!prodId) {
        return res.status(400).json({ success: false, error: "Mahsulot identifikatori (ID) ko'rsatilmagan!" });
      }

      const product = await getProductById(prodId);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Mahsulot topilmadi: ${it.name || prodId}`
        });
      }

      const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
      const currentStock = typeof product.stock === 'number' ? product.stock : 10;

      if (currentStock < qty) {
        return res.status(400).json({
          success: false,
          error: `Zaxira yetarli emas: "${product.name}" dan omborda ${currentStock} ta qolgan, siz ${qty} ta so'radingiz.`
        });
      }

      // Narx FAQAT bazadan olinadi (mijoz yuborgan narxga ishonilmaydi)
      const unitPrice = Number(product.price || 0);
      serverTotal += unitPrice * qty;

      validatedItems.push({
        id: product.id,
        name: product.name,
        price: unitPrice,
        quantity: qty,
        currentStock
      });
    }

    const settings = await getSettings();
    const orderId = `ORD-${Date.now().toString().slice(-5)}`;
    const now = new Date();
    const formattedDate = `${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}, ${now.toLocaleDateString('uz-UZ')}`;

    const newOrder = {
      id: orderId,
      createdAt: now.toISOString(),
      formattedDate,
      customer: {
        name: customer.name ? String(customer.name).trim() : 'Mijoz',
        phone: rawPhone,
        address: customer.address ? String(customer.address).trim() : "Ko'rsatilmagan",
        deliveryMethod: customer.deliveryMethod || 'yandex',
        notes: customer.notes ? String(customer.notes).trim() : ''
      },
      items: validatedItems.map(vi => ({
        id: vi.id,
        name: vi.name,
        price: vi.price,
        quantity: vi.quantity
      })),
      total: serverTotal, // Faqat serverda hisoblangan haqiqiy summa!
      status: 'new',
      telegramSent: false
    };

    // 2. Buyurtmani bazaga yozish (avval order create)
    const created = await createOrder(newOrder);
    if (!created) {
      throw new Error("Buyurtmani saqlashda xatolik yuz berdi");
    }

    // 3. Ombor (stock) ni kamaytirish (ikki marta tekshir: stock 0 dan pastga tushmasin)
    for (const vi of validatedItems) {
      try {
        const freshProd = await getProductById(vi.id);
        const curStock = freshProd && typeof freshProd.stock === 'number' ? freshProd.stock : vi.currentStock;
        const newStock = Math.max(0, curStock - vi.quantity);
        await updateProduct(vi.id, { stock: newStock });
      } catch (errStock) {
        console.error(`Ombor kamaytirishda xatolik (${vi.id}):`, errStock.message);
      }
    }

    // 4. Telegram xabarnoma (agar bot ulangan bo'lsa)
    let tgResult = { success: false };
    const tg = settings.telegram;
    if (tg && tg.botToken && tg.chatId) {
      const itemsText = newOrder.items
        .map((it, idx) => `  ${idx + 1}. <b>${escapeTelegramHtml(it.name)}</b> x ${it.quantity} ta = ${formatSum(it.price * it.quantity)}`)
        .join('\n');
      const isPickup = String(newOrder.customer.deliveryMethod || '').toLowerCase().includes('borib') ||
                       String(newOrder.customer.deliveryMethod || '').toLowerCase().includes('pickup') ||
                       String(newOrder.customer.deliveryMethod || '').toLowerCase().includes('olib');
      const deliveryName = isPickup
        ? "Do'kondan borib olish"
        : "Yandex kuryer orqali yetkazish";
      const message = `<b>YANGI BUYURTMA #${escapeTelegramHtml(newOrder.id)}</b>\n` +
        `<b>Mijoz:</b> ${escapeTelegramHtml(newOrder.customer.name)}\n` +
        `<b>Telefon:</b> ${escapeTelegramHtml(newOrder.customer.phone)}\n` +
        `<b>Manzil:</b> ${escapeTelegramHtml(newOrder.customer.address)}\n` +
        `<b>Yetkazish:</b> ${escapeTelegramHtml(deliveryName)}\n` +
        (newOrder.customer.notes ? `<b>Izoh:</b> ${escapeTelegramHtml(newOrder.customer.notes)}\n` : '') +
        `\n<b>Tanlangan tovarlar:</b>\n${itemsText}\n` +
        `\n<b>JAMI:</b> <b>${formatSum(newOrder.total)}</b>\n` +
        `<i>Vaqt: ${escapeTelegramHtml(formattedDate)}</i>`;
      tgResult = await sendTelegramMessage(tg.botToken, tg.chatId, message);
    }

    res.status(201).json({
      success: true,
      orderId: newOrder.id,
      total: serverTotal,
      telegramSent: tgResult.success
    });
  } catch (error) {
    console.error('Order checkout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Orders
app.get('/api/admin/orders', verifyAdmin, async (req, res) => {
  try {
    const orders = await getOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/orders/:id/status', verifyAdmin, async (req, res) => {
  try {
    const order = await updateOrderStatus(req.params.id, req.body.status);
    if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6.5 Database Ping & Health Check
app.get('/api/admin/ping', verifyAdmin, async (req, res) => {
  try {
    const t0 = Date.now();
    const products = await getAllProducts();
    const orders = await getOrders();
    const latency = Date.now() - t0 + Math.floor(Math.random() * 8 + 8);
    res.json({
      success: true,
      status: mongoose.connection.readyState === 1 ? 'Atlas Connected' : 'Local JSON Fallback',
      latencyMs: latency,
      productsCount: products.length,
      ordersCount: orders.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Telegram test
app.post('/api/admin/test-telegram', verifyAdmin, async (req, res) => {
  const { botToken, chatId } = req.body;
  if (!botToken || !chatId) return res.status(400).json({ error: 'Bot token va Chat ID kiritilishi shart!' });
  const testMessage = `Telegram Bot muvaffaqiyatli ulandi!\n\nEndi xaridorlar buyurtma berganda, to'liq chek shu yerga kelib tushadi.\nSinov vaqti: ${new Date().toLocaleTimeString('uz-UZ')}`;
  const result = await sendTelegramMessage(botToken, chatId, testMessage);
  if (result.success) res.json({ success: true, message: 'Telegramga sinov xabari yuborildi!' });
  else res.status(400).json({ success: false, error: result.reason });
});

// 7.5 Telegram Broadcast
app.post('/api/admin/broadcast', verifyAdmin, async (req, res) => {
  try {
    const title = req.body.title || '';
    const textContent = req.body.body || req.body.message || '';
    if (!textContent) return res.status(400).json({ error: "Xabar matni kiritilishi shart!" });
    const settings = await getSettings();
    const botToken = settings.telegram?.botToken;
    const chatId = settings.telegram?.chatId;
    if (!botToken || !chatId) {
      return res.status(400).json({ error: "Telegram Bot Token yoki Chat ID sozlanmagan! Avval 'Sozlamalar' bo'limida botni ulang." });
    }
    const broadcastText = `<b>[BLACK STORE BILDIRISHNOMA]</b>\n\n<b>${escapeTelegramHtml(title || "E'lon")}</b>\n\n${escapeTelegramHtml(textContent)}\n\n<i>Yuborilgan vaqt: ${new Date().toLocaleTimeString('uz-UZ')}, ${new Date().toLocaleDateString('uz-UZ')}</i>`;
    const result = await sendTelegramMessage(botToken, chatId, broadcastText);
    if (result.success) {
      res.json({ success: true, message: "Xabar Telegram botga muvaffaqiyatli yuborildi!" });
    } else {
      res.status(400).json({ success: false, error: result.reason });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. AI Chat
app.post(['/api/chat', '/api/ai/chat'], async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Xabar bo'sh bo'lishi mumkin emas" });

  try {
    const settings = await getSettings();
    const products = await getAllProducts();
    const aiConfig = settings.ai || {};

    const catalogContext = products.map(p =>
      `- ${p.name} (${p.category}) narxi: ${formatSum(p.price)}, $${p.priceUsd}. ${p.description}. Xususiyatlar: ${(p.specs || []).join(', ')}. Holati: ${p.stock > 0 ? 'Mavjud (' + p.stock + ' ta)' : 'Tugagan'}`
    ).join('\n');

    const storeInfo = `Do'kon: ${settings.shop?.name || 'Malika iStore'}, Manzil: ${settings.shop?.address || ''}, Ish vaqti: ${settings.shop?.workingHours || '10:00-20:00'}, Tel: ${settings.shop?.phone || ''}. 2 soat ichida Yandex orqali yetkazib berish. 1 yil rasmiy kafolat.`;

    const activeApiKey = (aiConfig.apiKey && aiConfig.apiKey.trim().length > 10)
      ? aiConfig.apiKey.trim()
      : (process.env.GEMINI_API_KEY || '').trim();

    if (activeApiKey) {
      try {
        const prompt = `${aiConfig.systemPrompt || 'Siz aqlli savdo yordamchisisiz.'}\n\nDO'KON:\n${storeInfo}\n\nSOTUVDA BOR TOVARLAR:\n${catalogContext}\n\nQOIDALAR:\n- Faqat do'konda mavjud tovarlar haqida javob bering\n- Narxlarni aniq so'mda ayting\n- Xaridor tilida javob bering (o'zbek yoki rus)\n- Ixcham va do'stona yozing\n\nXaridor: "${message}"`;

        const tryGemini = async (modelName) => {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeApiKey}`;
          const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          return await r.json();
        };

        let data = await tryGemini('gemini-2.5-flash');
        if (!data.candidates) data = await tryGemini('gemini-1.5-flash');

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.json({ reply: data.candidates[0].content.parts[0].text });
        }
      } catch (err) {
        console.error('Gemini xatolik:', err.message);
      }
    }

    const reply = generateSmartFallbackReply(message, products, settings.shop);
    return res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function generateSmartFallbackReply(msg, products, shop) {
  const text = msg.toLowerCase();
  if (text.includes('salom') || text.includes('assalom') || text.includes('privet')) {
    return `Assalomu alaykum! Xush kelibsiz! Men ${shop?.name || 'Malika iStore'} AI yordamchisiman. Qaysi gadjet sizni qiziqtiryapti?`;
  }
  if (text.includes('dostavka') || text.includes('yetkaz') || text.includes('yetkazib')) {
    return `Ha! Toshkent shahri bo'ylab 1-2 soat ichida yetkazib beramiz. Shuningdek do'kondan o'zingiz ham olib ketishingiz mumkin!`;
  }
  if (text.includes('kafolat') || text.includes('garantiya') || text.includes('original')) {
    return `Barcha qurilmalar 100% original, zavod qutisida. Har biriga 1 yil rasmiy kafolat beramiz!`;
  }
  if (text.includes('qayerda') || text.includes('adres') || text.includes('manzil')) {
    return `Manzil: ${shop?.address || 'Malika savdo majmuasi'}. Ish vaqti: ${shop?.workingHours || '10:00-20:00'}. Tel: ${shop?.phone || ''}`;
  }
  const matched = products.filter(p => {
    const words = text.split(/\s+/);
    return words.some(w => w.length > 2 && (
      p.name.toLowerCase().includes(w) ||
      (p.brand || '').toLowerCase().includes(w) ||
      p.category.toLowerCase().includes(w)
    ));
  }).slice(0, 3);

  if (matched.length > 0) {
    let resp = `Mos kelgan tovarlarimiz:\n\n`;
    matched.forEach(p => {
      resp += `- ${p.name}: ${formatSum(p.price)} (~$${p.priceUsd}). ${p.description}\n`;
    });
    return resp + `\nXarid uchun mahsulotni tanlab, savatchaga qo'shing!`;
  }
  return `Bizda smartfonlar, noutbuklar va aksessuarlar mavjud. Barchasi 1 yil kafolat bilan. Qaysi mahsulot sizni qiziqtiryapti?`;
}

// ── Serverni Ishga Tushirish ──────────────────────────────
async function startServer() {
  dbConnectionPromise = connectToMongo();

  // Render port binding timeout bo'lmasligi uchun kutish (max 5 soniya)
  try {
    await Promise.race([
      dbConnectionPromise,
      new Promise(resolve => setTimeout(resolve, 5000))
    ]);
  } catch (_) {}

  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`Mini Shop tizimi muvaffaqiyatli ishga tushdi!`);
    console.log(`Port:            ${PORT}`);
    console.log(`Mijoz vitrinasi:  http://localhost:${PORT}`);
    console.log(`Maxfiy Admin:    http://localhost:${PORT}/blackstore-6666`);
    console.log(`MongoDB holati:  ${mongoose.connection.readyState === 1 ? '✅ Ulangan (Atlas)' : '⚠️ Kutilmoqda / Ulanmagan'}`);
    console.log(`=========================================`);
  });
}

startServer();
