// ============================================
// MINI SHOP - CLIENT APPLICATION LOGIC
// ============================================

const state = {
  products: [],
  filteredProducts: [],
  cart: JSON.parse(localStorage.getItem('mini_shop_cart') || '[]'),
  activeCategory: 'Barchasi',
  searchQuery: '',
  sortBy: 'featured',
  shopInfo: null,
  activeProductModal: null,
  chatHistory: []
};

// DOM Elements
const elements = {
  // Shop elements
  shopName: document.getElementById('shop-name'),
  shopTagline: document.getElementById('shop-tagline'),
  topAddress: document.getElementById('top-address'),
  topHours: document.getElementById('top-hours'),
  topPhone: document.getElementById('top-phone'),
  topPhoneLink: document.getElementById('top-phone-link'),
  instagramLink: document.getElementById('instagram-link'),
  telegramLink: document.getElementById('telegram-link'),
  footerShopName: document.getElementById('footer-shop-name'),
  footerShopDesc: document.getElementById('footer-shop-desc'),
  footerAddress: document.getElementById('footer-address'),
  footerPhone: document.getElementById('footer-phone'),
  footerHours: document.getElementById('footer-hours'),

  // Catalog
  productsGrid: document.getElementById('products-grid'),
  emptyState: document.getElementById('empty-state'),
  searchInput: document.getElementById('search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  categoriesBar: document.getElementById('categories-bar'),
  currentCategoryTitle: document.getElementById('current-category-title'),
  productsCountBadge: document.getElementById('products-count-badge'),
  sortSelect: document.getElementById('sort-select'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),

  // Cart
  cartCount: document.getElementById('cart-count'),
  openCartBtn: document.getElementById('open-cart-btn'),
  closeCartBtn: document.getElementById('close-cart-btn'),
  cartDrawer: document.getElementById('cart-drawer'),
  cartItemsList: document.getElementById('cart-items-list'),
  cartEmptyState: document.getElementById('cart-empty-state'),
  checkoutFormSection: document.getElementById('checkout-form-section'),
  cartDrawerFooter: document.getElementById('cart-drawer-footer'),
  cartTotalAmount: document.getElementById('cart-total-amount'),
  browseBtn: document.getElementById('browse-btn'),
  submitOrderBtn: document.getElementById('submit-order-btn'),

  // Checkout inputs
  orderName: document.getElementById('order-name'),
  orderPhone: document.getElementById('order-phone'),
  orderAddress: document.getElementById('order-address'),
  orderNotes: document.getElementById('order-notes'),
  deliveryOptYandex: document.getElementById('delivery-opt-yandex'),
  deliveryOptPickup: document.getElementById('delivery-opt-pickup'),

  // Modals
  productModal: document.getElementById('product-modal'),
  closeProductModal: document.getElementById('close-product-modal'),
  modalProductImg: document.getElementById('modal-product-img'),
  modalProductBadge: document.getElementById('modal-product-badge'),
  modalProductBrand: document.getElementById('modal-product-brand'),
  modalProductTitle: document.getElementById('modal-product-title'),
  modalProductPrice: document.getElementById('modal-product-price'),
  modalProductOldPrice: document.getElementById('modal-product-old-price'),
  modalProductUsd: document.getElementById('modal-product-usd'),
  modalProductDesc: document.getElementById('modal-product-desc'),
  modalProductSpecs: document.getElementById('modal-product-specs'),
  modalAddCartBtn: document.getElementById('modal-add-cart-btn'),
  modalBuyNowBtn: document.getElementById('modal-buy-now-btn'),

  // Order Success
  orderSuccessModal: document.getElementById('order-success-modal'),
  successOrderCode: document.getElementById('success-order-code'),
  closeSuccessBtn: document.getElementById('close-success-btn'),
  successTgDirect: document.getElementById('success-tg-direct'),

  // AI Chat
  aiFabBtn: document.getElementById('ai-fab-btn'),
  aiChatWindow: document.getElementById('ai-chat-window'),
  aiChatCloseBtn: document.getElementById('ai-chat-close-btn'),
  aiMessagesContainer: document.getElementById('ai-messages-container'),
  aiWelcomeText: document.getElementById('ai-welcome-text'),
  aiSuggestionsWrap: document.getElementById('ai-suggestions-wrap'),
  aiChatForm: document.getElementById('ai-chat-form'),
  aiUserInput: document.getElementById('ai-user-input')
};

// Format currency
function formatSum(num) {
  return Number(num || 0).toLocaleString('uz-UZ') + " so'm";
}

// ================= 1. INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  initShopInfo();
  initProducts();
  updateCartBadge();
  setupEventListeners();
});

