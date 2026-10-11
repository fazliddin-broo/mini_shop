// ==========================================================================
// BLACK STORE — ASOSIY ILOVA LOGIKASI (JAVASCRIPT)
// ==========================================================================

function safeJsonParse(val, fallback) {
  try {
    if (!val) return fallback;
    const parsed = JSON.parse(val);
    return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : (parsed || fallback);
  } catch (_) {
    return fallback;
  }
}

const APP_STATE = {
  theme: localStorage.getItem('blackstore_theme') || 'dark',
  lang: localStorage.getItem('blackstore_lang') || 'uz',
  cart: safeJsonParse(localStorage.getItem('blackstore_cart'), []),
  wishlist: safeJsonParse(localStorage.getItem('blackstore_wishlist'), []),
  activeCategory: 'all',
  activeBrand: 'all',
  searchQuery: '',
  sortBy: 'popular',
  activeSlide: 0,
  sliderInterval: null,
  activeDetailProduct: null,
  selectedDetailColor: null,
  discountRate: 0,
  isWishlistView: false,
  _lastProductsHash: ''
};

// Til tarjimasi yordamchisi (i18n Helper)
function t(key) {
  const currentLang = APP_STATE.lang || 'uz';
  return (I18N[currentLang] && I18N[currentLang][key]) || (I18N.uz && I18N.uz[key]) || key;
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  applyLanguage();
  updateCounters();
  setupEventListeners();
  startSliderAutoplay();
  loadLiveProducts();
  loadShopSettings();
  // Har 8 soniyada dashboarddan yangi qo'shilgan mahsulotlarni avtomatik tekshirib yangilab turadi
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
      const pId = p.id || p._id || `prod-${Date.now()}`;
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

    // Server mahsulotlari bilan sinxronizatsiya
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

    // 1. Telefon raqam
    if (shop.phone) {
      const cleanPhone = shop.phone.replace(/[^\d+]/g, '');
      const phoneEl = document.getElementById('footerPhoneLink');
      if (phoneEl) {
        phoneEl.textContent = shop.phone;
        phoneEl.href = `tel:${cleanPhone}`;
      }
      const topPhone = document.getElementById('topPhoneLink');
      if (topPhone) {
        topPhone.textContent = shop.phone;
        topPhone.href = `tel:${cleanPhone}`;
      }
    }

    // 2. Manzil (Malika filiali)
    if (shop.address) {
      const addrEl = document.getElementById('footerAddressText');
      if (addrEl) addrEl.textContent = shop.address;

      const topAddr = document.getElementById('topAddressText') || document.getElementById('top-address');
      if (topAddr) topAddr.textContent = shop.address;

      const trustAddr = document.getElementById('trustAddressDesc');
      if (trustAddr) trustAddr.textContent = shop.address;

      const trustTitle = document.getElementById('trustAddressTitle');
      if (trustTitle) {
        // Masalan: "Malika B-blok 24" yoki qisqa manzil
        const parts = shop.address.split(',');
        trustTitle.textContent = parts[parts.length - 1]?.trim() || shop.address;
      }
    }

    // 3. Ish vaqti
    if (shop.workingHours) {
      const hoursEl = document.getElementById('footerHoursText');
      if (hoursEl) {
        const lang = APP_STATE.lang || 'uz';
        hoursEl.textContent = lang === 'ru' 
          ? `Время работы: ${shop.workingHours}`
          : `Ish vaqti: ${shop.workingHours}`;
      }
      const topHours = document.getElementById('topHoursText') || document.getElementById('top-hours');
      if (topHours) topHours.textContent = shop.workingHours;
    }

    // 4. Qisqa tavsif / Tagline / Description
    if (shop.description || shop.tagline) {
      const descEl = document.getElementById('footerShopDesc');
      if (descEl) {
        descEl.textContent = shop.description || `${shop.name || 'Black Store'} — ${shop.tagline || ''}`;
      }
    }

    // 5. Telegram kanal / havola
    if (shop.telegramChannel) {
      const tgBtn = document.getElementById('footerTgBtn');
      if (tgBtn) {
        tgBtn.href = shop.telegramChannel;
        tgBtn.title = `Telegram: ${shop.telegramChannel}`;
      }
      const tgLink = document.getElementById('footerTgLink');
      if (tgLink) {
        tgLink.href = shop.telegramChannel;
        const channelHandle = shop.telegramChannel.replace(/^https?:\/\/t\.me\//i, '@');
        tgLink.textContent = `Telegram: ${channelHandle}`;
      }
    }

    // 6. Instagram havola
    if (shop.instagram) {
      const instaBtn = document.getElementById('footerInstaBtn');
      if (instaBtn) {
        instaBtn.href = shop.instagram;
        instaBtn.title = `Instagram: ${shop.instagram}`;
      }
    }

    // 7. Footer Tagline & Rights
    const tagEl = document.getElementById('footerTaglineText');
    if (tagEl) {
      const addrSummary = shop.address || shop.tagline || "Malika B-blok 1-do'kon";
      const phoneSummary = shop.phone || '';
      tagEl.textContent = phoneSummary ? `${addrSummary} · ${phoneSummary}` : addrSummary;
    }

    const rightsEl = document.getElementById('footerRightsText');
    if (rightsEl && shop.name) {
      rightsEl.innerHTML = `&copy; 2026 ${shop.name}.uz. Barcha huquqlar himoyalangan.`;
    }

    // 8. Do'kon Nomi
    if (shop.name && shop.name.trim()) {
      const brandTitles = document.querySelectorAll('.brand-title');
      brandTitles.forEach(bt => {
        bt.innerHTML = `${shop.name}<span class="brand-uz">.uz</span>`;
      });
    }

    // 9. AI Yordamchi xush kelibsiz xabari (agar admin belgilagan bo'lsa)
    if (data.aiWelcome) {
      const welcomeEl = document.getElementById('aiWelcomeText');
      if (welcomeEl && !welcomeEl.dataset.customized) {
        welcomeEl.textContent = data.aiWelcome;
        welcomeEl.dataset.customized = "true";
      }
    }
  } catch (err) {
    console.warn('Shop settings load error:', err);
  }
}

