require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || '';

// ── MongoDB ulanish ──────────────────────────────────────
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Atlas ga ulandi!'))
    .catch(err => console.error('❌ MongoDB ulanishda xatolik:', err.message));
} else {
  console.warn('⚠️  MONGO_URI belgilanmagan — JSON fayllar ishlatiladi (lokal rejim)');
}

// ── Mongoose Schemas ──────────────────────────────────────
const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main' },
  shop: {
    name: String,
    tagline: String,
    description: String,
    phone: String,
    address: String,
    instagram: String,
    telegramChannel: String,
    currency: { type: String, default: 'UZS' },
    workingHours: String,
    adminPin: String
  },
  telegram: {
    botToken: String,
    chatId: String,
    enabled: { type: Boolean, default: false }
  },
  ai: {
    provider: { type: String, default: 'gemini' },
    apiKey: String,
    systemPrompt: String,
    welcomeMessage: String
  }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  category: String,
  brand: String,
  price: Number,
  oldPrice: Number,
  priceUsd: Number,
  image: String,
  description: String,
  specs: [String],
  stock: { type: Number, default: 10 },
  featured: { type: Boolean, default: false },
  badge: String
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  formattedDate: String,
  customer: {
    name: String,
    phone: String,
    address: String,
    deliveryMethod: String,
    notes: String
  },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  status: { type: String, default: 'new' },
  telegramSent: { type: Boolean, default: false }
}, { timestamps: true });

const Settings = mongoose.model('Settings', SettingsSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

// ── Brute-force himoyasi ──────────────────────────────────
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const BLOCK_MINUTES = 15;

function checkBruteForce(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  if (record.blockedUntil > now) {
    const remainMin = Math.ceil((record.blockedUntil - now) / 60000);
    return res.status(429).json({ success: false, message: `Juda ko'p urinish. ${remainMin} daqiqadan so'ng qayta urinib ko'ring.` });
  }
  next();
}
function recordFailedLogin(ip) {
  const record = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = Date.now() + BLOCK_MINUTES * 60 * 1000;
    record.count = 0;
  }
  loginAttempts.set(ip, record);
}
function clearLoginRecord(ip) { loginAttempts.delete(ip); }

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── File paths (JSON fallback uchun) ──────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const DEFAULT_SETTINGS = {
  shop: {
    name: "Do'kon nomi",
    tagline: 'Tagline',
    description: '',
    phone: '',
    address: '',
    instagram: '',
    telegramChannel: '',
    currency: 'UZS',
    workingHours: '10:00 - 20:00',
    adminPin: process.env.ADMIN_PIN || '1234'
  },
  telegram: { botToken: '', chatId: '', enabled: false },
  ai: {
    provider: 'gemini',
    apiKey: process.env.GEMINI_API_KEY || '',
    systemPrompt: "Siz professional va samimiy virtual savdo maslahatchisisiz.",
    welcomeMessage: 'Assalomu alaykum! Sizga qanday yordam bera olaman?'
  }
};