// Fetch Shop info
async function initShopInfo() {
  try {
    const res = await fetch('/api/shop');
    const data = await res.json();
    if (data.shop) {
      state.shopInfo = data.shop;
      const s = data.shop;
      
      if (elements.shopName) elements.shopName.textContent = s.name || 'Malika iStore';
      if (elements.shopTagline) elements.shopTagline.textContent = s.tagline || 'Original Gadjetlar';
      if (elements.topAddress) elements.topAddress.textContent = s.address || 'Malika bozori';
      if (elements.topHours) elements.topHours.textContent = s.workingHours || '10:00 - 20:00';
      if (elements.topPhone) elements.topPhone.textContent = s.phone || '+998 90 123 45 67';
      if (elements.topPhoneLink) elements.topPhoneLink.href = `tel:${s.phone?.replace(/\s+/g, '')}`;
      if (elements.instagramLink && s.instagram) elements.instagramLink.href = s.instagram;
      if (elements.telegramLink && s.telegramChannel) elements.telegramLink.href = s.telegramChannel;
      
      if (elements.footerShopName) elements.footerShopName.textContent = s.name;
      if (elements.footerShopDesc) elements.footerShopDesc.textContent = s.description;
      if (elements.footerAddress) elements.footerAddress.textContent = `📍 ${s.address}`;
      if (elements.footerPhone) elements.footerPhone.textContent = `📞 ${s.phone}`;
      if (elements.footerHours) elements.footerHours.textContent = `🕒 ${s.workingHours}`;
      if (elements.successTgDirect && s.telegramChannel) elements.successTgDirect.href = s.telegramChannel;

      if (data.aiWelcome && elements.aiWelcomeText) {
        elements.aiWelcomeText.textContent = data.aiWelcome;
      }
    }
  } catch (err) {
    console.error('Failed to load shop info:', err);
  }
}

// Fetch Products
async function initProducts() {
  try {
    const res = await fetch('/api/products');
    state.products = await res.json();
    applyFiltersAndSort();
  } catch (err) {
    console.error('Failed to load products:', err);
    elements.productsGrid.innerHTML = `
      <div class="empty-state">
        <p>Mahsulotlarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.</p>
      </div>
    `;
  }
}

// Filter and Sort
function applyFiltersAndSort() {
  let list = [...state.products];

  // Category filter
  if (state.activeCategory !== 'Barchasi') {
    list = list.filter(p => p.category.toLowerCase() === state.activeCategory.toLowerCase());
  }

  // Search filter
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Sorting
  switch (state.sortBy) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'featured':
    default:
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  state.filteredProducts = list;
  renderProducts();
}

