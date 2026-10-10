// ============================================
// MINI SHOP — CLIENT APPLICATION LOGIC
// Multilingual: O'zbekcha (uz) | Русский (ru) | English (en)
// ============================================

const translations = {
  uz: {
    tagline: "Original Gadjetlar Markazi",
    searchPlaceholder: "Mahsulot qidirish (iPhone 16, MacBook, zaryadnik...)",
    cart: "Savatcha",
    allCategories: "Barchasi",
    allProducts: "Barcha Mahsulotlar",
    itemsCount: "ta tovar",
    heroChip: "Yangi flagmanlar va eng qulay narxlar",
    heroHeadline: "Malika Bozoridagi Original Gadjetlar",
    heroSubtext: "100% Original Apple & Samsung texnikalari. Har bir xaridga 1 yil rasmiy kafolat va Toshkent bo‘ylab 2 soat ichida eshigingizgacha yetkazib berish!",
    feat1Title: "1 Yil Kafolat",
    feat1Sub: "Rasmiy servis kafolati",
    feat2Title: "2 Soatda Yetkazish",
    feat2Sub: "Yandex Taxi orqali Toshkentda",
    feat3Title: "Original Plomba",
    feat3Sub: "Zavod muhrlangan qutilar",
    feat4Title: "AI Maslahatchi",
    feat4Sub: "24/7 savollarga javob beradi",
    sortLabel: "Saralash:",
    sortFeatured: "Ommabopligi bo'yicha",
    sortPriceAsc: "Avval arzonlari",
    sortPriceDesc: "Avval qimmatlari",
    sortName: "Nomi bo'yicha (A-Z)",
    inStock: "Mavjud",
    preOrder: "Buyurtmaga",
    emptyTitle: "Hech narsa topilmadi",
    emptySub: "Boshqa qidiruv so‘zini kiriting yoki toifani o‘zgartiring",
    emptyBtn: "Barcha tovarlarni ko‘rish",
    addToCart: "Savatchaga qo‘shish",
    buyNow: "⚡ 1-Klikda Xarid",
    specsHeading: "Xususiyatlari:",
    guaranteeText: "🛡️ 1 Yillik Kafolat • 100% Original IMEI ro'yxatdan o'tgan",
    yourCart: "Sizning Savatchangiz",
    cartEmpty: "Savatchangiz bo‘sh",
    cartEmptySub: "Katalogdan o‘zingizga ma’qul gadjetni tanlang",
    startShopping: "Xarid qilishni boshlash",
    deliveryInfo: "Yetkazib berish ma'lumotlari",
    delivYandex: "🚕 Yandex Kuryer",
    delivYandexDesc: "Toshkent bo'ylab 1-2 soatda",
    delivPickup: "🏪 O'zi olib ketish",
    delivPickupDesc: "Malika bozori B-24",
    nameLabel: "Ismingiz *",
    namePlaceholder: "Masalan: Sardor",
    phoneLabel: "Telefon raqamingiz *",
    phoneHint: "Buyurtmani tasdiqlash uchun qo'ng'iroq qilamiz",
    addressLabel: "Manzil yoki Mo'ljal *",
    addressPlaceholder: "Toshkent sh., Yunusobod 4, 12-uy",
    notesLabel: "Izoh (ixtiyoriy)",
    notesPlaceholder: "Rangi, qulay yetkazish vaqti...",
    totalAmount: "Jami to'lov:",
    placeOrder: "Buyurtma berish 🚀",
    paymentNote: "🔒 To'lov mahsulotni qabul qilib olgach naqd yoki Click/Payme orqali",
    orderSuccess: "Buyurtmangiz qabul qilindi!",
    orderSuccessDesc1: "✅ Sotuvchining Telegram botiga barcha ma'lumotlar yetkazildi.",
    orderSuccessDesc2: "📞 Menejerimiz 5-10 daqiqa ichida siz bilan bog'lanib, yetkazib berishni tasdiqlaydi.",
    orderSuccessBtn: "Yaxshi, tushunarli",
    orderSuccessTg: "💬 Telegram orqali yozish",
    aiFabTitle: "AI Maslahatchi",
    aiFabStatus: "Onlayn",
    aiChatTitle: "Malika AI Maslahatchi",
    aiChatSubtitle: "Tovarlar va narxlar bo'yicha 24/7 yordamchi",
    aiWelcome: "Assalomu alaykum! Men Malika iStore virtual maslahatchisiman 🤖 Qanday gadjet yoki telefon qidiryapsiz? Sizga qaysi narx oralig'ida tanlashda yordam beray?",
    aiInputPlaceholder: "Savolingizni yozing...",
    aiChips: [
      { q: "iPhone 16 Pro Max narxi qancha?", label: "iPhone 16 Pro Max narxi?" },
      { q: "Samsung S24 Ultra bormi?", label: "Samsung S24 Ultra bormi?" },
      { q: "Toshkentda yetkazib berish qancha vaqt oladi?", label: "Yetkazib berish qancha?" },
      { q: "Kafolat shartlari qanaqa?", label: "Kafolat bormi?" }
    ],
    footerContact: "Bog'lanish",
    footerHours: "🕒 10:00 - 20:00",
    footerRights: "Barcha huquqlar himoyalangan.",
    addedToCartToast: "Savatchaga qo‘shildi!",
    fillRequiredToast: "Iltimos, ism va telefon raqamini kiriting!",
    currencySuffix: "so'm",
    orderNumPrefix: "Buyurtma raqami:"
  },
  ru: {
    tagline: "Центр оригинальных гаджетов",
    searchPlaceholder: "Поиск товаров (iPhone 16, MacBook, зарядка...)",
    cart: "Корзина",
    allCategories: "Все",
    allProducts: "Все товары",
    itemsCount: "товаров",
    heroChip: "Новые флагманы и лучшие цены",
    heroHeadline: "Оригинальные гаджеты на Малике",
    heroSubtext: "100% оригинальная техника Apple & Samsung. Официальная гарантия 1 год на каждую покупку и быстрая доставка по Ташкенту за 2 часа!",
    feat1Title: "1 Год Гарантии",
    feat1Sub: "Официальный сервис",
    feat2Title: "Доставка за 2 часа",
    feat2Sub: "Через Яндекс Такси по Ташкенту",
    feat3Title: "Заводская пломба",
    feat3Sub: "Запечатанные заводские коробки",
    feat4Title: "AI Консультант",
    feat4Sub: "Отвечает 24/7 на любые вопросы",
    sortLabel: "Сортировка:",
    sortFeatured: "По популярности",
    sortPriceAsc: "Сначала дешевые",
    sortPriceDesc: "Сначала дорогие",
    sortName: "По названию (А-Я)",
    inStock: "В наличии",
    preOrder: "Под заказ",
    emptyTitle: "Ничего не найдено",
    emptySub: "Попробуйте изменить поисковый запрос или категорию",
    emptyBtn: "Показать все товары",
    addToCart: "В корзину",
    buyNow: "⚡ Купить в 1 клик",
    specsHeading: "Характеристики:",
    guaranteeText: "🛡️ Гарантия 1 год • 100% оригинал, IMEI официально зарегистрирован",
    yourCart: "Ваша корзина",
    cartEmpty: "Корзина пуста",
    cartEmptySub: "Выберите понравившийся гаджет из каталога",
    startShopping: "Начать покупки",
    deliveryInfo: "Данные для доставки",
    delivYandex: "🚕 Яндекс Курьер",
    delivYandexDesc: "По Ташкенту за 1-2 часа",
    delivPickup: "🏪 Самовывоз",
    delivPickupDesc: "Рынок Малика, Б-24",
    nameLabel: "Ваше имя *",
    namePlaceholder: "Например: Сардор",
    phoneLabel: "Номер телефона *",
    phoneHint: "Позвоним вам для подтверждения заказа",
    addressLabel: "Адрес или ориентир *",
    addressPlaceholder: "г. Ташкент, Юнусабад 4, дом 12",
    notesLabel: "Комментарий (необязательно)",
    notesPlaceholder: "Цвет, удобное время доставки...",
    totalAmount: "Итого к оплате:",
    placeOrder: "Оформить заказ 🚀",
    paymentNote: "🔒 Оплата при получении наличными или Click/Payme",
    orderSuccess: "Ваш заказ успешно принят!",
    orderSuccessDesc1: "✅ Все данные переданы в Telegram бот продавца.",
    orderSuccessDesc2: "📞 Наш менеджер свяжется с вами в течение 5-10 минут для подтверждения.",
    orderSuccessBtn: "Отлично, понятно",
    orderSuccessTg: "💬 Написать в Telegram",
    aiFabTitle: "AI Консультант",
    aiFabStatus: "Онлайн",
    aiChatTitle: "Malika AI Консультант",
    aiChatSubtitle: "Помощник по товарам и ценам 24/7",
    aiWelcome: "Здравствуйте! Я виртуальный консультант Malika iStore 🤖 Какой гаджет или телефон вас интересует? Помогу подобрать идеальный вариант!",
    aiInputPlaceholder: "Напишите ваш вопрос...",
    aiChips: [
      { q: "Сколько стоит iPhone 16 Pro Max?", label: "Цена iPhone 16 Pro Max?" },
      { q: "Есть ли Samsung S24 Ultra в наличии?", label: "Есть ли Samsung S24 Ultra?" },
      { q: "Сколько длится доставка по Ташкенту?", label: "Сроки доставки?" },
      { q: "Какие условия гарантии?", label: "Есть ли гарантия?" }
    ],
    footerContact: "Контакты",
    footerHours: "🕒 10:00 - 20:00",
    footerRights: "Все права защищены.",
    addedToCartToast: "Добавлено в корзину!",
    fillRequiredToast: "Пожалуйста, введите имя и номер телефона!",
    currencySuffix: "сум",
    orderNumPrefix: "Номер заказа:"
  },
  en: {
    tagline: "Original Gadgets Flagship",
    searchPlaceholder: "Search gadgets (iPhone 16, MacBook, chargers...)",
    cart: "Cart",
    allCategories: "All",
    allProducts: "All Products",
    itemsCount: "items",
    heroChip: "Latest Flagships & Best Prices",
    heroHeadline: "Original Gadgets at Malika Market",
    heroSubtext: "100% Genuine Apple & Samsung electronics. 1-Year official warranty on every purchase and ultra-fast 2-hour doorstep delivery across Tashkent!",
    feat1Title: "1-Year Warranty",
    feat1Sub: "Official service warranty",
    feat2Title: "2-Hour Delivery",
    feat2Sub: "Express Yandex Taxi delivery",
    feat3Title: "Factory Sealed",
    feat3Sub: "Genuine sealed retail boxes",
    feat4Title: "AI Assistant",
    feat4Sub: "24/7 smart shopping helper",
    sortLabel: "Sort by:",
    sortFeatured: "Featured",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortName: "Alphabetical (A-Z)",
    inStock: "In Stock",
    preOrder: "Pre-order",
    emptyTitle: "No products found",
    emptySub: "Try another search term or change category filter",
    emptyBtn: "View All Products",
    addToCart: "Add to Cart",
    buyNow: "⚡ Buy Now (1-Click)",
    specsHeading: "Specifications:",
    guaranteeText: "🛡️ 1-Year Warranty • 100% Authentic, IMEI registered",
    yourCart: "Your Shopping Cart",
    cartEmpty: "Your cart is empty",
    cartEmptySub: "Explore our catalog and choose your favorite gadget",
    startShopping: "Start Shopping",
    deliveryInfo: "Delivery Information",
    delivYandex: "🚕 Yandex Courier",
    delivYandexDesc: "1-2 hours across Tashkent",
    delivPickup: "🏪 Store Pickup",
    delivPickupDesc: "Malika Market B-24",
    nameLabel: "Your Name *",
    namePlaceholder: "E.g. Alexander",
    phoneLabel: "Phone Number *",
    phoneHint: "We'll call you to confirm your order",
    addressLabel: "Delivery Address *",
    addressPlaceholder: "Tashkent city, Yunusabad 4, apt 12",
    notesLabel: "Notes (Optional)",
    notesPlaceholder: "Color preference, delivery time...",
    totalAmount: "Total Amount:",
    placeOrder: "Place Order 🚀",
    paymentNote: "🔒 Pay upon delivery with Cash, Click or Payme",
    orderSuccess: "Your Order is Confirmed!",
    orderSuccessDesc1: "✅ Full order invoice delivered to seller's Telegram bot.",
    orderSuccessDesc2: "📞 Our manager will contact you within 5-10 minutes to verify details.",
    orderSuccessBtn: "Got it, Thanks",
    orderSuccessTg: "💬 Chat on Telegram",
    aiFabTitle: "AI Assistant",
    aiFabStatus: "Online",
    aiChatTitle: "Malika AI Assistant",
    aiChatSubtitle: "24/7 product & price consultant",
    aiWelcome: "Hello! I am Malika iStore virtual shopping assistant 🤖 Which phone or laptop are you looking for today? Happy to help you choose!",
    aiInputPlaceholder: "Ask anything about gadgets...",
    aiChips: [
      { q: "How much is iPhone 16 Pro Max?", label: "iPhone 16 Pro Max price?" },
      { q: "Is Samsung S24 Ultra in stock?", label: "Samsung S24 Ultra?" },
      { q: "How long is delivery in Tashkent?", label: "Delivery time?" },
      { q: "What are warranty terms?", label: "Warranty details?" }
    ],
    footerContact: "Contact Us",
    footerHours: "🕒 10:00 - 20:00",
    footerRights: "All rights reserved.",
    addedToCartToast: "Added to Cart!",
    fillRequiredToast: "Please enter your name and phone number!",
    currencySuffix: "UZS",
    orderNumPrefix: "Order #:"
  }
};

