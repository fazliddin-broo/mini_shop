// ==========================================================================
// BLACK STORE — ASOSIY ILOVA LOGIKASI (JAVASCRIPT)
// ==========================================================================

const APP_STATE = {
  theme: localStorage.getItem('blackstore_theme') || 'light',
  lang: localStorage.getItem('blackstore_lang') || 'uz',
  cart: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('blackstore_cart') || '[]');
      return Array.isArray(val) ? val.map(item => ({ ...item, id: String(item.id) })) : [];
    } catch (e) {
      return [];
    }
  })(),
  wishlist: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('blackstore_wishlist') || '[]');
      return Array.isArray(val) ? val.map(String) : [];
    } catch (e) {
      return [];
    }
  })(),
  activeCategory: 'all',
  activeBrand: 'all',
  searchQuery: '',
  sortBy: 'popular',
  activeSlide: 0,
  sliderInterval: null,
  activeDetailProduct: null,
  selectedDetailColor: null,
  discountRate: 0,
  promoCode: null,
  isWishlistView: false,
  isCategoryView: false,
  isCartView: false,
  isDetailView: false,
  inStockOnly: false,
  _lastProductsHash: '',
  _hasLoadedLiveOnce: false
};

// Til tarjimasi yordamchisi (i18n Helper)
function t(key) {
  const currentLang = APP_STATE.lang || 'uz';
  return (I18N[currentLang] && I18N[currentLang][key]) || (I18N.uz && I18N.uz[key]) || key;
}

// HTML xavfsiz qochirish yordamchisi (XSS himoyasi)
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsString(str) {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

function sanitizeId(id) {
  return String(id || '').replace(/[^a-zA-Z0-9_-]/g, '');
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  applyLanguage();
  updateCounters();
  setupEventListeners();
  startSliderAutoplay();
  updateViewMode();
  initCurtainIntro();
  loadLiveProducts();
  loadShopSettings();
  // Har 8 soniyada dashboarddan yangi qo'shilgan/o'zgartirilgan mahsulotlarni yangilab turadi
  setInterval(loadLiveProducts, 8000);
  // Har 10 soniyada do'kon sozlamalarini (telefon, manzil, ish vaqti) avtomatik sinxronlaydi
  setInterval(loadShopSettings, 10000);
});

// ==========================================================================
// LIVE PRODUCTS SYNC WITH ADMIN DASHBOARD (API INTEGRATION)
// ==========================================================================
async function loadLiveProducts() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return;

    // Serverdan kelgan mahsulotlarni Customer vitrinasi formatiga o'tkazish
    const liveProducts = data.map(p => {
      const pId = String(p.id || p._id || `prod-${Date.now()}`);
      const primaryImg = p.image || (Array.isArray(p.images) && p.images[0]) || p.main_image || 'images/logo.png';
      const allImgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : [primaryImg];

      // Texnik xususiyatlar (specs)
      let specsUz = p.specs_uz || {};
      let specsRu = p.specs_ru || {};
      if (Array.isArray(p.specs)) {
        p.specs.forEach(s => {
          if (typeof s === 'string') {
            const parts = s.split(':');
            const key = parts[0]?.trim() || 'Xususiyat';
            const val = parts.slice(1).join(':')?.trim() || '';
            specsUz[key] = val;
            specsRu[key] = val;
          }
        });
      }

      const rawPrice = Number(p.price) || 0;
      const rawOldPrice = p.oldPrice ? Number(p.oldPrice) : (p.old_price ? Number(p.old_price) : null);
      let discPercent = p.discount_percent;
      if (!discPercent && rawOldPrice && rawOldPrice > rawPrice) {
        discPercent = Math.round(((rawOldPrice - rawPrice) / rawOldPrice) * 100);
      }

      return {
        id: pId,
        name_uz: p.name_uz || p.name || 'Mahsulot',
        name_ru: p.name_ru || p.name || 'Товар',
        category: p.category || 'boshqa',
        brand: p.brand || 'Boshqa',
        price: rawPrice,
        old_price: rawOldPrice,
        priceUsd: p.priceUsd ? Number(p.priceUsd) : null,
        currency: p.currency || null,
        discount_percent: discPercent,
        rating: p.rating || 4.9,
        reviews_count: p.reviews_count || 15,
        badge_uz: p.badge || p.badge_uz || (p.featured ? 'Top' : ''),
        badge_ru: p.badge_ru || p.badge || (p.featured ? 'Топ' : ''),
        badge_type: 'hot',
        in_stock: p.stock !== undefined ? p.stock > 0 : true,
        stock: p.stock !== undefined ? p.stock : 10,
        main_image: primaryImg,
        images: allImgs,
        colors: p.colors || ['Standart'],
        description_uz: p.description || p.description_uz || "Original kafolatlangan mahsulot. Toshkent bo'ylab tezkor yetkazib beriladi.",
        description_ru: p.description_ru || p.description || "Оригинальная продукция с гарантией. Быстрая доставка по Ташкенту.",
        specs_uz: specsUz,
        specs_ru: specsRu,
        is_live: true
      };
    });

    const liveHash = JSON.stringify(data);
    const hasChanged = APP_STATE._lastProductsHash !== liveHash;

    if (hasChanged || !APP_STATE._hasLoadedLiveOnce) {
      APP_STATE._lastProductsHash = liveHash;
      APP_STATE._hasLoadedLiveOnce = true;

      const serverIds = new Set(liveProducts.map(p => String(p.id)));
      const remainingStatic = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).filter(p => !serverIds.has(String(p.id)) && !p.is_live);
      PRODUCTS = [...liveProducts, ...remainingStatic];

      renderProducts();
      renderCategoriesBar();
      renderBrandsDrawer();
      renderSidebarFilters();
      renderCategoryActiveHeader();
      if (!APP_STATE.isCategoryView && !APP_STATE.isDetailView && !APP_STATE.isCartView) {
        renderHomeDeals();
      }
    }
  } catch (err) {
    console.warn("Live products sync error, fallback static products active:", err);
  }
}

// ==========================================================================
// DYNAMIC SHOP SETTINGS SYNC (ADMIN DASHBOARD -> CUSTOMER PANEL)
// ==========================================================================
async function loadShopSettings() {
  try {
    const res = await fetch('/api/shop');
    if (!res.ok) return;
    const data = await res.json();
    const shop = data.shop || {};

    if (shop.phone) {
      const cleanPhone = shop.phone.replace(/[^\d+]/g, '');
      const footerPhoneLinks = document.querySelectorAll('a[href^="tel:"]');
      footerPhoneLinks.forEach(el => {
        el.href = `tel:${cleanPhone}`;
        el.textContent = shop.phone;
      });
    }

    if (shop.address) {
      const footerTagline = document.getElementById('footerTaglineText');
      if (footerTagline) {
        footerTagline.textContent = `${shop.address} · ${shop.phone || '+998 (95) 196-44-44'}`;
      }
    }

    if (shop.workingHours) {
      const hoursEl = document.getElementById('footerHoursText');
      if (hoursEl) {
        hoursEl.textContent = `Ish vaqti: ${shop.workingHours}`;
      }
    }

    if (shop.telegramChannel) {
      const tgLinks = document.querySelectorAll('#footerTgBtn, #footerTgIcon + a, .social-link-btn[id*="Tg"], a[href*="t.me"]');
      tgLinks.forEach(el => {
        if (!el.href.includes('admin')) el.href = shop.telegramChannel;
      });
    }

    if (shop.instagram) {
      const instaLinks = document.querySelectorAll('#footerInstaBtn, a[href*="instagram.com"]');
      instaLinks.forEach(el => {
        el.href = shop.instagram;
      });
    }
  } catch (err) {
    console.warn("Shop settings sync error:", err);
  }
}

// ==========================================================================
// CINEMATIC CURTAIN INTRO ANIMATION (Parda Ochilishi)
// ==========================================================================
let curtainIntroTimeout = null;

function initCurtainIntro() {
  const overlay = document.getElementById('siteCurtainIntro');
  const progress = document.getElementById('curtainLoaderProgress');
  if (!overlay) return;

  // 1-bosqich: Progres chizig'i to'ladi (~550ms)
  setTimeout(() => {
    if (progress) progress.style.width = '100%';
  }, 100);

  // 2-bosqich: Parda ikki tomonga ajralib ochiladi (~800ms)
  curtainIntroTimeout = setTimeout(() => {
    overlay.classList.add('opening');

    // 3-bosqich: Parda butunlay ochilgach, domdan tozalash
    setTimeout(() => {
      dismissCurtainIntro();
    }, 1050);
  }, 800);
}

function dismissCurtainIntro() {
  const overlay = document.getElementById('siteCurtainIntro');
  if (!overlay || overlay.classList.contains('completed')) return;

  overlay.classList.add('opening');
  setTimeout(() => {
    overlay.classList.add('completed');
    overlay.style.display = 'none';
  }, 400);
}

// ==========================================================================
// THEME MANAGEMENT (Tungi / Kunduzgi Rejim)
// ==========================================================================
function initTheme() {
  const currentTheme = APP_STATE.theme || 'light';
  if (currentTheme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }

  const metaTheme = document.getElementById('metaThemeColor') || document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.content = currentTheme === 'light' ? '#f8f9fa' : '#09090b';
  }

  updateThemeIcon();
}

function toggleTheme() {
  APP_STATE.theme = APP_STATE.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('blackstore_theme', APP_STATE.theme);
  initTheme();
}

function updateThemeIcon() {
  const isDark = APP_STATE.theme === 'dark';
  // Agar qora bo'lsa, quyosh (kunduzgiga o'tish) ikonkasi, oq bo'lsa oy (tungiga o'tish) ikonkasi
  const iconName = isDark ? 'sun' : 'moon';

  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = getIcon(iconName);
    btn.title = isDark ? "Kunduzgi rejim (Oq)" : "Tungi rejim (Qora)";
  }

  const mIcon = document.getElementById('mDrawerThemeIcon');
  if (mIcon) {
    mIcon.innerHTML = getIcon(iconName);
  }

  const mBtn = document.getElementById('mDrawerThemeBtn');
  if (mBtn) {
    mBtn.title = isDark ? "Kunduzgi rejim" : "Tungi rejim";
  }
}

// ==========================================================================
// LANGUAGE SWITCHER (O'ZBEKCHA / RUSCHA / INGLIZCHA 100% TARJIMA TIZIMI)
// ==========================================================================
function toggleLanguage() {
  if (APP_STATE.lang === 'uz') {
    APP_STATE.lang = 'ru';
  } else if (APP_STATE.lang === 'ru') {
    APP_STATE.lang = 'en';
  } else {
    APP_STATE.lang = 'uz';
  }
  localStorage.setItem('blackstore_lang', APP_STATE.lang);
  applyLanguage();
  renderCategoriesBar();
  renderHeroSlider();
  renderSidebarFilters();
  renderCategoryActiveHeader();
  renderProducts();
}

function setLanguage(lang) {
  if (['uz', 'ru', 'en'].includes(lang)) {
    APP_STATE.lang = lang;
    localStorage.setItem('blackstore_lang', lang);
    applyLanguage();
    renderCategoriesBar();
    renderHeroSlider();
    renderSidebarFilters();
    renderCategoryActiveHeader();
    renderProducts();
  }
}