// Render Products Grid
function renderProducts() {
  const container = elements.productsGrid;
  const list = state.filteredProducts;

  elements.productsCountBadge.textContent = `${list.length} ta tovar`;
  elements.currentCategoryTitle.textContent = state.activeCategory === 'Barchasi' ? 'Barcha Mahsulotlar' : state.activeCategory;

  if (list.length === 0) {
    container.innerHTML = '';
    elements.emptyState.classList.remove('hidden');
    return;
  }

  elements.emptyState.classList.add('hidden');
  container.innerHTML = list.map(prod => `
    <article class="product-card" data-id="${prod.id}">
      <div class="product-image-box">
        <img src="${prod.image}" alt="${prod.name}" loading="lazy">
        ${prod.badge ? `<span class="card-badge">${prod.badge}</span>` : ''}
        <div class="stock-indicator">
          <span class="stock-dot"></span>
          <span>${prod.stock > 0 ? 'Mavjud' : 'Buyurtmaga'}</span>
        </div>
      </div>
      <div class="product-info">
        <div class="product-brand">${prod.brand || 'Original'}</div>
        <h3 class="product-title">${prod.name}</h3>
        <p class="product-specs-summary">${prod.description || (prod.specs ? prod.specs.join(' • ') : '')}</p>
        <div class="product-pricing">
          <div class="price-col">
            ${prod.oldPrice ? `<span class="old-price">${formatSum(prod.oldPrice)}</span>` : ''}
            <span class="current-price">${formatSum(prod.price)}</span>
            <span class="usd-price">~$${prod.priceUsd}</span>
          </div>
          <button class="card-add-btn" data-action="add-cart" data-id="${prod.id}" title="Savatchaga qo'shish">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="18" height="18">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

// ================= 2. PRODUCT MODAL =================
function openProductModal(prod) {
  state.activeProductModal = prod;
  elements.modalProductImg.src = prod.image;
  elements.modalProductBadge.textContent = prod.badge || '';
  elements.modalProductBadge.style.display = prod.badge ? 'block' : 'none';
  elements.modalProductBrand.textContent = prod.brand || 'Original Gadjet';
  elements.modalProductTitle.textContent = prod.name;
  elements.modalProductPrice.textContent = formatSum(prod.price);
  
  if (prod.oldPrice) {
    elements.modalProductOldPrice.textContent = formatSum(prod.oldPrice);
    elements.modalProductOldPrice.classList.remove('hidden');
  } else {
    elements.modalProductOldPrice.classList.add('hidden');
  }
  
  elements.modalProductUsd.textContent = `~$${prod.priceUsd}`;
  elements.modalProductDesc.textContent = prod.description || '';

  // Specs list
  if (prod.specs && prod.specs.length) {
    elements.modalProductSpecs.innerHTML = prod.specs.map(s => `<li>${s}</li>`).join('');
    elements.modalProductSpecs.parentElement.style.display = 'block';
  } else {
    elements.modalProductSpecs.parentElement.style.display = 'none';
  }

  elements.productModal.classList.remove('hidden');
}

function closeProductModal() {
  elements.productModal.classList.add('hidden');
  state.activeProductModal = null;
}

// ================= 3. CART MANAGEMENT =================
function addToCart(product, quantity = 1) {
  const existingIndex = state.cart.findIndex(item => item.id === product.id);
  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += quantity;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    });
  }
  saveCart();
  updateCartBadge();
  animateCartBtn();
}

function updateCartItemQty(id, delta) {
  const idx = state.cart.findIndex(i => i.id === id);
  if (idx === -1) return;

  state.cart[idx].quantity += delta;
  if (state.cart[idx].quantity <= 0) {
    state.cart.splice(idx, 1);
  }
  saveCart();
  updateCartBadge();
  renderCartDrawer();
}

function removeCartItem(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
}

function saveCart() {
  localStorage.setItem('mini_shop_cart', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const count = state.cart.reduce((sum, i) => sum + i.quantity, 0);
  elements.cartCount.textContent = count;
}

function animateCartBtn() {
  elements.openCartBtn.style.transform = 'scale(1.15)';
  setTimeout(() => {
    elements.openCartBtn.style.transform = '';
  }, 200);
}

function openCart() {
  renderCartDrawer();
  elements.cartDrawer.classList.remove('hidden');
}

function closeCart() {
  elements.cartDrawer.classList.add('hidden');
}

function renderCartDrawer() {
  const items = state.cart;
  if (items.length === 0) {
    elements.cartItemsList.innerHTML = '';
    elements.cartEmptyState.classList.remove('hidden');
    elements.checkoutFormSection.classList.add('hidden');
    elements.cartDrawerFooter.classList.add('hidden');
    return;
  }

  elements.cartEmptyState.classList.add('hidden');
  elements.checkoutFormSection.classList.remove('hidden');
  elements.cartDrawerFooter.classList.remove('hidden');

  elements.cartItemsList.innerHTML = items.map(it => `
    <div class="cart-item">
      <img class="cart-item-img" src="${it.image}" alt="${it.name}">
      <div class="cart-item-details">
        <h4 class="cart-item-name">${it.name}</h4>
        <div class="cart-item-price">${formatSum(it.price * it.quantity)}</div>
      </div>
      <div class="cart-qty-ctrl">
        <button class="qty-btn" onclick="updateCartItemQty('${it.id}', -1)">-</button>
        <span class="qty-val">${it.quantity}</span>
        <button class="qty-btn" onclick="updateCartItemQty('${it.id}', 1)">+</button>
      </div>
      <button class="cart-remove-btn" onclick="removeCartItem('${it.id}')" title="O'chirish">&times;</button>
    </div>
  `).join('');

  const total = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  elements.cartTotalAmount.textContent = formatSum(total);
}

// ================= 4. CHECKOUT SUBMISSION =================
async function submitOrder() {
  const name = elements.orderName.value.trim();
  const phone = elements.orderPhone.value.trim();
  const address = elements.orderAddress.value.trim();
  const notes = elements.orderNotes.value.trim();
  const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked')?.value || 'yandex';

  if (!name) {
    alert('Iltimos, ismingizni kiriting!');
    elements.orderName.focus();
    return;
  }

  if (!phone || phone.length < 7) {
    alert('Iltimos, to‘g‘ri telefon raqamingizni kiriting!');
    elements.orderPhone.focus();
    return;
  }

  if (deliveryMethod === 'yandex' && !address) {
    alert('Yandex yetkazib berish uchun iltimos manzilingizni kiriting!');
    elements.orderAddress.focus();
    return;
  }

  const total = state.cart.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const fullPhone = phone.startsWith('+998') ? phone : `+998 ${phone}`;

  // Button loading state
  const btn = elements.submitOrderBtn;
  btn.disabled = true;
  btn.querySelector('.btn-text').classList.add('hidden');
  btn.querySelector('.btn-spinner').classList.remove('hidden');

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name,
          phone: fullPhone,
          address: deliveryMethod === 'pickup' ? "Do'kondan o'zi olib ketadi (Malika B-24)" : address,
          deliveryMethod,
          notes
        },
        items: state.cart,
        total
      })
    });

    const data = await res.json();
    if (data.success) {
      // Clear cart
      state.cart = [];
      saveCart();
      updateCartBadge();
      closeCart();

      // Show success modal
      elements.successOrderCode.textContent = `#${data.orderId}`;
      elements.orderSuccessModal.classList.remove('hidden');

      // Reset form
      elements.orderName.value = '';
      elements.orderPhone.value = '';
      elements.orderAddress.value = '';
      elements.orderNotes.value = '';
    } else {
      alert(`Xatolik yuz berdi: ${data.error || 'Qayta urinib ko‘ring'}`);
    }
  } catch (err) {
    console.error('Order error:', err);
    alert('Buyurtma yuborishda tarmoq xatosi. Iltimos qayta urinib ko‘ring!');
  } finally {
    btn.disabled = false;
    btn.querySelector('.btn-text').classList.remove('hidden');
    btn.querySelector('.btn-spinner').classList.add('hidden');
  }
}