const categoryMap = {
  'Barchasi': { uz: 'Barchasi', ru: 'Все', en: 'All' },
  'Smartfonlar': { uz: 'Smartfonlar', ru: 'Смартфоны', en: 'Smartphones' },
  'Noutbuklar': { uz: 'Noutbuklar', ru: 'Ноутбуки', en: 'Laptops' },
  'Aksessuarlar': { uz: 'Aksessuarlar', ru: 'Аксессуары', en: 'Accessories' },
  'Soatlar': { uz: 'Soatlar', ru: 'Часы', en: 'Watches' }
};

const state = {
  lang: localStorage.getItem('mini_shop_lang') || 'uz',
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
  const t = translations[state.lang] || translations.uz;
  const locale = state.lang === 'en' ? 'en-US' : (state.lang === 'ru' ? 'ru-RU' : 'uz-UZ');
  return Number(num || 0).toLocaleString(locale) + ' ' + t.currencySuffix;
}

// ================= 1. INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(state.lang, false);
  initShopInfo();
  initProducts();
  updateCartBadge();
  setupEventListeners();
});

// Set Language function
function setLanguage(lang, triggerRerender = true) {
  if (!translations[lang]) lang = 'uz';
  state.lang = lang;
  localStorage.setItem('mini_shop_lang', lang);

  const t = translations[lang];

  // Update active lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Header & Search
  if (elements.shopTagline) elements.shopTagline.textContent = t.tagline;
  if (elements.searchInput) elements.searchInput.placeholder = t.searchPlaceholder;
  const cartLabel = document.getElementById('cart-label-text');
  if (cartLabel) cartLabel.textContent = t.cart;

  // Hero Section
  const heroChipText = document.getElementById('hero-chip-text');
  if (heroChipText) heroChipText.textContent = t.heroChip;
  const heroHeadline = document.getElementById('hero-headline');
  if (heroHeadline) heroHeadline.textContent = t.heroHeadline;
  const heroSubtext = document.getElementById('hero-subtext');
  if (heroSubtext) heroSubtext.textContent = t.heroSubtext;

  // Features
  const f1Title = document.getElementById('feat-1-title');
  const f1Sub = document.getElementById('feat-1-sub');
  if (f1Title) f1Title.textContent = t.feat1Title;
  if (f1Sub) f1Sub.textContent = t.feat1Sub;

  const f2Title = document.getElementById('feat-2-title');
  const f2Sub = document.getElementById('feat-2-sub');
  if (f2Title) f2Title.textContent = t.feat2Title;
  if (f2Sub) f2Sub.textContent = t.feat2Sub;

  const f3Title = document.getElementById('feat-3-title');
  const f3Sub = document.getElementById('feat-3-sub');
  if (f3Title) f3Title.textContent = t.feat3Title;
  if (f3Sub) f3Sub.textContent = t.feat3Sub;

  const f4Title = document.getElementById('feat-4-title');
  const f4Sub = document.getElementById('feat-4-sub');
  if (f4Title) f4Title.textContent = t.feat4Title;
  if (f4Sub) f4Sub.textContent = t.feat4Sub;

  // Category Pills
  document.querySelectorAll('.category-pill').forEach(pill => {
    const cat = pill.dataset.category;
    const textSpan = pill.querySelector('.cat-pill-text');
    if (textSpan && categoryMap[cat]) {
      textSpan.textContent = categoryMap[cat][lang] || cat;
    }
  });

  // Sort Select
  const sortLabel = document.getElementById('sort-label-text');
  if (sortLabel) sortLabel.textContent = t.sortLabel;
  if (elements.sortSelect) {
    const opts = elements.sortSelect.options;
    if (opts[0]) opts[0].textContent = t.sortFeatured;
    if (opts[1]) opts[1].textContent = t.sortPriceAsc;
    if (opts[2]) opts[2].textContent = t.sortPriceDesc;
    if (opts[3]) opts[3].textContent = t.sortName;
  }

  // Empty State
  const emptyTitle = document.querySelector('#empty-state h3');
  const emptySub = document.querySelector('#empty-state p');
  if (emptyTitle) emptyTitle.textContent = t.emptyTitle;
  if (emptySub) emptySub.textContent = t.emptySub;
  if (elements.resetFiltersBtn) elements.resetFiltersBtn.textContent = t.emptyBtn;

  // Cart Drawer
  const cartDrawerTitle = document.getElementById('cart-drawer-title');
  if (cartDrawerTitle) cartDrawerTitle.textContent = t.yourCart;
  const cartEmptyTitle = document.getElementById('cart-empty-title');
  if (cartEmptyTitle) cartEmptyTitle.textContent = t.cartEmpty;
  const cartEmptySub = document.getElementById('cart-empty-sub');
  if (cartEmptySub) cartEmptySub.textContent = t.cartEmptySub;
  if (elements.browseBtn) elements.browseBtn.textContent = t.startShopping;

  const checkoutSectionTitle = document.getElementById('checkout-section-title');
  if (checkoutSectionTitle) checkoutSectionTitle.textContent = t.deliveryInfo;
  const delivYandexTitle = document.getElementById('deliv-yandex-title');
  const delivYandexDesc = document.getElementById('deliv-yandex-desc');
  if (delivYandexTitle) delivYandexTitle.textContent = t.delivYandex;
  if (delivYandexDesc) delivYandexDesc.textContent = t.delivYandexDesc;

  const delivPickupTitle = document.getElementById('deliv-pickup-title');
  const delivPickupDesc = document.getElementById('deliv-pickup-desc');
  if (delivPickupTitle) delivPickupTitle.textContent = t.delivPickup;
  if (delivPickupDesc) delivPickupDesc.textContent = t.delivPickupDesc;

  const labelOrderName = document.getElementById('label-order-name');
  if (labelOrderName) labelOrderName.textContent = t.nameLabel;
  if (elements.orderName) elements.orderName.placeholder = t.namePlaceholder;

  const labelOrderPhone = document.getElementById('label-order-phone');
  if (labelOrderPhone) labelOrderPhone.textContent = t.phoneLabel;
  const fieldHintPhone = document.getElementById('field-hint-phone');
  if (fieldHintPhone) fieldHintPhone.textContent = t.phoneHint;

  const labelOrderAddress = document.getElementById('label-order-address');
  if (labelOrderAddress) labelOrderAddress.textContent = t.addressLabel;
  if (elements.orderAddress) elements.orderAddress.placeholder = t.addressPlaceholder;

  const labelOrderNotes = document.getElementById('label-order-notes');
  if (labelOrderNotes) labelOrderNotes.textContent = t.notesLabel;
  if (elements.orderNotes) elements.orderNotes.placeholder = t.notesPlaceholder;

  const cartTotalLabel = document.getElementById('cart-total-label');
  if (cartTotalLabel) cartTotalLabel.textContent = t.totalAmount;
  const submitOrderBtnText = document.getElementById('submit-order-btn-text');
  if (submitOrderBtnText) submitOrderBtnText.textContent = t.placeOrder;
  const cartSecurityBadge = document.getElementById('cart-security-badge');
  if (cartSecurityBadge) cartSecurityBadge.textContent = t.paymentNote;

  // Product Modal
  const modalSpecsHeading = document.getElementById('modal-specs-heading');
  if (modalSpecsHeading) modalSpecsHeading.textContent = t.specsHeading;
  const modalGuaranteeText = document.getElementById('modal-guarantee-text');
  if (modalGuaranteeText) modalGuaranteeText.textContent = t.guaranteeText;
  const modalAddCartText = document.getElementById('modal-add-cart-text');
  if (modalAddCartText) modalAddCartText.textContent = t.addToCart;
  const modalBuyNowText = document.getElementById('modal-buy-now-text');
  if (modalBuyNowText) modalBuyNowText.textContent = t.buyNow;

  // Order Success Modal
  const successTitle = document.getElementById('success-title');
  if (successTitle) successTitle.textContent = t.orderSuccess;
  const successOrderLabel = document.getElementById('success-order-label');
  if (successOrderLabel) successOrderLabel.textContent = t.orderNumPrefix;
  const successInfo1 = document.getElementById('success-info-1');
  if (successInfo1) successInfo1.textContent = t.orderSuccessDesc1;
  const successInfo2 = document.getElementById('success-info-2');
  if (successInfo2) successInfo2.textContent = t.orderSuccessDesc2;
  if (elements.closeSuccessBtn) elements.closeSuccessBtn.textContent = t.orderSuccessBtn;
  if (elements.successTgDirect) elements.successTgDirect.textContent = t.orderSuccessTg;

  // AI Widget
  const aiFabTitle = document.getElementById('ai-fab-title');
  if (aiFabTitle) aiFabTitle.textContent = t.aiFabTitle;
  const aiFabStatus = document.getElementById('ai-fab-status');
  if (aiFabStatus) aiFabStatus.textContent = t.aiFabStatus;
  const aiChatTitle = document.getElementById('ai-chat-title');
  if (aiChatTitle) aiChatTitle.textContent = t.aiChatTitle;
  const aiChatSubtitle = document.getElementById('ai-chat-subtitle');
  if (aiChatSubtitle) aiChatSubtitle.textContent = t.aiChatSubtitle;
  if (elements.aiWelcomeText) elements.aiWelcomeText.textContent = t.aiWelcome;
  if (elements.aiUserInput) elements.aiUserInput.placeholder = t.aiInputPlaceholder;

  // AI Suggestions
  if (elements.aiSuggestionsWrap) {
    elements.aiSuggestionsWrap.innerHTML = t.aiChips.map(c => 
      `<button class="ai-chip" data-query="${c.q}">${c.label}</button>`
    ).join('');
  }

  // Footer
  const footerContactTitle = document.getElementById('footer-contact-title');
  if (footerContactTitle) footerContactTitle.textContent = t.footerContact;
  const footerCopyText = document.getElementById('footer-copy-text');
  if (footerCopyText) footerCopyText.textContent = t.footerRights;

  if (triggerRerender) {
    applyFiltersAndSort();
    renderCart();
  }
}