function applyLanguage() {
  const currentLang = APP_STATE.lang || 'uz';
  document.documentElement.setAttribute('lang', currentLang);

  // Header til tugmasi: UZ, RU, yoki EN ko'rsatadi (Applebox uslubi)
  const langBtn = document.getElementById('langToggleBtn');
  if (langBtn) {
    langBtn.textContent = currentLang.toUpperCase();
    langBtn.setAttribute('title', currentLang === 'uz' ? "Переключить на русский (RU)" : currentLang === 'ru' ? "Switch to English (EN)" : "O'zbek tiliga o'tish (UZ)");
  }

  // Qidiruv maydoni placeholder
  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(input => {
    input.placeholder = t('searchPlaceholder');
  });

  // Sub-navigatsiya tugmalari (Screenshot 2 uslubi)
  const subNavCat = document.querySelector('#subNavCatalogBtn span:last-child');
  if (subNavCat) subNavCat.textContent = t('categories');
  const subNavBrands = document.querySelector('#subNavBrandsBtn span:last-child');
  if (subNavBrands) subNavBrands.textContent = t('brands');
  const subNavAll = document.querySelector('#subNavAllLink span:first-child');
  if (subNavAll) subNavAll.textContent = t('seeAll');

  // Mobil chap menyu (Mobile Left Drawer - IMG_2196)
  const mDrawerLangText = document.getElementById('mDrawerLangText');
  if (mDrawerLangText) {
    mDrawerLangText.textContent = currentLang === 'uz' ? "O'zbek tili" : currentLang === 'ru' ? "Русский язык" : "English";
  }
  const mDrawerLangTag = document.getElementById('mDrawerLangTag');
  if (mDrawerLangTag) {
    mDrawerLangTag.textContent = currentLang.toUpperCase();
  }

  const mDHomeText = document.getElementById('mDHomeText');
  if (mDHomeText) mDHomeText.textContent = t('navHome');
  const mDAllText = document.getElementById('mDAllText');
  if (mDAllText) mDAllText.textContent = t('seeAll');
  const mDWishText = document.getElementById('mDWishText');
  if (mDWishText) mDWishText.textContent = t('navWishlist');
  const mDCartText = document.getElementById('mDCartText');
  if (mDCartText) mDCartText.textContent = t('navCart');
  const mDCatText = document.getElementById('mDCatText');
  if (mDCatText) mDCatText.textContent = t('navCategories');
  const mDBrandText = document.getElementById('mDBrandText');
  if (mDBrandText) mDBrandText.textContent = t('brands');
  const mDContactText = document.getElementById('mDContactText');
  if (mDContactText) mDContactText.textContent = currentLang === 'ru' ? "Контакты и Адрес" : currentLang === 'en' ? "Contact & Address" : "Aloqa va Manzil";

  // Mobil pastdan chiquvchi Filtr drawer (IMG_2194)
  const mobileFilterTitle = document.getElementById('mobileFilterDrawerTitle');
  if (mobileFilterTitle) mobileFilterTitle.textContent = t('filterTitle');
  const mfilterCatTitle = document.getElementById('mfilterCatTitle');
  if (mfilterCatTitle) mfilterCatTitle.textContent = t('filterCategories');
  const mfilterBrandTitle = document.getElementById('mfilterBrandTitle');
  if (mfilterBrandTitle) mfilterBrandTitle.textContent = t('filterBrands');
  const mobileFilterApplyBtn = document.getElementById('mobileFilterApplyBtn');
  if (mobileFilterApplyBtn) mobileFilterApplyBtn.textContent = t('applyFilter');
  const mobileFilterResetBtn = document.getElementById('mobileFilterResetBtn');
  if (mobileFilterResetBtn) mobileFilterResetBtn.textContent = t('resetFilter');
  const mfilterInStockTitle = document.getElementById('mfilterInStockTitle');
  if (mfilterInStockTitle) mfilterInStockTitle.textContent = currentLang === 'ru' ? 'В НАЛИЧИИ' : currentLang === 'en' ? 'IN STOCK' : 'MAVJUD';

  // Desktop sidebar filter matnlari
  const sidebarFilterTitle = document.getElementById('sidebarFilterTitle');
  if (sidebarFilterTitle) sidebarFilterTitle.textContent = t('filterTitle');
  const sidebarCatTitle = document.getElementById('sidebarCatTitle');
  if (sidebarCatTitle) sidebarCatTitle.textContent = t('filterCategories');
  const sidebarBrandTitle = document.getElementById('sidebarBrandTitle');
  if (sidebarBrandTitle) sidebarBrandTitle.textContent = t('filterBrands');
  const sidebarInStockTitle = document.getElementById('sidebarInStockTitle');
  if (sidebarInStockTitle) sidebarInStockTitle.textContent = currentLang === 'ru' ? 'В НАЛИЧИИ' : 'MAVJUD';
  const sidebarResetText = document.getElementById('sidebarResetText');
  if (sidebarResetText) sidebarResetText.textContent = t('resetFilter');

  // Chap tarafdagi to'liq Katalog drawer sarlavhasi
  const catDrawerHeading = document.querySelector('.catalog-drawer-heading');
  if (catDrawerHeading) catDrawerHeading.textContent = t('categories');

  // Savat drawer sarlavhasi
  const cartDrawerTitle = document.querySelector('#cartDrawer .drawer-title span:last-child');
  if (cartDrawerTitle) cartDrawerTitle.textContent = t('cartTitle');

  // Afzalliklar bloki (Trust Strip - 4 ta karta)
  const trust1H = document.querySelector('.trust-item:nth-child(1) h4');
  const trust1P = document.querySelector('.trust-item:nth-child(1) p');
  if (trust1H) trust1H.textContent = t('trust1Title');
  if (trust1P) trust1P.textContent = t('trust1Desc');

  const trust2H = document.querySelector('.trust-item:nth-child(2) h4');
  const trust2P = document.querySelector('.trust-item:nth-child(2) p');
  if (trust2H) trust2H.textContent = t('trust2Title');
  if (trust2P) trust2P.textContent = t('trust2Desc');

  const trust3H = document.querySelector('.trust-item:nth-child(3) h4');
  const trust3P = document.querySelector('.trust-item:nth-child(3) p');
  if (trust3H) trust3H.textContent = t('trust3Title');
  if (trust3P) trust3P.textContent = t('trust3Desc');

  const trust4H = document.querySelector('.trust-item:nth-child(4) h4');
  const trust4P = document.querySelector('.trust-item:nth-child(4) p');
  if (trust4H) trust4H.textContent = t('trust4Title');
  if (trust4P) trust4P.textContent = t('trust4Desc');

  // Toifalar seksiyasi bosh sarlavhasi
  const catSectionTitle = document.querySelector('.categories-section .section-title');
  if (catSectionTitle) catSectionTitle.textContent = t('categories');

  // Saralash paneli va hisob
  const sortLabel = document.querySelector('.sort-label');
  if (sortLabel) sortLabel.textContent = t('sort');
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.options[0].text = t('sortPopular');
    sortSelect.options[1].text = t('sortPriceAsc');
    sortSelect.options[2].text = t('sortPriceDesc');
    sortSelect.options[3].text = t('sortRating');
  }

  // Brendlar drawer sarlavhasi
  const brandsDrawerHeading = document.getElementById('brandsDrawerHeading');
  if (brandsDrawerHeading) brandsDrawerHeading.textContent = t('brandsTitle');
  const brandsModalTitle = document.getElementById('brandsModalTitle');
  if (brandsModalTitle) brandsModalTitle.textContent = t('brandsTitle');

  // Savat drawer elementlari
  const promoInput = document.getElementById('promoInput');
  if (promoInput) promoInput.placeholder = t('promoPlaceholder');
  const promoBtn = document.querySelector('.btn-promo');
  if (promoBtn) promoBtn.textContent = t('apply');
  const cartTotalLabel = document.querySelector('.cart-total-label');
  if (cartTotalLabel) cartTotalLabel.textContent = t('totalSum');
  const checkoutBtnText = document.querySelector('.btn-checkout span:last-child');
  if (checkoutBtnText) checkoutBtnText.textContent = t('checkout');

  // Mobil navigatsiya paneli (Bottom Bar - 5 ta tab)
  const navTabs = document.querySelectorAll('.mobile-bottom-bar .nav-tab-item');
  if (navTabs.length >= 5) {
    const s0 = navTabs[0].querySelector('span:last-child');
    if (s0) s0.textContent = t('navHome');
    const s1 = navTabs[1].querySelector('span:last-child');
    if (s1) s1.textContent = t('navCategories');
    const s2 = navTabs[2].querySelector('span:last-child');
    if (s2) s2.textContent = t('navCart');
    const s3 = navTabs[3].querySelector('span:last-child');
    if (s3) s3.textContent = t('navWishlist');
    const s4 = navTabs[4].querySelector('span:last-child');
    if (s4) s4.textContent = currentLang === 'ru' ? 'Контакты' : currentLang === 'en' ? 'Contact' : 'Aloqa';
  }

  // Footer matnlari va havolalari
  const footerAbout = document.querySelector('.footer-col:nth-child(1) p');
  if (footerAbout) footerAbout.textContent = t('footerAbout');
  const footerH5s = document.querySelectorAll('.footer-col h5');
  if (footerH5s.length >= 3) {
    footerH5s[0].textContent = t('footerCategories');
    footerH5s[1].textContent = t('footerClients');
    footerH5s[2].textContent = t('footerContact');
  }

  // Mobil va Desktop Filtr Sheet tarjimalari (IMG_2194)
  const mFDrawerTitle = document.getElementById('mobileFilterDrawerTitle');
  if (mFDrawerTitle) mFDrawerTitle.textContent = currentLang === 'ru' ? 'Фильтр' : 'Filtr';
  const mFCatTitle = document.getElementById('mfilterCatTitle');
  if (mFCatTitle) mFCatTitle.textContent = currentLang === 'ru' ? 'КАТЕГОРИИ' : 'KATEGORIYALAR';
  const mFBrandTitle = document.getElementById('mfilterBrandTitle');
  if (mFBrandTitle) mFBrandTitle.textContent = currentLang === 'ru' ? 'БРЕНДЫ' : 'BRENDLAR';
  const mFApplyBtn = document.getElementById('mobileFilterApplyBtn');
  if (mFApplyBtn) mFApplyBtn.textContent = currentLang === 'ru' ? 'Применить' : "Qo'llash";

  // Footer Kategoriyalar havolalari (Faqat 4 ta rasmiy kategoriya)
  const footerCatLinks = document.querySelectorAll('.footer-col:nth-child(2) .footer-links a');
  if (footerCatLinks.length >= 4) {
    footerCatLinks[0].textContent = currentLang === 'ru' ? 'Умные часы и фитнес' : 'Aqlli soatlar va fitnes';
    footerCatLinks[1].textContent = currentLang === 'ru' ? 'Наушники и гарнитуры' : 'Quloqchinlar va naushniklar';
    footerCatLinks[2].textContent = currentLang === 'ru' ? 'Зарядные устройства и кабели' : 'Zaryadlovchi va kabellar';
    footerCatLinks[3].textContent = currentLang === 'ru' ? 'Аксессуары для телефонов' : 'Telefon aksessuarlari';
  }

  // Footer Mijozlar uchun havolalar
  const footerClientLinks = document.querySelectorAll('.footer-col:nth-child(3) .footer-links a');
  if (footerClientLinks.length >= 4) {
    footerClientLinks[0].textContent = t('linkPromotions');
    footerClientLinks[1].textContent = t('linkDelivery');
    footerClientLinks[2].textContent = t('linkWarranty');
    footerClientLinks[3].textContent = t('linkPayment');
  }

  const footerHours = document.getElementById('footerHoursText');
  if (footerHours) footerHours.textContent = t('footerHours');

  const footerRights = document.getElementById('footerRightsText');
  if (footerRights) footerRights.textContent = t('footerRights');

  const footerTagline = document.getElementById('footerTaglineText');
  if (footerTagline) footerTagline.textContent = t('footerTagline');

  // Dinamik komponentlarni to'liq qayta chizish
  renderHeroSlider();
  renderCategoriesBar();
  renderBrandsDrawer();
  renderSidebarFilters();
  renderMobileFilterDrawerContent();
  renderCategoryActiveHeader();
  renderProducts();
  renderCartDrawer();
  if (APP_STATE.isCartView) {
    renderCartPage();
  }

  // Agar mahsulot tafsilot sahifasi yoki oynasi ochiq bo'lsa, uni ham yangilash
  if (APP_STATE.isDetailView && APP_STATE.activeDetailProduct) {
    renderProductDetailPage(APP_STATE.activeDetailProduct);
  }
  const productModal = document.getElementById('productDetailModal');
  if (productModal?.classList?.contains?.('active') && APP_STATE.activeDetailProduct) {
    openProductDetail(APP_STATE.activeDetailProduct.id);
  }

  // Agar checkout ochiq bo'lsa, uni ham yangilash
  const checkoutModal = document.getElementById('checkoutModal');
  if (checkoutModal?.classList?.contains?.('active')) {
    openCheckoutModal();
  }
}

// ==========================================================================
// HERO SLIDER (SILKY SMOOTH SLIDING CAROUSEL — SCREENSHOT 2 USLUBI)
// ==========================================================================
function renderHeroSlider() {
  const track = document.getElementById('heroSliderTrack');
  const dashesContainer = document.getElementById('sliderDashes');
  if (!track || !dashesContainer) return;

  const lang = APP_STATE.lang || 'uz';
  const isMobile = window.innerWidth <= 640;

  track.innerHTML = BANNERS.map((banner, index) => {
    const title = banner['title_' + lang] || banner.title_uz;
    const subtitle = banner['subtitle_' + lang] || banner.subtitle_uz;
    const cta = banner['cta_' + lang] || banner.cta_uz;
    const badge = banner['badge_' + lang] || banner.badge_uz;

    // Til va qurilma turiga mos rasmni tanlash
    let bannerImg = banner.image;
    if (isMobile) {
      if (lang === 'ru' && banner.mobile_image_ru) {
        bannerImg = banner.mobile_image_ru;
      } else if (banner.mobile_image) {
        bannerImg = banner.mobile_image;
      } else if (lang === 'ru' && banner.image_ru) {
        bannerImg = banner.image_ru;
      }
    } else {
      if (lang === 'ru' && banner.image_ru) {
        bannerImg = banner.image_ru;
      }
    }
    if (bannerImg && !bannerImg.startsWith('http') && !bannerImg.startsWith('/')) {
      bannerImg = '/' + bannerImg;
    }

    if (banner.is_graphic) {
      return `
        <div class="hero-slide hero-slide-graphic" onclick="handleHeroSlideClick(${index})" style="background-image: url('${bannerImg}');" role="button" tabindex="0" aria-label="${escapeHtml(title)}">
          <div class="hero-graphic-cta-hitbox" title="${escapeHtml(cta)}" onclick="event.stopPropagation(); handleHeroSlideClick(${index})"></div>
        </div>
      `;
    }

    return `
      <div class="hero-slide" style="background-image: url('${bannerImg}');">
        <div class="hero-slide-bg-overlay" style="background: ${banner.bg_style};"></div>
        <div class="hero-slide-content">
          <span class="hero-slide-badge">${badge}</span>
          <h1 class="hero-slide-title">${title}</h1>
          <p class="hero-slide-desc">${subtitle}</p>
          <div class="hero-features-strip">
            ${(banner.features || []).map(f => `<span class="hero-feature-chip">${f}</span>`).join('')}
          </div>
          <button class="hero-slide-btn" onclick="event.stopPropagation(); handleHeroSlideClick(${index})">
            <span>${cta}</span>
            ${getIcon('arrowRight')}
          </button>
        </div>
      </div>
    `;
  }).join('');

  dashesContainer.innerHTML = BANNERS.map((_, index) => `
    <button class="slider-dash ${index === APP_STATE.activeSlide ? 'active' : ''}" onclick="goToSlide(${index})" aria-label="Slayd ${index + 1}"></button>
  `).join('');

  track.style.transform = `translateX(-${APP_STATE.activeSlide * 100}%)`;
  setupSliderSwipe();
}

function handleHeroSlideClick(index) {
  const banner = BANNERS[index];
  if (!banner) return;
  if (banner.brand_filter && banner.brand_filter !== 'all') {
    selectBrand(banner.brand_filter);
  } else if (banner.category_filter) {
    selectCategory(banner.category_filter);
  }
}

function goToSlide(index) {
  const track = document.getElementById('heroSliderTrack');
  const dashes = document.querySelectorAll('.slider-dash');
  if (!track) return;

  APP_STATE.activeSlide = (index + BANNERS.length) % BANNERS.length;
  // Surilib o'tish (Smooth horizontal slide transition)
  track.style.transform = `translateX(-${APP_STATE.activeSlide * 100}%)`;

  dashes.forEach((d, i) => {
    if (i === APP_STATE.activeSlide) {
      d.classList.add('active');
    } else {
      d.classList.remove('active');
    }
  });
}

function nextSlide() {
  goToSlide(APP_STATE.activeSlide + 1);
}

function prevSlide() {
  goToSlide(APP_STATE.activeSlide - 1);
}

function startSliderAutoplay() {
  stopSliderAutoplay();
  APP_STATE.sliderInterval = setInterval(nextSlide, 5500);
}

function stopSliderAutoplay() {
  if (APP_STATE.sliderInterval) {
    clearInterval(APP_STATE.sliderInterval);
    APP_STATE.sliderInterval = null;
  }
}

// Sensor / Sichqoncha orqali surish (Swipe gestures)
function setupSliderSwipe() {
  const wrap = document.getElementById('heroSliderWrap');
  if (!wrap || !wrap.addEventListener || (wrap.dataset && wrap.dataset.swipeInitialized)) return;
  if (wrap.dataset) wrap.dataset.swipeInitialized = 'true';

  let startX = 0;
  let currentX = 0;
  let isSwiping = false;

  wrap.addEventListener('touchstart', (e) => {
    stopSliderAutoplay();
    startX = e.touches[0].clientX;
    isSwiping = true;
  }, { passive: true });

  wrap.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    currentX = e.touches[0].clientX;
  }, { passive: true });

  wrap.addEventListener('touchend', () => {
    if (!isSwiping) return;
    const diff = startX - currentX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    isSwiping = false;
    startSliderAutoplay();
  });
}

// ==========================================================================
// CATEGORIES BAR & DRAWER (APPLEBOX USLUBIDAGI KVADRAT KARTALAR VA CHAP MENYU)
// ==========================================================================
function renderCategoriesBar() {
  const container = document.getElementById('categoriesScroll');
  const lang = APP_STATE.lang;

  // Yuqori gorizontal lenta (Image 2: Applebox skrinshotidagi kabi kvadrat kartalar va tagida yozuv)
  if (container) {
    container.innerHTML = CATEGORIES.filter(c => c.id !== 'all').map(cat => {
      const catName = cat['name_' + lang] || cat.name_uz;
      const isActive = !APP_STATE.isWishlistView && APP_STATE.activeCategory === cat.id;
      return `
        <button class="cat-tile ${isActive ? 'active' : ''}" onclick="selectCategory('${cat.id}')">
          <div class="cat-tile-box">
            ${getIcon(cat.icon)}
          </div>
          <span class="cat-tile-label">${catName}</span>
        </button>
      `;
    }).join('');
  }

  renderCatalogDrawer();
  renderCategoryActiveHeader();
}

// Chap tomondagi to'liq Kategoriyalar drayveri (Applebox uslubidagi to'liq qatorli toifalar ro'yxati)
function renderCatalogDrawer() {
  const container = document.getElementById('catalogDrawerGrid');
  if (!container) return;

  const lang = APP_STATE.lang || 'uz';
  const allText = lang === 'ru' ? 'Все' : lang === 'en' ? 'All' : 'Barchasi';
  const isAllActive = !APP_STATE.isWishlistView && APP_STATE.activeCategory === 'all';
  const sectionLabel = lang === 'ru' ? 'КАТЕГОРИИ' : lang === 'en' ? 'CATEGORIES' : 'KATEGORIYALAR';

  let drawerHtml = `
    <div class="category-drawer-section-label">${sectionLabel}</div>
    <div class="category-drawer-item ${isAllActive ? 'active' : ''}" onclick="selectCategory('all'); toggleCatalogDrawer(false);" role="button" tabindex="0">
      <div class="category-drawer-icon-wrap">
        ${getIcon('grid')}
      </div>
      <span class="category-drawer-name">${allText}</span>
      <span class="category-drawer-arrow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </span>
    </div>
  `;

  drawerHtml += CATEGORIES.filter(c => c.id !== 'all').map(cat => {
    const catName = cat['name_' + lang] || cat.name_uz;
    const isActive = !APP_STATE.isWishlistView && APP_STATE.activeCategory === cat.id;

    return `
      <div class="category-drawer-item ${isActive ? 'active' : ''}" onclick="selectCategory('${cat.id}'); toggleCatalogDrawer(false);" role="button" tabindex="0">
        <div class="category-drawer-icon-wrap">
          ${getIcon(cat.icon)}
        </div>
        <span class="category-drawer-name">${escapeHtml(catName)}</span>
        <span class="category-drawer-arrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </span>
      </div>
    `;
  }).join('');

  container.innerHTML = drawerHtml;
}

