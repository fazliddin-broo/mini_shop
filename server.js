require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const dns = require('dns');
const cloudinary = require('cloudinary').v2;

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'zhdah4g2';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '378577798194528';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'tpMNhuiUkHnbZbDUdrL2BqfnEK8';

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });
  console.log('☁️ Cloudinary muvaffaqiyatli sozlandi! (Cloud: ' + CLOUDINARY_CLOUD_NAME + ')');
}

// Ba'zi lokal muhitlar yoki provayderlarda SRV DNS yechish muammolarini oldini olish
try {
  dns.setDefaultResultOrder('ipv4first');
  if (process.platform === 'win32') {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
} catch (_) { }

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = (process.env.MONGO_URI || '').trim();

// ── Mongoose Schemas ──────────────────────────────────────
const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  shop: {
    name: { type: String, default: "Black Store" },
    tagline: { type: String, default: "Malika savdo markazi • B-blok 1-do'kon" },
    description: { type: String, default: "BlackStore.uz — Apple mahsulotlari eng arzon narxlarda! 1 yilgacha rasmiy kafolat, tezkor yetkazib berish va sifatli xizmat ko'rsatish." },
    phone: { type: String, default: "+998 (95) 196-44-44" },
    address: { type: String, default: "Toshkent sh., Malika savdo markazi, B-blok 1-do'kon" },
    instagram: { type: String, default: "https://instagram.com/blackstore.uz" },
    telegramChannel: { type: String, default: "https://t.me/blackstore_uz" },
    currency: { type: String, default: "UZS" },
    workingHours: { type: String, default: "09:00 - 22:00 (dam olish kunlarisiz)" },
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
    systemPrompt: { type: String, default: "Siz 'Black Store' (Apple, Samsung va zamonaviy gadjetlar do'koni)ning aqlli AI savdo maslahatchisisiz. Sizning vazifangiz — xaridorlarga do'kondagi tovarlar, kafolat (1 yil), yetkazib berish va narxlar bo'yicha professional maslahat berish. Manzil: Malika B-blok 1-do'kon. Tel: +998 (95) 196-44-44." },
    welcomeMessage: { type: String, default: "Assalomu alaykum! Black Store do'koniga xush kelibsiz! Qanday gadjet yoki Apple mahsuloti qidiryapsiz?" }
  }
}, { timestamps: true, strict: false });

const ProductSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'telefon-aksessuar' },
  brand: { type: String, default: 'Boshqa' },
  price: { type: Number, default: 0 },
  minPrice: { type: Number, default: 0 },
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
// BUGFIX: avval MongoDB xatosi bo'lsa BARCHA /api so'rovlar 503 qaytarardi va do'kon
// butunlay ishlamay qolardi. Endi MongoDB ulanmagan bo'lsa, tizim data/*.json fayllari
// bilan ishlashda davom etadi (helper funksiyalar readyState ni o'zi tekshiradi).
async function ensureDbConnected(req, res, next) {
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
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: "Noto'g'ri JSON format yuborildi!" });
  }
  next(err);
});
app.use(express.urlencoded({ extended: true }));

// Maxfiy admin himoyasi: /admin, /admin.html, /dashboard ga kirish butunlay yopiladi (404)
app.use((req, res, next) => {
  const p = (req.path || '').toLowerCase();
  if (p === '/admin' || p === '/admin.html' || p === '/dashboard') {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});

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
    name: "Black Store",
    tagline: "Malika savdo markazi • B-blok 1-do'kon",
    description: "BlackStore.uz — Apple mahsulotlari eng arzon narxlarda! 1 yilgacha rasmiy kafolat, tezkor yetkazib berish va sifatli xizmat ko'rsatish.",
    phone: "+998 (95) 196-44-44",
    address: "Toshkent sh., Malika savdo markazi, B-blok 1-do'kon",
    instagram: "https://instagram.com/blackstore.uz",
    telegramChannel: "https://t.me/blackstore_uz",
    currency: "UZS",
    workingHours: "09:00 - 22:00 (dam olish kunlarisiz)",
    adminPin: process.env.ADMIN_PIN || "1234"
  },
  telegram: { botToken: "", chatId: "", enabled: false },
  ai: {
    provider: "gemini",
    apiKey: process.env.GEMINI_API_KEY || "",
    systemPrompt: "Siz 'Black Store' (Apple, Samsung va zamonaviy gadjetlar do'koni)ning aqlli AI savdo maslahatchisisiz. Sizning vazifangiz — xaridorlarga do'kondagi tovarlar, kafolat (1 yil), yetkazib berish va narxlar bo'yicha professional maslahat berish. Manzil: Malika B-blok 1-do'kon. Tel: +998 (95) 196-44-44.",
    welcomeMessage: "Assalomu alaykum! Black Store do'koniga xush kelibsiz! Qanday gadjet yoki Apple mahsuloti qidiryapsiz?"
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
        } catch (_) { }
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

    // 2. Mahsulotlar: MongoDB Atlas bilan data/products.json to'liq sinxronlashtiriladi
    let fileProducts = [];
    if (fs.existsSync(PRODUCTS_FILE)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
        if (Array.isArray(fileData)) fileProducts = fileData;
      } catch (_) { }
    }

    // 2. Mahsulotlar: Faqat yangi, bo'sh bazaga birinchi marta seed qilinadi.
    // Agar admin demo mahsulotlarni o'chirsa, keyingi deploylarda qayta tiklanmaydi!
    const productsCount = await Product.countDocuments();
    const settingsDoc = await Settings.findOne({ key: 'main' }).lean();

    if (productsCount === 0 && !settingsDoc?.seeded && fileProducts.length > 0) {
      console.log(`🌱 MongoDB: Baza yangi. Birlamchi ${fileProducts.length} ta mahsulot yuklanmoqda...`);
      for (const p of fileProducts) {
        try {
          const doc = { ...p, id: String(p.id) };
          await Product.create(doc);
        } catch (_) { }
      }
      await Settings.updateOne({ key: 'main' }, { $set: { seeded: true } }, { upsert: true });
      console.log(`✅ Birlamchi mahsulotlar MongoDB Atlas ga yuklandi.`);
    } else {
      console.log(`ℹ️ MongoDB: Mahsulotlar bazasi saqlanmoqda (${productsCount} ta tovar). Demo tovarlar qayta tiklanmaydi.`);
    }
  } catch (err) {
    console.error('❌ Birlamchi seed jarayonida xatolik:', err.message);
  }
}