// ================= 5. AI CHAT ASSISTANT =================
function toggleAiChat() {
  const isHidden = elements.aiChatWindow.classList.contains('hidden');
  if (isHidden) {
    elements.aiChatWindow.classList.remove('hidden');
    elements.aiUserInput.focus();
  } else {
    elements.aiChatWindow.classList.add('hidden');
  }
}

async function sendAiMessage(userText) {
  const text = (userText || elements.aiUserInput.value).trim();
  if (!text) return;

  // Append user bubble
  appendChatBubble(text, 'user');
  elements.aiUserInput.value = '';

  // Hide suggestion chips after first interaction
  if (elements.aiSuggestionsWrap) {
    elements.aiSuggestionsWrap.style.display = 'none';
  }

  // Show typing indicator
  const typingIndicator = createTypingIndicator();
  elements.aiMessagesContainer.appendChild(typingIndicator);
  scrollChatToBottom();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: state.chatHistory
      })
    });

    const data = await res.json();
    typingIndicator.remove();

    const reply = data.reply || "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.";
    appendChatBubble(reply, 'bot');

    state.chatHistory.push({ role: 'user', content: text });
    state.chatHistory.push({ role: 'model', content: reply });
  } catch (err) {
    console.error('AI chat error:', err);
    typingIndicator.remove();
    appendChatBubble("Kechirasiz, aloqada uzilish yuz berdi. Do'konimiz raqamiga to'g'ridan-to'g'ri qo'ng'iroq qilishingiz mumkin: +998 90 123 45 67", 'bot');
  }
}

function appendChatBubble(text, sender) {
  const wrap = document.createElement('div');
  wrap.className = `ai-msg ai-msg-${sender}`;

  if (sender === 'bot') {
    wrap.innerHTML = `
      <div class="ai-bot-avatar">🤖</div>
      <div class="ai-msg-bubble"><p>${text}</p></div>
    `;
  } else {
    wrap.innerHTML = `
      <div class="ai-msg-bubble"><p>${text}</p></div>
    `;
  }

  elements.aiMessagesContainer.appendChild(wrap);
  scrollChatToBottom();
}