function renderCategoryActiveHeader() {
  const headerContainer = document.getElementById('categoryActiveHeader');
  if (!headerContainer) return;

  const lang = APP_STATE.lang || 'uz';
  const unit = t('productsUnit') || (lang === 'ru' ? 'товаров' : 'ta mahsulot');
  const filterBtnText = t('filterBtn') || (lang === 'ru' ? 'Фильтр' : 'Filtr');
  const filteredProducts = getFilteredProducts();
  const count = filteredProducts.length;

  const isCategoryMode = (
    APP_STATE.isCategoryView || 
    (APP_STATE.activeCategory && APP_STATE.activeCategory !== 'all') ||
    (APP_STATE.activeBrand && APP_STATE.activeBrand !== 'all') ||
    (APP_STATE.searchQuery && APP_STATE.searchQuery.trim().length > 0)
  );

  if (APP_STATE.isWishlistView) {
    if (count === 0) {
      headerContainer.innerHTML = '';
      headerContainer.style.display = 'none';
      return;
    }
    headerContainer.style.display = 'block';
    const wishTitle = lang === 'ru' ? 'Избранные товары' : (lang === 'en' ? 'Favorite Items' : 'Sevimlilar ro\'yxati');
    headerContainer.innerHTML = `
      <div class="desktop-active-cat-row">
        <div class="desktop-active-cat-left">
          <h2 class="cat-active-title" style="display:inline-flex; align-items:center; gap:8px;">
            <span style="color:#ef4444; display:inline-flex; align-items:center;">${getIcon('heartFilled')}</span>
            ${wishTitle}
          </h2>
          <span class="cat-active-count">&bull; ${count} ${unit}</span>
        </div>
      </div>
      <div class="mobile-catalog-header-wrap" style="justify-content: flex-start; padding: 18px 0 6px;">
        <div class="mobile-catalog-title-col">
          <h2 class="mobile-catalog-main-title" style="display:inline-flex; align-items:center; gap:8px;">
            <span style="color:#ef4444; display:inline-flex; align-items:center;">${getIcon('heartFilled')}</span>
            ${wishTitle}
          </h2>
          <span class="mobile-catalog-sub-count">&bull; ${count} ${unit}</span>
        </div>
      </div>
    `;
    return;
  }

  // Bosh sahifa ko'rinishi (Hafta chegirmalari ostidagi barcha mahsulotlar bo'limi)
  if (!isCategoryMode) {
    headerContainer.style.display = 'block';
    const allProductsTitle = t('allProducts') || (lang === 'ru' ? "Все товары" : lang === 'en' ? "All Products" : "Barcha mahsulotlar");

    headerContainer.innerHTML = `
      <div class="home-catalog-section-head">
        <div class="home-catalog-title-group">
          <span class="home-catalog-badge-icon" style="color: var(--yellow-400); display: inline-flex; align-items: center;">${getIcon('grid')}</span>
          <h2 class="home-catalog-section-title">${allProductsTitle}</h2>
        </div>
        <span class="home-catalog-count-pill">&bull; ${count} ${unit}</span>
      </div>
    `;
    return;
  }

  headerContainer.style.display = 'block';

  let title = t('allProducts') || (lang === 'ru' ? 'Все товары' : lang === 'en' ? 'All products' : 'Barcha mahsulotlar');
  let isFiltered = false;

  if (APP_STATE.activeBrand && APP_STATE.activeBrand !== 'all') {
    title = APP_STATE.activeBrand;
    isFiltered = true;
  } else if (APP_STATE.activeCategory && APP_STATE.activeCategory !== 'all') {
    const cat = CATEGORIES.find(c => c.id === APP_STATE.activeCategory);
    if (cat) title = cat['name_' + lang] || cat.name_uz;
    isFiltered = true;
  } else if (APP_STATE.searchQuery) {
    title = `"${APP_STATE.searchQuery}"`;
    isFiltered = true;
  }

  headerContainer.innerHTML = `
    <div class="desktop-active-cat-row">
      <div class="desktop-active-cat-left">
        <h2 class="cat-active-title">${escapeHtml(title)}</h2>
        <span class="cat-active-count">&bull; ${count} ${unit}</span>
      </div>
      ${isFiltered ? `
        <button class="cat-active-pill" onclick="resetFilters(true)" title="${lang === 'ru' ? 'Сбросить фильтр' : lang === 'en' ? 'Clear filter' : 'Filtrni tozalash'}">
          <span>${escapeHtml(title)}</span>
          <span class="pill-x" style="display:inline-flex; align-items:center;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </span>
        </button>
      ` : ''}
    </div>
    <div class="mobile-catalog-header-wrap">
      <div class="mobile-catalog-title-col">
        <h2 class="mobile-catalog-main-title">${escapeHtml(title)}</h2>
        <span class="mobile-catalog-sub-count">&bull; ${count} ${unit}</span>
      </div>
      <button class="mobile-filter-pill-btn" onclick="toggleMobileFilterDrawer(true)" aria-label="${filterBtnText}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="21" x2="4" y2="14"></line>
          <line x1="4" y1="10" x2="4" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="3"></line>
          <line x1="20" y1="21" x2="20" y2="16"></line>
          <line x1="20" y1="12" x2="20" y2="3"></line>
          <line x1="1" y1="14" x2="7" y2="14"></line>
          <line x1="9" y1="8" x2="15" y2="8"></line>
          <line x1="17" y1="16" x2="23" y2="16"></line>
        </svg>
        <span>${filterBtnText}</span>
      </button>
    </div>
  `;
}

function selectCategory(catId) {
  APP_STATE.isWishlistView = false;
  APP_STATE.isCartView = false;
  APP_STATE.isDetailView = false;
  if (APP_STATE.activeCategory === catId) {
    APP_STATE.activeCategory = 'all';
  } else {
    APP_STATE.activeCategory = catId;
  }
  APP_STATE.isCategoryView = (APP_STATE.activeCategory !== 'all');

  setActiveBottomTab('bottomTabCatalog');

  updateViewMode();
  renderCategoriesBar();
  renderSidebarFilters();
  renderCategoryActiveHeader();
  renderProducts();
  // Sayt qimirlamasdan - sayt sakrab pastga tushib ketmaydi
}

// ==========================================================================
// BRANDS DRAWER (Left Drawer — Image 5 Uslubida: 6 ta Rasmiy Brend)
// ==========================================================================
function toggleBrandsDrawer(show) {
  const drawer = document.getElementById('brandsDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (!drawer || !backdrop) return;

  if (show) {
    closeAllDrawers();
    renderBrandsDrawer();
    drawer.classList.add('active');
    backdrop.classList.add('active');
  } else {
    drawer.classList.remove('active');
    const isCartOpen = document.getElementById('cartDrawer') && document.getElementById('cartDrawer').classList.contains('active');
    const isCatOpen = document.getElementById('catalogDrawer') && document.getElementById('catalogDrawer').classList.contains('active');
    if (!isCartOpen && !isCatOpen) {
      backdrop.classList.remove('active');
    }
  }
}

function renderBrandsDrawer() {
  const grid = document.getElementById('brandsDrawerGrid');
  if (!grid) return;

  grid.innerHTML = BRANDS.map(brand => {
    const isActive = APP_STATE.activeBrand && APP_STATE.activeBrand.toLowerCase() === brand.id.toLowerCase();
    const logoHtml = brand.logo 
      ? `<img src="${brand.logo}" alt="${brand.name}" class="brand-drawer-img" loading="eager" onerror="this.onerror=null;this.src='/images/placeholder.svg';" />`
      : getIcon(brand.icon);

    return `
      <div class="brand-drawer-card ${isActive ? 'active' : ''}" onclick="selectBrand('${brand.id}')" role="button" tabindex="0" title="${brand.name}">
        <div class="brand-drawer-box">
          ${logoHtml}
        </div>
        <div class="brand-drawer-name">${brand.name}</div>
      </div>
    `;
  }).join('');
}

function selectBrand(brandId) {
  APP_STATE.isCartView = false;
  APP_STATE.isDetailView = false;
  if (APP_STATE.activeBrand && APP_STATE.activeBrand.toLowerCase() === brandId.toLowerCase()) {
    APP_STATE.activeBrand = 'all';
  } else {
    APP_STATE.activeBrand = brandId;
  }
  APP_STATE.isWishlistView = false;
  APP_STATE.searchQuery = '';
  APP_STATE.activeCategory = 'all';
  APP_STATE.isCategoryView = (APP_STATE.activeBrand !== 'all');

  toggleBrandsDrawer(false);
  updateViewMode();
  renderBrandsDrawer();
  renderCategoriesBar();
  renderSidebarFilters();
  renderProducts();
  // Sayt qimirlamasdan - sayt sakrab pastga tushib ketmaydi
}

function closeBrandsModal() {
  toggleBrandsDrawer(false);
}

function filterByBrand(brand) {
  selectBrand(brand);
}

function setActiveBottomTab(tabId) {
  document.querySelectorAll('.mobile-bottom-bar .nav-tab-item').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(tabId);
  if (activeBtn) activeBtn.classList.add('active');
}

function filterByWishlist(e) {
  if (e && e.preventDefault) e.preventDefault();
  closeAllDrawers();
  setActiveBottomTab('bottomTabWishlist');
  APP_STATE.isWishlistView = true;
  APP_STATE.isCartView = false;
  APP_STATE.isDetailView = false;
  APP_STATE.activeCategory = 'all';
  APP_STATE.activeBrand = 'all';
  APP_STATE.searchQuery = '';
  APP_STATE.isCategoryView = false;
  APP_STATE.inStockOnly = false;

  const inStockCheckbox = document.getElementById('inStockToggle');
  if (inStockCheckbox) inStockCheckbox.checked = false;

  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(input => input.value = '');
  const searchClears = document.querySelectorAll('.search-clear');
  searchClears.forEach(btn => btn.style.display = 'none');
  if (typeof closeSearchDropdowns === 'function') closeSearchDropdowns();

  updateViewMode();
  renderCategoryActiveHeader();
  renderProducts();

  window.scrollTo({ top: 0, behavior: 'smooth' });
  return false;
}

// ==========================================================================
// PRODUCTS LISTING & FILTERING
// ==========================================================================
function getFilteredProducts() {
  let list = [...PRODUCTS];

  // Wishlist filter
  if (APP_STATE.isWishlistView) {
    list = list.filter(p => APP_STATE.wishlist.some(wId => String(wId) === String(p.id)));
    return list;
  }

  // Brand filter (Apple, Samsung, WHOOP, Meta, Google, Canon)
  if (APP_STATE.activeBrand && APP_STATE.activeBrand !== 'all') {
    const b = APP_STATE.activeBrand.toLowerCase();
    list = list.filter(p => {
      if (!p.brand) return false;
      const pb = p.brand.toLowerCase();
      if (b === 'meta' && (pb === 'meta' || pb === 'ray-ban')) return true;
      if (b === 'ray-ban' && (pb === 'meta' || pb === 'ray-ban')) return true;
      return pb === b;
    });
  }

  // Category filter
  if (APP_STATE.activeCategory !== 'all') {
    list = list.filter(p => p.category === APP_STATE.activeCategory);
  }

  // Search filter (O'zbekcha, Ruscha, Inglizcha va sinonimlar bo'yicha to'liq aqlli tokenli qidiruv)
  if (APP_STATE.searchQuery && APP_STATE.searchQuery.trim()) {
    list = list.filter(p => matchProductSearch(p, APP_STATE.searchQuery));
  }

  // In-stock filter (Mavjud bo'lgan mahsulotlar)
  if (APP_STATE.inStockOnly) {
    list = list.filter(p => p.in_stock);
  }

  // Sorting
  const getSortPrice = p => (p.price <= 5000 ? p.price * 12850 : p.price);
  switch (APP_STATE.sortBy) {
    case 'price-asc':
      list.sort((a, b) => getSortPrice(a) - getSortPrice(b));
      break;
    case 'price-desc':
      list.sort((a, b) => getSortPrice(b) - getSortPrice(a));
      break;
    case 'rating':
      list.sort((a, b) => b.rating - a.rating);
      break;
    case 'popular':
    default:
      list.sort((a, b) => b.reviews_count - a.reviews_count);
      break;
  }

  return list;
}

function renderProducts() {
  const container = document.getElementById('productsGrid');
  const catalogStats = document.querySelector('.catalog-stats');
  if (!container) return;

  renderCategoryActiveHeader();
  if (!APP_STATE.isWishlistView && !APP_STATE.isCategoryView && (!APP_STATE.activeCategory || APP_STATE.activeCategory === 'all') && (!APP_STATE.activeBrand || APP_STATE.activeBrand === 'all') && !APP_STATE.searchQuery) {
    renderHomeDeals();
  }

  const products = getFilteredProducts();
  const lang = APP_STATE.lang;

  if (catalogStats) {
    catalogStats.innerHTML = `${t('totalCount')}: <strong id="productsCount">${products.length}</strong> ${t('productsAvailable')}`;
  }

  const toolbar = document.querySelector('.catalog-toolbar');
  const catActiveHeader = document.getElementById('categoryActiveHeader');

  if (APP_STATE.isWishlistView) {
    if (products.length === 0) {
      if (toolbar) toolbar.style.display = 'none';
      if (catActiveHeader) catActiveHeader.style.display = 'none';

      container.innerHTML = `
        <div class="applebox-empty-view">
          <div class="applebox-empty-circle">
            <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h2 class="applebox-empty-title">${lang === 'ru' ? 'Избранное пусто' : (lang === 'en' ? 'Wishlist is empty' : 'Sevimlilar bo\'sh')}</h2>
          <p class="applebox-empty-subtitle">${lang === 'ru' ? 'Сохраняйте понравившиеся товары' : (lang === 'en' ? 'Save items you love here' : 'O\'zingizga yoqqan mahsulotlarni saqlang')}</p>
          <button class="applebox-empty-btn" onclick="openCatalogView(event)">
            ${lang === 'ru' ? 'Перейти в каталог' : (lang === 'en' ? 'Browse Catalog' : 'Katalogga o\'tish')}
          </button>
        </div>
      `;
      return;
    } else {
      if (toolbar) toolbar.style.display = 'none';
      if (catActiveHeader) catActiveHeader.style.display = 'block';
    }
  } else {
    if (toolbar) toolbar.style.display = 'none';
    if (catActiveHeader) catActiveHeader.style.display = 'block';
  }

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${getIcon('search')}</div>
        <h3>${t('emptyTitle')}</h3>
        <p>${t('emptyDesc')}</p>
        <button class="hero-cta-btn" style="margin: 0 auto;" onclick="resetFilters()">
          ${getIcon('grid')} ${t('viewAllBtn')}
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(prod => {
    const isWished = APP_STATE.wishlist.some(w => String(w) === String(prod.id));
    const prodName = prod['name_' + lang] || prod.name_uz || prod.name || '';
    const safeId = sanitizeId(prod.id);
    const safeJsId = escapeJsString(prod.id);
    const safeName = escapeHtml(prodName);
    const safeBrand = escapeHtml(prod.brand || '');
    const safeImage = escapeHtml(prod.main_image || prod.image || '');
    const safeRating = escapeHtml(String(prod.rating || '5.0'));

    return `
      <div class="product-card" data-id="${safeId}" onclick="openProductDetail('${safeJsId}')" style="cursor: pointer;">
        <div class="product-image-box">
          <button class="btn-wishlist ${isWished ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist('${safeJsId}')" title="${isWished ? t('wishlistRemove') : t('wishlistAdd')}">
            ${isWished ? getIcon('heartFilled') : getIcon('heart')}
          </button>
          <img src="${safeImage}" alt="${safeName}" title="${safeName}" loading="lazy" onerror="this.onerror=null;this.src='/images/placeholder.svg';" />
        </div>

        <div class="product-content">
          <div class="product-meta-row">
            <span class="product-brand">${safeBrand}</span>
            <div class="product-rating">
              ${getIcon('star')}
              <span>${safeRating}</span>
            </div>
          </div>

          <h3 class="product-title" onclick="openProductDetail('${safeJsId}')" title="${safeName}">${safeName}</h3>

          <div class="product-price-row">
            <div class="current-price">${formatPrice(prod.price, prod.currency)}</div>
            ${prod.old_price ? `
              <div class="old-price-wrap">
                <span class="old-price">${formatPrice(prod.old_price, prod.currency)}</span>
                ${prod.discount_percent ? `<span class="discount-badge">-${Number(prod.discount_percent)}%</span>` : ''}
              </div>
            ` : ''}
          </div>

          <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${safeJsId}', null, 1, this)">
            ${getIcon('shoppingBag')}
            <span>${t('addToCart')}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function resetFilters(keepCategoryMode = false) {
  APP_STATE.isWishlistView = false;
  APP_STATE.activeCategory = 'all';
  APP_STATE.activeBrand = 'all';
  APP_STATE.searchQuery = '';
  APP_STATE.inStockOnly = false;
  if (!keepCategoryMode) {
    APP_STATE.isCategoryView = false;
  }

  const inStockCheckbox = document.getElementById('inStockToggle');
  if (inStockCheckbox) inStockCheckbox.checked = false;

  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(input => input.value = '');
  const searchClears = document.querySelectorAll('.search-clear');
  searchClears.forEach(btn => btn.style.display = 'none');
  if (typeof closeSearchDropdowns === 'function') closeSearchDropdowns();

  updateViewMode();
  renderBrandsDrawer();
  renderCategoriesBar();
  renderSidebarFilters();
  renderCategoryActiveHeader();
  renderProducts();
}

// Asosiy bo'limga silliq o'tish (Sayt boshiga qaytish — Sahifa refresh bo'lmaydi!)
function goToHome(e) {
  if (e && e.preventDefault) e.preventDefault();
  APP_STATE.isWishlistView = false;
  APP_STATE.isCartView = false;
  APP_STATE.isDetailView = false;
  APP_STATE.activeCategory = 'all';
  APP_STATE.activeBrand = 'all';
  APP_STATE.searchQuery = '';
  APP_STATE.inStockOnly = false;
  APP_STATE.isCategoryView = false;

  const inStockCheckbox = document.getElementById('inStockToggle');
  if (inStockCheckbox) inStockCheckbox.checked = false;

  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(input => input.value = '');
  const searchClears = document.querySelectorAll('.search-clear');
  searchClears.forEach(btn => btn.style.display = 'none');
  if (typeof closeSearchDropdowns === 'function') closeSearchDropdowns();

  updateViewMode();
  renderCategoriesBar();
  renderHeroSlider();
  renderBrandsDrawer();
  renderSidebarFilters();
  renderCategoryActiveHeader();
  renderProducts();

  setActiveBottomTab('bottomTabHome');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return false;
}

// Applebox uslubidagi Kategoriyalar bo'limi (Barcha mahsulotlar va Filtr tugmasi bilan)
function openCatalogView(e) {
  if (e && e.preventDefault) e.preventDefault();
  closeAllDrawers();
  APP_STATE.isWishlistView = false;
  APP_STATE.isCartView = false;
  APP_STATE.isDetailView = false;
  APP_STATE.activeCategory = 'all';
  APP_STATE.activeBrand = 'all';
  APP_STATE.searchQuery = '';
  APP_STATE.isCategoryView = true;

  setActiveBottomTab('bottomTabCatalog');

  updateViewMode();
  renderCategoriesBar();
  renderSidebarFilters();
  renderCategoryActiveHeader();
  renderProducts();

  window.scrollTo({ top: 0, behavior: 'smooth' });
  return false;
}

function openAllCatalog(e) {
  return openCatalogView(e);
}

// Mavjud / Faqat sotuvda bor mahsulotlarni filtrlash
function toggleInStock(checked) {
  APP_STATE.inStockOnly = checked;
  renderProducts();
}

// ==========================================================================
// HAFTA CHEGIRMALARI (UZUM MARKET / APPLEBOX USLUBIDAGI GORIZONTAL SURILUVCHI LENTA)
// ==========================================================================
function renderHomeDeals() {
  const container = document.getElementById('homeDealsSection');
  if (!container) return;

  const lang = APP_STATE.lang || 'uz';
  const dealsTitle = t('weeklyDealsTitle') || (lang === 'ru' ? 'Скидки недели' : lang === 'en' ? 'Weekly Discounts' : 'Hafta chegirmalari');
  const seeAllText = t('seeAll') || (lang === 'ru' ? 'Смотреть все' : lang === 'en' ? 'View all' : "Hammasini ko'rish");

  // Faqat chegirmali mahsulotlar (discount_percent > 0 yoki old_price mavjud bo'lganlar)
  const dealProducts = PRODUCTS.filter(p => p.discount_percent && p.discount_percent > 0 && p.old_price);

  if (dealProducts.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  const cardsHtml = dealProducts.map(prod => {
    const isWished = APP_STATE.wishlist.some(w => String(w) === String(prod.id));
    const prodName = prod['name_' + lang] || prod.name_uz;
    const discountDrop = prod.discount_percent || Math.round(((prod.old_price - prod.price) / prod.old_price) * 100);

    const safeDealJsId = escapeJsString(prod.id);
    return `
      <div class="deal-card" onclick="openProductDetail('${safeDealJsId}')" data-id="${escapeHtml(prod.id)}">
        <div class="deal-image-box">
          <span class="deal-discount-badge">↓ -${discountDrop}%</span>
          <button class="deal-wishlist-btn ${isWished ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist('${safeDealJsId}')" title="${isWished ? t('wishlistRemove') : t('wishlistAdd')}" aria-label="Sevimlilar">
            ${isWished ? getIcon('heartFilled') : getIcon('heart')}
          </button>
          <img src="${prod.main_image}" alt="${escapeHtml(prodName)}" loading="lazy" onerror="this.onerror=null;this.src='/images/placeholder.svg';" />
        </div>
        <div class="deal-content">
          <div class="deal-price-block">
            <div class="deal-current-price">${formatPrice(prod.price, prod.currency)}</div>
            <div class="deal-old-price-row">
              <span class="deal-old-price">${formatPrice(prod.old_price, prod.currency)}</span>
              <span class="deal-drop-tag">-${discountDrop}%</span>
            </div>
          </div>
          <h3 class="deal-title" title="${escapeHtml(prodName)}">${escapeHtml(prodName)}</h3>
          <div class="deal-footer-action">
            <button class="deal-cart-btn" onclick="event.stopPropagation(); addToCart('${safeDealJsId}', null, 1, this)">
              <span class="deal-cart-icon">${getIcon('shoppingBag')}</span>
              <span>${t('addToCart')}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const shortSeeAll = lang === 'ru' ? 'Все' : (lang === 'en' ? 'All' : 'Barchasi');

  container.innerHTML = `
    <div class="deals-card-container">
      <div class="deals-header">
        <div class="deals-title-group" onclick="openAllCatalog(event)" style="cursor: pointer;">
          <span class="deals-header-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
          </span>
          <h2 class="deals-section-title">${dealsTitle}</h2>
        </div>
        <div class="deals-header-right">
          <div class="deals-nav-arrows">
            <button class="deals-scroll-btn deals-prev" onclick="scrollDealsSlider(-1)" aria-label="Oldingisi">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button class="deals-scroll-btn deals-next" onclick="scrollDealsSlider(1)" aria-label="Keyingisi">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          </div>
          <a href="javascript:void(0)" class="deals-see-all-link" onclick="openAllCatalog(event)">
            <span class="see-all-desktop">${seeAllText}</span>
            <span class="see-all-mobile">${shortSeeAll}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </a>
        </div>
      </div>
      <div class="deals-slider-track" id="dealsSliderTrack">
        ${cardsHtml}
      </div>
    </div>
  `;

  setupDealsSliderSwipe();
}

function scrollDealsSlider(direction) {
  const track = document.getElementById('dealsSliderTrack');
  if (!track) return;
  const scrollStep = track.clientWidth * 0.75;
  track.scrollBy({ left: direction * scrollStep, behavior: 'smooth' });
}

function setupDealsSliderSwipe() {
  const track = document.getElementById('dealsSliderTrack');
  if (!track || (track.dataset && track.dataset.dragInit)) return;
  if (track.dataset) track.dataset.dragInit = 'true';

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let hasDragged = false;

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    hasDragged = false;
    track.classList.add('is-dragging');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });

  const stopDrag = () => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('is-dragging');
    // drag tugagandan so'ng click hodisasini to'xtatib qolish uchun vaqt
    setTimeout(() => {
      hasDragged = false;
    }, 80);
  };

  window.addEventListener('mouseup', stopDrag);

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 8) {
      hasDragged = true;
    }
    track.scrollLeft = scrollLeft - walk;
  });

  // Agar sudrab surilgan bo'lsa, kartaning bosilishini bekor qilish
  track.addEventListener('click', (e) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
}