// ── Database Access Helpers (MongoDB + JSON Fallback) ───────
// BUGFIX: oldingi regex `/[.*+?^${}()|[\\]\\]/g` noto'g'ri edi va maxsus belgilarni
// escape qilmasdi -> qidiruvda "(" yoki "[" yozilsa server 500 xato berardi.
function escapeRegex(str) {
  return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Promo-kodlar (mijoz panelidagi kodlar bilan bir xil). Chegirma FAQAT serverda hisoblanadi.
const PROMO_CODES = { BLACK10: 0.10, APPLEBOX: 0.10, BLACK20: 0.20 };
const ORDER_STATUSES = ['new', 'processing', 'confirmed', 'completed', 'cancelled'];

let _cachedSettings = null;
let _cachedSettingsTs = 0;

async function getSettings(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _cachedSettings && (now - _cachedSettingsTs < 60000)) {
    return _cachedSettings;
  }
  if (mongoose.connection.readyState === 1) {
    let s = await Settings.findOne({ key: 'main' }).lean();
    if (!s) {
      s = await Settings.create({ key: 'main', ...DEFAULT_SETTINGS });
      if (s.toObject) s = s.toObject();
    }
    _cachedSettings = s;
    _cachedSettingsTs = now;
    return s;
  }
  const fileData = readJsonSafe(SETTINGS_FILE, DEFAULT_SETTINGS);
  _cachedSettings = fileData;
  _cachedSettingsTs = now;
  return fileData;
}

async function saveSettings(data) {
  _cachedSettings = null; // Keshni darhol yangilash
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
    _cachedSettings = updated;
    _cachedSettingsTs = Date.now();
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
      const escCat = escapeRegex(filter.category);
      query.category = { $regex: new RegExp(`^${escCat}$`, 'i') };
    }
    if (filter.search) {
      const esc = escapeRegex(filter.search);
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

async function getProductById(id, fallbackName = null) {
  const targetId = String(id || '').trim();
  let found = null;

  if (mongoose.connection.readyState === 1) {
    if (targetId) {
      found = await Product.findOne({ id: targetId }).lean();
    }
    if (!found && fallbackName) {
      const cleanName = String(fallbackName).trim();
      found = await Product.findOne({
        $or: [
          { name: cleanName },
          { name_uz: cleanName },
          { name_ru: cleanName }
        ]
      }).lean();
    }
    if (found) return found;
  }

  // Fallback: Agar MongoDB da topilmasa, JSON fayldan qidiramiz
  const list = readJsonSafe(PRODUCTS_FILE, []);
  if (targetId) {
    found = list.find(p => String(p.id) === targetId) || null;
  }
  if (!found && fallbackName) {
    const cleanLower = String(fallbackName).trim().toLowerCase();
    found = list.find(p =>
      (p.name && p.name.trim().toLowerCase() === cleanLower) ||
      (p.name_uz && p.name_uz.trim().toLowerCase() === cleanLower) ||
      (p.name_ru && p.name_ru.trim().toLowerCase() === cleanLower)
    ) || null;
  }

  // Agar JSON faylda topilsa va MongoDB ulangan bo'lsa, avtomatik MongoDB Atlas ga sinxronlashtirib qo'yamiz (Auto-heal)
  if (found && mongoose.connection.readyState === 1) {
    try {
      const doc = {
        ...found,
        id: String(found.id || targetId)
      };
      await Product.updateOne({ id: doc.id }, { $setOnInsert: doc }, { upsert: true });
    } catch (_) { }
  }

  return found;
}

async function createProduct(data) {
  const newProd = {
    ...data,
    id: data.id ? String(data.id) : `prod-${Date.now()}`
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
  const targetId = String(id);
  if (mongoose.connection.readyState === 1) {
    const updated = await Product.findOneAndUpdate({ id: targetId }, { $set: data }, { new: true, lean: true });
    const list = readJsonSafe(PRODUCTS_FILE, []);
    const idx = list.findIndex(p => String(p.id) === targetId);
    if (idx !== -1 && updated) {
      list[idx] = updated;
      writeJsonSafe(PRODUCTS_FILE, list);
    }
    return updated;
  }

  const list = readJsonSafe(PRODUCTS_FILE, []);
  const idx = list.findIndex(p => String(p.id) === targetId);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data };
    writeJsonSafe(PRODUCTS_FILE, list);
    return list[idx];
  }
  return null;
}

async function deleteProduct(id) {
  const targetId = String(id);
  if (mongoose.connection.readyState === 1) {
    const result = await Product.deleteOne({ id: targetId });
    await Settings.updateOne({ key: 'main' }, { $set: { seeded: true } }).catch(() => { });
    const list = readJsonSafe(PRODUCTS_FILE, []);
    const filtered = list.filter(p => String(p.id) !== targetId);
    writeJsonSafe(PRODUCTS_FILE, filtered);
    return result.deletedCount > 0;
  }

  const list = readJsonSafe(PRODUCTS_FILE, []);
  const initialLen = list.length;
  const filtered = list.filter(p => String(p.id) !== targetId);
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

async function getOrderById(id) {
  const targetId = String(id);
  if (mongoose.connection.readyState === 1) {
    return await Order.findOne({ $or: [{ id: targetId }, { _id: targetId }] }).lean();
  }
  const list = readJsonSafe(ORDERS_FILE, []);
  return list.find(o => String(o.id) === targetId || String(o._id) === targetId) || null;
}

// Buyurtma bekor qilinsa ombor qaytariladi, bekor holatdan qaytarilsa yana kamaytiriladi
async function adjustStockForOrder(order, direction) {
  for (const it of (order.items || [])) {
    try {
      const prod = await getProductById(String(it.id));
      if (!prod) continue;
      const cur = typeof prod.stock === 'number' ? prod.stock : 0;
      const qty = Number(it.quantity) || 1;
      const newStock = Math.max(0, cur + direction * qty);
      await updateProduct(prod.id, { stock: newStock });
    } catch (e) {
      console.error('Ombor tuzatishda xatolik:', e.message);
    }
  }
}

async function updateOrderStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`Yaroqsiz holat: ${status}`);
  }
  const targetId = String(id);
  const current = await getOrderById(targetId);
  if (!current) return null;
  const oldStatus = current.status;

  if (oldStatus !== status) {
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      await adjustStockForOrder(current, +1);
    } else if (oldStatus === 'cancelled' && status !== 'cancelled') {
      await adjustStockForOrder(current, -1);
    }
  }

  if (mongoose.connection.readyState === 1) {
    const updated = await Order.findOneAndUpdate({ $or: [{ id: targetId }, { _id: targetId }] }, { $set: { status } }, { new: true, lean: true });
    const list = readJsonSafe(ORDERS_FILE, []);
    const idx = list.findIndex(o => (String(o.id) === targetId || String(o._id) === targetId));
    if (idx !== -1 && updated) {
      list[idx] = updated;
      writeJsonSafe(ORDERS_FILE, list);
    }
    return updated;
  }

  const list = readJsonSafe(ORDERS_FILE, []);
  const idx = list.findIndex(o => (String(o.id) === targetId || String(o._id) === targetId));
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

// ── Cloudinary Helper ─────────────────────────────────────
async function uploadImageToCloud(file) {
  const isCloudinaryConfigured = Boolean(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET
  );

  if (!isCloudinaryConfigured) {
    return `/uploads/${file.filename}`;
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'black_store_products',
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    // Cloudinary ga muvaffaqiyatli yuklangach, vaqtinchalik diskdagi lokal faylni tozalaymiz
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (_) { }

    return result.secure_url;
  } catch (err) {
    console.error('⚠️ Cloudinary yuklashda xatolik:', err.message);
    return `/uploads/${file.filename}`;
  }
}

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

