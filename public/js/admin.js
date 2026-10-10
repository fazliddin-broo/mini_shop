// ============================================
// ADMIN DASHBOARD JAVASCRIPT
// ============================================

const adminState = {
  token: localStorage.getItem('mini_shop_admin_token') || '',
  products: [],
  orders: [],
  settings: null,
  activeTab: 'tab-products',
  editingProductId: null
};

// Elements
const dom = {
  pinScreen: document.getElementById('pin-screen'),
  pinForm: document.getElementById('pin-form'),
  pinInput: document.getElementById('pin-input'),
  pinError: document.getElementById('pin-error'),
  adminLayout: document.getElementById('admin-layout'),
  logoutBtn: document.getElementById('logout-btn'),

  // Sidebar & Topbar
  sidebarShopName: document.getElementById('sidebar-shop-name'),
  navItems: document.querySelectorAll('.nav-item'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  pageTitle: document.getElementById('page-title'),
  btnOpenAddProduct: document.getElementById('btn-open-add-product'),

  // KPIs
  kpiTotalProducts: document.getElementById('kpi-total-products'),
  kpiTotalOrders: document.getElementById('kpi-total-orders'),
  kpiBotStatus: document.getElementById('kpi-bot-status'),
  kpiBotSub: document.getElementById('kpi-bot-sub'),
  navProductsCount: document.getElementById('nav-products-count'),
  navOrdersCount: document.getElementById('nav-orders-count'),

  // Products Tab
  adminSearchProducts: document.getElementById('admin-search-products'),
  adminFilterCategory: document.getElementById('admin-filter-category'),
  adminProductsTbody: document.getElementById('admin-products-tbody'),

  // Orders Tab
  adminOrdersContainer: document.getElementById('admin-orders-container'),
  btnRefreshOrders: document.getElementById('btn-refresh-orders'),

  // Settings Tab
  formShopSettings: document.getElementById('form-shop-settings'),
  setShopName: document.getElementById('set-shop-name'),
  setShopTagline: document.getElementById('set-shop-tagline'),
  setShopPhone: document.getElementById('set-shop-phone'),
  setShopAddress: document.getElementById('set-shop-address'),
  setShopHours: document.getElementById('set-shop-hours'),
  setShopInstagram: document.getElementById('set-shop-instagram'),
  setShopTelegram: document.getElementById('set-shop-telegram'),
  setShopPin: document.getElementById('set-shop-pin'),

  formTelegramSettings: document.getElementById('form-telegram-settings'),
  setTgToken: document.getElementById('set-tg-token'),
  setTgChatId: document.getElementById('set-tg-chatid'),
  btnTestTelegram: document.getElementById('btn-test-telegram'),
  testTgResult: document.getElementById('test-tg-result'),

  formAiSettings: document.getElementById('form-ai-settings'),
  setAiApiKey: document.getElementById('set-ai-apikey'),
  setAiWelcome: document.getElementById('set-ai-welcome'),
  setAiPrompt: document.getElementById('set-ai-prompt'),

  // CRUD Modal
  productCrudModal: document.getElementById('product-crud-modal'),
  closeCrudModal: document.getElementById('close-crud-modal'),
  btnCancelCrud: document.getElementById('btn-cancel-crud'),
  crudModalTitle: document.getElementById('crud-modal-title'),
  productCrudForm: document.getElementById('product-crud-form'),
  crudProdId: document.getElementById('crud-prod-id'),
  crudProdName: document.getElementById('crud-prod-name'),
  crudProdCategory: document.getElementById('crud-prod-category'),
  crudProdBrand: document.getElementById('crud-prod-brand'),
  crudProdPrice: document.getElementById('crud-prod-price'),
  crudProdOldPrice: document.getElementById('crud-prod-old-price'),
  crudProdUsd: document.getElementById('crud-prod-usd'),
  crudProdFile: document.getElementById('crud-prod-file'),
  crudProdUrl: document.getElementById('crud-prod-url'),
  imagePreviewWrap: document.getElementById('image-preview-wrap'),
  imagePreview: document.getElementById('image-preview'),
  crudProdDesc: document.getElementById('crud-prod-desc'),
  crudProdSpecs: document.getElementById('crud-prod-specs'),
  crudProdStock: document.getElementById('crud-prod-stock'),
  crudProdBadge: document.getElementById('crud-prod-badge'),
  crudProdFeatured: document.getElementById('crud-prod-featured')
};

function formatSum(num) {
  return Number(num || 0).toLocaleString('uz-UZ') + " so'm";
}

// ================= 1. AUTHENTICATION =================
document.addEventListener('DOMContentLoaded', () => {
  if (adminState.token) {
    verifySession();
  } else {
    showPinScreen();
  }
  setupAdminEvents();
});

function showPinScreen() {
  dom.pinScreen.classList.remove('hidden');
  dom.adminLayout.classList.add('hidden');
  dom.pinInput.focus();
}

function showDashboard() {
  dom.pinScreen.classList.add('hidden');
  dom.adminLayout.classList.remove('hidden');
  loadAllAdminData();
}

async function verifySession() {
  try {
    const res = await fetch('/api/admin/settings', {
      headers: { 'Authorization': adminState.token }
    });
    if (res.ok) {
      showDashboard();
    } else {
      localStorage.removeItem('mini_shop_admin_token');
      adminState.token = '';
      showPinScreen();
    }
  } catch (err) {
    showPinScreen();
  }
}

dom.pinForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const pin = dom.pinInput.value.trim();
  if (!pin) return;

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    if (data.success) {
      adminState.token = data.token;
      localStorage.setItem('mini_shop_admin_token', data.token);
      dom.pinError.classList.add('hidden');
      showDashboard();
    } else {
      dom.pinError.classList.remove('hidden');
      dom.pinInput.value = '';
    }
  } catch (err) {
    alert('Serverga ulanishda xatolik yuz berdi!');
  }
});