// Kategoriya Ko'rinishini Boshqarish (Asosiy sahifa <-> Filtrli Kategoriya bo'limi <-> Savat <-> Mahsulot sahifasi)
function updateViewMode() {
  const isDetail = APP_STATE.isDetailView;
  const isCart = APP_STATE.isCartView;
  const isWishlist = APP_STATE.isWishlistView;
  const isCategoryMode = (
    APP_STATE.isCategoryView || 
    (APP_STATE.activeCategory && APP_STATE.activeCategory !== 'all') ||
    (APP_STATE.activeBrand && APP_STATE.activeBrand !== 'all') ||
    (APP_STATE.searchQuery && APP_STATE.searchQuery.trim().length > 0)
  );

  const heroSec = document.getElementById('heroSection');
  const trustSec = document.querySelector('.trust-strip');
  const catSec = document.getElementById('categoriesSection');
  const sidebar = document.getElementById('catalogSidebar');
  const layout = document.getElementById('catalogLayout');
  const catalogSec = document.getElementById('catalogSection');
  const detailSec = document.getElementById('productDetailPageSection');
  const cartSec = document.getElementById('cartPageSection');
  const dealsSec = document.getElementById('homeDealsSection');

  document.body.classList.remove('wishlist-view-active', 'category-view-active', 'cart-view-active', 'detail-view-active');

  if (isDetail) {
    document.body.classList.add('detail-view-active');
    if (heroSec) heroSec.style.display = 'none';
    if (trustSec) trustSec.style.display = 'none';
    if (catSec) catSec.style.display = 'none';
    if (catalogSec) catalogSec.style.display = 'none';
    if (cartSec) cartSec.style.display = 'none';
    if (dealsSec) dealsSec.style.display = 'none';
    if (detailSec) detailSec.style.display = 'block';
  } else if (isCart) {
    document.body.classList.add('cart-view-active');
    if (heroSec) heroSec.style.display = 'none';
    if (trustSec) trustSec.style.display = 'none';
    if (catSec) catSec.style.display = 'none';
    if (catalogSec) catalogSec.style.display = 'none';
    if (detailSec) detailSec.style.display = 'none';
    if (dealsSec) dealsSec.style.display = 'none';
    if (cartSec) cartSec.style.display = 'block';
  } else if (isWishlist) {
    document.body.classList.add('wishlist-view-active');
    if (heroSec) heroSec.style.display = 'none';
    if (trustSec) trustSec.style.display = 'none';
    if (catSec) catSec.style.display = 'none';
    if (detailSec) detailSec.style.display = 'none';
    if (cartSec) cartSec.style.display = 'none';
    if (dealsSec) dealsSec.style.display = 'none';
    if (catalogSec) catalogSec.style.display = 'block';
    if (sidebar) sidebar.style.display = 'none';
    if (layout) layout.classList.remove('has-sidebar');
  } else if (isCategoryMode) {
    document.body.classList.add('category-view-active');
    if (heroSec) heroSec.style.display = 'none';
    if (trustSec) trustSec.style.display = 'none';
    if (catSec) catSec.style.display = 'none';
    if (detailSec) detailSec.style.display = 'none';
    if (cartSec) cartSec.style.display = 'none';
    if (dealsSec) dealsSec.style.display = 'none';
    if (catalogSec) catalogSec.style.display = 'block';
    if (sidebar) sidebar.style.display = '';
    if (layout) layout.classList.add('has-sidebar');
  } else {
    // Bosh sahifa: Banner ko'rinadi, Filtr paneli butunlay yashiriladi, mahsulotlar 4 ustun to'liq kenglikda
    if (heroSec) heroSec.style.display = 'block';
    if (trustSec) trustSec.style.display = 'none';
    if (catSec) catSec.style.display = 'block';
    if (detailSec) detailSec.style.display = 'none';
    if (cartSec) cartSec.style.display = 'none';
    if (catalogSec) catalogSec.style.display = 'block';
    if (sidebar) sidebar.style.display = 'none';
    if (layout) layout.classList.remove('has-sidebar');
    if (dealsSec) {
      dealsSec.style.display = 'block';
      renderHomeDeals();
    }
  }

  const headerWishBtn = document.getElementById('headerWishlistBtn');
  if (headerWishBtn) {
    if (isWishlist) {
      headerWishBtn.classList.add('active');
    } else {
      headerWishBtn.classList.remove('active');
    }
  }
}

// Screenshot 1 dagi chap tomondagi Filtr kartasini to'ldirish (Applebox Desktop)
function renderSidebarFilters() {
  const catList = document.getElementById('sidebarCategoriesList');
  const brandList = document.getElementById('sidebarBrandsList');
  if (!catList || !brandList) return;

  const lang = APP_STATE.lang || 'uz';

  // 1. KATEGORIYALAR (Applebox Screenshot 1: Ixcham 175px scroll maydoni, tanlangan bo'lsa to'q sariq pill)
  let catHtml = CATEGORIES.filter(c => c.id !== 'all').map(cat => {
    const name = cat['name_' + lang] || cat.name_uz;
    const isActive = (APP_STATE.activeCategory === cat.id);
    const iconSvg = getIcon(cat.icon);

    return `
      <button class="sidebar-cat-item ${isActive ? 'active' : ''}" onclick="selectCategory('${cat.id}')">
        <span class="sidebar-cat-icon">${iconSvg}</span>
        <span class="sidebar-cat-name">${escapeHtml(name)}</span>
      </button>
    `;
  }).join('');

  catList.innerHTML = catHtml;

  // 2. BRENDLAR (Applebox Screenshot 1: Ixcham scroll maydoni)
  let brandsHtml = BRANDS.map(b => {
    const isActive = (APP_STATE.activeBrand && APP_STATE.activeBrand.toLowerCase() === b.id.toLowerCase());
    let logoHtml = '';
    if (b.id === 'Apple') {
      logoHtml = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.63 1.34-.56.65-.98 1.7-.85 2.72 1.01.08 2.01-.51 2.56-1.19z"/></svg>`;
    } else if (b.id === 'BlackStore') {
      logoHtml = `<span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; background:#f59e0b; color:#ffffff; font-weight:800; font-size:10px; border-radius:5px; line-height:1;">BS</span>`;
    } else if (b.logo) {
      logoHtml = `<img src="${b.logo}" alt="${b.name}" style="width: 20px; height: 20px; object-fit: contain; border-radius: 4px;" onerror="this.style.display='none'" />`;
    } else {
      logoHtml = getIcon('tag');
    }

    return `
      <button class="sidebar-brand-item ${isActive ? 'active' : ''}" onclick="selectBrand('${b.id}')">
        <span class="sidebar-brand-icon-wrap">${logoHtml}</span>
        <span class="sidebar-brand-name">${escapeHtml(b.name)}</span>
      </button>
    `;
  }).join('');

  brandList.innerHTML = brandsHtml;

  // 3. Mavjud (inStock) holatini yangilash
  const inStockCheckbox = document.getElementById('inStockToggle');
  if (inStockCheckbox) {
    inStockCheckbox.checked = !!APP_STATE.inStockOnly;
  }

  // 4. Tozalash tugmasi matni
  const resetBtn = document.getElementById('sidebarResetBtn');
  if (resetBtn) {
    resetBtn.textContent = t('resetFilter');
  }
}

// ==========================================================================
// WISHLIST LOGIC
// ==========================================================================
function toggleWishlist(productId) {
  const pId = String(productId);
  const index = APP_STATE.wishlist.findIndex(id => String(id) === pId);
  const isAdding = (index === -1);
  if (index > -1) {
    APP_STATE.wishlist.splice(index, 1);
  } else {
    APP_STATE.wishlist.push(pId);
  }

  localStorage.setItem('blackstore_wishlist', JSON.stringify(APP_STATE.wishlist));
  updateCounters();
  renderProducts();
  renderCategoryActiveHeader();
  if (!APP_STATE.isCategoryView && !APP_STATE.isDetailView && !APP_STATE.isCartView && !APP_STATE.isWishlistView) {
    renderHomeDeals();
  }

  if (APP_STATE.isDetailView && APP_STATE.activeDetailProduct && String(APP_STATE.activeDetailProduct.id) === pId) {
    const isWished = APP_STATE.wishlist.some(id => String(id) === pId);
    const detailBtn = document.getElementById('detailWishBtn');
    if (detailBtn) {
      if (isWished) {
        detailBtn.classList.add('active');
        detailBtn.innerHTML = getIcon('heartFilled');
      } else {
        detailBtn.classList.remove('active');
        detailBtn.innerHTML = getIcon('heart');
      }
    }
  }

  if (isAdding) {
    showToast(APP_STATE.lang === 'ru' ? 'Добавлено в избранное' : (APP_STATE.lang === 'en' ? 'Added to wishlist' : 'Sevimlilarga qo\'shildi'), 'heartFilled');
  } else {
    showToast(APP_STATE.lang === 'ru' ? 'Удалено из избранного' : (APP_STATE.lang === 'en' ? 'Removed from wishlist' : 'Sevimlilardan olib tashlandi'), 'heart');
  }
}