// ── Helpers: MongoDB yoki JSON ────────────────────────────
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function readJson(file, defaultValue = []) {
  try {
    if (!fs.existsSync(file)) return defaultValue;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch { return defaultValue; }
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch { return false; }
}

async function getSettings() {
  if (isMongoConnected()) {
    let s = await Settings.findOne({ key: 'main' }).lean();
    if (!s) s = await Settings.create({ key: 'main', ...DEFAULT_SETTINGS });
    return s;
  }
  if (!fs.existsSync(SETTINGS_FILE)) writeJson(SETTINGS_FILE, DEFAULT_SETTINGS);
  return readJson(SETTINGS_FILE, DEFAULT_SETTINGS);
}

async function saveSettings(data) {
  if (isMongoConnected()) {
    const toSet = {};
    if (data.shop) {
      for (const [k, v] of Object.entries(data.shop)) toSet[`shop.${k}`] = v;
    }
    if (data.telegram) {
      for (const [k, v] of Object.entries(data.telegram)) toSet[`telegram.${k}`] = v;
    }
    if (data.ai) {
      for (const [k, v] of Object.entries(data.ai)) toSet[`ai.${k}`] = v;
    }
    return await Settings.findOneAndUpdate(
      { key: 'main' },
      { $set: toSet },
      { upsert: true, new: true, lean: true }
    );
  }
  const current = readJson(SETTINGS_FILE, DEFAULT_SETTINGS);
  const updated = {
    ...current,
    shop: { ...current.shop, ...(data.shop || {}) },
    telegram: { ...current.telegram, ...(data.telegram || {}) },
    ai: { ...current.ai, ...(data.ai || {}) }
  };
  writeJson(SETTINGS_FILE, updated);
  return updated;
}

async function getProducts(filter = {}) {
  if (isMongoConnected()) {
    const query = {};
    if (filter.category && filter.category !== 'Barchasi') {
      query.category = { $regex: new RegExp(filter.category, 'i') };
    }
    if (filter.search) {
      const q = filter.search;
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    return await Product.find(query).sort({ createdAt: -1 }).lean();
  }
  let products = readJson(PRODUCTS_FILE, []);
  if (filter.category && filter.category !== 'Barchasi') {
    products = products.filter(p => p.category.toLowerCase() === filter.category.toLowerCase());
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }
  return products;
}

async function getAllProducts() {
  if (isMongoConnected()) return await Product.find().sort({ createdAt: -1 }).lean();
  return readJson(PRODUCTS_FILE, []);
}

async function createProduct(data) {
  if (isMongoConnected()) {
    const product = await Product.create({ ...data, id: data.id || `prod-${Date.now()}` });
    return product.toObject();
  }
  const products = readJson(PRODUCTS_FILE, []);
  products.unshift(data);
  writeJson(PRODUCTS_FILE, products);
  return data;
}

async function updateProduct(id, data) {
  if (isMongoConnected()) {
    return await Product.findOneAndUpdate({ id }, { $set: data }, { new: true, lean: true });
  }
  const products = readJson(PRODUCTS_FILE, []);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...data };
  writeJson(PRODUCTS_FILE, products);
  return products[index];
}

async function deleteProduct(id) {
  if (isMongoConnected()) {
    const result = await Product.deleteOne({ id });
    return result.deletedCount > 0;
  }
  let products = readJson(PRODUCTS_FILE, []);
  const before = products.length;
  products = products.filter(p => p.id !== id);
  writeJson(PRODUCTS_FILE, products);
  return products.length < before;
}

async function getOrders() {
  if (isMongoConnected()) return await Order.find().sort({ createdAt: -1 }).lean();
  return readJson(ORDERS_FILE, []);
}

async function createOrder(data) {
  if (isMongoConnected()) {
    const order = await Order.create(data);
    return order.toObject();
  }
  const orders = readJson(ORDERS_FILE, []);
  orders.unshift(data);
  writeJson(ORDERS_FILE, orders);
  return data;
}

async function updateOrderStatus(id, status) {
  if (isMongoConnected()) {
    return await Order.findOneAndUpdate({ id }, { $set: { status } }, { new: true, lean: true });
  }
  const orders = readJson(ORDERS_FILE, []);
  const order = orders.find(o => o.id === id);
  if (!order) return null;
  order.status = status;
  writeJson(ORDERS_FILE, orders);
  return order;
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

// ── Telegram helper ───────────────────────────────────────
async function sendTelegramMessage(botToken, chatId, text) {
  if (!botToken || !chatId) return { success: false, reason: 'Bot token yoki Chat ID belgilanmagan' };
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });
    const result = await res.json();
    if (!result.ok) return { success: false, reason: result.description };
    return { success: true, result };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

function formatSum(num) {
  return Number(num || 0).toLocaleString('uz-UZ') + " so'm";
}

// ── Admin auth middleware ─────────────────────────────────
async function verifyAdmin(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  try {
    const settings = await getSettings();
    const correctPin = settings.shop?.adminPin || '1234';
    const expectedToken = 'auth_' + Buffer.from(correctPin).toString('base64');
    if (authHeader === expectedToken || authHeader === correctPin) return next();
    return res.status(403).json({ error: 'Ruxsat berilmagan' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ── Maxfiy Admin Panel URL ────────────────────────────────
app.get('/blackstore-6666', (req, res) => {
  res.sendFile(path.join(__dirname, 'private', 'admin.html'));
});

app.get(['/admin', '/admin.html', '/administrator', '/wp-admin'], (req, res) => {
  res.status(404).send('<!DOCTYPE html><html lang="uz"><head><meta charset="UTF-8"><title>404 Topilmadi</title><style>body{background:#0a0d14;color:#94a3b8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column}h1{color:#f8fafc;font-size:3rem;margin:0}p{margin-top:10px}</style></head><body><h1>404</h1><p>Kechirasiz, bunday sahifa mavjud emas.</p><a href="/" style="color:#06b6d4;margin-top:20px;text-decoration:none">Bosh sahifaga qaytish</a></body></html>');
});

// ── API ROUTES ────────────────────────────────────────────

// 1. Public Shop Info
app.get('/api/shop', async (req, res) => {
  try {
    const settings = await getSettings();
    const publicShop = { ...(settings.shop || {}) };
    delete publicShop.adminPin;
    res.json({ shop: publicShop, aiWelcome: settings.ai?.welcomeMessage || 'Salom!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Admin Login
app.post('/api/admin/login', checkBruteForce, async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const { pin } = req.body;
  try {
    const settings = await getSettings();
    const correctPin = settings.shop?.adminPin || process.env.ADMIN_PIN || '1234';
    if (pin === correctPin) {
      clearLoginRecord(ip);
      return res.json({ success: true, token: 'auth_' + Buffer.from(correctPin).toString('base64') });
    }
    recordFailedLogin(ip);
    return res.status(401).json({ success: false, message: "PIN kod noto'g'ri!" });
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
    const newToken = 'auth_' + Buffer.from(updated.shop?.adminPin || '').toString('base64');
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

// 5. Admin Product CRUD
app.post('/api/admin/products', verifyAdmin, upload.single('imageFile'), async (req, res) => {
  try {
    const { name, category, brand, price, oldPrice, priceUsd, description, specs, stock, badge, featured, imageUrl } = req.body;
    let image = imageUrl || '';
    if (req.file) image = `/uploads/${req.file.filename}`;
    if (!image) image = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';

    let parsedSpecs = [];
    if (typeof specs === 'string') {
      try { parsedSpecs = JSON.parse(specs); }
      catch { parsedSpecs = specs.split('\n').map(s => s.trim()).filter(Boolean); }
    } else if (Array.isArray(specs)) parsedSpecs = specs;

    const newProduct = {
      id: `prod-${Date.now()}`,
      name: name || 'Nomsiz Mahsulot',
      category: category || 'Smartfonlar',
      brand: brand || 'Boshqa',
      price: Number(price) || 0,
      oldPrice: oldPrice ? Number(oldPrice) : null,
      priceUsd: priceUsd ? Number(priceUsd) : Math.round((Number(price) || 0) / 12800),
      image,
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

app.put('/api/admin/products/:id', verifyAdmin, upload.single('imageFile'), async (req, res) => {
  try {
    const products = await getAllProducts();
    const existing = products.find(p => p.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'Mahsulot topilmadi' });

    let image = existing.image;
    if (req.file) image = `/uploads/${req.file.filename}`;
    else if (req.body.imageUrl) image = req.body.imageUrl;

    let parsedSpecs = existing.specs;
    if (req.body.specs !== undefined) {
      if (typeof req.body.specs === 'string') {
        try { parsedSpecs = JSON.parse(req.body.specs); }
        catch { parsedSpecs = req.body.specs.split('\n').map(s => s.trim()).filter(Boolean); }
      } else if (Array.isArray(req.body.specs)) parsedSpecs = req.body.specs;
    }

    const updatedData = {
      ...existing,
      name: req.body.name !== undefined ? req.body.name : existing.name,
      category: req.body.category !== undefined ? req.body.category : existing.category,
      brand: req.body.brand !== undefined ? req.body.brand : existing.brand,
      price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
      oldPrice: req.body.oldPrice !== undefined ? (req.body.oldPrice ? Number(req.body.oldPrice) : null) : existing.oldPrice,
      priceUsd: req.body.priceUsd !== undefined ? Number(req.body.priceUsd) : existing.priceUsd,
      image,
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

// 6. Orders (Client checkout)
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, total } = req.body;
    if (!customer || !customer.phone || !items || !items.length) {
      return res.status(400).json({ error: "Buyurtma ma'lumotlari to'liq emas!" });
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
        name: customer.name || 'Mijoz',
        phone: customer.phone,
        address: customer.address || "Ko'rsatilmagan",
        deliveryMethod: customer.deliveryMethod || 'yandex',
        notes: customer.notes || ''
      },
      items: items.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity || 1 })),
      total: Number(total) || 0,
      status: 'new',
      telegramSent: false
    };

    await createOrder(newOrder);

    let tgResult = { success: false };
    const tg = settings.telegram;
    if (tg && tg.botToken && tg.chatId) {
      const itemsText = newOrder.items
        .map((it, idx) => `  ${idx + 1}. <b>${it.name}</b> x ${it.quantity} ta = ${formatSum(it.price * it.quantity)}`)
        .join('\n');
      const deliveryName = newOrder.customer.deliveryMethod === 'pickup'
        ? "Dokondan o'zi olib ketish"
        : "Yandex Taxi / Kuryer orqali yetkazish";
      const message = `YANGI BUYURTMA #${newOrder.id}\n` +
        `Mijoz: ${newOrder.customer.name}\n` +
        `Telefon: ${newOrder.customer.phone}\n` +
        `Manzil: ${newOrder.customer.address}\n` +
        `Yetkazish: ${deliveryName}\n` +
        (newOrder.customer.notes ? `Izoh: ${newOrder.customer.notes}\n` : '') +
        `\nTanlangan tovarlar:\n${itemsText}\n` +
        `\nJAMI: ${formatSum(newOrder.total)}\n` +
        `Vaqt: ${formattedDate}`;
      tgResult = await sendTelegramMessage(tg.botToken, tg.chatId, message);
    }

    res.status(201).json({ success: true, orderId: newOrder.id, telegramSent: tgResult.success });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// 7. Telegram test
app.post('/api/admin/test-telegram', verifyAdmin, async (req, res) => {
  const { botToken, chatId } = req.body;
  if (!botToken || !chatId) return res.status(400).json({ error: 'Bot token va Chat ID kiritilishi shart!' });
  const testMessage = `Telegram Bot muvaffaqiyatli ulandi!\n\nEndi xaridorlar buyurtma berganda, to'liq chek shu yerga kelib tushadi.\nSinov vaqti: ${new Date().toLocaleTimeString('uz-UZ')}`;
  const result = await sendTelegramMessage(botToken, chatId, testMessage);
  if (result.success) res.json({ success: true, message: 'Telegramga sinov xabari yuborildi!' });
  else res.status(400).json({ success: false, error: result.reason });
});

// 8. AI Chat
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Xabar bo'sh bo'lishi mumkin emas" });

  try {
    const settings = await getSettings();
    const products = await getAllProducts();
    const aiConfig = settings.ai || {};

    const catalogContext = products.map(p =>
      `- ${p.name} (${p.category}) narxi: ${formatSum(p.price)}, $${p.priceUsd}. ${p.description}. Xususiyatlar: ${(p.specs || []).join(', ')}. Holati: ${p.stock > 0 ? 'Mavjud (' + p.stock + ' ta)' : 'Tugagan'}`
    ).join('\n');

    const storeInfo = `Do'kon: ${settings.shop?.name || 'iStore'}, Manzil: ${settings.shop?.address || ''}, Ish vaqti: ${settings.shop?.workingHours || '10:00-20:00'}, Tel: ${settings.shop?.phone || ''}. 2 soat ichida Yandex orqali yetkazib berish. 1 yil rasmiy kafolat.`;

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
    return `Assalomu alaykum! Xush kelibsiz! Men ${shop?.name || 'iStore'} AI yordamchisiman. Qaysi gadjet sizni qiziqtiryapti?`;
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

// Start server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`Mini Shop tizimi ishga tushdi!`);
  console.log(`Mijoz vitrinasi:  http://localhost:${PORT}`);
  console.log(`Maxfiy Admin:    http://localhost:${PORT}/blackstore-6666`);
  console.log(`Baza rejimi:     ${MONGO_URI ? 'MongoDB Atlas' : 'JSON fayllar (lokal)'}`);
  console.log(`=========================================`);
});