function createTypingIndicator() {
  const ind = document.createElement('div');
  ind.className = 'ai-msg ai-msg-bot';
  ind.innerHTML = `
    <div class="ai-bot-avatar">🤖</div>
    <div class="ai-typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
  return ind;
}

function scrollChatToBottom() {
  elements.aiMessagesContainer.scrollTop = elements.aiMessagesContainer.scrollHeight;
}

// ================= 6. EVENT LISTENERS =================
function setupEventListeners() {
  // Category tabs click
  elements.categoriesBar.addEventListener('click', (e) => {
    const pill = e.target.closest('.category-pill');
    if (!pill) return;
    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.activeCategory = pill.dataset.category;
    applyFiltersAndSort();
  });

  // Search input
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    if (state.searchQuery) {
      elements.clearSearchBtn.classList.remove('hidden');
    } else {
      elements.clearSearchBtn.classList.add('hidden');
    }
    applyFiltersAndSort();
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.clearSearchBtn.classList.add('hidden');
    state.searchQuery = '';
    applyFiltersAndSort();
  });

  // Sort select
  elements.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    applyFiltersAndSort();
  });

  // Reset filters
  if (elements.resetFiltersBtn) {
    elements.resetFiltersBtn.addEventListener('click', () => {
      state.activeCategory = 'Barchasi';
      state.searchQuery = '';
      elements.searchInput.value = '';
      document.querySelectorAll('.category-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.category === 'Barchasi');
      });
      applyFiltersAndSort();
    });
  }

  // Product card click (delegated)
  elements.productsGrid.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-action="add-cart"]');
    if (addBtn) {
      e.stopPropagation();
      const id = addBtn.dataset.id;
      const product = state.products.find(p => p.id === id);
      if (product) addToCart(product, 1);
      return;
    }

    const card = e.target.closest('.product-card');
    if (card) {
      const id = card.dataset.id;
      const product = state.products.find(p => p.id === id);
      if (product) openProductModal(product);
    }
  });

  // Modal actions
  elements.closeProductModal.addEventListener('click', closeProductModal);
  elements.productModal.addEventListener('click', (e) => {
    if (e.target === elements.productModal) closeProductModal();
  });

  elements.modalAddCartBtn.addEventListener('click', () => {
    if (state.activeProductModal) {
      addToCart(state.activeProductModal, 1);
      closeProductModal();
    }
  });

  elements.modalBuyNowBtn.addEventListener('click', () => {
    if (state.activeProductModal) {
      addToCart(state.activeProductModal, 1);
      closeProductModal();
      openCart();
    }
  });

  // Cart Drawer open/close
  elements.openCartBtn.addEventListener('click', openCart);
  elements.closeCartBtn.addEventListener('click', closeCart);
  elements.cartDrawer.addEventListener('click', (e) => {
    if (e.target === elements.cartDrawer) closeCart();
  });

  if (elements.browseBtn) {
    elements.browseBtn.addEventListener('click', closeCart);
  }

  // Delivery toggle
  elements.deliveryOptYandex.addEventListener('click', () => {
    elements.deliveryOptYandex.classList.add('active');
    elements.deliveryOptPickup.classList.remove('active');
    document.getElementById('address-group').style.display = 'flex';
  });

  elements.deliveryOptPickup.addEventListener('click', () => {
    elements.deliveryOptPickup.classList.add('active');
    elements.deliveryOptYandex.classList.remove('active');
    document.getElementById('address-group').style.display = 'none';
  });

  // Order submit
  elements.submitOrderBtn.addEventListener('click', submitOrder);

  // Success modal
  elements.closeSuccessBtn.addEventListener('click', () => {
    elements.orderSuccessModal.classList.add('hidden');
  });

  // AI Widget
  elements.aiFabBtn.addEventListener('click', toggleAiChat);
  elements.aiChatCloseBtn.addEventListener('click', toggleAiChat);
  elements.aiChatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendAiMessage();
  });

  // AI Chips
  if (elements.aiSuggestionsWrap) {
    elements.aiSuggestionsWrap.addEventListener('click', (e) => {
      const chip = e.target.closest('.ai-chip');
      if (chip && chip.dataset.query) {
        sendAiMessage(chip.dataset.query);
      }
    });
  }

  // Expose global helpers for inline click
  window.updateCartItemQty = updateCartItemQty;
  window.removeCartItem = removeCartItem;
}