// ==========================================================================
// CART LOGIC
// ==========================================================================
function addToCart(productId, selectedColor = null, quantity = 1, btnElement = null) {
  const pId = String(productId);
  const prod = PRODUCTS.find(p => String(p.id) === pId);
  if (!prod) return;

  const existingIndex = APP_STATE.cart.findIndex(item => String(item.id) === pId);

  if (existingIndex > -1) {
    APP_STATE.cart[existingIndex].quantity += quantity;
  } else {
    APP_STATE.cart.push({
      id: pId,
      name_uz: prod.name_uz,
      name_ru: prod.name_ru,
      price: prod.price,
      image: prod.main_image,
      color: selectedColor || (prod.colors && prod.colors[0]) || 'Standart',
      quantity: quantity
    });
  }

  saveCart();
  updateCounters(true);
  renderCartDrawer();
  if (APP_STATE.isCartView) renderCartPage();
  triggerCartJump();
  showToast(APP_STATE.lang === 'ru' ? 'Товар добавлен в корзину' : 'Mahsulot savatga qo\'shildi', 'shoppingBag');

  // Tugma animatsiyasi: Oldin azgina aylanib, keyin ptichka chiqib, keyin o'z holiga qaytishi
  const targetBtn = btnElement || document.querySelector(`.product-card[data-id="${pId}"] .btn-add-cart`);
  if (targetBtn) {
    animateCartButton(targetBtn);
  }
}

// Savat ikonkasi sakrashi (cart jump animation)
function triggerCartJump() {
  const isMobile = window.innerWidth < 992;

  if (isMobile) {
    // Telefonda FAQAT pastdagi butun savatcha tugmasi baland va elastik sakraydi
    const bottomTab = document.getElementById('bottomTabCart');
    if (bottomTab) {
      bottomTab.classList.remove('bottom-cart-jump-anim');
      void bottomTab.offsetWidth;
      bottomTab.classList.add('bottom-cart-jump-anim');
      setTimeout(() => {
        bottomTab.classList.remove('bottom-cart-jump-anim');
      }, 850);
    }
  } else {
    // Desktopda yuqoridagi savat tugmasi qimirlaydi
    const elements = [
      document.getElementById('headerCartBtn'),
      document.querySelector('.header-action-btn.btn-cart'),
      document.querySelector('.header-icon-btn.btn-cart'),
      document.getElementById('hIconCart')
    ];

    elements.forEach(el => {
      if (el) {
        el.classList.remove('cart-jump-anim');
        void el.offsetWidth;
        el.classList.add('cart-jump-anim');
        setTimeout(() => {
          el.classList.remove('cart-jump-anim');
        }, 700);
      }
    });
  }
}

function animateCartButton(btn) {
  if (!btn) return;
  if (btn.dataset.animating === 'true') return;
  btn.dataset.animating = 'true';

  const lang = APP_STATE.lang || 'uz';
  const originalHtml = btn.innerHTML; // Tugmaning asl HTML tarkibini to'liq saqlab qolamiz

  // 1-bosqich: Azgina aylanib (Loading spinner ~300ms)
  const loadingText = lang === 'uz' ? "Qo'shilmoqda..." : (lang === 'ru' ? "Добавление..." : "Adding...");
  btn.classList.add('is-loading');
  btn.innerHTML = `
    <span class="btn-spinner"></span>
    <span>${loadingText}</span>
  `;

  // 2-bosqich: 300ms dan so'ng har doim yorqin YASHIL PTICHKA chiqishi (Success ~750ms)
  setTimeout(() => {
    btn.classList.remove('is-loading');
    btn.classList.add('is-success');
    const successText = lang === 'uz' ? "Qo'shildi!" : (lang === 'ru' ? "Добавлено!" : "Added!");
    btn.innerHTML = `
      <svg class="btn-check-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#10b981" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" style="stroke: #10b981 !important; color: #10b981 !important; display: inline-block; vertical-align: middle;">
        <circle cx="12" cy="12" r="9.5" stroke="#10b981" stroke-width="2" fill="rgba(16, 185, 129, 0.18)"></circle>
        <polyline points="8 12 11 15 16 9"></polyline>
      </svg>
      <span class="btn-check-text" style="color: #10b981 !important; font-weight: 700;">${successText}</span>
    `;

    // 3-bosqich: 750ms dan so'ng o'z holiga qaytadi (asl holatiga qaytadi, qolib ketmaydi)
    setTimeout(() => {
      btn.classList.remove('is-success');
      btn.innerHTML = originalHtml;
      btn.dataset.animating = 'false';
    }, 750);
  }, 300);
}

function updateCartQty(productId, change) {
  const pId = String(productId);
  const item = APP_STATE.cart.find(i => String(i.id) === pId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(pId);
    return;
  }

  saveCart();
  updateCounters();
  renderCartDrawer();
  if (APP_STATE.isCartView) renderCartPage();
}

function removeFromCart(productId) {
  const pId = String(productId);
  APP_STATE.cart = APP_STATE.cart.filter(item => String(item.id) !== pId);
  saveCart();
  updateCounters();
  renderCartDrawer();
  if (APP_STATE.isCartView) renderCartPage();
  showToast(APP_STATE.lang === 'ru' ? 'Товар удален из корзины' : 'Mahsulot savatdan olib tashlandi', 'trash');
}

function saveCart() {
  localStorage.setItem('blackstore_cart', JSON.stringify(APP_STATE.cart));
}

function updateCounters(animate = false) {
  const cartBadges = document.querySelectorAll('.cart-count-badge');
  const wishlistBadges = document.querySelectorAll('.wishlist-count-badge');

  const cartTotalQty = APP_STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishCount = APP_STATE.wishlist.length;
  const isMobile = window.innerWidth < 992;

  cartBadges.forEach(b => {
    b.textContent = cartTotalQty;
    b.style.display = cartTotalQty > 0 ? 'flex' : 'none';
    if (animate && cartTotalQty > 0) {
      // Telefonda yuqoridagi savat badge sakramaydi, faqat pastdagi badge qimirlaydi
      const isHeaderBadge = b.closest('#headerCartBtn') || b.closest('.header-action-btn') || b.closest('.header-actions');
      if (isMobile && isHeaderBadge) {
        b.classList.remove('badge-pop-anim');
      } else {
        b.classList.remove('badge-pop-anim');
        void b.offsetWidth;
        b.classList.add('badge-pop-anim');
      }
    }
  });

  wishlistBadges.forEach(b => {
    b.textContent = wishCount;
    b.style.display = wishCount > 0 ? 'flex' : 'none';
  });
}

function renderCartDrawer() {
  const itemsContainer = document.getElementById('cartDrawerItems');
  const totalAmountEl = document.getElementById('cartTotalAmount');
  if (!itemsContainer || !totalAmountEl) return;

  const lang = APP_STATE.lang;

  if (APP_STATE.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty-applebox-view">
        <div class="cart-empty-circle-badge">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <h3 class="cart-empty-heading">${lang === 'ru' ? 'Корзина пуста' : (lang === 'en' ? 'Cart is empty' : 'Savatingiz bo\'sh')}</h3>
        <p class="cart-empty-subtext">${lang === 'ru' ? 'Выберите товары из каталога' : (lang === 'en' ? 'Browse catalog to add items' : 'Xarid qilish uchun katalogdan mahsulot tanlang')}</p>
        <button class="cart-empty-action-btn" onclick="toggleCartDrawer(false); openCatalogView(event);">
          ${lang === 'ru' ? 'Перейти в каталог' : (lang === 'en' ? 'Browse Catalog' : 'Katalogga o\'tish')}
        </button>
      </div>
    `;
    totalAmountEl.textContent = formatPrice(0);
    return;
  }

  let usdTotal = 0;
  let uzsTotal = 0;

  itemsContainer.innerHTML = APP_STATE.cart.map(item => {
    const itemTotal = item.price * item.quantity;
    if (item.price <= 5000) {
      usdTotal += itemTotal;
    } else {
      uzsTotal += itemTotal;
    }
    const itemName = item['name_' + lang] || item.name_uz;

    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${escapeHtml(itemName)}" class="cart-item-img" onerror="this.onerror=null;this.src='/images/placeholder.svg';" />
        <div class="cart-item-details">
          <div>
            <h4 class="cart-item-title">${escapeHtml(itemName)}</h4>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${t('color')} ${escapeHtml(item.color || 'Standart')}</div>
          </div>
          <div class="cart-item-price">${formatPrice(item.price, item.currency)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">${getIcon('minus')}</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">${getIcon('plus')}</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="${lang === 'ru' ? 'Удалить' : 'O\'chirish'}">
          ${getIcon('trash')}
        </button>
      </div>
    `;
  }).join('');

  const formatCartTotal = (usd, uzs) => {
    if (usd > 0 && uzs > 0) return `${formatPrice(usd)} + ${formatPrice(uzs)}`;
    if (usd > 0) return formatPrice(usd);
    return formatPrice(uzs);
  };

  if (APP_STATE.discountRate > 0) {
    const rate = 1 - APP_STATE.discountRate;
    const finalUsd = usdTotal * rate;
    const finalUzs = uzsTotal * rate;
    totalAmountEl.innerHTML = `
      <div style="font-size: 0.8rem; text-decoration: line-through; color: var(--text-muted);">${formatCartTotal(usdTotal, uzsTotal)}</div>
      <div>${formatCartTotal(finalUsd, finalUzs)} <span style="font-size: 0.8rem; color: var(--yellow-400);">(-${APP_STATE.discountRate * 100}%)</span></div>
    `;
  } else {
    totalAmountEl.textContent = formatCartTotal(usdTotal, uzsTotal);
  }
}

function applyPromoCode() {
  const input = document.getElementById('promoInput');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  const lang = APP_STATE.lang || 'uz';
  if (!code) {
    showToast(lang === 'ru' ? 'Введите промокод!' : 'Promokodni kiriting!', 'alertTriangle');
    return;
  }

  if (code === 'BLACK10' || code === 'APPLEBOX') {
    APP_STATE.promoCode = code;
    APP_STATE.discountRate = 0.10;
    renderCartDrawer();
    showToast(lang === 'ru' ? `Промокод ${code} активирован (-10%)!` : `${code} promokodi qo'llandi (-10%)!`, 'check');
  } else if (code === 'BLACK20') {
    APP_STATE.promoCode = code;
    APP_STATE.discountRate = 0.20;
    renderCartDrawer();
    showToast(lang === 'ru' ? 'Промокод BLACK20 активирован (-20%)!' : 'BLACK20 promokodi qo\'llandi (-20%)!', 'check');
  } else {
    showToast(lang === 'ru' ? 'Неверный или недействительный промокод!' : "Noto'g'ri yoki muddati o'tgan promokod!", 'alertTriangle');
  }
}

// ==========================================================================
// DRAWER TOGGLES
// ==========================================================================
function toggleCartDrawer(open = true) {
  const backdrop = document.getElementById('drawerBackdrop');
  const cartDrawer = document.getElementById('cartDrawer');
  if (!backdrop || !cartDrawer) return;

  if (open) {
    setActiveBottomTab('bottomTabCart');
    renderCartDrawer();
    backdrop.classList.add('active');
    cartDrawer.classList.add('active');
  } else {
    cartDrawer.classList.remove('active');
    if (!document.getElementById('catalogDrawer').classList.contains('active')) {
      backdrop.classList.remove('active');
    }
  }
}

function toggleCatalogDrawer(open = true) {
  const backdrop = document.getElementById('drawerBackdrop');
  const catalogDrawer = document.getElementById('catalogDrawer');
  if (!backdrop || !catalogDrawer) return;

  if (open) {
    closeAllDrawers();
    renderCatalogDrawer();
    catalogDrawer.classList.add('active');
    backdrop.classList.add('active');
  } else {
    catalogDrawer.classList.remove('active');
    const isCartOpen = document.getElementById('cartDrawer') && document.getElementById('cartDrawer').classList.contains('active');
    const isBrandOpen = document.getElementById('brandsDrawer') && document.getElementById('brandsDrawer').classList.contains('active');
    if (!isCartOpen && !isBrandOpen) {
      backdrop.classList.remove('active');
    }
  }
}

function closeAllDrawers() {
  const backdrop = document.getElementById('drawerBackdrop');
  const cartDrawer = document.getElementById('cartDrawer');
  const catalogDrawer = document.getElementById('catalogDrawer');
  const brandsDrawer = document.getElementById('brandsDrawer');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileFilterDrawer = document.getElementById('mobileFilterDrawer');
  if (backdrop) backdrop.classList.remove('active');
  if (cartDrawer) cartDrawer.classList.remove('active');
  if (catalogDrawer) catalogDrawer.classList.remove('active');
  if (brandsDrawer) brandsDrawer.classList.remove('active');
  if (mobileNavDrawer) mobileNavDrawer.classList.remove('active');
  if (mobileFilterDrawer) mobileFilterDrawer.classList.remove('active');
  document.body.style.overflow = '';
}

// ==========================================================================
// MOBILE FILTER DRAWER (IMG_2194: Pastdan chiquvchi Filtr sheet)
// ==========================================================================
let mobileFilterTempState = {
  category: 'all',
  brand: 'all',
  inStockOnly: false
};

function toggleMobileFilterInStock(checked) {
  mobileFilterTempState.inStockOnly = checked;
}

function resetMobileFilters() {
  mobileFilterTempState.category = 'all';
  mobileFilterTempState.brand = 'all';
  mobileFilterTempState.inStockOnly = false;

  const inStockToggle = document.getElementById('mobileInStockToggle');
  if (inStockToggle) inStockToggle.checked = false;

  renderMobileFilterDrawerContent();
}