// Fetch Shop info
async function initShopInfo() {
  try {
    const res = await fetch('/api/shop');
    const data = await res.json();
    if (data.shop) {
      state.shopInfo = data.shop;
      const s = data.shop;
      
      if (elements.shopName) elements.shopName.textContent = s.name || 'Malika iStore';
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
  const t = translations[state.lang] || translations.uz;

  elements.productsCountBadge.textContent = `${list.length} ${t.itemsCount}`;
  const catName = categoryMap[state.activeCategory]?.[state.lang] || state.activeCategory;
  elements.currentCategoryTitle.textContent = state.activeCategory === 'Barchasi' ? t.allProducts : catName;

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
          <span>${prod.stock > 0 ? t.inStock : t.preOrder}</span>
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
          <button class="card-add-btn" data-action="add-cart" data-id="${prod.id}" title="${t.addToCart}">
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
  elements.modalProductDesc.textContent = prod.description;

  // Specs
  elements.modalProductSpecs.innerHTML = (prod.specs || []).map(spec => `
    <li>${spec}</li>
  `).join('');

  elements.productModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  elements.productModal.classList.add('hidden');
  document.body.style.overflow = '';
  state.activeProductModal = null;
}

// ================= 3. CART SYSTEM =================
function saveCart() {
  localStorage.setItem('mini_shop_cart', JSON.stringify(state.cart));
  updateCartBadge();
}

function updateCartBadge() {
  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  elements.cartCount.textContent = totalQty;
  if (totalQty > 0) {
    elements.cartCount.classList.remove('hidden');
  } else {
    elements.cartCount.classList.add('hidden');
  }
}

function addToCart(product, qty = 1) {
  const existing = state.cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      priceUsd: product.priceUsd,
      image: product.image,
      qty: qty
    });
  }
  saveCart();
  const t = translations[state.lang] || translations.uz;
  showToast(t.addedToCartToast);
}

function updateCartItemQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(i => i.id !== id);
  }
  saveCart();
  renderCart();
}

function removeCartItem(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function openCart() {
  renderCart();
  elements.cartDrawer.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  elements.cartDrawer.classList.add('hidden');
  document.body.style.overflow = '';
}

function renderCart() {
  const listEl = elements.cartItemsList;
  const emptyEl = elements.cartEmptyState;
  const checkoutEl = elements.checkoutFormSection;
  const footerEl = elements.cartDrawerFooter;

  if (state.cart.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    checkoutEl.classList.add('hidden');
    footerEl.classList.add('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  checkoutEl.classList.remove('hidden');
  footerEl.classList.remove('hidden');

  let totalSum = 0;

  listEl.innerHTML = state.cart.map(item => {
    const itemTotal = item.price * item.qty;
    totalSum += itemTotal;
    return `
      <div class="cart-item-row">
        <img class="cart-item-thumb" src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatSum(item.price)}</div>
        </div>
        <div class="cart-qty-control">
          <button class="qty-btn" onclick="updateCartItemQty('${item.id}', -1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="updateCartItemQty('${item.id}', 1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeCartItem('${item.id}')" title="O'chirish">&times;</button>
      </div>
    `;
  }).join('');

  elements.cartTotalAmount.textContent = formatSum(totalSum);
}

// ================= 4. CHECKOUT & ORDER SUBMISSION =================
async function submitOrder() {
  const t = translations[state.lang] || translations.uz;
  const name = elements.orderName.value.trim();
  const phone = elements.orderPhone.value.trim();
  const address = elements.orderAddress.value.trim();
  const notes = elements.orderNotes.value.trim();
  const isYandex = elements.deliveryOptYandex.classList.contains('active');
  const deliveryMethod = isYandex ? 'Yandex Kuryer (Tezkor)' : "O'zi olib ketish (Malika B-24)";

  if (!name || !phone) {
    alert(t.fillRequiredToast);
    return;
  }

  if (isYandex && !address) {
    alert(state.lang === 'ru' ? 'Пожалуйста, укажите адрес доставки!' : (state.lang === 'en' ? 'Please provide a delivery address!' : 'Iltimos, yetkazib berish manzilini kiriting!'));
    return;
  }

  const total = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const orderPayload = {
    customer: {
      name,
      phone: `+998 ${phone.replace(/^(\+998|998)/, '').trim()}`,
      address: isYandex ? address : "Malika bozoridan o'zi olib ketadi",
      notes: notes,
      deliveryMethod: deliveryMethod,
      language: state.lang
    },
    items: state.cart.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      qty: i.qty
    })),
    total
  };

  const btn = elements.submitOrderBtn;
  const btnText = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');

  btn.disabled = true;
  btnText.textContent = state.lang === 'ru' ? 'Отправка...' : (state.lang === 'en' ? 'Sending...' : 'Yuborilmoqda...');
  spinner?.classList.remove('hidden');

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Clear cart
      state.cart = [];
      saveCart();
      closeCart();

      // Clear input fields
      elements.orderName.value = '';
      elements.orderPhone.value = '';
      elements.orderAddress.value = '';
      elements.orderNotes.value = '';

      // Show success modal
      elements.successOrderCode.textContent = `#ORD-${data.orderId.slice(-4).toUpperCase()}`;
      elements.orderSuccessModal.classList.remove('hidden');
    } else {
      alert(`Xatolik: ${data.error || 'Buyurtmani qabul qilishda xatolik yuz berdi'}`);
    }
  } catch (err) {
    console.error('Order error:', err);
    alert('Tarmoq xatoligi yuz berdi. Iltimos qayta urinib ko‘ring.');
  } finally {
    btn.disabled = false;
    btnText.textContent = t.placeOrder;
    spinner?.classList.add('hidden');
  }
}