dom.logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('mini_shop_admin_token');
  adminState.token = '';
  showPinScreen();
});

// ================= 2. DATA LOADING =================
async function loadAllAdminData() {
  await Promise.all([
    loadSettings(),
    loadProducts(),
    loadOrders()
  ]);
}

// Settings
async function loadSettings() {
  try {
    const res = await fetch('/api/admin/settings', {
      headers: { 'Authorization': adminState.token }
    });
    if (!res.ok) return;
    const settings = await res.json();
    adminState.settings = settings;

    // Sidebar
    if (settings.shop?.name) {
      dom.sidebarShopName.textContent = settings.shop.name;
    }

    // Shop settings form
    const s = settings.shop || {};
    dom.setShopName.value = s.name || '';
    dom.setShopTagline.value = s.tagline || '';
    dom.setShopPhone.value = s.phone || '';
    dom.setShopAddress.value = s.address || '';
    dom.setShopHours.value = s.workingHours || '';
    dom.setShopInstagram.value = s.instagram || '';
    dom.setShopTelegram.value = s.telegramChannel || '';
    dom.setShopPin.value = s.adminPin || '1234';

    // Telegram settings form
    const tg = settings.telegram || {};
    dom.setTgToken.value = tg.botToken || '';
    dom.setTgChatId.value = tg.chatId || '';
    updateBotKpi(tg);

    // AI settings form
    const ai = settings.ai || {};
    dom.setAiApiKey.value = ai.apiKey || '';
    dom.setAiWelcome.value = ai.welcomeMessage || '';
    dom.setAiPrompt.value = ai.systemPrompt || '';

  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

function updateBotKpi(tg) {
  if (tg.botToken && tg.chatId) {
    dom.kpiBotStatus.textContent = 'Faol ✅';
    dom.kpiBotStatus.style.color = '#10b981';
    dom.kpiBotSub.textContent = 'Buyurtmalar botga yuborilmoqda';
  } else {
    dom.kpiBotStatus.textContent = 'Ulanmagan ⚠️';
    dom.kpiBotStatus.style.color = '#f59e0b';
    dom.kpiBotSub.textContent = 'Sozlamalar bo‘limida ulang';
  }
}

// Products
async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    adminState.products = await res.json();
    renderProductsTable();
    updateProductsKpi();
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

function updateProductsKpi() {
  const count = adminState.products.length;
  dom.kpiTotalProducts.textContent = count;
  dom.navProductsCount.textContent = count;
}

function renderProductsTable() {
  let list = [...adminState.products];
  const q = dom.adminSearchProducts.value.toLowerCase().trim();
  const cat = dom.adminFilterCategory.value;

  if (cat !== 'all') {
    list = list.filter(p => p.category === cat);
  }
  if (q) {
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)));
  }

  if (list.length === 0) {
    dom.adminProductsTbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #64748b; padding: 30px;">
          Mahsulotlar topilmadi
        </td>
      </tr>
    `;
    return;
  }

  dom.adminProductsTbody.innerHTML = list.map(p => `
    <tr>
      <td>
        <img class="table-prod-img" src="${p.image}" alt="${p.name}">
      </td>
      <td>
        <div class="table-prod-name">${p.name}</div>
        <span class="table-prod-cat">${p.brand || ''} • ${p.category}</span>
      </td>
      <td>
        <div class="table-price-main">${formatSum(p.price)}</div>
        <div class="table-price-usd">~$${p.priceUsd}</div>
      </td>
      <td>
        <span class="stock-tag ${p.stock > 0 ? 'in-stock' : 'out-stock'}">
          ${p.stock > 0 ? `${p.stock} ta mavjud` : 'Tugagan'}
        </span>
      </td>
      <td>
        ${p.badge ? `<span style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; padding: 2px 8px; border-radius: 99px; font-size: 0.72rem; font-weight: 700;">${p.badge}</span>` : '<span style="color: #64748b;">—</span>'}
      </td>
      <td>
        <div class="action-btns-group">
          <button class="btn-icon-action" onclick="openEditProduct('${p.id}')" title="Tahrirlash">✏️</button>
          <button class="btn-icon-action delete" onclick="deleteProduct('${p.id}')" title="O'chirish">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Orders
async function loadOrders() {
  try {
    const res = await fetch('/api/admin/orders', {
      headers: { 'Authorization': adminState.token }
    });
    if (!res.ok) return;
    adminState.orders = await res.json();
    renderOrdersList();
    updateOrdersKpi();
  } catch (err) {
    console.error('Failed to load orders:', err);
  }
}

function updateOrdersKpi() {
  const newOrders = adminState.orders.filter(o => o.status === 'new').length;
  dom.kpiTotalOrders.textContent = newOrders;
  dom.navOrdersCount.textContent = newOrders;
  dom.kpiOrdersSub.textContent = `${adminState.orders.length} ta umumiy buyurtma`;
}

function renderOrdersList() {
  const container = dom.adminOrdersContainer;
  const list = adminState.orders;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #64748b;">
        Hozircha yangi buyurtmalar mavjud emas
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(ord => {
    const statusMap = {
      new: { label: 'Yangi', class: 'new' },
      processing: { label: 'Jarayonda', class: 'processing' },
      completed: { label: 'Yetkazildi', class: 'completed' },
      cancelled: { label: 'Bekor qilindi', class: 'cancelled' }
    };
    const curStatus = statusMap[ord.status] || statusMap.new;

    const itemsHtml = ord.items.map(it => `
      <div class="order-item-line">
        <span>${it.name} <strong>x${it.quantity}</strong></span>
        <span>${formatSum(it.price * it.quantity)}</span>
      </div>
    `).join('');

    return `
      <div class="order-card">
        <div class="order-header-row">
          <div>
            <span class="order-id-badge">#${ord.id}</span>
            <span class="order-status-badge ${curStatus.class}">${curStatus.label}</span>
          </div>
          <span class="order-time">⏰ ${ord.formattedDate || new Date(ord.createdAt).toLocaleString('uz-UZ')}</span>
        </div>

        <div class="order-customer-box">
          <div class="cust-info-item">
            <span>Xaridor:</span>
            <strong>${ord.customer.name}</strong>
          </div>
          <div class="cust-info-item">
            <span>Telefon:</span>
            <strong><a href="tel:${ord.customer.phone}" class="cust-phone-link">📞 ${ord.customer.phone}</a></strong>
          </div>
          <div class="cust-info-item">
            <span>Manzil:</span>
            <strong>${ord.customer.address}</strong>
          </div>
          <div class="cust-info-item">
            <span>Yetkazish:</span>
            <strong>${ord.customer.deliveryMethod === 'pickup' ? "🏪 Do'kondan olib ketish" : "🚕 Yandex Taxi"}</strong>
          </div>
        </div>

        ${ord.customer.notes ? `<div style="font-size: 0.8rem; color: #94a3b8; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 6px;">💬 Izoh: <i>${ord.customer.notes}</i></div>` : ''}

        <div class="order-items-table">
          ${itemsHtml}
        </div>

        <div class="order-footer-row">
          <div>
            <span style="font-size: 0.82rem; color: #94a3b8;">Jami summa: </span>
            <span class="order-total-sum">${formatSum(ord.total)}</span>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <select onchange="updateOrderStatus('${ord.id}', this.value)" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 6px 10px; border-radius: 8px; font-size: 0.8rem;">
              <option value="new" ${ord.status === 'new' ? 'selected' : ''}>Yangi</option>
              <option value="processing" ${ord.status === 'processing' ? 'selected' : ''}>Jarayonda</option>
              <option value="completed" ${ord.status === 'completed' ? 'selected' : ''}>Yetkazildi</option>
              <option value="cancelled" ${ord.status === 'cancelled' ? 'selected' : ''}>Bekor qilindi</option>
            </select>
            <a href="tel:${ord.customer.phone}" class="btn btn-primary btn-sm">📞 Qo'ng'iroq</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminState.token
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      loadOrders();
    }
  } catch (err) {
    alert('Holatni o‘zgartirishda xatolik yuz berdi!');
  }
}

// ================= 3. CRUD PRODUCTS =================
function openAddProductModal() {
  adminState.editingProductId = null;
  dom.crudModalTitle.textContent = "Yangi Mahsulot Qo'shish";
  dom.crudProdId.value = '';
  dom.productCrudForm.reset();
  dom.imagePreview.src = '';
  dom.imagePreview.classList.add('hidden');
  dom.crudProdFeatured.checked = true;
  dom.productCrudModal.classList.remove('hidden');
}

function openEditProduct(id) {
  const p = adminState.products.find(prod => prod.id === id);
  if (!p) return;

  adminState.editingProductId = id;
  dom.crudModalTitle.textContent = "Mahsulotni Tahrirlash";
  dom.crudProdId.value = p.id;
  dom.crudProdName.value = p.name;
  dom.crudProdCategory.value = p.category;
  dom.crudProdBrand.value = p.brand || '';
  dom.crudProdPrice.value = p.price;
  dom.crudProdOldPrice.value = p.oldPrice || '';
  dom.crudProdUsd.value = p.priceUsd || '';
  dom.crudProdDesc.value = p.description || '';
  dom.crudProdSpecs.value = p.specs ? p.specs.join('\n') : '';
  dom.crudProdStock.value = p.stock;
  dom.crudProdBadge.value = p.badge || '';
  dom.crudProdFeatured.checked = Boolean(p.featured);

  if (p.image) {
    dom.imagePreview.src = p.image;
    dom.imagePreview.classList.remove('hidden');
    dom.crudProdUrl.value = p.image.startsWith('http') ? p.image : '';
  } else {
    dom.imagePreview.classList.add('hidden');
  }

  dom.productCrudModal.classList.remove('hidden');
}

async function deleteProduct(id) {
  if (!confirm('Haqiqatan ham bu mahsulotni o‘chirmoqchimisiz?')) return;

  try {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': adminState.token }
    });
    if (res.ok) {
      loadProducts();
    } else {
      alert('Mahsulotni o‘chirishda xatolik yuz berdi');
    }
  } catch (err) {
    alert('Tarmoq xatosi!');
  }
}

// File preview
dom.crudProdFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    dom.imagePreview.src = URL.createObjectURL(file);
    dom.imagePreview.classList.remove('hidden');
    dom.crudProdUrl.value = '';
  }
});

dom.crudProdUrl.addEventListener('input', (e) => {
  const url = e.target.value.trim();
  if (url) {
    dom.imagePreview.src = url;
    dom.imagePreview.classList.remove('hidden');
  }
});

dom.productCrudForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = adminState.editingProductId;
  const formData = new FormData();

  formData.append('name', dom.crudProdName.value.trim());
  formData.append('category', dom.crudProdCategory.value);
  formData.append('brand', dom.crudProdBrand.value.trim());
  formData.append('price', dom.crudProdPrice.value);
  if (dom.crudProdOldPrice.value) formData.append('oldPrice', dom.crudProdOldPrice.value);
  if (dom.crudProdUsd.value) formData.append('priceUsd', dom.crudProdUsd.value);
  formData.append('description', dom.crudProdDesc.value.trim());
  formData.append('specs', dom.crudProdSpecs.value.trim());
  formData.append('stock', dom.crudProdStock.value);
  formData.append('badge', dom.crudProdBadge.value.trim());
  formData.append('featured', dom.crudProdFeatured.checked);

  if (dom.crudProdFile.files[0]) {
    formData.append('imageFile', dom.crudProdFile.files[0]);
  } else if (dom.crudProdUrl.value.trim()) {
    formData.append('imageUrl', dom.crudProdUrl.value.trim());
  }

  const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Authorization': adminState.token },
      body: formData
    });
    if (res.ok) {
      dom.productCrudModal.classList.add('hidden');
      loadProducts();
    } else {
      const errData = await res.json();
      alert(`Xatolik: ${errData.error || 'Saqlashda xatolik yuz berdi'}`);
    }
  } catch (err) {
    alert('Tarmoq xatosi yuz berdi!');
  }
});

// ================= 4. SETTINGS HANDLERS =================
dom.formShopSettings.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminState.token
      },
      body: JSON.stringify({
        shop: {
          name: dom.setShopName.value.trim(),
          tagline: dom.setShopTagline.value.trim(),
          phone: dom.setShopPhone.value.trim(),
          address: dom.setShopAddress.value.trim(),
          workingHours: dom.setShopHours.value.trim(),
          instagram: dom.setShopInstagram.value.trim(),
          telegramChannel: dom.setShopTelegram.value.trim(),
          adminPin: dom.setShopPin.value.trim()
        }
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        adminState.token = data.token;
        localStorage.setItem('mini_shop_admin_token', data.token);
      }
      alert('Do‘kon ma’lumotlari muvaffaqiyatli saqlandi!');
      loadSettings();
    }
  } catch (err) {
    alert('Sozlamalarni saqlashda xatolik yuz berdi!');
  }
});

dom.formTelegramSettings.addEventListener('submit', async (e) => {
  e.preventDefault();
  const botToken = dom.setTgToken.value.trim();
  const chatId = dom.setTgChatId.value.trim();

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminState.token
      },
      body: JSON.stringify({
        telegram: {
          botToken,
          chatId,
          enabled: Boolean(botToken && chatId)
        }
      })
    });
    if (res.ok) {
      alert('Telegram sozlamalari saqlandi!');
      loadSettings();
    }
  } catch (err) {
    alert('Xatolik yuz berdi!');
  }
});

// Test Telegram Button
dom.btnTestTelegram.addEventListener('click', async () => {
  const botToken = dom.setTgToken.value.trim();
  const chatId = dom.setTgChatId.value.trim();

  if (!botToken || !chatId) {
    alert('Iltimos, avval Bot Token va Chat ID maydonlarini to‘ldiring!');
    return;
  }

  dom.testTgResult.className = 'test-result-box';
  dom.testTgResult.textContent = 'Telegramga xabar yuborilmoqda... ⏳';
  dom.testTgResult.classList.remove('hidden');

  try {
    const res = await fetch('/api/admin/test-telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminState.token
      },
      body: JSON.stringify({ botToken, chatId })
    });
    const data = await res.json();
    if (data.success) {
      dom.testTgResult.className = 'test-result-box success';
      dom.testTgResult.textContent = '🎉 Muvaffaqiyatli! Telegramingizga sinov xabari bordi. Qarab ko‘ring!';
    } else {
      dom.testTgResult.className = 'test-result-box error';
      dom.testTgResult.textContent = `❌ Xatolik: ${data.error || 'Telegramga ulanib bo‘lmadi. Token yoki ID ni tekshiring.'}`;
    }
  } catch (err) {
    dom.testTgResult.className = 'test-result-box error';
    dom.testTgResult.textContent = 'Tarmoq xatosi! Internet aloqasini tekshiring.';
  }
});

// AI Settings
dom.formAiSettings.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminState.token
      },
      body: JSON.stringify({
        ai: {
          apiKey: dom.setAiApiKey.value.trim(),
          welcomeMessage: dom.setAiWelcome.value.trim(),
          systemPrompt: dom.setAiPrompt.value.trim()
        }
      })
    });
    if (res.ok) {
      alert('AI sozlamalari muvaffaqiyatli saqlandi!');
    }
  } catch (err) {
    alert('AI sozlamalarini saqlashda xatolik!');
  }
});

// ================= 5. EVENT LISTENERS =================
function setupAdminEvents() {
  // Navigation Tabs
  dom.navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      dom.navItems.forEach(b => b.classList.remove('active'));
      dom.tabPanes.forEach(p => p.classList.add('hidden'));

      btn.classList.add('active');
      document.getElementById(target).classList.remove('hidden');

      if (target === 'tab-products') {
        dom.pageTitle.textContent = 'Mahsulotlar Katalogi';
        dom.btnOpenAddProduct.style.display = 'inline-flex';
      } else if (target === 'tab-orders') {
        dom.pageTitle.textContent = 'Kelib Tushgan Buyurtmalar';
        dom.btnOpenAddProduct.style.display = 'none';
        loadOrders();
      } else if (target === 'tab-settings') {
        dom.pageTitle.textContent = 'Tizim Sozlamalari & Telegram';
        dom.btnOpenAddProduct.style.display = 'none';
      }
    });
  });

  // Search and filter in products
  dom.adminSearchProducts.addEventListener('input', renderProductsTable);
  dom.adminFilterCategory.addEventListener('change', renderProductsTable);

  // Add Product modal button
  dom.btnOpenAddProduct.addEventListener('click', openAddProductModal);
  dom.closeCrudModal.addEventListener('click', () => dom.productCrudModal.classList.add('hidden'));
  dom.btnCancelCrud.addEventListener('click', () => dom.productCrudModal.classList.add('hidden'));

  // Refresh orders button
  dom.btnRefreshOrders.addEventListener('click', loadOrders);

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('mini_shop_admin_token');
      location.reload();
    });
  }

  // Expose global methods
  window.openEditProduct = openEditProduct;
  window.deleteProduct = deleteProduct;
  window.updateOrderStatus = updateOrderStatus;
}