function toggleMobileFilterDrawer(isOpen) {
  const drawer = document.getElementById('mobileFilterDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (!drawer || !backdrop) return;

  if (isOpen) {
    if (typeof closeAllDrawers === 'function') closeAllDrawers();
    mobileFilterTempState.category = APP_STATE.activeCategory || 'all';
    mobileFilterTempState.brand = APP_STATE.activeBrand || 'all';
    mobileFilterTempState.inStockOnly = !!APP_STATE.inStockOnly;

    const inStockToggle = document.getElementById('mobileInStockToggle');
    if (inStockToggle) inStockToggle.checked = !!APP_STATE.inStockOnly;

    renderMobileFilterDrawerContent();
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}
window.toggleMobileFilterDrawerGlobal = toggleMobileFilterDrawer;
window.toggleMobileFilterDrawer = toggleMobileFilterDrawer;

function renderMobileFilterDrawerContent() {
  const catList = document.getElementById('mobileFilterCategoryList');
  const brandList = document.getElementById('mobileFilterBrandList');
  if (!catList || !brandList) return;

  const lang = APP_STATE.lang || 'uz';
  const allText = lang === 'ru' ? 'Все' : lang === 'en' ? 'All' : 'Barchasi';

  // 1. KATEGORIYALAR (Pastga-tepaga suriladigan ro'yxat — Huddi kompyuter sidebaridagidek)
  const isAllCatActive = !mobileFilterTempState.category || mobileFilterTempState.category === 'all';
  let catHtml = `
    <button class="mfilter-item ${isAllCatActive ? 'active' : ''}" onclick="setMobileFilterCategory('all')">
      <span class="mfilter-item-icon">${getIcon('grid')}</span>
      <span class="mfilter-item-name">${allText}</span>
    </button>
  `;

  CATEGORIES.filter(c => c.id !== 'all').forEach(cat => {
    const name = cat['name_' + lang] || cat.name_uz;
    const isActive = mobileFilterTempState.category === cat.id;
    catHtml += `
      <button class="mfilter-item ${isActive ? 'active' : ''}" onclick="setMobileFilterCategory('${cat.id}')">
        <span class="mfilter-item-icon">${getIcon(cat.icon)}</span>
        <span class="mfilter-item-name">${escapeHtml(name)}</span>
      </button>
    `;
  });
  catList.innerHTML = catHtml;

  // 2. BRENDLAR (Pastga-tepaga suriladigan ro'yxat — Huddi kompyuter sidebaridagidek)
  const isAllBrandActive = !mobileFilterTempState.brand || mobileFilterTempState.brand === 'all';
  let brandHtml = `
    <button class="mfilter-item ${isAllBrandActive ? 'active' : ''}" onclick="setMobileFilterBrand('all')">
      <span class="mfilter-item-icon">${getIcon('tag')}</span>
      <span class="mfilter-item-name">${allText}</span>
    </button>
  `;

  BRANDS.forEach(brand => {
    const isActive = mobileFilterTempState.brand && mobileFilterTempState.brand.toLowerCase() === brand.id.toLowerCase();
    let logoHtml = '';
    if (brand.id === 'Apple') {
      logoHtml = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.63 1.34-.56.65-.98 1.7-.85 2.72 1.01.08 2.01-.51 2.56-1.19z"/></svg>`;
    } else if (brand.id === 'BlackStore') {
      logoHtml = `<span style="display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; background:#f59e0b; color:#ffffff; font-weight:800; font-size:9px; border-radius:4px; line-height:1;">BS</span>`;
    } else if (brand.logo) {
      logoHtml = `<img src="${brand.logo}" alt="${brand.name}" style="width: 18px; height: 18px; object-fit: contain; border-radius: 4px;" onerror="this.style.display='none'" />`;
    } else {
      logoHtml = getIcon('tag');
    }

    brandHtml += `
      <button class="mfilter-item ${isActive ? 'active' : ''}" onclick="setMobileFilterBrand('${brand.id}')">
        <span class="mfilter-item-icon">${logoHtml}</span>
        <span class="mfilter-item-name">${escapeHtml(brand.name)}</span>
      </button>
    `;
  });
  brandList.innerHTML = brandHtml;

  // 3. MAVJUD switch holati
  const inStockToggle = document.getElementById('mobileInStockToggle');
  if (inStockToggle) {
    inStockToggle.checked = !!mobileFilterTempState.inStockOnly;
  }
}

function setMobileFilterCategory(catId) {
  mobileFilterTempState.category = catId;
  renderMobileFilterDrawerContent();
}

function setMobileFilterBrand(brandId) {
  mobileFilterTempState.brand = brandId;
  renderMobileFilterDrawerContent();
}

function applyMobileFilterAndClose() {
  APP_STATE.activeCategory = mobileFilterTempState.category;
  APP_STATE.activeBrand = mobileFilterTempState.brand;
  APP_STATE.inStockOnly = !!mobileFilterTempState.inStockOnly;
  APP_STATE.isWishlistView = false;
  APP_STATE.isCartView = false;
  APP_STATE.isDetailView = false;
  APP_STATE.isCategoryView = (APP_STATE.activeCategory !== 'all' || APP_STATE.activeBrand !== 'all');

  const inStockCheckbox = document.getElementById('inStockToggle');
  if (inStockCheckbox) inStockCheckbox.checked = !!APP_STATE.inStockOnly;

  toggleMobileFilterDrawer(false);
  updateViewMode();
  renderCategoriesBar();
  renderSidebarFilters();
  renderCategoryActiveHeader();
  renderProducts();
}

// ==========================================================================
// ==========================================================================
// APPLEBOX PRODUCT DETAIL VIEW (Screenshot 2: Mahsulot sahifasi)
// ==========================================================================
function openProductDetail(productId) {
  const prod = PRODUCTS.find(p => String(p.id) === String(productId));
  if (!prod) return;

  APP_STATE.activeDetailProduct = prod;
  APP_STATE.selectedDetailColor = prod.colors && prod.colors.length ? prod.colors[0] : null;
  APP_STATE.isDetailView = true;
  APP_STATE.isCartView = false;

  closeProductModal();
  updateViewMode();
  renderProductDetailPage(prod);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeProductDetail() {
  APP_STATE.isDetailView = false;
  updateViewMode();
  if (APP_STATE.isCartView) {
    renderCartPage();
    setActiveBottomTab('bottomTabCart');
  } else if (APP_STATE.isWishlistView) {
    renderProducts();
    setActiveBottomTab('bottomTabWishlist');
  } else if (APP_STATE.isCategoryView || (APP_STATE.activeCategory && APP_STATE.activeCategory !== 'all') || (APP_STATE.activeBrand && APP_STATE.activeBrand !== 'all')) {
    renderProducts();
    setActiveBottomTab('bottomTabCatalog');
  } else {
    renderProducts();
    setActiveBottomTab('bottomTabHome');
  }
}

function renderProductDetailPage(prod) {
  if (!prod) return;
  const lang = APP_STATE.lang || 'uz';
  const prodName = prod['name_' + lang] || prod.name_uz;
  const prodDesc = prod['description_' + lang] || prod.description_uz || (prodName + ' — yuqori sifatli, 100% original va kafolatlangan qurilma. Tezkor yetkazib berish xizmati mavjud.');
  const specs = prod['specs_' + lang] || prod.specs_uz || prod.specs;
  const isWished = APP_STATE.wishlist.some(w => String(w) === String(prod.id));

  // Top bar orqaga matni
  const backTextEl = document.getElementById('detailBackText');
  if (backTextEl) {
    backTextEl.textContent = lang === 'ru' ? 'Назад' : lang === 'en' ? 'Back' : 'Orqaga';
  }

  // Kategoriya va Brend nomi
  const catObj = CATEGORIES.find(c => c.id === prod.category);
  const catName = catObj ? (catObj['name_' + lang] || catObj.name_uz) : prod.category;
  const brandName = prod.brand || 'BlackStore';

  // Breadcrumb
  const breadcrumbEl = document.getElementById('detailPageBreadcrumb');
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `
      <a href="javascript:void(0)" class="applebox-link-brand" onclick="filterByBrand('${escapeHtml(brandName)}')">${escapeHtml(brandName)}</a>
      <span class="applebox-link-sep">·</span>
      <a href="javascript:void(0)" class="applebox-link-cat" onclick="selectCategory('${prod.category}')">${escapeHtml(catName)}</a>
    `;
  }

  const container = document.getElementById('productDetailContentWrap');
  if (!container) return;

  const imagesList = (prod.images && prod.images.length > 0) ? prod.images : [prod.main_image];
  window._currentDetailImages = imagesList;
  window._currentDetailImageIdx = 0;

  container.innerHTML = `
    <div class="applebox-detail-container">
      <!-- Giant Rounded Hero Image Card (Screenshot 2) -->
      <div class="applebox-detail-img-card" id="detailHeroCard">
        <img id="detailHeroImg" src="${prod.main_image}" alt="${escapeHtml(prodName)}" class="applebox-detail-hero-img" onerror="this.onerror=null;this.src='/images/placeholder.svg';" />
        ${imagesList.length > 1 ? `
          <button class="detail-gallery-nav-btn prev" type="button" onclick="navigateDetailGallery(-1)" aria-label="Oldingi rasm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button class="detail-gallery-nav-btn next" type="button" onclick="navigateDetailGallery(1)" aria-label="Keyingi rasm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <div class="detail-gallery-counter"><span id="detailGalleryIdx">1</span> / ${imagesList.length}</div>
          <div class="applebox-detail-thumbs-strip">
            ${imagesList.map((img, idx) => `
              <div class="applebox-detail-thumb ${idx === 0 ? 'active' : ''}" data-idx="${idx}" onclick="selectDetailGalleryIdx(${idx})">
                <img src="${escapeHtml(img)}" alt="${escapeHtml(prodName)}" onerror="this.onerror=null;this.src='/images/placeholder.svg';" />
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Category / Brand links row (Screenshot 2: Applebox · Playstation va Kompyuter...) -->
      <div class="applebox-detail-links-row">
        <a href="javascript:void(0)" class="applebox-link-brand" onclick="filterByBrand('${escapeHtml(brandName)}')">${escapeHtml(brandName)}</a>
        <span class="applebox-link-sep">·</span>
        <a href="javascript:void(0)" class="applebox-link-cat" onclick="selectCategory('${prod.category}')">${escapeHtml(catName)}</a>
      </div>

      <!-- Product Title (Screenshot 2) -->
      <h1 class="applebox-detail-title">${escapeHtml(prodName)}</h1>

      <!-- Price & Stock Card (Screenshot 2) -->
      <div class="applebox-detail-price-card">
        <div class="applebox-detail-price-val">${formatPrice(prod.price, prod.currency)}</div>
        ${prod.old_price ? `<div class="applebox-detail-old-price">${formatPrice(prod.old_price, prod.currency)}</div>` : ''}
        <div class="applebox-detail-stock-row">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>${lang === 'ru' ? 'В наличии' : lang === 'en' ? 'In stock' : 'Mavjud'}</span>
        </div>
      </div>

      <!-- Action Buttons Row (Screenshot 2: Savatga + Heart Wishlist) -->
      <div class="applebox-detail-actions-row">
        <button class="applebox-detail-add-btn" onclick="addToCart('${prod.id}', '${APP_STATE.selectedDetailColor || ''}', 1, this)">
          ${getIcon('shoppingBag')}
          <span>${lang === 'ru' ? 'В корзину' : lang === 'en' ? 'Add to Cart' : 'Savatga'}</span>
        </button>
        <button class="applebox-detail-buy-btn" onclick="buyNow('${prod.id}')" style="background: var(--yellow-400); color: #000; font-weight: 700; border-radius: 9999px; padding: 12px 20px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
          ${getIcon('check')}
          <span>${lang === 'ru' ? 'Купить сразу' : lang === 'en' ? 'Buy Now' : 'Hoziroq xarid qilish'}</span>
        </button>
        <button class="applebox-detail-wish-btn ${isWished ? 'active' : ''}" id="detailWishBtn" onclick="toggleDetailWishlist('${prod.id}')" title="${isWished ? t('wishlistRemove') : t('wishlistAdd')}">
          ${isWished ? getIcon('heartFilled') : getIcon('heart')}
        </button>
      </div>

      ${prod.colors && prod.colors.length ? `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">${t('availColors')}</div>
          <div class="detail-color-options">
            ${prod.colors.map((color, i) => `
              <button class="color-chip ${i === 0 ? 'active' : ''}" onclick="selectDetailColor('${escapeHtml(color)}', this)">
                ${escapeHtml(color)}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Tavsif Card (Screenshot 2) -->
      <div class="applebox-detail-desc-card">
        <h2 class="applebox-detail-desc-heading">${lang === 'ru' ? 'Описание' : lang === 'en' ? 'Description' : 'Tavsif'}</h2>
        <p class="applebox-detail-desc-paragraph">${escapeHtml(prodDesc)}</p>

        ${specs ? `
          <div class="applebox-detail-specs-wrap">
            <table class="applebox-specs-table">
              <tbody>
                ${Object.entries(specs).map(([k, v]) => `
                  <tr>
                    <td class="specs-key">${escapeHtml(k)}</td>
                    <td class="specs-val">${escapeHtml(String(v))}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Mobil qurilmalarda swipe orqali surish
  setTimeout(() => {
    const heroCard = document.getElementById('detailHeroCard');
    if (heroCard && imagesList.length > 1) {
      let touchStartX = 0;
      heroCard.addEventListener('touchstart', (e) => {
        if (e.changedTouches && e.changedTouches[0]) touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      heroCard.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const touchEndX = e.changedTouches[0].screenX;
          const diff = touchEndX - touchStartX;
          if (Math.abs(diff) > 40) {
            if (diff < 0) navigateDetailGallery(1);
            else navigateDetailGallery(-1);
          }
        }
      }, { passive: true });
    }
  }, 50);
}

function selectDetailGalleryIdx(idx) {
  const images = window._currentDetailImages || [];
  if (!images.length || idx < 0 || idx >= images.length) return;
  window._currentDetailImageIdx = idx;

  const heroImg = document.getElementById('detailHeroImg');
  if (heroImg) heroImg.src = images[idx];

  const counterEl = document.getElementById('detailGalleryIdx');
  if (counterEl) counterEl.textContent = idx + 1;

  document.querySelectorAll('.applebox-detail-thumb').forEach(el => {
    const elIdx = parseInt(el.getAttribute('data-idx'), 10);
    if (elIdx === idx) {
      el.classList.add('active');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      el.classList.remove('active');
    }
  });
}

function navigateDetailGallery(direction) {
  const images = window._currentDetailImages || [];
  if (!images.length || images.length <= 1) return;
  let nextIdx = (window._currentDetailImageIdx || 0) + direction;
  if (nextIdx < 0) nextIdx = images.length - 1;
  else if (nextIdx >= images.length) nextIdx = 0;
  selectDetailGalleryIdx(nextIdx);
}

function changeDetailHeroImg(imgSrc, element) {
  const images = window._currentDetailImages || [];
  const idx = images.indexOf(imgSrc);
  if (idx !== -1) {
    selectDetailGalleryIdx(idx);
  } else {
    const heroImg = document.getElementById('detailHeroImg');
    if (heroImg) heroImg.src = imgSrc;
    document.querySelectorAll('.applebox-detail-thumb').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
  }
}

function toggleDetailWishlist(prodId) {
  toggleWishlist(prodId);
  const isWished = APP_STATE.wishlist.some(w => String(w) === String(prodId));
  const btn = document.getElementById('detailWishBtn');
  if (btn) {
    if (isWished) {
      btn.classList.add('active');
      btn.innerHTML = getIcon('heartFilled');
    } else {
      btn.classList.remove('active');
      btn.innerHTML = getIcon('heart');
    }
  }
}

function changeDetailImage(imgSrc, element) {
  changeDetailHeroImg(imgSrc, element);
}

function selectDetailColor(color, element) {
  APP_STATE.selectedDetailColor = color;
  document.querySelectorAll('.color-chip').forEach(el => el.classList.remove('active'));
  if (element) element.classList.add('active');
}

function closeProductModal() {
  const modal = document.getElementById('productDetailModal');
  if (modal) modal.classList.remove('active');
}

// ==========================================================================
// APPLEBOX CART VIEW (Screenshot 1: Savat & Buyurtma xulosasi)
// ==========================================================================
function openCartView(e) {
  if (e && e.preventDefault) e.preventDefault();
  closeAllDrawers();
  APP_STATE.isCartView = true;
  APP_STATE.isDetailView = false;
  APP_STATE.isWishlistView = false;

  setActiveBottomTab('bottomTabCart');
  updateViewMode();
  renderCartPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return false;
}

function renderCartPage() {
  const headingEl = document.getElementById('cartPageHeading');
  const countBadgeEl = document.getElementById('cartPageCountBadge');
  const contentEl = document.getElementById('cartPageContent');
  if (!contentEl) return;

  const lang = APP_STATE.lang || 'uz';
  if (headingEl) {
    headingEl.textContent = lang === 'ru' ? 'Корзина' : lang === 'en' ? 'Cart' : 'Savat';
  }

  const totalQty = APP_STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (countBadgeEl) {
    countBadgeEl.textContent = `${totalQty} ta`;
  }

  if (APP_STATE.cart.length === 0) {
    contentEl.innerHTML = `
      <div class="cart-empty-applebox-view" style="padding: 60px 20px; text-align: center;">
        <div class="cart-empty-circle-badge">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <h3 class="cart-empty-heading" style="font-size: 1.35rem; margin-top: 14px;">${lang === 'ru' ? 'Корзина пуста' : lang === 'en' ? 'Cart is empty' : 'Savat bo\'sh'}</h3>
        <p class="cart-empty-subtext" style="color: var(--text-secondary); max-width: 320px; margin: 8px auto 20px;">
          ${lang === 'ru' ? 'Войдите или выберите товары из каталога' : lang === 'en' ? 'Add products from the catalog to get started' : 'Xarid qilish uchun hisobingizga kiring yoki mahsulot tanlang'}
        </p>
        <button class="applebox-checkout-main-btn" style="max-width: 260px; margin: 0 auto;" onclick="openCatalogView(event)">
          ${lang === 'ru' ? 'Перейти в каталог' : lang === 'en' ? 'Browse catalog' : 'Katalogga o\'tish'}
        </button>
      </div>
    `;
    return;
  }

  let usdTotal = 0;
  let uzsTotal = 0;

  const itemsHtml = APP_STATE.cart.map(item => {
    const itemTotal = item.price * item.quantity;
    if (item.price <= 5000) {
      usdTotal += itemTotal;
    } else {
      uzsTotal += itemTotal;
    }

    const prod = PRODUCTS.find(p => String(p.id) === String(item.id));
    const brand = (prod && prod.brand) || 'BlackStore';
    const sku = prod && prod.sku ? prod.sku : `SKU: ${brand.toUpperCase().slice(0, 4)}-${prod ? prod.id : item.id}BK`;
    const itemName = item['name_' + lang] || item.name_uz;

    return `
      <div class="applebox-cart-card" data-cart-id="${item.id}">
        <div class="applebox-cart-card-top">
          <div class="applebox-cart-img-box" onclick="openProductDetail('${item.id}')">
            <img src="${item.image}" alt="${escapeHtml(itemName)}" onerror="this.onerror=null;this.src='/images/placeholder.svg';" />
          </div>
          <div class="applebox-cart-info-col">
            <div class="applebox-cart-brand-tag">${escapeHtml(brand)}</div>
            <h3 class="applebox-cart-item-title" onclick="openProductDetail('${item.id}')">${escapeHtml(itemName)}</h3>
            <div class="applebox-cart-sku">${escapeHtml(sku)}</div>
            <div class="applebox-cart-price-val">${formatPrice(item.price, item.currency)}</div>
          </div>
        </div>

        <div class="applebox-cart-card-bottom">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="applebox-cart-qty-pill">
              <button class="applebox-qty-btn" onclick="updateCartQty('${item.id}', -1)" aria-label="Kamaytirish">–</button>
              <span class="applebox-qty-num">${item.quantity}</span>
              <button class="applebox-qty-btn" onclick="updateCartQty('${item.id}', 1)" aria-label="Ko'paytirish">+</button>
            </div>
            <button class="applebox-cart-del-btn" onclick="removeFromCart('${item.id}')" title="${lang === 'ru' ? 'Удалить' : 'O\'chirish'}" aria-label="O'chirish">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
          <div class="applebox-cart-item-subtotal">
            <span class="applebox-cart-subtotal-label">Jami</span>
            <span class="applebox-cart-subtotal-val">${formatPrice(itemTotal)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const formatCartTotal = (usd, uzs) => {
    if (usd > 0 && uzs > 0) return `${formatPrice(usd)} + ${formatPrice(uzs)}`;
    if (usd > 0) return formatPrice(usd);
    return formatPrice(uzs);
  };

  const finalTotalFormatted = formatCartTotal(usdTotal, uzsTotal);

  contentEl.innerHTML = `
    <div class="applebox-cart-layout">
      <!-- Chap/Yuqori qism: Mahsulot kartalari ro'yxati (Screenshot 1) -->
      <div class="applebox-cart-items-list">
        ${itemsHtml}
      </div>

      <!-- O'ng/Pastki qism: Buyurtma xulosasi (Screenshot 1: Buyurtma xulosasi) -->
      <div class="applebox-summary-card">
        <h2 class="applebox-summary-card-title">${lang === 'ru' ? 'Итоги заказа' : lang === 'en' ? 'Order summary' : 'Buyurtma xulosasi'}</h2>
        
        <div class="applebox-summary-lines">
          ${APP_STATE.cart.map(i => {
            const iName = i['name_' + lang] || i.name_uz;
            const iTotal = i.price * i.quantity;
            return `
              <div class="applebox-summary-item-row">
                <span class="applebox-summary-item-name">${escapeHtml(iName)}</span>
                <span class="applebox-summary-item-qty">×${i.quantity}</span>
                <span class="applebox-summary-item-price">${formatPrice(iTotal)}</span>
              </div>
            `;
          }).join('')}
        </div>

        <div class="applebox-summary-count-row">
          <span>${lang === 'ru' ? 'Товары' : lang === 'en' ? 'Products' : 'Mahsulotlar'} (${totalQty} ta)</span>
          <span style="font-weight: 700; color: var(--text-main);">${finalTotalFormatted}</span>
        </div>

        <div class="applebox-summary-divider"></div>

        <div class="applebox-summary-total-row">
          <span class="summary-total-label">${lang === 'ru' ? 'Итого' : lang === 'en' ? 'Total' : 'Jami'}</span>
          <span class="summary-total-val">${finalTotalFormatted}</span>
        </div>

        <button class="applebox-checkout-main-btn" onclick="openCheckoutModal()">
          ${lang === 'ru' ? 'Оформить заказ' : lang === 'en' ? 'Checkout' : 'Buyurtma berish'}
        </button>
      </div>
    </div>
  `;
}

function buyNow(productId) {
  closeProductModal();
  addToCart(productId, APP_STATE.selectedDetailColor);
  openCheckoutModal();
}

// ==========================================================================
// CHECKOUT MODAL & ORDER CREATION
// ==========================================================================
function openLoginModal() {
  openContactModal();
}

let currentPaymentMethod = 'Click';
let currentDeliveryMethod = 'yandex';

function selectDeliveryMethod(method, element) {
  currentDeliveryMethod = method;
  document.querySelectorAll('.delivery-option').forEach(el => el.classList.remove('active'));
  if (element) element.classList.add('active');

  const addrInput = document.getElementById('checkoutAddress');
  if (addrInput) {
    if (method === 'pickup') {
      addrInput.value = "Toshkent sh., Malika savdo markazi, B-blok 1-do'kon (Do'kondan borib olish)";
      addrInput.readOnly = true;
      addrInput.style.opacity = '0.85';
    } else {
      if (addrInput.value.includes('Malika')) {
        addrInput.value = '';
      }
      addrInput.readOnly = false;
      addrInput.style.opacity = '1';
      addrInput.placeholder = t('addressPlaceholder') || "Toshkent sh., Yunusobod t., Amir Temur ko'chasi 12-uy";
      addrInput.focus();
    }
  }
}

function selectPaymentMethod(method, element) {
  currentPaymentMethod = method;
  document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('active'));
  if (element) element.classList.add('active');
}

function openCheckoutModal() {
  if (APP_STATE.cart.length === 0) {
    alert(t('selectProductFirst'));
    return;
  }

  toggleCartDrawer(false);

  const modal = document.getElementById('checkoutModal');
  const body = document.getElementById('checkoutModalBody');
  if (!modal || !body) return;

  currentDeliveryMethod = 'yandex';
  currentPaymentMethod = t('cashDelivery');

  const total = APP_STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = APP_STATE.discountRate > 0 ? total * (1 - APP_STATE.discountRate) : total;

  body.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 6px;">${t('checkoutTitle')}</h2>
      <p style="color: var(--text-secondary); font-size: 0.875rem;">${t('checkoutSubtitle')}</p>
    </div>

    <form class="checkout-form" id="checkoutForm" onsubmit="handleCheckoutSubmit(event)">
      <div class="form-group">
        <label class="form-label">${t('fullName')}</label>
        <input type="text" class="form-input" id="checkoutName" placeholder="${t('namePlaceholder')}" required />
      </div>

      <div class="form-group">
        <label class="form-label">${t('phoneNumber')}</label>
        <input type="tel" class="form-input" id="checkoutPhone" placeholder="+998 90 123 45 67" value="+998 " required />
      </div>

      <div class="form-group">
        <label class="form-label">${t('deliveryAddress')}</label>
        <input type="text" class="form-input" id="checkoutAddress" placeholder="${t('addressPlaceholder')}" required />
      </div>

      <!-- Yetkazib berish usuli -->
      <div class="form-group">
        <label class="form-label">${APP_STATE.lang === 'ru' ? 'Способ доставки' : 'Yetkazib berish usuli'}</label>
        <div class="delivery-methods-grid">
          <div class="delivery-option active" onclick="selectDeliveryMethod('yandex', this)">
            ${getIcon('truck')}
            <span style="font-size: 0.85rem;">${APP_STATE.lang === 'ru' ? 'Яндекс доставка' : 'Yandex kuryer'}</span>
          </div>
          <div class="delivery-option" onclick="selectDeliveryMethod('pickup', this)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span style="font-size: 0.85rem;">${APP_STATE.lang === 'ru' ? 'Самовывоз (Малика)' : 'Borib olish (Malika)'}</span>
          </div>
        </div>
      </div>

      <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.95rem; font-weight: 600;">${t('totalPayment')}</span>
        <span style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: var(--yellow-400);">${formatPrice(finalTotal)}</span>
      </div>

      <button type="submit" class="btn-checkout" id="checkoutSubmitBtn" style="margin-top: 10px;">
        ${getIcon('check')} <span>${t('confirmOrder')}</span>
      </button>
    </form>
  `;

  modal.classList.add('active');
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('checkoutName').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const submitBtn = document.getElementById('checkoutSubmitBtn');
  const lang = APP_STATE.lang || 'uz';

  // 1. Telefon raqami validatsiyasi (kamida 9 ta raqam)
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 9) {
    showToast(
      lang === 'ru' ? 'Пожалуйста, введите корректный номер телефона (минимум 9 цифр)!' : "Iltimos, to'g'ri telefon raqam kiriting (kamida 9 ta raqam)!",
      'alertTriangle'
    );
    const phoneInput = document.getElementById('checkoutPhone');
    if (phoneInput) phoneInput.focus();
    return;
  }

  // 2. Savatcha bo'sh emasligini tekshirish
  if (!APP_STATE.cart || APP_STATE.cart.length === 0) {
    showToast(
      lang === 'ru' ? 'Ваша корзина пуста!' : "Savatingiz bo'sh!",
      'alertTriangle'
    );
    return;
  }

  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>${lang === 'ru' ? 'Оформление заказа...' : 'Buyurtma rasmiylashtirilmoqda...'}</span>`;
  }

  const total = APP_STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = APP_STATE.discountRate > 0 ? total * (1 - APP_STATE.discountRate) : total;

  const orderPayload = {
    customer: {
      name: name || (lang === 'ru' ? 'Клиент' : 'Mijoz'),
      phone: phone,
      address: address || (lang === 'ru' ? 'Не указан' : "Ko'rsatilmagan"),
      deliveryMethod: currentDeliveryMethod || 'yandex',
      notes: `To'lov turi: ${currentPaymentMethod}`
    },
    promoCode: APP_STATE.promoCode || null,
    items: APP_STATE.cart.map(item => ({
      id: String(item.id),
      name: item['name_' + lang] || item.name_uz || item.name || 'Mahsulot',
      quantity: Math.max(1, Number(item.quantity) || 1)
    }))
  };

  let orderResult = null;

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || !data.success || !data.orderId) {
      const errorMsg = (data && (data.error || data.message))
        ? (data.error || data.message)
        : (lang === 'ru' ? 'Не удалось оформить заказ. Попробуйте снова!' : "Buyurtma saqlanmadi, qayta urinib ko'ring!");

      showToast(errorMsg, 'alertTriangle');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml || `${getIcon('check')} <span>${t('confirmOrder')}</span>`;
      }
      // Savatchani tozalash EMAS! Xatolik yuz berganda savat to'liq saqlanadi.
      return;
    }

    orderResult = data;
  } catch (err) {
    console.error("Order submit network error:", err);
    showToast(
      lang === 'ru' ? 'Ошибка сети! Проверьте подключение и повторите попытку.' : "Tarmoq xatosi! Ulanishni tekshirib, qayta urinib ko'ring.",
      'alertTriangle'
    );
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml || `${getIcon('check')} <span>${t('confirmOrder')}</span>`;
    }
    // Savatchani tozalash EMAS!
    return;
  }

  // FAQAT muvaffaqiyatli saqlangandagina buyurtma kodi va chek ko'rsatiladi
  const assignedOrderId = orderResult.orderId;
  const confirmedTotal = typeof orderResult.total === 'number' ? orderResult.total : finalTotal;

  const body = document.getElementById('checkoutModalBody');
  if (!body) return;

  const safeOrderId = escapeHtml(String(assignedOrderId || ''));
  const safeCustomerName = escapeHtml(name || (lang === 'ru' ? 'Клиент' : 'Mijoz'));
  const safeCustomerPhone = escapeHtml(phone || '');
  const safeCustomerAddress = escapeHtml(address || (lang === 'ru' ? 'Не указан' : "Ko'rsatilmagan"));
  const safePaymentMethod = escapeHtml(String(currentPaymentMethod || ''));

  const greeting = lang === 'ru' 
    ? `Спасибо, <strong>${safeCustomerName}</strong>! ${t('orderCode')} <strong>#${safeOrderId}</strong>. Наш менеджер скоро свяжется с вами по номеру <strong>${safeCustomerPhone}</strong>.`
    : `Rahmat, <strong>${safeCustomerName}</strong>! Buyurtma kodi: <strong>#${safeOrderId}</strong>. Menejerimiz tez orada <strong>${safeCustomerPhone}</strong> raqamiga aloqaga chiqadi.`;

  const deliveryNameText = currentDeliveryMethod === 'pickup'
    ? (lang === 'ru' ? 'Самовывоз (Малика savdo markazi, B-1)' : "Do'kondan borib olish (Malika, B-blok 1-do'kon)")
    : (lang === 'ru' ? 'Яндекс доставка' : 'Yandex kuryer');

  body.innerHTML = `
    <div class="order-success">
      <div class="success-check-icon">
        ${getIcon('shieldCheck')}
      </div>
      <h2>${t('orderSuccessTitle')}</h2>
      <p>${greeting}</p>

      <div class="order-receipt-box">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">${APP_STATE.lang === 'ru' ? 'Доставка' : 'Yetkazish'}</span>
          <strong>${deliveryNameText}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">${t('orderPaymentMethod')}</span>
          <strong>${safePaymentMethod}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">${t('orderAddress')}</span>
          <strong style="text-align: right; max-width: 60%;">${safeCustomerAddress}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">${t('orderItemsCount')}</span>
          <strong>${APP_STATE.cart.length} ${t('productsUnit')}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
          <span style="font-weight: 700;">${t('totalPayment')}</span>
          <span style="font-weight: 800; color: var(--yellow-400);">${formatPrice(confirmedTotal)}</span>
        </div>
      </div>

      <button class="hero-cta-btn" style="margin: 0 auto;" onclick="finishOrder()">
        ${t('backToHome')}
      </button>
    </div>
  `;

  // Savatchani tozalash FAQAT muvaffaqiyatdan keyin!
  APP_STATE.cart = [];
  APP_STATE.discountRate = 0;
  APP_STATE.promoCode = null;
  saveCart();
  updateCounters();
  renderProducts();
  if (APP_STATE.isCartView) {
    renderCartPage();
  }
}

function finishOrder() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.remove('active');
  goToHome();
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.remove('active');
}

// Tezkor bildirishnoma (Toast notification)
function showToast(message, iconName = 'check') {
  let toastEl = document.getElementById('appGlobalToast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'appGlobalToast';
    toastEl.style.cssText = `
      position: fixed;
      bottom: 84px;
      left: 50%;
      transform: translateX(-50%) translateY(30px);
      background: rgba(18, 18, 26, 0.96);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 999px;
      font-size: 0.88rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      z-index: 99999;
      opacity: 0;
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    `;
    document.body.appendChild(toastEl);
  }

  const iconSvg = typeof getIcon === 'function' ? getIcon(iconName) : '';
  toastEl.innerHTML = `<span style="color: var(--yellow-400); display: flex; align-items: center;">${iconSvg}</span><span>${message}</span>`;
  toastEl.style.opacity = '1';
  toastEl.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateX(-50%) translateY(30px)';
  }, 2400);
}