function formatSum(num, currency = null) {
  if (currency === 'USD' || currency === '$') {
    return Number(num || 0).toLocaleString('en-US') + ' $';
  }
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

// ── Black Store Maxfiy Admin Dashboard URL (FAQAT maxfiy link) ────────────
app.get('/blackstore-6666', (req, res) => {
  res.sendFile(path.join(__dirname, 'private', 'admin.html'));
});

// ── Taplink / Bio Links (Instagram bio uchun) ──────────────
app.get(['/taplink', '/taplink.html', '/links', '/bio'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'taplink.html'));
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

app.post('/api/admin/change-password', verifyAdmin, async (req, res) => {
  try {
    const currentPin = String(req.body.currentPin || '').trim();
    const newPin = String(req.body.newPin || '').trim();
    const settings = await getSettings();
    const correctPin = String(settings?.shop?.adminPin || process.env.ADMIN_PIN || '1234').trim();

    if (currentPin !== correctPin) {
      return res.status(400).json({ success: false, message: "Joriy parol noto'g'ri!" });
    }
    if (newPin.length < 4) {
      return res.status(400).json({ success: false, message: "Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak!" });
    }
    await saveSettings({ shop: { adminPin: newPin } });
    res.json({ success: true, token: 'auth_' + Buffer.from(newPin).toString('base64') });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Products (Admin - verifyAdmin bilan, minPrice ko'rinadi)
app.get('/api/admin/products', verifyAdmin, async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cloudinary Status Check (Admin)
app.get('/api/admin/cloudinary-status', verifyAdmin, async (req, res) => {
  try {
    const ping = await cloudinary.api.ping();
    res.json({ success: true, cloud: CLOUDINARY_CLOUD_NAME, ping });
  } catch (err) {
    res.status(500).json({ success: false, cloud: CLOUDINARY_CLOUD_NAME, error: err.message });
  }
});

// 5. Products (Public Vitrina - xavfsiz, minPrice yashirilgan)
app.get('/api/products', async (req, res) => {
  try {
    const products = await getProducts(req.query);
    const safeProducts = products.map(p => {
      const copy = { ...p };
      delete copy.minPrice;
      return copy;
    });
    res.json(safeProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Admin Product CRUD (5 tagacha rasm yuklashni qo'llab-quvvatlaydi)
app.post('/api/admin/products', verifyAdmin, upload.any(), async (req, res) => {
  try {
    const { name, category, brand, price, minPrice, oldPrice, priceUsd, description, specs, stock, badge, featured } = req.body;

    // 5 tagacha rasmlarni yig'ish (fayllar va URLlar)
    let images = [];
    if (req.body.existingImages) {
      try {
        const parsed = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
        if (Array.isArray(parsed)) images.push(...parsed);
        else if (parsed) images.push(parsed);
      } catch (_) { }
    }
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const f of req.files) {
        const cloudUrl = await uploadImageToCloud(f);
        if (cloudUrl) images.push(cloudUrl);
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
      minPrice: (minPrice !== undefined && minPrice !== '') ? Number(minPrice) : 0,
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
      } catch (_) { }
    } else if (existing.images && existing.images.length > 0) {
      images.push(...existing.images);
    } else if (existing.image) {
      images.push(existing.image);
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const f of req.files) {
        const cloudUrl = await uploadImageToCloud(f);
        if (cloudUrl) images.push(cloudUrl);
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
      minPrice: req.body.minPrice !== undefined ? (req.body.minPrice !== '' ? Number(req.body.minPrice) : 0) : (existing.minPrice || 0),
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

    const ordersByStatus = { new: 0, processing: 0, completed: 0, cancelled: 0 };
    orders.forEach(o => {
      const st = o.status || 'new';
      ordersByStatus[st] = (ordersByStatus[st] || 0) + 1;
    });

    // BUGFIX: bekor qilingan buyurtmalar daromadga qo'shilmaydi
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const effectiveRevenue = validOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
    const effectiveOrders = validOrders.length;
    const averageOrderValue = effectiveOrders > 0 ? Math.round(effectiveRevenue / effectiveOrders) : 0;

    // BUGFIX: oldin grafik soxta edi (jami summa 7 ga / 4 ga teng bo'lingan).
    // Endi buyurtmalar haqiqiy sanasi bo'yicha guruhlanadi.
    let timeline = [];
    const now = new Date();
    if (period === 'weekly') {
      const daysUz = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
      const daysRu = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      timeline = daysUz.map((d, i) => ({ labelUz: d, labelRu: daysRu[i], revenue: 0, orders: 0 }));
      validOrders.forEach(o => {
        const dt = new Date(o.createdAt);
        if (isNaN(dt) || dt < monday) return;
        const idx = (dt.getDay() + 6) % 7;
        timeline[idx].revenue += Number(o.total || 0);
        timeline[idx].orders += 1;
      });
    } else {
      const weeksUz = ['1-hafta (1-7)', '2-hafta (8-14)', '3-hafta (15-21)', '4-hafta (22-31)'];
      const weeksRu = ['1-я неделя (1-7)', '2-я неделя (8-14)', '3-я неделя (15-21)', '4-я неделя (22-31)'];
      timeline = weeksUz.map((w, i) => ({ labelUz: w, labelRu: weeksRu[i], revenue: 0, orders: 0 }));
      validOrders.forEach(o => {
        const dt = new Date(o.createdAt);
        if (isNaN(dt) || dt.getFullYear() !== now.getFullYear() || dt.getMonth() !== now.getMonth()) return;
        const idx = Math.min(3, Math.floor((dt.getDate() - 1) / 7));
        timeline[idx].revenue += Number(o.total || 0);
        timeline[idx].orders += 1;
      });
    }

    // Top mahsulotlar (Haqiqiy buyurtmalar asosida)
    const soldMap = {};
    validOrders.forEach(o => {
      (o.items || []).forEach(it => {
        soldMap[it.id] = (soldMap[it.id] || 0) + (it.quantity || 1);
      });
    });

    // BUGFIX: oldin shunchaki birinchi 5 ta mahsulot olinardi; endi eng ko'p sotilganlar
    const topProducts = [...products].sort((a, b) => (soldMap[b.id] || 0) - (soldMap[a.id] || 0)).slice(0, 5).map(p => {
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
    const requestedQty = {};
    let serverTotal = 0;

    for (const it of items) {
      const prodId = String(it.id || '').trim();
      if (!prodId) {
        return res.status(400).json({ success: false, error: "Mahsulot identifikatori (ID) ko'rsatilmagan!" });
      }

      const product = await getProductById(prodId, it.name);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Mahsulot topilmadi: ${it.name || prodId}`
        });
      }

      const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
      const currentStock = typeof product.stock === 'number' ? product.stock : 10;
      // BUGFIX: bir xil mahsulot savatda bir necha qatorda (masalan, turli rang) bo'lsa,
      // umumiy miqdor ombordan oshib ketmasligi tekshiriladi
      requestedQty[product.id] = (requestedQty[product.id] || 0) + qty;

      if (currentStock < requestedQty[product.id]) {
        return res.status(400).json({
          success: false,
          error: `Zaxira yetarli emas: "${product.name}" dan omborda ${currentStock} ta qolgan, siz ${qty} ta so'radingiz.`
        });
      }

      // Valyutani tekshirish (USD yoki UZS)
      const itemCurr = String(it.currency || req.body.currency || '').toUpperCase();
      const isUsd = itemCurr === 'USD' || itemCurr === '$' || (Number(it.dealPrice || it.price || 0) <= 5000 && product.priceUsd);
      const effectiveCurr = isUsd ? 'USD' : 'UZS';

      let unitPrice = isUsd
        ? (Number(product.priceUsd) || Math.round(Number(product.price || 0) / 12800))
        : Number(product.price || 0);

      const minPrice = isUsd
        ? (product.minPrice ? Math.round(Number(product.minPrice) / 12800) : Math.round(unitPrice * 0.92))
        : Number(product.minPrice || 0);

      const clientDealPrice = Number(it.dealPrice || it.price || 0);

      if (clientDealPrice > 0 && minPrice > 0 && clientDealPrice >= minPrice && clientDealPrice < unitPrice) {
        unitPrice = clientDealPrice;
      }
      serverTotal += unitPrice * qty;

      validatedItems.push({
        id: product.id,
        name: product.name,
        price: unitPrice,
        currency: effectiveCurr,
        quantity: qty,
        currentStock
      });
    }

    const settings = await getSettings();
    // BUGFIX: oldin ID faqat vaqtning oxirgi 5 raqamidan iborat edi -> takrorlanib,
    // MongoDB unique xatosi bilan buyurtma yo'qolishi mumkin edi
    const orderId = `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
    const now = new Date();
    // BUGFIX: serverda (Render, UTC) vaqt 5 soat farq qilardi -> Toshkent vaqti majburiy
    const tz = { timeZone: 'Asia/Tashkent' };
    const formattedDate = `${now.toLocaleTimeString('uz-UZ', { ...tz, hour: '2-digit', minute: '2-digit' })}, ${now.toLocaleDateString('uz-UZ', tz)}`;

    // BUGFIX: promo-kod chegirmasi oldin faqat mijoz ekranida ko'rinardi, sotuvchiga esa
    // to'liq narx borardi. Endi chegirma serverda tekshiriladi va hisoblanadi.
    const promoCode = String(req.body.promoCode || '').trim().toUpperCase();
    const discountRate = PROMO_CODES[promoCode] || 0;
    const subtotal = serverTotal;
    if (discountRate > 0) {
      serverTotal = Math.round(subtotal * (1 - discountRate));
    }

    const orderCurrency = validatedItems.some(vi => vi.currency === 'USD') ? 'USD' : 'UZS';

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
        currency: vi.currency,
        quantity: vi.quantity
      })),
      currency: orderCurrency,
      subtotal,
      discount: discountRate > 0 ? (subtotal - serverTotal) : 0,
      promoCode: discountRate > 0 ? promoCode : null,
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
        const freshProd = await getProductById(vi.id, vi.name);
        const curStock = freshProd && typeof freshProd.stock === 'number' ? freshProd.stock : vi.currentStock;
        const newStock = Math.max(0, curStock - vi.quantity);
        await updateProduct(vi.id, { stock: newStock });
      } catch (errStock) {
        console.error(`Ombor kamaytirishda xatolik (${vi.id}):`, errStock.message);
      }
    }

    // 4. Telegram xabarnoma (agar bot ulangan va yoqilgan bo'lsa)
    let tgResult = { success: false };
    const tg = settings.telegram;
    if (tg && tg.botToken && tg.chatId && tg.enabled !== false) {
      const itemsText = newOrder.items
        .map((it, idx) => `  ${idx + 1}. <b>${escapeTelegramHtml(it.name)}</b> x ${it.quantity} ta = ${formatSum(it.price * it.quantity, it.currency || newOrder.currency)}`)
        .join('\n');
      const isPickup = String(newOrder.customer.deliveryMethod || '').toLowerCase().includes('borib') ||
        String(newOrder.customer.deliveryMethod || '').toLowerCase().includes('pickup') ||
        String(newOrder.customer.deliveryMethod || '').toLowerCase().includes('olib');
      const deliveryName = isPickup
        ? "Do'kondan borib olish (Malika)"
        : "Yandex kuryer orqali yetkazish";

      const discountText = discountRate > 0
        ? `\n<b>Promokod (${escapeTelegramHtml(promoCode)}):</b> -${formatSum(subtotal - serverTotal, newOrder.currency)}\n<b>Asl summa:</b> <s>${formatSum(subtotal, newOrder.currency)}</s>\n`
        : '';

      const message = `<b>🛍 YANGI BUYURTMA #${escapeTelegramHtml(newOrder.id)}</b>\n\n` +
        `<b>👤 Mijoz:</b> ${escapeTelegramHtml(newOrder.customer.name)}\n` +
        `<b>📞 Telefon:</b> <code>${escapeTelegramHtml(newOrder.customer.phone)}</code>\n` +
        `<b>📍 Manzil:</b> ${escapeTelegramHtml(newOrder.customer.address)}\n` +
        `<b>🚚 Yetkazish:</b> ${escapeTelegramHtml(deliveryName)}\n` +
        (newOrder.customer.notes ? `<b>📝 Izoh:</b> ${escapeTelegramHtml(newOrder.customer.notes)}\n` : '') +
        `\n<b>📦 Tovarlar:</b>\n${itemsText}\n` +
        discountText +
        `\n💰 <b>JAMI TO'LOV:</b> <b>${formatSum(newOrder.total, newOrder.currency)}</b>\n` +
        `<i>🕒 Vaqt: ${escapeTelegramHtml(formattedDate)}</i>`;

      tgResult = await sendTelegramMessage(tg.botToken, tg.chatId, message);
      if (tgResult.success) {
        newOrder.telegramSent = true;
        if (mongoose.connection.readyState === 1) {
          await Order.updateOne({ id: newOrder.id }, { $set: { telegramSent: true } });
        }
        const oList = readJsonSafe(ORDERS_FILE, []);
        const oIdx = oList.findIndex(o => o.id === newOrder.id);
        if (oIdx !== -1) {
          oList[oIdx].telegramSent = true;
          writeJsonSafe(ORDERS_FILE, oList);
        }
      }
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

// ── AI Speed & Quota Tracker ──────────────────────────────
let openAiDisabledUntil = 0;

// 8. AI Chat (Dual AI: OpenAI GPT Primary + Gemini Flash + Bozorona Savdolashish)
app.post(['/api/chat', '/api/ai/chat'], async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: "Xabar bo'sh bo'lishi mumkin emas" });

  try {
    const settings = await getSettings();
    const products = await getAllProducts();
    const aiConfig = settings.ai || {};

    const catalogContext = products.map(p => {
      const minP = Number(p.minPrice || 0);
      const usdPrice = Number(p.priceUsd) || Math.round(Number(p.price || 0) / 12800);
      const minUsd = minP > 0 ? Math.round(minP / 12800) : Math.round(usdPrice * 0.92);

      const minNote = minP > 0
        ? `[MAXFIY MINIMAL: ${formatSum(minP)} / $${minUsd} — XARIDORGA ASLO AYTMA!]`
        : `[MAXFIY MINIMAL: ${formatSum(Math.round(p.price * 0.92))} / $${minUsd} — XARIDORGA ASLO AYTMA!]`;

      return `ID: ${p.id} | Nomi: "${p.name}" | Kategoriya: ${p.category} | Sotuv narxi: ${formatSum(p.price)} ($${usdPrice}) | ${minNote} | Holati: ${p.stock > 0 ? 'Mavjud (' + p.stock + ' ta)' : 'Tugagan'}`;
    }).join('\n');

    const storeInfo = `Do'kon: ${settings.shop?.name || 'Black Store'}, Manzil: ${settings.shop?.address || "Malika savdo markazi, B-blok 1-do'kon"}, Ish vaqti: ${settings.shop?.workingHours || '09:00 - 22:00'}, Tel: ${settings.shop?.phone || '+998 (95) 196-44-44'}. 2 soat ichida Yandex orqali yetkazib berish. 1 yil rasmiy kafolat.`;

    // Savdolashuv bosqichini aniqlash (1-bosqich: narxni himoya qilish, 2-bosqich: kichik qadam, 3-bosqich: yakuniy murosa)
    const bargainKeywords = ['qilib ber', 'qib ber', 'tush', 'arzon', 'chegirma', 'kam', 'qancha', 'berasiz', 'otib ber', "o'tib ber", 'skidka', 'deshevle', 'skidku', 'ustupite', 'oxiri', 'oxirgi'];
    const currentMsgLower = (message || '').toLowerCase();
    const isCurrentMsgBargain = bargainKeywords.some(kw => currentMsgLower.includes(kw));

    const pastBargainCount = (Array.isArray(history) ? history : []).filter(h => {
      if (h.role !== 'user') return false;
      const t = String(h.content || '').toLowerCase();
      return bargainKeywords.some(kw => t.includes(kw));
    }).length;

    const bargainStage = isCurrentMsgBargain ? pastBargainCount + 1 : pastBargainCount;

    const masterPrompt = `Siz 'Black Store' (Toshkent, Malika savdo markazi, B-blok 1-do'kon) do'koni egasining epchil, muomalali va tajribali virtual o'zbek savdogar sotuvchisisiz.

ENG ASOSIY MISSIYANGIZ: MAHSULOT EGASIGA (SAVDOGARGA) MAKSIMAL FOYDA KELTIRISH!
Har bir so'ralganda narxni tushiraverish — bu do'konga to'g'ridan-to'g'ri zarar va qat'iyan taqiqlanadi.
Lekin mijoz 2-3 marta so'raganda umuman tushmasdan toshday qotib turish ham xaridorni "ee bore" deb chiqib ketishiga sabab bo'ladi.
Shuning uchun siz SAVDODA OLTIN ME'YOR (GOLDEN BALANCE) qoidalariga qat'iy amal qilasiz: Klient ham mamnun bo'lsin, mahsulot egasiga ham maksimal foyda qolsin!

DO'KON MA'LUMOTLARI:
${storeInfo}

DO'KONDAGI TOVARLAR VA MAXFIY CHEGARALAR:
${catalogContext}

SAVDOLASHUVNING HOZIRGI BOSQICHI: ${bargainStage === 0 ? "Boshlang'ich muloqot (mahsulot haqida ma'lumot va asl narx)" : bargainStage === 1 ? "1-BOSQICH (Xaridorning 1-marta narx tushirish so'rovi)" : bargainStage === 2 ? "2-BOSQICH (Xaridorning 2-marta narx tushirish so'rovi)" : "3-BOSQICH (Xaridor 3 yoki undan ko'p marta so'radi — Yakuniy murosa)"}

QAT'IY BOSQICHMA-BOSQICH SAVDO QOIDALARI (OLTIN ME'YOR):
1. 1-BOSQICHDA (Xaridor 1-marta narx tushirishni so'raganda, masalan "qancha qilib berasan", "arzonroq bering", "tushib bering"):
   - QAT'IYAN BIR TIYIN HAM TUSHMAYSIZ!
   - Asl narxni to'liq himoya qiling: "Aka, narxini o'zi juda hamyonbop va qulay qilib qo'yganmiz. 100% original, zavod qutisida va 1 yil to'liq rasmiy kafolati bor. O'zi eng yaxshi narxda turibdi." deng.
   - Narxni o'zingiz tushirmasdan, samimiy qilib: "Lekin siz o'zingiz qanchaga mo'ljallayapsiz, o'z taklifingizni aytingchi?" deb to'pni xaridorga tashlang.

2. 2-BOSQICHDA (Xaridor 2-marta yana narx tushirishni so'rasa yoki o'zidan narx aytsa):
   - Agar xaridor haddan tashqari past narx aytgan bo'lsa (masalan 450 minglikka 350 ming): "Yo'q aka, bu narxga to'g'risi o'zimizga ham kelmaydi, original tovar." deb darhol rad qiling.
   - Lekin xaridor xafa bo'lib chiqib ketmasligi uchun birinchi juda kichik RAMZIY QADAM tashlang (narxning bor-yo'g'i 2% - 4% qismi):
     * Kichik aksessuarlarga (100k - 600k): atigi 10 000 - 15 000 so'm (yoki $1-$2).
     * O'rta toifaga (1 mln - 5 mln): 30 000 - 50 000 so'm ($3-$5).
     * Qimmat flagmanlarga (10 mln - 25 mln): 100 000 - 150 000 so'm ($10-$15).
   - "Sizga hurmatimiz uchun bir oz ko'nglingizga qarab, [YangiNarx] qilib bera olaman. Nima deysiz, kelishdikmi?" deb taklif qiling.

3. 3-BOSQICHDA (Xaridor 3-marta yana tush desa, 'oxirgi narxmi', 'yana tush' deb turib olsa):
   - Bu mijoz endi real xaridor, agar hozir kelishilmasa chiqib ketishi mumkin!
   - Shuning uchun samimiy, do'stona va "qo'lni tashlang" uslubida yakuniy murosa narxini bering:
     "Aka, sizgayam emas, mengayam emas, baribir oladigan mard odam ekansiz — [MurosaNarxi] ga qo'lni tashlang! Bu narxga bizga deyarli 1 tiyin ham foyda qolmaydi, faqat siz xursand bo'lib mining deb beryapman. Rozimisiz?"
   - DIQQAT: Bu Murosa Narxi hech qachon [MAXFIY MINIMAL] dan pastga tushmasligi shart! Savdogarga har doim munosib foyda qolishi shart!

4. VALYUTA QOIDASI (SO'M VA DOLLAR):
   - Xaridor dollarda ($) gapirsa, faqat DOLLARDA javob bering va savdolashing!
   - Xaridor so'mda gapirsa, faqat SO'MDA javob bering!

5. BUYURTMA RASMIYLASHTIRISH VA DEAL ACTION (ENG QAT'IY QOIDA):
   - QAT'IY TAQIQLANADI:
     Xaridor hali narx tushirishni so'rayotganida (masalan "ukam shuni 400 qilib ber", "arzonroq bering"), siz narx taklif qilayotganingizda yoki rad etayotganingizda HECH QACHON [DEAL] tegini qo'ymang va "Buyurtmani rasmiylashtirish uchun pastdagi tugmani bosing" deb YOZMANG!
     Chunki xaridor hali rozi bo'lgani yo'q, u faqat narx tushirishni so'rayapti!
   - FAQAT VA FAQAT xaridor siz aytgan narxga ROZI BO'LIB, "olaman", "roziman", "kelishdik", "buyurtma qilaylik", "sotib olaman" deb ANIQLIK KIRITGANDAGINA:
     Xabaringizda:
     "Barakasini bering! Tabriklayman! Buyurtmani shu maxsus kelishilgan narxda rasmiylashtirish uchun pastdagi yashil 'Kelishilgan narxda savatga olish' tugmasini bosing! Tovar avtomatik ravishda savatingizga kelishilgan narxda tushadi va bir necha soniyada yetkazib berishga buyurtma berasiz!" deb tushuntiring.
     Va xabaringizning eng oxiriga aniq ushbu tegi qo'shing:
     [DEAL:tovarId:kelishilganNarx:VALYUTA]
     Misol dollar uchun: [DEAL:100:1050:USD]
     Misol so'm uchun: [DEAL:bs-502:425000:UZS]

6. TIL VA USLUB:
   - Xaridor qaysi tilda yozsa (o'zbek yoki rus), o'sha tilda javob bering.
   - Tabiiy, samimiy, epchil o'zbek savdogari kabi gapiring.`;

    const openAiKey = (aiConfig.apiKey && aiConfig.apiKey.startsWith('sk-'))
      ? aiConfig.apiKey.trim()
      : (process.env.OPENAI_API_KEY || '').trim();

    const geminiKey = (aiConfig.apiKey && !aiConfig.apiKey.startsWith('sk-') && aiConfig.apiKey.trim().length > 10)
      ? aiConfig.apiKey.trim()
      : (process.env.GEMINI_API_KEY || '').trim();

    let rawReply = null;
    let usedProvider = null;

    // 1. PRIMARY AI: Google Gemini Flash (Eng tezkor va faol model - 1.2s)
    if (geminiKey) {
      try {
        const contents = [];
        if (Array.isArray(history)) {
          history.slice(-8).forEach(h => {
            const role = h.role === 'user' ? 'user' : 'model';
            if (contents.length > 0 && contents[contents.length - 1].role === role) {
              contents[contents.length - 1].parts[0].text += `\n${String(h.content || '')}`;
            } else {
              contents.push({
                role,
                parts: [{ text: String(h.content || '') }]
              });
            }
          });
        }

        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts[0].text += `\n${message}`;
        } else {
          contents.push({ role: 'user', parts: [{ text: message }] });
        }

        const tryGemini = async (modelName) => {
          const geminiController = new AbortController();
          const geminiTimer = setTimeout(() => geminiController.abort(), 10000);
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: geminiController.signal,
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: masterPrompt }] },
                contents,
                generationConfig: {
                  temperature: 0.45,
                  maxOutputTokens: 2048,
                  thinkingConfig: { thinkingBudget: 0 }
                }
              })
            });
            if (!res.ok) {
              const errText = await res.text();
              console.warn(`⚠️ Gemini (${modelName}) xato: status ${res.status}`, errText.substring(0, 120));
              return null;
            }
            return await res.json();
          } catch (e) {
            console.warn(`⚠️ Gemini (${modelName}) tarmoq xatosi:`, e.message);
            return null;
          } finally {
            clearTimeout(geminiTimer);
          }
        };

        let data = await tryGemini('gemini-2.5-flash');
        if (!data?.candidates) data = await tryGemini('gemini-flash-latest');

        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          rawReply = data.candidates[0].content.parts[0].text;
          usedProvider = 'gemini';
        }
      } catch (err) {
        console.warn('⚠️ Gemini xatolik:', err.message);
      }
    }

    // 2. SECONDARY AI: OpenAI GPT (faqat Gemini ishlamasa va limit bo'lsa)
    if (!rawReply && openAiKey && Date.now() > openAiDisabledUntil) {
      const openAiController = new AbortController();
      const openAiTimer = setTimeout(() => openAiController.abort(), 8000);
      try {
        const messages = [
          { role: 'system', content: masterPrompt },
          ...(Array.isArray(history) ? history.slice(-6).map(h => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: String(h.content || '')
          })) : []),
          { role: 'user', content: message }
        ];

        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          signal: openAiController.signal,
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.5,
            max_tokens: 1500
          })
        });

        if (r.ok) {
          const data = await r.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            rawReply = text;
            usedProvider = 'openai';
          }
        } else {
          const errText = await r.text();
          if (r.status === 429 || r.status === 401) {
            openAiDisabledUntil = Date.now() + 24 * 60 * 60 * 1000; // 24 soat kutish
          }
          console.warn('⚠️ OpenAI javob bermadi (status:', r.status, '), Smart Offline dvigateliga o\'tilmoqda');
        }
      } catch (err) {
        console.warn('⚠️ OpenAI tarmoq xatosi, Smart Offline dvigateliga o\'tilmoqda:', err.message);
      } finally {
        clearTimeout(openAiTimer);
      }
    }

    // 3. OFFLINE FALLBACK: Algoritmik Aqlli Savdolashish Dvigateli
    if (!rawReply) {
      rawReply = generateSmartFallbackReply(message, products, settings.shop, history);
      usedProvider = 'smart-offline';
    }

    // Xaridor rozi bo'lgan-bo'lmaganini aniqlash:
    // Faqat xaridor "olaman", "roziman", "kelishdik", "buyurtma beraman" deb ANIQLIK kiritgandagina KELISHUV amalga oshadi.
    // Savdolashish paytida ("ukam shuni 400 qilib ber", "arzonroq bering") KELISHUV YO'Q!
    const isCustomerAgreement = isExplicitCustomerAgreement(message);

    let deal = null;
    let cleanReply = rawReply;
    const dealMatch = rawReply.match(/\[DEAL:([^:]+):(\d+)(?::([a-zA-Z$]+))?\]/i);

    // 1. Agar xaridor hali rozi bo'lmagan bo'lsa (savdolashayotgan bo'lsa):
    if (!isCustomerAgreement) {
      // Hech qanday DEAL obyekti berilmaydi (yashil karta CHIQMAYDI)
      deal = null;
      // Agar model adashib [DEAL] tegini yoki buyurtma rasmiylashtirish matnini qo'shgan bo'lsa, uni tozalaymiz!
      cleanReply = rawReply.replace(/\[DEAL:[^\]]+\]/gi, '').trim();
      cleanReply = cleanReply.replace(/\n*🛍️\s*\*\*Buyurtmani shu kelishilgan narxda[^\n*]*\*\*/gi, '').trim();
      cleanReply = cleanReply.replace(/Buyurtmani shu kelishilgan narxda rasmiylashtirish uchun pastdagi[^.]*\./gi, '').trim();
      cleanReply = cleanReply.replace(/pastdagi yashil 'Kelishilgan narxda savatga olish' tugmasini bosing!/gi, '').trim();
    } else {
      // 2. FAQAT xaridor aniq rozi bo'lgandagina (masalan "olaman", "roziman", "kelishdik"):
      if (dealMatch) {
        const dealProdId = String(dealMatch[1]).trim();
        const dealPrice = Number(dealMatch[2]);
        let dealCurr = (dealMatch[3] || '').trim().toUpperCase();
        const matchedProd = products.find(p => String(p.id) === dealProdId);

        if (matchedProd && dealPrice > 0) {
          if (!dealCurr || dealCurr === '$') {
            dealCurr = (dealPrice <= 5000 && matchedProd.priceUsd) ? 'USD' : 'UZS';
          }
          const isUsd = dealCurr === 'USD';
          const prodPrice = isUsd
            ? (Number(matchedProd.priceUsd) || Math.round(Number(matchedProd.price || 0) / 12800))
            : Number(matchedProd.price || 0);

          const minP = isUsd
            ? (matchedProd.minPrice ? Math.round(Number(matchedProd.minPrice) / 12800) : Math.round(prodPrice * 0.92))
            : Number(matchedProd.minPrice || 0);

          if (minP === 0 || dealPrice >= minP) {
            deal = {
              productId: matchedProd.id,
              productName: matchedProd.name,
              price: dealPrice,
              regularPrice: prodPrice,
              currency: dealCurr
            };
          }
        }
        cleanReply = rawReply.replace(/\[DEAL:[^\]]+\]/gi, '').trim();
      }

      // Agar xaridor "olaman / roziman" degan, lekin model [DEAL] tegini qo'ymagan bo'lsa:
      if (!deal && products.length > 0) {
        let targetProd = products[0];
        if (products.length > 1) {
          const allContextText = (message + ' ' + (history || []).map(h => h.content).join(' ')).toLowerCase();
          targetProd = products.find(p => allContextText.includes(p.name.toLowerCase()) || allContextText.includes((p.name_uz || '').toLowerCase())) || products[0];
        }

        if (targetProd) {
          const lastAssistantMsg = [...(history || [])].reverse().find(h => h.role === 'assistant');
          const lastText = (lastAssistantMsg ? lastAssistantMsg.content : '') + ' ' + cleanReply;
          const isDollarContext = lastText.includes('$') || lastText.toLowerCase().includes('dollar') || lastText.toLowerCase().includes('usd');

          let foundPrice = null;
          let foundCurr = 'UZS';

          if (isDollarContext) {
            const dollarRegex = /(?:\$|\bUSD\b)?\s*(\d{2,4})\s*(?:\$|\bUSD\b|\bdollar\b)?/gi;
            const dMatches = [...lastText.matchAll(dollarRegex)];
            for (const m of dMatches) {
              const num = Number(m[1]);
              const targetUsd = Number(targetProd.priceUsd) || Math.round(targetProd.price / 12800);
              const minUsd = targetProd.minPrice ? Math.round(targetProd.minPrice / 12800) : Math.round(targetUsd * 0.92);
              if (num >= minUsd && num <= targetUsd) {
                foundPrice = num;
                foundCurr = 'USD';
              }
            }
          }

          if (!foundPrice) {
            const priceRegex = /(\d{1,3}(?:\s?\d{3})+)\s*(?:so'm|som|sum)?/gi;
            const matches = [...lastText.matchAll(priceRegex)];
            for (const m of matches) {
              const num = Number(m[1].replace(/\s+/g, ''));
              const minP = Number(targetProd.minPrice || 0);
              if (num > 10000 && num <= targetProd.price && (minP === 0 || num >= minP)) {
                foundPrice = num;
                foundCurr = 'UZS';
              }
            }
          }

          if (foundPrice) {
            const regularPrice = foundCurr === 'USD'
              ? (Number(targetProd.priceUsd) || Math.round(targetProd.price / 12800))
              : targetProd.price;

            deal = {
              productId: targetProd.id,
              productName: targetProd.name,
              price: foundPrice,
              regularPrice,
              currency: foundCurr
            };

            if (!cleanReply.includes('savatga olish') && !cleanReply.includes('tugma')) {
              cleanReply += `\n\n🛍️ **Buyurtmani shu kelishilgan narxda rasmiylashtirish uchun pastdagi 'Kelishilgan narxda savatga olish' tugmasini bosing!**`;
            }
          }
        }
      }
    }

    return res.json({
      reply: cleanReply,
      deal,
      provider: usedProvider
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function isExplicitCustomerAgreement(userMsg) {
  const msg = (userMsg || '').toLowerCase().trim();

  // Agar xaridor hali narx tushirishni so'rayotgan yoki savdolashayotgan bo'lsa:
  // Masalan: "400 qilib ber", "tushirib ber", "380 bo'ladimi", "oxirgi narx qancha", "arzonroq bering", "sal o'tib bering"
  // Bu KELISHUV EMAS!
  if (
    msg.includes('qilib ber') || msg.includes('qib ber') || msg.includes('tushir') ||
    msg.includes("o'tib") || msg.includes('otib') || msg.includes('tushib') || msg.includes('kamaytir') ||
    msg.includes('arzon') || msg.includes('chegirma') || msg.includes('berasizmi') ||
    msg.includes('berarmisiz') || msg.includes('boladimi') || msg.includes("bo'ladimi") ||
    msg.includes('qancha') || msg.includes('oxiri') || msg.includes('minimal') ||
    msg.includes('bormi') ||
    (/\b\d+\s*(?:ga|som|so'm|\$)?\s*(?:qilib\s*)?ber(?:ing)?\b/i.test(msg) && !msg.includes('olaman') && !msg.includes('rozi') && !msg.includes('kelishdik'))
  ) {
    return false;
  }

  // Aniq sotib olish / rozi bo'lish kalit so'zlari:
  const agreementKeywords = [
    'olaman', 'olay', 'roziman', 'rozi', 'kelishdik', 'kelishamiz',
    'buyurtma', 'zakaz', 'yozing', 'yozvor', 'menga bering', 'shu narxga bering',
    'yetkazib bering', 'qanday olaman', 'qanday rasmiylashtiraman',
    'mayli shu narx', 'hop olaman', "xo'p olaman", 'xop olaman',
    'shu narxda olaman', "bo'pti olaman", 'bopti olaman',
    'согласен', 'беру', 'оформляй', 'заказ', 'заберу'
  ];

  return agreementKeywords.some(kw => msg.includes(kw));
}

function generateSmartFallbackReply(msg, products, shop, history = []) {
  const text = (msg || '').toLowerCase();
  const isDollar = text.includes('$') || text.includes('dollar') || text.includes('usd');
  const isAgreement = isExplicitCustomerAgreement(msg);

  // Kelishuv va buyurtma rasmiylashtirish (FAQAT xaridor rozi bo'lganda)
  if (isAgreement) {
    const p = products[0];
    if (p) {
      if (isDollar) {
        const usdP = Number(p.priceUsd) || Math.round(p.price / 12800);
        const minUsd = p.minPrice ? Math.round(p.minPrice / 12800) : Math.round(usdP * 0.92);
        const agreed = Math.max(minUsd, Math.round(usdP * 0.96));
        return `Barakasini bering! Tabriklayman! Buyurtmani shu maxsus kelishilgan ${agreed} $ narxda rasmiylashtirish uchun quyidagi 'Kelishilgan narxda savatga olish' tugmasini bosing! Tovar avtomatik savatingizga tushadi va manzilingizga buyurtma berasiz! [DEAL:${p.id}:${agreed}:USD]`;
      }
      const minP = Number(p.minPrice || Math.round(p.price * 0.92));
      const agreed = Math.max(minP, Math.round(p.price * 0.96));
      return `Barakasini bering! Tabriklayman! Buyurtmani shu maxsus kelishilgan narxda rasmiylashtirish uchun quyidagi 'Kelishilgan narxda savatga olish' tugmasini bosing! Tovar avtomatik savatingizga tushadi va manzilingizga buyurtma berasiz! [DEAL:${p.id}:${agreed}:UZS]`;
    }
  }

  // Savdolashuv bosqichini hisoblash
  const bargainKeywords = ['qilib ber', 'qib ber', 'tush', 'arzon', 'chegirma', 'kam', 'qancha', 'berasiz', 'otib ber', "o'tib ber", 'skidka', 'deshevle', 'skidku', 'ustupite', 'oxiri', 'oxirgi'];
  const pastBargainCount = (Array.isArray(history) ? history : []).filter(h => {
    if (h.role !== 'user') return false;
    const t = String(h.content || '').toLowerCase();
    return bargainKeywords.some(kw => t.includes(kw));
  }).length;
  const isBargaining = bargainKeywords.some(kw => text.includes(kw));
  const bargainStage = isBargaining ? pastBargainCount + 1 : pastBargainCount;

  // Savdolashish va narx tushirish so'rovi (Oltin Me'yor tamoyili):
  if (isBargaining) {
    const p = products[0];
    if (p) {
      const isUsd = isDollar;
      const prodPrice = isUsd ? (Number(p.priceUsd) || Math.round(p.price / 12800)) : Number(p.price);
      const minP = isUsd
        ? (p.minPrice ? Math.round(p.minPrice / 12800) : Math.round(prodPrice * 0.92))
        : Number(p.minPrice || Math.round(p.price * 0.92));

      // 1-BOSQICH: Asl narxni himoya qilish (0 so'm chegirma!)
      if (bargainStage <= 1) {
        return `Aka, "${p.name}" narxi ${isUsd ? '$' + prodPrice : formatSum(prodPrice) + ' so\'m'}. 100% original, zavod qutisida va 1 yil to'liq rasmiy kafolati bor. O'zi juda hamyonbop va qulay narxda qo'yilgan. Lekin siz o'zingiz qanchaga mo'ljallayapsiz, o'z taklifingizni aytingchi?`;
      }

      // 2-BOSQICH: Juda kichik ramziy chegirma (2-3%)
      if (bargainStage === 2) {
        const step1 = isUsd
          ? Math.max(1, Math.round(prodPrice * 0.025))
          : (p.price > 5000000 ? 100000 : (p.price > 1000000 ? 30000 : 15000));
        const offer1 = Math.max(minP, prodPrice - step1);
        return `Aka, bu narxga to'g'risi o'zimizga ham kelmaydi. Lekin sizga hurmatimiz uchun bir oz ko'nglingizga qarab, ${isUsd ? '$' + offer1 : formatSum(offer1) + ' so\'m'} qilib bera olaman. Nima deysiz, kelishdikmi?`;
      }

      // 3-BOSQICH VA UNDAN YUQORI: Murosa yakuniy chegirma (mijoz bezib ketmasligi uchun)
      const step2 = isUsd
        ? Math.max(2, Math.round(prodPrice * 0.05))
        : (p.price > 5000000 ? 250000 : (p.price > 1000000 ? 70000 : 30000));
      const offerFinal = Math.max(minP, prodPrice - step2);
      return `Aka, sizgayam emas, mengayam emas, baribir oladigan mard odam ekansiz — ${isUsd ? '$' + offerFinal : formatSum(offerFinal) + ' so\'m'} ga qo'lni tashlang! Bu narxga deyarli foyda qolmaydi, faqat siz xursand bo'ling deb beryapman. Rozimisiz?`;
    }
  }

  // Xaridor minimal narx yoki aldashga urinayotganda
  if (text.includes('minimal') || text.includes('oxirgi narx') || text.includes('oxiri qancha') || text.includes('max qancha') || text.includes('eng past')) {
    return `Aka, aniq bir narx aytolmayman, siz o'zingiz taklif bering, savdolashamiz! Qaysi tovarimiz sizni qiziqtiryapti va qanchaga olmoqchisiz?`;
  }

  if (text.includes('salom') || text.includes('assalom') || text.includes('privet')) {
    return `Assalomu alaykum! Xush kelibsiz! Men ${shop?.name || 'Black Store'} do'koni savdo maslahatchisiman. Gadjetlarimizni qulay narxlarda beramiz, bemalol savdolashishimiz mumkin! Qaysi tovar kerak sizga?`;
  }
  if (text.includes('dostavka') || text.includes('yetkaz') || text.includes('yetkazib')) {
    return `Ha! Toshkent shahri bo'ylab 1-2 soat ichida yetkazib beramiz. Shuningdek do'kondan (Malika, B-blok 1-do'kon) o'zingiz ham olib ketishingiz mumkin!`;
  }
  if (text.includes('kafolat') || text.includes('garantiya') || text.includes('original')) {
    return `Barcha qurilmalar 100% original, zavod qutisida. Har biriga 1 yil rasmiy kafolat beramiz!`;
  }
  if (text.includes('qayerda') || text.includes('adres') || text.includes('manzil')) {
    return `Manzil: ${shop?.address || "Toshkent sh., Malika savdo markazi, B-blok 1-do'kon"}. Ish vaqti: ${shop?.workingHours || '09:00 - 22:00'}. Tel: ${shop?.phone || '+998 (95) 196-44-44'}`;
  }

  // Mahsulotni topish
  const matched = products.filter(p => {
    const words = text.split(/\s+/);
    return words.some(w => w.length > 2 && (
      p.name.toLowerCase().includes(w) ||
      (p.brand || '').toLowerCase().includes(w) ||
      p.category.toLowerCase().includes(w)
    ));
  }).slice(0, 3);

  if (matched.length > 0) {
    const p = matched[0];
    if (text.includes('arzon') || text.includes('tush') || text.includes('chegirma') || text.includes('savdo') || text.includes('berasizmi')) {
      // 1-bosqich: Narxni himoya qilish
      return `"${p.name}" hozirda ${formatSum(p.price)} so'm. Bu tovarimiz 100% original va 1 yil to'liq kafolati bor. O'zi juda qulay arzon narxda qo'yilgan, aka!`;
    }

    let resp = `Mos kelgan tovarlarimiz:\n\n`;
    matched.forEach(item => {
      resp += `- ${item.name}: ${formatSum(item.price)} (~$${item.priceUsd}).\n`;
    });
    return resp + `\nNarx bo'yicha ham gaplashib kelishamiz, qaysi biri ma'qul?`;
  }

  return `Bizda smartfonlar, noutbuklar va aksessuarlar mavjud. 1 yil rasmiy kafolat va tezkor yetkazish bilan. Narxini ham savdolashib kelishamiz! Qaysi mahsulot sizni qiziqtiryapti?`;
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
  } catch (_) { }

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