// ================= 5. AI CHATBOT SYSTEM =================
function toggleAiChat() {
  elements.aiChatWindow.classList.toggle('hidden');
  if (!elements.aiChatWindow.classList.contains('hidden')) {
    elements.aiUserInput.focus();
    scrollChatToBottom();
  }
}

async function sendAiMessage(presetQuery = null) {
  const input = elements.aiUserInput;
  const msg = presetQuery || input.value.trim();
  if (!msg) return;

  // Add user bubble
  appendMessage('user', msg);
  if (!presetQuery) input.value = '';

  // Show typing indicator
  const typingIndicator = createTypingIndicator();
  elements.aiMessagesContainer.appendChild(typingIndicator);
  scrollChatToBottom();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        history: state.chatHistory.slice(-6)
      })
    });

    const data = await res.json();
    typingIndicator.remove();

    if (data.reply) {
      appendMessage('bot', data.reply);
      state.chatHistory.push({ role: 'user', content: msg });
      state.chatHistory.push({ role: 'assistant', content: data.reply });
    } else {
      const errReply = state.lang === 'ru' 
        ? "К сожалению, произошла небольшая ошибка. Пожалуйста, напишите еще раз!"
        : (state.lang === 'en' ? "Sorry, something went wrong. Please try again!" : "Kechirasiz, kichik xatolik yuz berdi. Iltimos, qayta yozing!");
      appendMessage('bot', errReply);
    }
  } catch (err) {
    typingIndicator.remove();
    const netErr = state.lang === 'ru'
      ? "Ошибка связи. Проверьте интернет или обратитесь напрямую к продавцу!"
      : (state.lang === 'en' ? "Connection issue. Please check your network or call the shop!" : "Aloqa uzildi. Internetni tekshiring yoki do'konga to'g'ridan-to'g'ri telefon qiling!");
    appendMessage('bot', netErr);
  }
}

function appendMessage(sender, text) {
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

// Toast helper
function showToast(message) {
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

// ================= 6. EVENT LISTENERS =================
function setupEventListeners() {
  // Language switcher capsule
  const langCapsule = document.getElementById('lang-switch-capsule');
  if (langCapsule) {
    langCapsule.addEventListener('click', (e) => {
      const btn = e.target.closest('.lang-btn');
      if (btn && btn.dataset.lang) {
        setLanguage(btn.dataset.lang);
      }
    });
  }

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
  window.setLanguage = setLanguage;
}