// ==========================================================================
// LIVE SEARCH AUTOCOMPLETE & INTELLIGENT MATCHING ENGINE
// ==========================================================================
const CYRILLIC_TO_LATIN = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z',
  'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
  'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'ў': 'o', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h'
};

const SEARCH_SYNONYMS = {
  'айфон': ['iphone', 'apple'],
  'ayfon': ['iphone', 'apple'],
  'эппл': ['apple'],
  'epl': ['apple'],
  'самсунг': ['samsung'],
  'samsung': ['samsung', 'самсунг', 'galaxy'],
  'аирподс': ['airpods'],
  'эрподс': ['airpods'],
  'айрподс': ['airpods'],
  'airpods': ['airpods', 'аирподс', 'earbuds', 'quloqchin', 'naushnik'],
  'наушник': ['naushnik', 'quloqchin', 'airpods', 'earpods', 'earbuds', 'headphones'],
  'наушники': ['naushnik', 'quloqchin', 'airpods', 'earpods', 'earbuds', 'headphones'],
  'гарнитура': ['naushnik', 'quloqchin', 'airpods', 'earbuds'],
  'quloqchin': ['quloqchin', 'naushnik', 'earbuds', 'earpods', 'airpods', 'headphones'],
  'naushnik': ['quloqchin', 'naushnik', 'earbuds', 'earpods', 'airpods', 'headphones'],
  'soat': ['soat', 'watch', 'smartwatch', 'smart watch', 'часы'],
  'часы': ['soat', 'watch', 'smartwatch', 'smart watch', 'часы'],
  'smart': ['smart', 'aqlli', 'умный'],
  'watch': ['watch', 'soat', 'часы', 'smartwatch'],
  'чехол': ['case', 'chexol', 'silicone', 'silikon', 'magsafe'],
  'chexol': ['case', 'chexol', 'silicone', 'silikon', 'magsafe'],
  'кейс': ['case', 'chexol'],
  'кейсы': ['case', 'chexol'],
  'case': ['case', 'chexol', 'чехол', 'silicone'],
  'зарядка': ['charger', 'adapter', 'kabel', 'cable', 'zaryadka', 'zaryadlovchi', 'power'],
  'зарядное': ['charger', 'adapter', 'kabel', 'cable', 'zaryadka', 'zaryadlovchi'],
  'адаптер': ['adapter', 'charger', 'zaryadka', '20w', '30w', '45w', '100w'],
  'adapter': ['adapter', 'charger', 'zaryadka', '20w', '30w', '45w', '100w'],
  'charger': ['charger', 'adapter', 'zaryadka', 'zaryadlovchi'],
  'zaryadka': ['charger', 'adapter', 'zaryadka', 'zaryadlovchi', 'kabel'],
  'кабель': ['cable', 'kabel', 'type-c', 'lightning', 'usb'],
  'kabel': ['cable', 'kabel', 'type-c', 'lightning', 'usb', 'zaryadlovchi'],
  'cable': ['cable', 'kabel', 'type-c', 'lightning', 'usb'],
  'блок': ['adapter', 'charger', '20w', '30w', '45w', '100w', 'blok'],
  'шнур': ['cable', 'kabel'],
  'повербанк': ['powerbank', 'power bank', 'battery'],
  'павербанк': ['powerbank', 'power bank', 'battery'],
  'powerbank': ['powerbank', 'power bank', 'battery', 'повербанк'],
  'стекло': ['glass', 'shisha', 'protector'],
  'shisha': ['glass', 'shisha', 'protector', 'стекло'],
  'гугл': ['google', 'pixel'],
  'пиксель': ['pixel', 'google'],
  'канон': ['canon'],
  'вуп': ['whoop'],
  'хуп': ['whoop']
};