// ==========================================================================
// THEME MANAGEMENT (Tungi / Kunduzgi Rejim)
// ==========================================================================
function initTheme() {
  if (APP_STATE.theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  updateThemeIcon();
}

function toggleTheme() {
  APP_STATE.theme = APP_STATE.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('blackstore_theme', APP_STATE.theme);
  initTheme();
}

function updateThemeIcon() {
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = APP_STATE.theme === 'dark' ? getIcon('sun') : getIcon('moon');
  }
}

// ==========================================================================
// LANGUAGE SWITCHER (O'ZBEKCHA / RUSCHA 100% TO'LIQ TARJIMA TIZIMI)
// ==========================================================================
function toggleLanguage() {
  APP_STATE.lang = APP_STATE.lang === 'uz' ? 'ru' : 'uz';
  localStorage.setItem('blackstore_lang', APP_STATE.lang);
  applyLanguage();
}

function applyLanguage() {
  const currentLang = APP_STATE.lang;
  document.documentElement.setAttribute('lang', currentLang);

  // Header til tugmasi: faol tilni va o'tish imkoniyatini bildiradi
  const langBtn = document.getElementById('langToggleBtn');
  if (langBtn) {
    langBtn.textContent = currentLang === 'uz' ? 'RU' : 'UZ';
    langBtn.setAttribute('title', currentLang === 'uz' ? "Переключить на русский язык" : "O'zbek tiliga o'tish");
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
  renderBrandsDrawer();

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
  const navTabs = document.querySelectorAll('.nav-tab-item');
  if (navTabs.length >= 5) {
    navTabs[0].querySelector('span:last-child').textContent = t('navHome');
    navTabs[1].querySelector('span:last-child').textContent = t('navCatalog');
    navTabs[2].querySelector('span:last-child').textContent = t('navSearch');
    navTabs[3].querySelector('span:last-child').textContent = t('navWishlist');
    navTabs[4].querySelector('span:last-child').textContent = t('navCart');
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

  // Footer Kategoriyalar havolalari
  const footerCatLinks = document.querySelectorAll('.footer-col:nth-child(2) .footer-links a');
  if (footerCatLinks.length >= 5) {
    footerCatLinks[0].textContent = currentLang === 'ru' ? 'Умные часы' : 'Aqlli soatlar';
    footerCatLinks[1].textContent = currentLang === 'ru' ? 'Наушники' : 'Quloqchinlar';
    footerCatLinks[2].textContent = currentLang === 'ru' ? 'Зарядные устройства и кабели' : 'Zaryadlovchi va kabellar';
    footerCatLinks[3].textContent = currentLang === 'ru' ? 'Повербанки' : 'Powerbanklar';
    footerCatLinks[4].textContent = currentLang === 'ru' ? 'Gaming аксессуары' : 'Gaming aksessuarlar';
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
  renderProducts();
  renderCartDrawer();

  // Agar mahsulot tafsilot oynasi ochiq bo'lsa, uni ham yangilash
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

  const lang = APP_STATE.lang;

  track.innerHTML = BANNERS.map((banner, index) => {
    const title = banner['title_' + lang] || banner.title_uz;
    const subtitle = banner['subtitle_' + lang] || banner.subtitle_uz;
    const cta = banner['cta_' + lang] || banner.cta_uz;
    const badge = banner['badge_' + lang] || banner.badge_uz;

    if (banner.is_graphic) {
      return `
        <div class="hero-slide hero-slide-graphic" onclick="handleHeroSlideClick(${index})" style="background-image: url('${banner.image}');" role="button" tabindex="0" aria-label="${title}">
          <div class="hero-graphic-cta-hitbox" title="${cta}" onclick="event.stopPropagation(); handleHeroSlideClick(${index})"></div>
        </div>
      `;
    }

    return `
      <div class="hero-slide" style="background-image: url('${banner.image}');">
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
  const drawerList = document.getElementById('catalogDrawerList');
  const lang = APP_STATE.lang;

  // Yuqori gorizontal lenta (Applebox skrinshotidagi kabi kvadrat kartalar)
  if (container) {
    container.innerHTML = CATEGORIES.map(cat => {
      const catName = cat['name_' + lang] || cat.name_uz;
      const isActive = !APP_STATE.isWishlistView && APP_STATE.activeCategory === cat.id;
      return `
        <button class="cat-card ${isActive ? 'active' : ''}" onclick="selectCategory('${cat.id}')">
          <div class="cat-card-icon-wrap">
            ${getIcon(cat.icon)}
          </div>
          <span class="cat-card-title">${catName}</span>
        </button>
      `;
    }).join('');
  }

  // Screenshot dagi chap tomondagi to'liq Kategoriyalar menyusi
  if (drawerList) {
    drawerList.innerHTML = CATEGORIES.filter(c => c.id !== 'all').map(cat => {
      const catName = cat['name_' + lang] || cat.name_uz;
      const isActive = !APP_STATE.isWishlistView && APP_STATE.activeCategory === cat.id;

      return `
        <button class="catalog-category-row ${isActive ? 'active' : ''}" onclick="selectCategory('${cat.id}'); toggleCatalogDrawer(false);">
          <span class="catalog-cat-icon">${getIcon(cat.icon)}</span>
          <span class="catalog-cat-text">${catName}</span>
        </button>
      `;
    }).join('');
  }

  renderCategoryActiveHeader();
}

function renderCategoryActiveHeader() {
  const headerContainer = document.getElementById('categoryActiveHeader');
  if (!headerContainer) return;

  const lang = APP_STATE.lang;

  if (APP_STATE.isWishlistView) {
    const wishTitle = lang === 'ru' ? 'Избранные товары' : 'Sevimlilar ro\'yxati';
    const count = APP_STATE.wishlist.length;
    const unit = t('productsUnit');

    headerContainer.innerHTML = `
      <h2 class="cat-active-title">${wishTitle}</h2>
      <span class="cat-active-count">&bull; ${count} ${unit}</span>
      <button class="cat-active-pill" onclick="resetFilters()">
        <span>${wishTitle}</span>
        <span class="pill-x">✕</span>
      </button>
    `;
    return;
  }

  // Active Brand Header (Screenshot 5 / Applebox uslubida: Apple · X ta mahsulot [Apple ✕])
  if (APP_STATE.activeBrand && APP_STATE.activeBrand !== 'all') {
    const brandName = APP_STATE.activeBrand;
    const count = getFilteredProducts().length;
    const unit = t('productsUnit');

    headerContainer.innerHTML = `
      <h2 class="cat-active-title">${brandName}</h2>
      <span class="cat-active-count">&bull; ${count} ${unit}</span>
      <button class="cat-active-pill" onclick="resetFilters()">
        <span>${brandName}</span>
        <span class="pill-x">✕</span>
      </button>
    `;
    return;
  }

  if (APP_STATE.activeCategory === 'all') {
    headerContainer.innerHTML = '';
    return;
  }

  const cat = CATEGORIES.find(c => c.id === APP_STATE.activeCategory);
  if (!cat) return;
  const catName = cat['name_' + lang] || cat.name_uz;
  const count = getFilteredProducts().length;
  const unit = t('productsUnit');

  headerContainer.innerHTML = `
    <h2 class="cat-active-title">${catName}</h2>
    <span class="cat-active-count">&bull; ${count} ${unit}</span>
    <button class="cat-active-pill" onclick="resetFilters()">
      <span>${catName}</span>
      <span class="pill-x">✕</span>
    </button>
  `;
}

function selectCategory(catId) {
  APP_STATE.isWishlistView = false;
  APP_STATE.activeBrand = 'all';
  APP_STATE.activeCategory = catId;
  renderCategoriesBar();
  renderProducts();

  // Scroll to catalog section smoothly
  const catalogEl = document.getElementById('catalogSection');
  if (catalogEl) {
    catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
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
      ? `<img src="${brand.logo}" alt="${brand.name}" class="brand-drawer-img" loading="eager" />`
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
  if (APP_STATE.activeBrand && APP_STATE.activeBrand.toLowerCase() === brandId.toLowerCase()) {
    APP_STATE.activeBrand = 'all';
  } else {
    APP_STATE.activeBrand = brandId;
  }
  APP_STATE.isWishlistView = false;
  APP_STATE.searchQuery = '';
  APP_STATE.activeCategory = 'all';
  toggleBrandsDrawer(false);
  renderBrandsDrawer();
  renderCategoriesBar();
  renderProducts();

  const catalogEl = document.getElementById('catalogSection');
  if (catalogEl) {
    catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function closeBrandsModal() {
  toggleBrandsDrawer(false);
}

function filterByBrand(brand) {
  selectBrand(brand);
}

function filterByWishlist() {
  APP_STATE.isWishlistView = true;
  APP_STATE.activeCategory = 'all';
  APP_STATE.activeBrand = 'all';
  APP_STATE.searchQuery = '';
  renderCategoriesBar();
  renderProducts();

  const catalogEl = document.getElementById('catalogSection');
  if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================================================
// PRODUCTS LISTING & FILTERING
// ==========================================================================
function getFilteredProducts() {
  let list = [...PRODUCTS];

  // Wishlist filter
  if (APP_STATE.isWishlistView) {
    list = list.filter(p => APP_STATE.wishlist.includes(p.id));
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
    const activeCat = String(APP_STATE.activeCategory).toLowerCase().trim();
    const matchedCategoryObj = (typeof CATEGORIES !== 'undefined' ? CATEGORIES : []).find(c => String(c.id).toLowerCase() === activeCat);
    list = list.filter(p => {
      const pCat = String(p.category || '').toLowerCase().trim();
      if (pCat === activeCat) return true;
      if (matchedCategoryObj) {
        if (matchedCategoryObj.name_uz && pCat === matchedCategoryObj.name_uz.toLowerCase().trim()) return true;
        if (matchedCategoryObj.name_ru && pCat === matchedCategoryObj.name_ru.toLowerCase().trim()) return true;
      }
      return false;
    });
  }

  // Search filter (O'zbekcha va Ruscha nomlar bo'yicha)
  if (APP_STATE.searchQuery.trim()) {
    const q = APP_STATE.searchQuery.toLowerCase().trim();
    list = list.filter(p => 
      (p.name_uz && p.name_uz.toLowerCase().includes(q)) || 
      (p.name_ru && p.name_ru.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.description_uz && p.description_uz.toLowerCase().includes(q)) ||
      (p.description_ru && p.description_ru.toLowerCase().includes(q))
    );
  }

  // Sorting
  switch (APP_STATE.sortBy) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
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

  const products = getFilteredProducts();
  const lang = APP_STATE.lang;

  if (catalogStats) {
    catalogStats.innerHTML = `${t('totalCount')}: <strong id="productsCount">${products.length}</strong> ${t('productsAvailable')}`;
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
    const isWished = APP_STATE.wishlist.some(id => String(id) === String(prod.id));
    const inCart = APP_STATE.cart.some(item => String(item.id) === String(prod.id));
    const prodName = prod['name_' + lang] || prod.name_uz;
    const prodBadge = prod['badge_' + lang] || prod.badge_uz || prod.badge;
    const cartBtnText = inCart ? t('inCart') : t('addToCart');

    return `
      <div class="product-card" data-id="${prod.id}">
        <div class="product-image-box" onclick="openProductDetail('${prod.id}')">
          <button class="btn-wishlist ${isWished ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist('${prod.id}')" title="${isWished ? t('wishlistRemove') : t('wishlistAdd')}">
            ${isWished ? getIcon('heartFilled') : getIcon('heart')}
          </button>
          <img src="${prod.main_image}" alt="${prodName}" loading="lazy" />
          <div class="quick-view-overlay">
            ${getIcon('eye')} ${t('quickView')}
          </div>
        </div>

        <div class="product-content">
          <div class="product-meta-row">
            <span class="product-brand">${prod.brand}</span>
            <div class="product-rating">
              ${getIcon('star')}
              <span>${prod.rating}</span>
            </div>
          </div>

          <h3 class="product-title" onclick="openProductDetail('${prod.id}')">${prodName}</h3>

          <div class="product-price-row">
            <div class="current-price">${formatPrice(prod.price)}</div>
            ${prod.old_price ? `
              <div class="old-price-wrap">
                <span class="old-price">${formatPrice(prod.old_price)}</span>
                ${prod.discount_percent ? `<span class="discount-badge">-${prod.discount_percent}%</span>` : ''}
              </div>
            ` : ''}
          </div>

          <button class="btn-add-cart ${inCart ? 'added' : ''}" onclick="addToCart('${prod.id}')">
            ${inCart ? getIcon('check') : getIcon('cart')}
            <span>${cartBtnText}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function resetFilters() {
  APP_STATE.isWishlistView = false;
  APP_STATE.activeCategory = 'all';
  APP_STATE.activeBrand = 'all';
  APP_STATE.searchQuery = '';
  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(input => input.value = '');
  renderBrandsDrawer();
  renderCategoriesBar();
  renderProducts();
}

// ==========================================================================
// WISHLIST LOGIC
// ==========================================================================
function toggleWishlist(productId) {
  const index = APP_STATE.wishlist.indexOf(productId);
  if (index > -1) {
    APP_STATE.wishlist.splice(index, 1);
  } else {
    APP_STATE.wishlist.push(productId);
  }

  localStorage.setItem('blackstore_wishlist', JSON.stringify(APP_STATE.wishlist));
  updateCounters();
  renderProducts();
}

// ==========================================================================
// CART LOGIC
// ==========================================================================
function addToCart(productId, selectedColor = null, quantity = 1) {
  const prod = PRODUCTS.find(p => String(p.id) === String(productId));
  if (!prod) return;

  const existingIndex = APP_STATE.cart.findIndex(item => String(item.id) === String(productId));

  if (existingIndex > -1) {
    APP_STATE.cart[existingIndex].quantity += quantity;
  } else {
    APP_STATE.cart.push({
      id: prod.id,
      name_uz: prod.name_uz,
      name_ru: prod.name_ru,
      price: prod.price,
      image: prod.main_image,
      color: selectedColor || (prod.colors && prod.colors[0]) || 'Standart',
      quantity: quantity
    });
  }

  saveCart();
  updateCounters();
  renderProducts();
  renderCartDrawer();
}

function updateCartQty(productId, change) {
  const item = APP_STATE.cart.find(i => String(i.id) === String(productId));
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  updateCounters();
  renderCartDrawer();
}

function removeFromCart(productId) {
  APP_STATE.cart = APP_STATE.cart.filter(item => String(item.id) !== String(productId));
  saveCart();
  updateCounters();
  renderProducts();
  renderCartDrawer();
}

function saveCart() {
  localStorage.setItem('blackstore_cart', JSON.stringify(APP_STATE.cart));
}

function updateCounters() {
  const cartBadges = document.querySelectorAll('.cart-count-badge');
  const wishlistBadges = document.querySelectorAll('.wishlist-count-badge');

  const cartTotalQty = APP_STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishCount = APP_STATE.wishlist.length;

  cartBadges.forEach(b => {
    b.textContent = cartTotalQty;
    b.style.display = cartTotalQty > 0 ? 'flex' : 'none';
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
      <div class="empty-state" style="padding: 40px 10px; background: transparent; border: none;">
        <div class="empty-state-icon">${getIcon('shoppingBag')}</div>
        <h3>${t('cartEmptyTitle')}</h3>
        <p>${t('cartEmptyDesc')}</p>
        <button class="hero-cta-btn" style="margin: 0 auto;" onclick="toggleCartDrawer(false)">
          ${t('startShopping')}
        </button>
      </div>
    `;
    totalAmountEl.textContent = formatPrice(0);
    return;
  }

  let subtotal = 0;

  itemsContainer.innerHTML = APP_STATE.cart.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    const itemName = item['name_' + lang] || item.name_uz;

    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${itemName}" class="cart-item-img" />
        <div class="cart-item-details">
          <div>
            <h4 class="cart-item-title">${itemName}</h4>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${t('color')} ${item.color}</div>
          </div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
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

  if (APP_STATE.discountRate > 0) {
    const discountAmount = subtotal * APP_STATE.discountRate;
    const finalTotal = subtotal - discountAmount;
    totalAmountEl.innerHTML = `
      <div style="font-size: 0.8rem; text-decoration: line-through; color: var(--text-muted);">${formatPrice(subtotal)}</div>
      <div>${formatPrice(finalTotal)} <span style="font-size: 0.8rem; color: var(--yellow-400);">(-${APP_STATE.discountRate * 100}%)</span></div>
    `;
  } else {
    totalAmountEl.textContent = formatPrice(subtotal);
  }
}

function applyPromoCode() {
  const input = document.getElementById('promoInput');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (code === 'BLACK10' || code === 'APPLEBOX') {
    APP_STATE.discountRate = 0.10;
    renderCartDrawer();
  } else if (code === 'BLACK20') {
    APP_STATE.discountRate = 0.20;
    renderCartDrawer();
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
    backdrop.classList.add('active');
    catalogDrawer.classList.add('active');
  } else {
    catalogDrawer.classList.remove('active');
    if (!document.getElementById('cartDrawer').classList.contains('active')) {
      backdrop.classList.remove('active');
    }
  }
}

function closeAllDrawers() {
  const backdrop = document.getElementById('drawerBackdrop');
  const cartDrawer = document.getElementById('cartDrawer');
  const catalogDrawer = document.getElementById('catalogDrawer');
  const brandsDrawer = document.getElementById('brandsDrawer');
  if (backdrop) backdrop.classList.remove('active');
  if (cartDrawer) cartDrawer.classList.remove('active');
  if (catalogDrawer) catalogDrawer.classList.remove('active');
  if (brandsDrawer) brandsDrawer.classList.remove('active');
}

// ==========================================================================
// PRODUCT DETAIL MODAL (QUICK VIEW)
// ==========================================================================
function openProductDetail(productId) {
  const prod = PRODUCTS.find(p => String(p.id) === String(productId));
  if (!prod) return;

  APP_STATE.activeDetailProduct = prod;
  APP_STATE.selectedDetailColor = prod.colors && prod.colors.length ? prod.colors[0] : null;

  const modal = document.getElementById('productDetailModal');
  const body = document.getElementById('productDetailBody');
  if (!modal || !body) return;

  const lang = APP_STATE.lang;
  const prodName = prod['name_' + lang] || prod.name_uz;
  const prodDesc = prod['description_' + lang] || prod.description_uz;
  const specs = prod['specs_' + lang] || prod.specs_uz || prod.specs;

  body.innerHTML = `
    <div class="detail-grid">
      <div class="detail-gallery">
        <div class="detail-main-img">
          <img id="detailMainImg" src="${prod.main_image}" alt="${prodName}" />
        </div>
        ${prod.images && prod.images.length > 1 ? `
          <div class="detail-thumbs">
            ${prod.images.map((img, i) => `
              <div class="thumb-item ${i === 0 ? 'active' : ''}" onclick="changeDetailImage('${img}', this)">
                <img src="${img}" alt="${prodName}" />
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="detail-info">
        <div class="detail-brand-badge">${prod.brand}</div>
        <h2 class="detail-title">${prodName}</h2>

        <div class="detail-price-box">
          <div class="detail-price">${formatPrice(prod.price)}</div>
          ${prod.old_price ? `<div class="detail-old-price">${formatPrice(prod.old_price)}</div>` : ''}
        </div>

        <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">
          ${prodDesc}
        </p>

        ${prod.colors && prod.colors.length ? `
          <div>
            <div class="detail-colors-title">${t('availColors')}</div>
            <div class="detail-color-options">
              ${prod.colors.map((color, i) => `
                <button class="color-chip ${i === 0 ? 'active' : ''}" onclick="selectDetailColor('${color}', this)">
                  ${color}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${specs ? `
          <table class="detail-specs-table">
            <tbody>
              ${Object.entries(specs).map(([key, val]) => `
                <tr>
                  <td>${key}</td>
                  <td>${val}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <div class="detail-actions">
          <button class="btn-detail-add" onclick="addToCart('${prod.id}', APP_STATE.selectedDetailColor); closeProductModal();">
            ${getIcon('shoppingBag')} ${t('addToCartFull')}
          </button>
          <button class="btn-detail-buy" onclick="buyNow('${prod.id}')">
            ${t('buyNow')}
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function changeDetailImage(imgSrc, element) {
  const mainImg = document.getElementById('detailMainImg');
  if (mainImg) mainImg.src = imgSrc;
  document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('active'));
  if (element) element.classList.add('active');
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

function buyNow(productId) {
  closeProductModal();
  addToCart(productId, APP_STATE.selectedDetailColor);
  openCheckoutModal();
}

// ==========================================================================
// CHECKOUT MODAL & ORDER CREATION
// ==========================================================================
function openCheckoutModal() {
  if (APP_STATE.cart.length === 0) {
    alert(t('selectProductFirst'));
    return;
  }

  toggleCartDrawer(false);

  const modal = document.getElementById('checkoutModal');
  const body = document.getElementById('checkoutModalBody');
  if (!modal || !body) return;

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

      <div class="form-group">
        <label class="form-label">${t('paymentMethod')}</label>
        <div class="payment-methods-grid">
          <div class="payment-option active" id="deliveryOptYandex" onclick="selectDeliveryMethod('Yandex kuryer', this)">
            ${getIcon('truck')}
            <span class="payment-name">Yandex kuryer</span>
          </div>
          <div class="payment-option" id="deliveryOptPickup" onclick="selectDeliveryMethod('Borib olish', this)">
            ${getIcon('mapPin')}
            <span class="payment-name">Borib olish</span>
          </div>
        </div>
      </div>

      <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.95rem; font-weight: 600;">${t('totalPayment')}</span>
        <span style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: var(--yellow-400);">${formatPrice(finalTotal)}</span>
      </div>

      <button type="submit" class="btn-checkout" style="margin-top: 10px;">
        ${getIcon('check')} <span>${t('confirmOrder')}</span>
      </button>
    </form>
  `;

  modal.classList.add('active');
}

let currentDeliveryMethod = 'Yandex kuryer';
let currentPaymentMethod = 'Yandex kuryer';

function selectDeliveryMethod(method, element) {
  currentDeliveryMethod = method;
  currentPaymentMethod = method;
  document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('active'));
  if (element) element.classList.add('active');

  const addressInput = document.getElementById('checkoutAddress');
  if (addressInput) {
    if (method === 'Borib olish') {
      addressInput.value = "Do'kondan borib olish";
      addressInput.setAttribute('readonly', 'true');
      addressInput.style.opacity = '0.75';
    } else {
      if (addressInput.value === "Do'kondan borib olish") addressInput.value = '';
      addressInput.removeAttribute('readonly');
      addressInput.style.opacity = '1';
      addressInput.placeholder = t('addressPlaceholder');
    }
  }
}

function selectPaymentMethod(method, element) {
  selectDeliveryMethod(method, element);
}

function handleCheckoutSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('checkoutName').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();

  let orderId = 'BS-' + Math.floor(100000 + Math.random() * 900000);
  const total = APP_STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = APP_STATE.discountRate > 0 ? total * (1 - APP_STATE.discountRate) : total;

  // Backend API ga jo'natish (Admin dashboardda darhol ko'rinishi uchun)
  try {
    const payload = {
      customer: {
        name: name,
        phone: phone,
        address: currentDeliveryMethod === 'Borib olish' ? "Do'kondan borib olish" : address,
        deliveryMethod: currentDeliveryMethod || 'Yandex kuryer',
        notes: `Yetkazish usuli: ${currentDeliveryMethod || 'Yandex kuryer'}`
      },
      items: APP_STATE.cart.map(item => ({
        id: String(item.id),
        name: item.name_uz || item.name_ru || item.name || 'Mahsulot',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      })),
      total: finalTotal
    };

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json()).then(data => {
      if (data && data.order && data.order.id) {
        const orderCodeEl = document.getElementById('successOrderCode');
        if (orderCodeEl) orderCodeEl.textContent = '#' + data.order.id;
      }
    }).catch(err => console.warn('Order backend sync failed:', err));
  } catch (e) {
    console.warn('Checkout error:', e);
  }

  const body = document.getElementById('checkoutModalBody');
  if (!body) return;

  const lang = APP_STATE.lang;
  const greeting = lang === 'ru' 
    ? `Спасибо, <strong>${name}</strong>! ${t('orderCode')} <strong id="successOrderCode">#${orderId}</strong>. Наш менеджер скоро свяжется с вами по номеру <strong>${phone}</strong>.`
    : `Rahmat, <strong>${name}</strong>! Buyurtma kodi: <strong id="successOrderCode">#${orderId}</strong>. Menejerimiz tez orada <strong>${phone}</strong> raqamiga aloqaga chiqadi.`;

  body.innerHTML = `
    <div class="order-success">
      <div class="success-check-icon">
        ${getIcon('shieldCheck')}
      </div>
      <h2>${t('orderSuccessTitle')}</h2>
      <p>${greeting}</p>

      <div class="order-receipt-box">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">${t('orderPaymentMethod')}</span>
          <strong>${currentPaymentMethod}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">${t('orderAddress')}</span>
          <strong>${currentDeliveryMethod === 'Borib olish' ? "Do'kondan borib olish" : address}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">${t('orderItemsCount')}</span>
          <strong>${APP_STATE.cart.length} ${t('productsUnit')}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
          <span style="font-weight: 700;">${t('totalPayment')}</span>
          <span style="font-weight: 800; color: var(--yellow-400);">${formatPrice(finalTotal)}</span>
        </div>
      </div>

      <button class="hero-cta-btn" style="margin: 0 auto;" onclick="finishOrder()">
        ${t('backToHome')}
      </button>
    </div>
  `;

  // Clear cart
  APP_STATE.cart = [];
  APP_STATE.discountRate = 0;
  saveCart();
  updateCounters();
  renderProducts();
}

function finishOrder() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.remove('active');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.remove('active');
}

// Burchakdagi xabarlar foydalanuvchi talabi bilan o'chirilgan
function showToast(message, iconName = 'check') {
  return;
}

// ==========================================================================
// EVENT LISTENERS & SEARCH
// ==========================================================================
function setupEventListeners() {
  // Search Inputs
  const searchInputs = document.querySelectorAll('.search-input');
  const searchClears = document.querySelectorAll('.search-clear');

  searchInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      APP_STATE.searchQuery = e.target.value;
      searchClears.forEach(btn => btn.style.display = APP_STATE.searchQuery ? 'block' : 'none');
      renderProducts();
    });
  });

  searchClears.forEach(btn => {
    btn.addEventListener('click', () => {
      APP_STATE.searchQuery = '';
      searchInputs.forEach(input => input.value = '');
      searchClears.forEach(b => b.style.display = 'none');
      renderProducts();
    });
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
      closeAllDrawers();
      closeProductModal();
      closeCheckoutModal();
      closeBrandsModal();
      closeContactModal();
      closeReviewsModal();
      closeInfoModal();
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
// INFO MODAL (Yetkazib berish, Kafolat, To'lov usullari)
// ==========================================================================
function openInfoModal(type) {
  const modal = document.getElementById('infoModal');
  const body = document.getElementById('infoModalBody');
  if (!modal || !body) return;

  const lang = APP_STATE.lang;

  const contentMap = {
    delivery: {
      title_uz: "Yetkazib berish shartlari",
      title_ru: "Условия доставки",
      icon: "truck",
      html_uz: `
        <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid var(--yellow-400);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">⚡️ Toshkent shahri bo'ylab tezkor yetkazish</strong>
            Buyurtma tasdiqlangach, Yandex Taxi yoki shaxsiy kuryer orqali <strong>1-2 soat ichida</strong> to'g'ridan-to'g'ri eshigingizgacha yetkazib beriladi.
          </div>
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid var(--yellow-400);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">📦 O'zbekiston viloyatlariga yetkazish</strong>
            Barcha viloyat markazlariga BTS Pochta yoki EMU orqali <strong>24 soat ichida</strong> xavfsiz qadoqlangan holda yetkazib beriladi.
          </div>
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid var(--yellow-400);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">🏬 Do'kondan olib ketish (Samovivoz)</strong>
            Toshkent sh., Malika savdo markazi, B-blok 1-do'kondan o'zingiz kelib, tovarlarni ko'rib olib ketishingiz mumkin.
          </div>
        </div>
      `,
      html_ru: `
        <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid var(--yellow-400);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">⚡️ Экспресс-доставка по Ташкенту</strong>
            В течение <strong>1-2 часов</strong> через Яндекс Доставку или курьера прямо до вашей двери.
          </div>
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid var(--yellow-400);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">📦 Доставка по регионам Узбекистана</strong>
            Во все регионы через BTS или EMU почту в течение <strong>24 часов</strong> в надежной защитной упаковке.
          </div>
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid var(--yellow-400);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">🏬 Самовывоз из магазина</strong>
            г. Ташкент, ТЦ Малика, B-блок 1-магазин (09:00 - 22:00 ежедневно).
          </div>
        </div>
      `
    },
    warranty: {
      title_uz: "Kafolat va qaytarish",
      title_ru: "Гарантия и возврат",
      icon: "shieldCheck",
      html_uz: `
        <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid #22c55e;">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">🛡 1 Yilgacha rasmiy kafolat</strong>
            Barcha mahsulotlar 100% original bo'lib, ishlab chiqaruvchi va Black Store tomonidan 1 yilgacha rasmiy kafolat beriladi.
          </div>
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid #22c55e;">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">🔄 14 kunlik almashtirish</strong>
            Zavod nuqsoni (brak) aniqlangan taqdirda, mahsulot 14 kun ichida so'zsiz yangisiga almashtirib beriladi.
          </div>
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid #22c55e;">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">✅ Rasmiy tekshiruv kafolati</strong>
            Xarid qilishdan oldin yoki yetkazib berilganda qutini ochib, IMEI kodini Apple rasmiy saytida tekshirishingiz mumkin.
          </div>
        </div>
      `,
      html_ru: `
        <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid #22c55e;">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">🛡 Официальная гарантия до 1 года</strong>
            Вся продукция 100% оригинальная, предоставляется гарантийный талон от магазина и сервиса.
          </div>
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid #22c55e;">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">🔄 Замена в течение 14 дней</strong>
            При обнаружении заводского брака — моментальный обмен на новое устройство.
          </div>
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid #22c55e;">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">✅ Проверка перед покупкой</strong>
            Вы можете проверить серийный номер на официальном сайте Apple перед получением.
          </div>
        </div>
      `
    },
    payment: {
      title_uz: "To'lov usullari",
      title_ru: "Способы оплаты",
      icon: "creditCard",
      html_uz: `
        <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid var(--yellow-400);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">💳 Milliy to'lov tizimlari</strong>
            Click, Payme, Uzum Bank ilovalari orqali 0% komissiya bilan bir zumda xavfsiz to'lov.
          </div>
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid var(--yellow-400);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">💵 Naqd pul orqali to'lov</strong>
            Mahsulotni qo'lingizga olib, tekshirib ko'rganingizdan so'ng kuryerga yoki do'konda to'lashingiz mumkin.
          </div>
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid var(--yellow-400);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">🏦 Bank kartalari (Uzcard / Humo / Visa)</strong>
            Terminal orqali yoki xalqaro kartalar orqali qulay to'lov.
          </div>
        </div>
      `,
      html_ru: `
        <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid var(--yellow-400);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">💳 Национальные платежные системы</strong>
            Click, Payme, Uzum Bank без комиссии.
          </div>
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid var(--yellow-400);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">💵 Наличными при получении</strong>
            Оплата курьеру после проверки товара или в нашем магазине на Малике.
          </div>
          <div style="padding: 12px 14px; background: var(--bg-card); border-radius: var(--radius-md); border-left: 3px solid var(--yellow-400);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">🏦 Банковские карты (Uzcard / Humo / Visa)</strong>
            Оплата через терминал в магазине или онлайн.
          </div>
        </div>
      `
    }
  };

  const item = contentMap[type] || contentMap.delivery;
  const title = lang === 'ru' ? item.title_ru : item.title_uz;
  const bodyHtml = lang === 'ru' ? item.html_ru : item.html_uz;

  body.innerHTML = `
    <div style="text-align: center; margin-bottom: 18px;">
      <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); color: var(--yellow-400); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
        ${getIcon(item.icon)}
      </div>
      <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; margin-bottom: 4px;">${title}</h3>
      <p style="color: var(--text-muted); font-size: 0.85rem;">BlackStore.uz rasmiy kafolati va xizmati</p>
    </div>
    ${bodyHtml}
    <div style="margin-top: 20px;">
      <button class="hero-cta-btn" style="width: 100%; justify-content: center;" onclick="closeInfoModal()">
        ${lang === 'ru' ? 'Понятно' : 'Tushunarli'}
      </button>
    </div>
  `;

  modal.classList.add('active');
}

function closeInfoModal() {
  const modal = document.getElementById('infoModal');
  if (modal) modal.classList.remove('active');
}

// ==========================================================================
// FLOATING AI CHAT ASSISTANT
// ==========================================================================
const aiChatState = {
  isOpen: false,
  history: [],
  isLoading: false
};

function safeEscapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

function toggleAiChat(forceOpen) {
  const chatWindow = document.getElementById('aiChatWindow');
  const userInput = document.getElementById('aiUserInput');
  if (!chatWindow) return;

  if (typeof forceOpen === 'boolean') {
    aiChatState.isOpen = forceOpen;
  } else {
    aiChatState.isOpen = !aiChatState.isOpen;
  }

  if (aiChatState.isOpen) {
    chatWindow.classList.remove('hidden');
    if (userInput) {
      setTimeout(() => userInput.focus(), 150);
    }
  } else {
    chatWindow.classList.add('hidden');
  }
}

function sendAiPrompt(promptText) {
  if (!promptText) return;
  const userInput = document.getElementById('aiUserInput');
  if (userInput) userInput.value = promptText;
  sendAiMessage(promptText);
}

function handleAiFormSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const userInput = document.getElementById('aiUserInput');
  const text = userInput ? userInput.value.trim() : '';
  if (text) {
    sendAiMessage(text);
  }
}

async function sendAiMessage(customText) {
  const userInput = document.getElementById('aiUserInput');
  const msgContainer = document.getElementById('aiMessagesContainer');
  const suggestionsWrap = document.getElementById('aiSuggestionsWrap');
  if (!msgContainer) return;

  const text = (customText || (userInput ? userInput.value : '')).trim();
  if (!text || aiChatState.isLoading) return;

  if (userInput) userInput.value = '';

  // Append user message
  appendAiBubble(text, 'user');

  // Hide suggestions after first prompt
  if (suggestionsWrap) {
    suggestionsWrap.style.display = 'none';
  }

  // Show typing indicator
  aiChatState.isLoading = true;
  const typingIndicator = createAiTypingIndicator();
  msgContainer.appendChild(typingIndicator);
  scrollAiChatToBottom();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: aiChatState.history
      })
    });

    const data = await res.json();
    typingIndicator.remove();
    aiChatState.isLoading = false;

    const reply = data.reply || "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.";
    appendAiBubble(reply, 'bot');

    aiChatState.history.push({ role: 'user', content: text });
    aiChatState.history.push({ role: 'model', content: reply });
  } catch (err) {
    console.error('AI chat error:', err);
    typingIndicator.remove();
    aiChatState.isLoading = false;
    appendAiBubble("Kechirasiz, aloqada uzilish yuz berdi. Do'konimiz raqamiga to'g'ridan-to'g'ri qo'ng'iroq qilishingiz mumkin: +998 90 123 45 67", 'bot');
  }
}

function formatAiText(text) {
  if (!text) return '';
  // Convert markdown bold **text** to <strong>text</strong>
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert bullet points
  formatted = formatted.replace(/^\*\s+(.*)$/gm, '• $1');
  return formatted;
}

function appendAiBubble(text, sender) {
  const container = document.getElementById('aiMessagesContainer');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = `ai-msg ai-msg-${sender}`;

  if (sender === 'bot') {
    bubble.innerHTML = `
      <div class="ai-bot-avatar">🤖</div>
      <div class="ai-msg-bubble"><p>${formatAiText(text)}</p></div>
    `;
  } else {
    bubble.innerHTML = `
      <div class="ai-msg-bubble"><p>${safeEscapeHtml(text)}</p></div>
    `;
  }

  container.appendChild(bubble);
  scrollAiChatToBottom();
}

function createAiTypingIndicator() {
  const ind = document.createElement('div');
  ind.className = 'ai-msg ai-msg-bot';
  ind.id = 'aiTypingIndicator';
  ind.innerHTML = `
    <div class="ai-bot-avatar">🤖</div>
    <div class="ai-typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
  return ind;
}

function scrollAiChatToBottom() {
  const container = document.getElementById('aiMessagesContainer');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// Global exports
window.toggleAiChat = toggleAiChat;
window.sendAiPrompt = sendAiPrompt;
window.handleAiFormSubmit = handleAiFormSubmit;
window.sendAiMessage = sendAiMessage;