function normalizeSearchText(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/o['`ʼʻ]/g, 'o')
    .replace(/g['`ʼʻ]/g, 'g')
    .replace(/[^a-z0-9а-яёўқғҳ\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getProductSearchCorpus(p) {
  const parts = [
    p.name_uz || '',
    p.name_ru || '',
    p.name_en || '',
    p.name || '',
    p.brand || '',
    p.category || '',
    p.description_uz || '',
    p.description_ru || '',
    p.description || '',
    p.variant_note || '',
    p.badge_uz || '',
    p.badge_ru || '',
    Array.isArray(p.colors) ? p.colors.join(' ') : ''
  ];
  if (p.specs_uz) {
    Object.entries(p.specs_uz).forEach(([k, v]) => parts.push(`${k} ${v}`));
  }
  if (p.specs_ru) {
    Object.entries(p.specs_ru).forEach(([k, v]) => parts.push(`${k} ${v}`));
  }
  const cat = typeof CATEGORIES !== 'undefined' ? CATEGORIES.find(c => c.id === p.category) : null;
  if (cat) {
    parts.push(cat.name_uz || '');
    parts.push(cat.name_ru || '');
    parts.push(cat.name_en || '');
  }

  const raw = parts.join(' ');
  const normalized = normalizeSearchText(raw);
  let translit = '';
  for (const ch of normalized) {
    translit += CYRILLIC_TO_LATIN[ch] !== undefined ? CYRILLIC_TO_LATIN[ch] : ch;
  }
  return `${normalized} ${translit}`;
}

function matchProductSearch(p, query) {
  if (!query || !query.trim()) return true;
  const rawQ = normalizeSearchText(query);
  const corpus = getProductSearchCorpus(p);
  if (corpus.includes(rawQ)) return true;

  const tokens = rawQ.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  return tokens.every(token => {
    if (corpus.includes(token)) return true;
    let tokenTranslit = '';
    for (const ch of token) {
      tokenTranslit += CYRILLIC_TO_LATIN[ch] !== undefined ? CYRILLIC_TO_LATIN[ch] : ch;
    }
    if (tokenTranslit && corpus.includes(tokenTranslit)) return true;

    const syns = SEARCH_SYNONYMS[token] || SEARCH_SYNONYMS[tokenTranslit];
    if (syns && syns.some(s => corpus.includes(s))) return true;
    return false;
  });
}


function highlightSearchQuery(text, query) {
  if (!text) return '';
  if (!query) return escapeHtml(text);
  const trimmed = query.trim();
  if (!trimmed) return escapeHtml(text);
  const tokens = trimmed.split(/\s+/).filter(Boolean).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (tokens.length === 0) return escapeHtml(text);
  const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map(part => {
    if (tokens.some(t => part.toLowerCase() === t.toLowerCase())) {
      return `<mark>${escapeHtml(part)}</mark>`;
    }
    return escapeHtml(part);
  }).join('');
}

function searchProductsLive(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  const scored = [];

  PRODUCTS.forEach(p => {
    if (matchProductSearch(p, q)) {
      const nameUz = (p.name_uz || '').toLowerCase();
      const nameRu = (p.name_ru || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();

      let score = 50;
      if (nameUz.startsWith(q) || nameRu.startsWith(q)) {
        score += 100;
      } else if (nameUz.includes(q) || nameRu.includes(q)) {
        score += 60;
      } else if (brand.includes(q)) {
        score += 40;
      }
      scored.push({ product: p, score });
    }
  });

  scored.sort((a, b) => b.score - a.score || (b.product.rating || 0) - (a.product.rating || 0));
  return scored.map(item => item.product);
}

function renderLiveSearchDropdown(dropdownEl, query) {
  if (!dropdownEl) return;
  const q = (query || '').trim();

  if (!q) {
    dropdownEl.innerHTML = '';
    dropdownEl.style.display = 'none';
    return;
  }

  const currentLang = APP_STATE.lang || 'uz';
  const allMatches = searchProductsLive(q);
  const topMatches = allMatches.slice(0, 8);

  if (allMatches.length === 0) {
    const emptyTitle = currentLang === 'uz' ? 'Hech narsa topilmadi' : 'Ничего не найдено';
    const emptyDesc = currentLang === 'uz'
      ? `"${escapeHtml(q)}" bo'yicha mahsulot topilmadi. Boshqa so'z bilan qidirib ko'ring.`
      : `По запросу "${escapeHtml(q)}" ничего не найдено. Попробуйте другой запрос.`;

    dropdownEl.innerHTML = `
      <div class="search-empty-state">
        <div class="search-empty-icon">${getIcon('search')}</div>
        <div class="search-empty-title">${emptyTitle}</div>
        <div class="search-empty-desc">${emptyDesc}</div>
      </div>
    `;
    dropdownEl.style.display = 'block';
    return;
  }

  const itemsHtml = topMatches.map(product => {
    const name = currentLang === 'uz' ? (product.name_uz || product.name) : (product.name_ru || product.name);
    const highlightedTitle = highlightSearchQuery(name, q);
    const variant = product.variant_note || (product.colors && product.colors[0]) || 'Normal';
    const priceFormatted = formatPrice(product.price);

    return `
      <div class="search-item-row" data-id="${escapeHtml(product.id)}" onclick="handleSearchItemClick('${escapeJsString(product.id)}')">
        <div class="search-item-left">
          <div class="search-item-thumb-box">
            <img src="${product.main_image}" alt="${escapeHtml(name)}" class="search-item-thumb" loading="lazy" onerror="this.onerror=null;this.src='/images/placeholder.svg';" />
          </div>
          <div class="search-item-info">
            <div class="search-item-title">${highlightedTitle}</div>
            <div class="search-item-variant">${escapeHtml(variant)}</div>
          </div>
        </div>
        <div class="search-item-price">${formatPrice(product.price, product.currency)}</div>
      </div>
    `;
  }).join('');

  const viewAllText = currentLang === 'uz'
    ? `Barcha natijalarni ko'rish (${allMatches.length} ta mahsulot)`
    : `Посмотреть все результаты (${allMatches.length} товаров)`;

  const footerHtml = `
    <div class="search-dropdown-footer" onclick="submitLiveSearch('${escapeJsString(q)}')">
      <span>${viewAllText}</span>
      <span class="search-dropdown-footer-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      </span>
    </div>
  `;

  dropdownEl.innerHTML = `
    <div class="search-dropdown-list">
      ${itemsHtml}
    </div>
    ${footerHtml}
  `;
  dropdownEl.style.display = 'block';
}

function closeSearchDropdowns() {
  const dropdowns = document.querySelectorAll('.search-results-dropdown');
  dropdowns.forEach(d => {
    d.innerHTML = '';
    d.style.display = 'none';
  });
}

function handleSearchItemClick(productId) {
  closeSearchDropdowns();
  openProductDetail(productId);
}

function submitLiveSearch(query) {
  closeSearchDropdowns();
  APP_STATE.searchQuery = (query || '').trim();
  APP_STATE.isCategoryView = true;
  APP_STATE.isWishlistView = false;
  APP_STATE.isCartView = false;
  APP_STATE.isDetailView = false;
  APP_STATE.activeCategory = 'all';
  APP_STATE.activeBrand = 'all';

  // Desktop va mobile inputlarini sinxronlashtirish
  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(input => input.value = APP_STATE.searchQuery);

  const searchClears = document.querySelectorAll('.search-clear');
  searchClears.forEach(btn => btn.style.display = APP_STATE.searchQuery ? 'block' : 'none');

  updateViewMode();
  renderCategoryActiveHeader();
  renderProducts();

  // Katalog bo'limiga silliq o'tish
  const target = document.getElementById('catalogSection') || document.getElementById('productsSection');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function clearAllSearch() {
  APP_STATE.searchQuery = '';
  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(input => input.value = '');
  const searchClears = document.querySelectorAll('.search-clear');
  searchClears.forEach(btn => btn.style.display = 'none');
  closeSearchDropdowns();
  APP_STATE.isCategoryView = false;
  updateViewMode();
  renderCategoryActiveHeader();
  renderProducts();
}

// ==========================================================================
// EVENT LISTENERS & SETUP
// ==========================================================================
function setupEventListeners() {
  const desktopInput = document.getElementById('desktopSearchInput');
  const desktopDropdown = document.getElementById('desktopSearchResults');
  const desktopClear = document.getElementById('desktopSearchClear');

  const mobileInput = document.getElementById('mobileSearchInput');
  const mobileDropdown = document.getElementById('mobileSearchResults');
  const mobileClear = document.getElementById('mobileSearchClear');

  function handleSearchTyping(input, dropdown, clearBtn, otherInput, otherClear) {
    const val = input.value;
    if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
    if (otherInput) otherInput.value = val;
    if (otherClear) otherClear.style.display = val ? 'block' : 'none';

    renderLiveSearchDropdown(dropdown, val);

    // Sinxron qidiruv: ham autocomplete oynasi, ham mahsulotlar sahifasi bir vaqtda filtrlanadi
    APP_STATE.searchQuery = val.trim();
    if (APP_STATE.searchQuery) {
      APP_STATE.isCategoryView = true;
      APP_STATE.isWishlistView = false;
      APP_STATE.isCartView = false;
      APP_STATE.isDetailView = false;
      APP_STATE.activeCategory = 'all';
      APP_STATE.activeBrand = 'all';
    }
    updateViewMode();
    renderCategoryActiveHeader();
    renderProducts();
  }

  // Desktop qidiruv maydoni hodisalari
  if (desktopInput) {
    desktopInput.addEventListener('input', () => {
      handleSearchTyping(desktopInput, desktopDropdown, desktopClear, mobileInput, mobileClear);
    });
    desktopInput.addEventListener('focus', () => {
      if (desktopInput.value.trim()) {
        renderLiveSearchDropdown(desktopDropdown, desktopInput.value);
      }
    });
    desktopInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitLiveSearch(desktopInput.value);
      } else if (e.key === 'Escape') {
        closeSearchDropdowns();
      }
    });
  }

  if (desktopClear) {
    desktopClear.addEventListener('click', () => {
      clearAllSearch();
      if (desktopInput) desktopInput.focus();
    });
  }

  // Mobil qidiruv maydoni hodisalari
  if (mobileInput) {
    mobileInput.addEventListener('input', () => {
      handleSearchTyping(mobileInput, mobileDropdown, mobileClear, desktopInput, desktopClear);
    });
    mobileInput.addEventListener('focus', () => {
      if (mobileInput.value.trim()) {
        renderLiveSearchDropdown(mobileDropdown, mobileInput.value);
      }
    });
    mobileInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitLiveSearch(mobileInput.value);
      } else if (e.key === 'Escape') {
        closeSearchDropdowns();
      }
    });
  }

  if (mobileClear) {
    mobileClear.addEventListener('click', () => {
      clearAllSearch();
      if (mobileInput) mobileInput.focus();
    });
  }

  // Tashqariga bosilganda Live Search oynasini yopish
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container') && !e.target.closest('.mobile-search-row')) {
      closeSearchDropdowns();
    }
  });

  // Sort select
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      APP_STATE.sortBy = e.target.value;
      renderProducts();
    });
  }

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearchDropdowns();
      closeAllDrawers();
      closeProductModal();
      closeCheckoutModal();
      closeBrandsModal();
      closeContactModal();
      closeReviewsModal();
    }
  });

  // Mobil va desktop o'rtasida o'lcham o'zgarganda slayderni yangilash
  let lastIsMobileState = window.innerWidth <= 640;
  window.addEventListener('resize', () => {
    const isMobileNow = window.innerWidth <= 640;
    if (isMobileNow !== lastIsMobileState) {
      lastIsMobileState = isMobileNow;
      renderHeroSlider();
    }
  });
}

// ==========================================================================
// BLACKSTORE STORIES & MODAL HANDLERS
// ==========================================================================
function filterHotDeals() {
  APP_STATE.activeCategory = 'all';
  APP_STATE.searchQuery = '';
  APP_STATE.sortBy = 'popular';
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = 'popular';
  renderCategoriesBar();
  renderProducts();
  const catalog = document.getElementById('catalogSection');
  if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function openContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) modal.classList.add('active');
}

function closeContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) modal.classList.remove('active');
}

function openReviewsModal() {
  const modal = document.getElementById('reviewsModal');
  if (modal) modal.classList.add('active');
}

function closeReviewsModal() {
  const modal = document.getElementById('reviewsModal');
  if (modal) modal.classList.remove('active');
}

// ==========================================================================
// CUSTOMER AI CONSULTANT CHAT LOGIC (VIRTUAL SELLER)
// ==========================================================================
function toggleCustomerAiChat(open) {
  const modal = document.getElementById('customerAiModal');
  if (!modal) return;
  if (open) {
    modal.classList.add('active');
    setTimeout(() => {
      const input = document.getElementById('customerAiInput');
      if (input) input.focus();
    }, 150);
  } else {
    modal.classList.remove('active');
  }
}

function sendQuickAiPrompt(text) {
  const input = document.getElementById('customerAiInput');
  if (input) {
    input.value = text;
    handleCustomerAiSend(new Event('submit'));
  }
}

async function handleCustomerAiSend(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('customerAiInput');
  const messagesBox = document.getElementById('customerAiMessages');
  const sendBtn = document.getElementById('customerAiSendBtn');
  if (!input || !messagesBox) return;

  const text = (input.value || '').trim();
  if (!text) return;
  input.value = '';

  // Append User message
  const userBubble = document.createElement('div');
  userBubble.className = 'ai-chat-bubble ai-bubble-user';
  userBubble.innerHTML = `<div class="ai-bubble-content">${escapeHtml(text)}</div>`;
  messagesBox.appendChild(userBubble);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Append Bot loading bubble
  const botBubble = document.createElement('div');
  botBubble.className = 'ai-chat-bubble ai-bubble-bot';
  botBubble.innerHTML = `<div class="ai-bubble-content" style="display:flex;align-items:center;gap:6px;"><span class="ai-sparkle-dot"></span> <em>Javob tayyorlanmoqda...</em></div>`;
  messagesBox.appendChild(botBubble);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  if (sendBtn) sendBtn.disabled = true;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    const replyText = (data && data.reply) ? data.reply : "Kechirasiz, javob olishda muammo yuz berdi. Iltimos qaytadan urinib ko'ring.";
    botBubble.innerHTML = `<div class="ai-bubble-content">${escapeHtml(replyText)}</div>`;
  } catch (err) {
    botBubble.innerHTML = `<div class="ai-bubble-content" style="color:#ef4444;">Tarmoq xatosi. Iltimos ulanishingizni tekshiring.</div>`;
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }
}

window.toggleCustomerAiChat = toggleCustomerAiChat;
window.sendQuickAiPrompt = sendQuickAiPrompt;
window.handleCustomerAiSend = handleCustomerAiSend;

