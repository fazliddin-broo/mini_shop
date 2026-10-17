// ==========================================================================
// BLACK STORE — MAHSULOTLAR VA TARJIMALAR BAZASI (DATA & I18N)
// ==========================================================================

const CATEGORIES = [
  { id: 'all', name_uz: 'Barchasi', name_ru: 'Все', name_en: 'All', icon: 'grid', count: 35 },
  { id: 'telefon-planshetlar', name_uz: 'Telefon va planshetlar', name_ru: 'Телефоны и планшеты', name_en: 'Phones & Tablets', icon: 'tablet', count: 12 },
  { id: 'telefon-aksessuar', name_uz: 'Telefon aksessuarlari', name_ru: 'Аксессуары для телефонов', name_en: 'Phone Accessories', icon: 'casePhone', count: 14 },
  { id: 'naushniki-quloqchinlar', name_uz: 'Quloqchinlar va naushniklar', name_ru: 'Наушники и гарнитуры', name_en: 'Headphones & Audio', icon: 'headphones', count: 8 },
  { id: 'smart-watch-fitnes', name_uz: 'Aqlli soatlar va fitnes', name_ru: 'Умные часы и фитнес', name_en: 'Smart Watches & Fitness', icon: 'watch', count: 6 },
  { id: 'zaryadka-kabel', name_uz: 'Zaryadlovchi va kabellar', name_ru: 'Зарядные устройства и кабели', name_en: 'Chargers & Cables', icon: 'plug', count: 7 },
  { id: 'powerbanklar', name_uz: 'Powerbanklar', name_ru: 'Повербанки', name_en: 'Power Banks', icon: 'battery', count: 6 },
  { id: 'kolonki-audio', name_uz: 'Karnaylar va audio', name_ru: 'Колонки и аудио', name_en: 'Speakers & Audio', icon: 'headphones', count: 0 },
  { id: 'blogger-jihozlar', name_uz: 'Blogerlar jihozlari', name_ru: 'Оборудование для блогеров', name_en: 'Creator Gear', icon: 'grid', count: 0 },
  { id: 'kompyuter-aksessuar', name_uz: 'Playstation va Kompyuter aksessuarlari', name_ru: 'PlayStation и компьютерные аксессуары', name_en: 'PC & PlayStation Accessories', icon: 'grid', count: 0 },
  { id: 'smart-texnika', name_uz: 'Smart qurilmalar va uy texnikasi', name_ru: 'Умные устройства и бытовая техника', name_en: 'Smart Home', icon: 'plug', count: 0 },
  { id: 'gozellik-avto', name_uz: "Go'zallik, avto va boshqalar", name_ru: 'Красота, авто и другое', name_en: 'Beauty, Auto & More', icon: 'grid', count: 0 },
  { id: 'holderlar-va-smart-parfyumlar', name_uz: 'Holderlar va Smart Parfyumlar', name_ru: 'Держатели и смарт-парфюмы', name_en: 'Holders & Smart Perfumes', icon: 'casePhone', count: 0 },
  { id: 'sumkalar', name_uz: 'Sumkalar va chexollar', name_ru: 'Сумки и чехлы', name_en: 'Bags & Cases', icon: 'casePhone', count: 0 }
];

const BRANDS = [
  { id: 'Apple', name: 'Apple', logo: 'images/brands/apple.png' },
  { id: 'BlackStore', name: 'BlackStore', logo: 'images/logo.png' },
  { id: 'Samsung', name: 'Samsung', logo: 'images/brands/samsung.png' },
  { id: 'WHOOP', name: 'WHOOP', logo: 'images/brands/whoop.png' },
  { id: 'Ray-Ban', name: 'Ray-Ban', logo: 'images/brands/meta.png' },
  { id: 'Google', name: 'Google', logo: 'images/brands/google.png' },
  { id: 'Canon', name: 'Canon', logo: 'images/brands/canon.png' }
];

// Bannerlar — Screenshot 2 dagi Applebox uslubida
const BANNERS = [
  {
    id: 10,
    title_uz: 'Apple mahsulotlari',
    title_ru: 'Продукция Apple',
    title_en: 'Apple Products',
    subtitle_uz: 'Applening eng sifatli mahsulotlarini bizdan harid qiling!',
    subtitle_ru: 'Покупайте самую качественную оригинальную технику Apple у нас!',
    subtitle_en: 'Shop premium authentic Apple ecosystem devices with official warranty!',
    cta_uz: "Ko'rish",
    cta_ru: 'Смотреть',
    cta_en: 'View Collection',
    brand_filter: 'Apple',
    category_filter: 'all',
    badge_uz: '100% Original · Apple Ekosistema',
    badge_ru: '100% Оригинал · Экосистема Apple',
    badge_en: '100% Authentic · Apple Ecosystem',
    bg_style: 'linear-gradient(90deg, rgba(8, 8, 10, 0.95) 0%, rgba(18, 18, 22, 0.7) 45%, rgba(0, 0, 0, 0.3) 100%)',
    image: 'images/banner_apple_ecosystem.png',
    image_ru: 'images/banner_apple_ecosystem_ru.png',
    mobile_image: 'images/banner_mobile_applebox.png',
    mobile_image_ru: 'images/banner_mobile_applebox_ru.png',
    features: ['iPhone 16 Pro Max', 'AirPods Max', 'Apple Watch Ultra', 'MagSafe Ecosystem'],
    is_graphic: true
  },
  {
    id: 11,
    title_uz: 'Smartfoningiz uchun premium himoya va quvvat!',
    title_ru: 'Премиум защита и зарядка для смартфона!',
    title_en: 'Premium Protection & Fast Power for Smartphones!',
    subtitle_uz: "Yuqori sifatli chexollar, zamonaviy simsiz quloqchinlar va kuchli powerbanklar to'plami. Qurilmangizga eng yaxshisini sovg'a qiling.",
    subtitle_ru: 'Коллекция качественных чехлов, наушников и мощных повербанков.',
    subtitle_en: 'High-end protective cases, wireless audio, and ultra-fast magnetic charging.',
    cta_uz: "To'plamni ko'rish",
    cta_ru: 'Посмотреть всё',
    cta_en: 'Discover Now',
    category_filter: 'telefon-aksessuar',
    badge_uz: 'Silicone Case · MagSafe · Carbon Fiber',
    badge_ru: 'Silicone Case · MagSafe · Carbon Fiber',
    badge_en: 'Silicone Case · MagSafe · Carbon Fiber',
    bg_style: 'linear-gradient(90deg, rgba(8, 8, 10, 0.95) 0%, rgba(20, 20, 24, 0.75) 45%, rgba(0, 0, 0, 0.35) 100%)',
    image: 'images/banner_cases_protection.png',
    image_ru: 'images/banner_cases_protection_ru.png',
    features: ['Shockproof Cases', 'MagSafe Wireless', 'Ultra-Durable Glass', 'Fast Power'],
    is_graphic: true
  },
  {
    id: 1,
    title_uz: 'AirPods Killer – Premium ANC Earbuds',
    title_ru: 'AirPods Killer – Премиум ANC Наушники',
    title_en: 'AirPods Killer – Premium ANC Earbuds',
    subtitle_uz: '50 dB ANC, Hi-Res Audio, LDAC, 43 soatgacha batareya va ChatGPT integratsiyasiga ega premium simsiz quloqchin.',
    subtitle_ru: '50 дБ ANC, Hi-Res Audio, LDAC, до 43 часов автономности и интеграция с ChatGPT.',
    subtitle_en: '50 dB Active Noise Cancelling, Hi-Res Audio, 43 hours battery life & AI integration.',
    cta_uz: 'Ketdik',
    cta_ru: 'Купить сейчас',
    cta_en: 'Buy Now',
    category_filter: 'naushniki-quloqchinlar',
    badge_uz: 'Hi-Res Audio · LDAC',
    badge_ru: 'Hi-Res Audio · LDAC',
    badge_en: 'Hi-Res Audio · LDAC',
    bg_style: 'linear-gradient(90deg, rgba(8, 8, 10, 0.96) 0%, rgba(18, 18, 22, 0.88) 50%, rgba(0, 0, 0, 0.45) 100%)',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000&auto=format&fit=crop&q=80',
    features: ['43 HOURS of total playback', 'CUSTOMISABLE SMART DIAL', '50 dB Hybrid ANC', 'SPATIAL AUDIO EFFECT', 'CHATGPT INTEGRATED']
  },
  {
    id: 2,
    title_uz: 'Smart Watch M99 & H100 – 4G SIM & Kamera',
    title_ru: 'Smart Watch M99 & H100 – 4G SIM и Камера',
    title_en: 'Smart Watch M99 & H100 – 4G SIM & Camera',
    subtitle_uz: 'Bilakdagi to\'laqonli Android mini-smartfon: 4G qo\'ng\'iroqlar, 190° aylanuvchi kamera va AMOLED displey.',
    subtitle_ru: 'Полноценный Android мини-смартфон на руке: звонки 4G, поворотная камера 190° и AMOLED дисплей.',
    subtitle_en: 'Full standalone wrist mini-smartphone with 4G calls, 190° rotating camera and AMOLED display.',
    cta_uz: 'Hoziroq xarid qilish',
    cta_ru: 'Купить сейчас',
    cta_en: 'Order Now',
    category_filter: 'smart-watch-fitnes',
    badge_uz: '4G Nano-SIM · 190° Kamera',
    badge_ru: '4G Nano-SIM · Камера 190°',
    badge_en: '4G Nano-SIM · 190° Camera',
    bg_style: 'linear-gradient(90deg, rgba(8, 8, 10, 0.96) 0%, rgba(22, 22, 28, 0.88) 50%, rgba(245, 158, 11, 0.3) 100%)',
    image: 'https://api.applebox.uz/images/products/3ea4b929d84849019a931ff546d9cbe8.png',
    features: ['190° Rotating HD Camera', 'Google Play & Telegram', 'AMOLED 2.02" Display', 'Super Fast 4G LTE']
  },
  {
    id: 3,
    title_uz: 'Baseus 100W GaN Pro & MagSafe Power',
    title_ru: 'Baseus 100W GaN Pro и MagSafe Повербанк',
    title_en: 'Baseus 100W GaN Pro & MagSafe Charging',
    subtitle_uz: 'MacBook, iPad va iPhone uchun ultra-tezkor zaryadlash stansiyalari va yupqa magnitli powerbanklar.',
    subtitle_ru: 'Ультрабыстрые зарядные станции и тонкие магнитные повербанки для MacBook, iPad и iPhone.',
    subtitle_en: 'Ultra-fast charging stations and magnetic slim packs for MacBook, iPad, and iPhone.',
    cta_uz: 'Katalogga o\'tish',
    cta_ru: 'В каталог',
    cta_en: 'Go to Catalog',
    category_filter: 'zaryadka-kabel',
    badge_uz: '100W GaN5 · MagSafe 15W',
    badge_ru: '100W GaN5 · MagSafe 15W',
    badge_en: '100W GaN5 · MagSafe 15W',
    bg_style: 'linear-gradient(90deg, rgba(8, 8, 10, 0.96) 0%, rgba(18, 18, 22, 0.88) 50%, rgba(0, 0, 0, 0.5) 100%)',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1000&auto=format&fit=crop&q=80',
    features: ['100W Power Delivery', 'Multi-Device Fast Charge', 'GaN5 Pro Technology', 'Safe Temperature Shield']
  }
];

// O'zbekcha va Ruscha to'liq tarjimalar lug'ati (100% Complete Bilingual Dictionary)
const I18N = {
  uz: {
    // Header & Subnav
    searchPlaceholder: "Mahsulot qidirish...",
    categories: "Kategoriyalar",
    brands: "Brendlar",
    seeAll: "Hammasini ko'rish",
    login: "Kirish",
    all: "Barchasi",
    allProducts: "Barcha mahsulotlar",
    totalCount: "Jami",
    productsAvailable: "ta mahsulot mavjud",
    productsUnit: "ta mahsulot",
    filterBtn: "Filtr",
    filterTitle: "Filtr",
    filterCategories: "KATEGORIYALAR",
    filterBrands: "BRENDLAR",
    applyFilter: "Qo'llash",
    resetFilter: "Tozalash",
    sort: "Saralash:",
    sortPopular: "Ommabopligi bo'yicha",
    sortPriceAsc: "Narxi: Arzondan qimmatga",
    sortPriceDesc: "Narxi: Qimmatdan arzonga",
    sortRating: "Yuqori reytingli",

    // Mahsulot kartasi va harakatlar
    addToCart: "Savatga",
    addToCartFull: "Savatga qo'shish",
    inCart: "Savatda",
    quickView: "Tezkor ko'rish",
    wishlistAdd: "Sevimlilarga qo'shish",
    wishlistRemove: "Sevimlilardan o'chirish",
    wishlistEmpty: "Sevimlilar ro'yxatingiz bo'sh",

    // Afzalliklar (Trust strip - Instagram bio asosida)
    trust1Title: "Eng arzon narxlar",
    trust1Desc: "Apple mahsulotlari eng arzon narxlarda",
    trust2Title: "1 Yilgacha kafolat",
    trust2Desc: "Rasmiy servis xizmati",
    trust3Title: "Tezkor yetkazish",
    trust3Desc: "Toshkent va viloyatlar bo'ylab",
    trust4Title: "Malika B-blok 1",
    trust4Desc: "Toshkent sh., Malika savdo markazi",

    // Stories (Instagram Highlights)
    storyPrices: "Narxlar",
    storyCases: "Silicone Case",
    storyGoods: "Tovarlar",
    storyReviews: "Mijozlar",
    storyContact: "Bog'lanish",

    // Hafta chegirmalari (Uzum / Applebox Horizontal Carousel)
    weeklyDealsTitle: "Hafta chegirmalari",
    weeklyDealsSubtitle: "Eng arzon narxlar va maxsus chegirmalar",

    // Qidiruv va bo'sh holatlar
    emptyTitle: "Hech qanday mahsulot topilmadi",
    emptyDesc: "Qidiruv so'zini o'zgartirib ko'ring yoki boshqa toifani tanlang.",
    viewAllBtn: "Barcha mahsulotlarni ko'rish",

    // Savat oynasi (Cart drawer)
    cartTitle: "Savatingiz",
    cartEmptyTitle: "Savatingiz bo'sh",
    cartEmptyDesc: "Katalogdan o'zingizga yoqqan gadjetlarni tanlang.",
    startShopping: "Xarid qilishni boshlash",
    promoPlaceholder: "Promo-kod (BLACK10)",
    apply: "Qo'llash",
    totalSum: "Jami hisob:",
    checkout: "Rasmiylashtirish",
    color: "Rang:",
    availColors: "Mavjud ranglar:",
    buyNow: "Hoziroq xarid qilish",

    // Buyurtma berish modali (Checkout modal)
    checkoutTitle: "Buyurtmani rasmiylashtirish",
    checkoutSubtitle: "Ma'lumotlaringizni to'ldiring, kuryerimiz tez orada siz bilan bog'lanadi.",
    fullName: "To'liq ismingiz",
    namePlaceholder: "Masalan: Fazliddin Tursunov",
    phoneNumber: "Telefon raqamingiz",
    deliveryAddress: "Yetkazib berish manzili",
    addressPlaceholder: "Shahar, tuman, ko'cha, uy raqami",
    paymentMethod: "To'lov usulini tanlang",
    cashDelivery: "Naqd",
    totalPayment: "Jami to'lov:",
    confirmOrder: "Buyurtmani tasdiqlash",
    orderSuccessTitle: "Buyurtmangiz qabul qilindi!",
    orderSuccessDesc: "Rahmat, menejerimiz tez orada siz bilan bog'lanadi.",
    orderCode: "Buyurtma kodi:",
    orderPaymentMethod: "To'lov usuli:",
    orderAddress: "Manzil:",
    orderItemsCount: "Mahsulotlar soni:",
    backToHome: "Bosh sahifaga qaytish",
    selectProductFirst: "Buyurtma berish uchun avval mahsulot tanlang",

    // Brendlar modali
    brandsTitle: "Brendlar",

    // Footer
    footerAbout: "BlackStore.uz — Apple mahsulotlari eng arzon narxlarda! 1 yilgacha rasmiy kafolat, tezkor yetkazib berish va sifatli xizmat ko'rsatish.",
    footerCategories: "Kategoriyalar",
    footerClients: "Mijozlar uchun",
    footerContact: "Aloqa va Manzil",
    footerHours: "Ish vaqti: 09:00 - 22:00 (dam olish kunlarisiz)",
    footerRights: "© 2026 BlackStore.uz. Barcha huquqlar himoyalangan.",
    footerTagline: "Malika B-blok 1-do'kon · +998 (95) 196-44-44",

    // Footer link matnlari
    linkPromotions: "Aksiyalar va chegirmalar",
    linkDelivery: "Yetkazib berish shartlari",
    linkWarranty: "Kafolat va qaytarish",
    linkPayment: "To'lov usullari",

    // Mobil pastki navigatsiya (IMG_2191 / Image 2: Bosh sahifa, Kategoriyalar, Savat, Sevimlilar, Profil)
    navHome: "Bosh sahifa",
    navCategories: "Kategoriyalar",
    navCart: "Savat",
    navWishlist: "Sevimlilar",
    navProfile: "Profil"
  },

  ru: {
    // Header & Subnav
    searchPlaceholder: "Поиск товаров...",
    categories: "Категории",
    brands: "Бренды",
    seeAll: "Посмотреть все",
    login: "Войти",
    all: "Все",
    allProducts: "Все товары",
    totalCount: "Всего",
    productsAvailable: "товаров",
    productsUnit: "товаров",
    filterBtn: "Фильтр",
    filterTitle: "Фильтр",
    filterCategories: "КАТЕГОРИИ",
    filterBrands: "БРЕНДЫ",
    applyFilter: "Применить",
    resetFilter: "Сбросить",
    sort: "Сортировка:",
    sortPopular: "По популярности",
    sortPriceAsc: "Цена: Сначала дешевые",
    sortPriceDesc: "Цена: Сначала дорогие",
    sortRating: "С высоким рейтингом",

    // Mahsulot kartasi va harakatlar
    addToCart: "В корзину",
    addToCartFull: "В корзину",
    inCart: "В корзине",
    quickView: "Быстрый просмотр",
    wishlistAdd: "В избранное",
    wishlistRemove: "Удалить из избранного",
    wishlistEmpty: "Список избранного пуст",

    // Afzalliklar (Trust strip - по био Instagram)
    trust1Title: "Самые низкие цены",
    trust1Desc: "Apple по выгодным ценам",
    trust2Title: "1 Год гарантии",
    trust2Desc: "Официальный гарантийный сервис",
    trust3Title: "Быстрая доставка",
    trust3Desc: "По Ташкенту и всему Узбекистану",
    trust4Title: "Малика B-блок 1",
    trust4Desc: "г. Ташкент, ТЦ Малика, магазин 1",

    // Stories (Instagram Highlights)
    storyPrices: "Цены",
    storyCases: "Silicone Case",
    storyGoods: "Товары",
    storyReviews: "Отзывы",
    storyContact: "Контакты",

    // Hafta chegirmalari (Uzum / Applebox Horizontal Carousel)
    weeklyDealsTitle: "Скидки недели",
    weeklyDealsSubtitle: "Лучшие цены со скидкой и выгодные предложения",

    // Qidiruv va bo'sh holatlar
    emptyTitle: "Ничего не найдено",
    emptyDesc: "Попробуйте изменить поисковый запрос или выберите другую категорию.",
    viewAllBtn: "Посмотреть все товары",

    // Savat oynasi (Cart drawer)
    cartTitle: "Ваша корзина",
    cartEmptyTitle: "Ваша корзина пуста",
    cartEmptyDesc: "Выберите нужные девайсы в каталоге товаров.",
    startShopping: "Начать покупки",
    promoPlaceholder: "Промокод (BLACK10)",
    apply: "Применить",
    totalSum: "Итого:",
    checkout: "Оформить заказ",
    color: "Цвет:",
    availColors: "Доступные цвета:",
    buyNow: "Купить сейчас",

    // Buyurtma berish modali (Checkout modal)
    checkoutTitle: "Оформление заказа",
    checkoutSubtitle: "Заполните контактные данные, наш менеджер свяжется с вами в ближайшее время.",
    fullName: "Ваше полное имя",
    namePlaceholder: "Например: Фазлиддин Турсунов",
    phoneNumber: "Номер телефона",
    deliveryAddress: "Адрес доставки",
    addressPlaceholder: "Город, район, улица, дом, квартира",
    paymentMethod: "Выберите способ оплаты",
    cashDelivery: "Наличные",
    totalPayment: "Итого к оплате:",
    confirmOrder: "Подтвердить заказ",
    orderSuccessTitle: "Ваш заказ принят!",
    orderSuccessDesc: "Спасибо, наш менеджер свяжется с вами в ближайшее время.",
    orderCode: "Код заказа:",
    orderPaymentMethod: "Способ оплаты:",
    orderAddress: "Адрес:",
    orderItemsCount: "Количество товаров:",
    backToHome: "Вернуться на главную",
    selectProductFirst: "Для оформления заказа сначала выберите товары",

    // Brendlar modali
    brandsTitle: "Бренды",

    // Footer
    footerAbout: "BlackStore.uz — продукция Apple по самым низким ценам! Официальная гарантия до 1 года, оперативная доставка и первоклассный сервис.",
    footerCategories: "Категории",
    footerClients: "Для клиентов",
    footerContact: "Контакты и Адрес",
    footerHours: "Время работы: 09:00 - 22:00 (без выходных)",
    footerRights: "© 2026 BlackStore.uz. Все права защищены.",
    footerTagline: "Малика B-блок 1-магазин · +998 (95) 196-44-44",

    // Footer link matnlari
    linkPromotions: "Акции и скидки",
    linkDelivery: "Условия доставки",
    linkWarranty: "Гарантия и возврат",
    linkPayment: "Способы оплаты",

    // Mobil pastki navigatsiya (IMG_2191 / Image 2: Главная, Категории, Корзина, Избранное, Профиль)
    navHome: "Главная",
    navCategories: "Категории",
    navCart: "Корзина",
    navWishlist: "Избранное",
    navProfile: "Профиль"
  },

  en: {
    // Header & Subnav
    searchPlaceholder: "Search products...",
    categories: "Categories",
    brands: "Brands",
    seeAll: "View all",
    login: "Sign In",
    all: "All",
    allProducts: "All products",
    totalCount: "Total",
    productsAvailable: "products available",
    productsUnit: "products",
    filterBtn: "Filter",
    filterTitle: "Filter",
    filterCategories: "CATEGORIES",
    filterBrands: "BRANDS",
    inStock: "IN STOCK",
    applyFilter: "Apply",
    resetFilter: "Clear",
    sort: "Sort by:",
    sortPopular: "Most Popular",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortRating: "Top Rated",

    // Product Card & Actions
    addToCart: "Add to cart",
    addToCartFull: "Add to Cart",
    inCart: "In Cart",
    quickView: "Quick View",
    wishlistAdd: "Add to Wishlist",
    wishlistRemove: "Remove from Wishlist",
    wishlistEmpty: "Your wishlist is empty",

    // Trust strip
    trust1Title: "Best Prices",
    trust1Desc: "Apple products at lowest prices",
    trust2Title: "Up to 1 Year Warranty",
    trust2Desc: "Official service support",
    trust3Title: "Fast Delivery",
    trust3Desc: "Across Tashkent and regions",
    trust4Title: "Malika B-Block 1",
    trust4Desc: "Tashkent, Malika shopping mall",

    // Stories
    storyPrices: "Prices",
    storyCases: "Silicone Case",
    storyGoods: "Goods",
    storyReviews: "Reviews",
    storyContact: "Contact",

    // Hafta chegirmalari (Uzum / Applebox Horizontal Carousel)
    weeklyDealsTitle: "Weekly Discounts",
    weeklyDealsSubtitle: "Top-rated deals and best discounted prices",

    // Empty states
    emptyTitle: "No products found",
    emptyDesc: "Try a different search term or select another category.",
    viewAllBtn: "View all products",

    // Cart
    cartTitle: "Your Cart",
    cartEmptyTitle: "Your cart is empty",
    cartEmptyDesc: "Browse the catalog to add devices and accessories.",
    startShopping: "Start Shopping",
    promoPlaceholder: "Promo code (BLACK10)",
    apply: "Apply",
    totalSum: "Total amount:",
    checkout: "Proceed to Checkout",
    color: "Color:",
    availColors: "Available colors:",
    buyNow: "Buy Now",

    // Checkout Modal
    checkoutTitle: "Complete Order",
    checkoutSubtitle: "Fill in your details and our courier will contact you shortly.",
    fullName: "Full Name",
    namePlaceholder: "e.g., John Doe",
    phoneNumber: "Phone Number",
    deliveryAddress: "Delivery Address",
    addressPlaceholder: "City, district, street, apt / house number",
    paymentMethod: "Select Payment Method",
    cashDelivery: "Cash on delivery",
    totalPayment: "Total to pay:",
    confirmOrder: "Confirm Order",
    orderSuccessTitle: "Order Received!",
    orderSuccessDesc: "Thank you! Our manager will contact you shortly.",
    orderCode: "Order Code:",
    orderPaymentMethod: "Payment Method:",
    orderAddress: "Address:",
    orderItemsCount: "Items Count:",
    backToHome: "Back to Home",
    selectProductFirst: "Please select a product first",

    // Brands Modal
    brandsTitle: "Brands",

    // Footer
    footerAbout: "BlackStore.uz — Apple devices and accessories at the lowest prices! Official warranty up to 1 year, express delivery and premium service.",
    footerCategories: "Categories",
    footerClients: "For Customers",
    footerContact: "Contact & Location",
    footerHours: "Working hours: 09:00 - 22:00 (every day)",
    footerRights: "© 2026 BlackStore.uz. All rights reserved.",
    footerTagline: "Malika B-Block Store #1 · +998 (95) 196-44-44",

    // Footer Links
    linkPromotions: "Promotions & Discounts",
    linkDelivery: "Delivery Terms",
    linkWarranty: "Warranty & Return",
    linkPayment: "Payment Methods",

    // Mobile Bottom Nav
    navHome: "Home",
    navCategories: "Categories",
    navCart: "Cart",
    navWishlist: "Wishlist",
    navProfile: "Profile"
  }
};

// 6 ta rasmiy brend bo'yicha mahsulotlar to'plami (Apple, Samsung, WHOOP, Ray-Ban, Google, Canon)
const DEMO_PRODUCTS = [
  // --- APPLE ---
  {
    id: 100,
    name_uz: 'Apple iPhone 15 Pro 128GB Natural Titanium | 100% Original',
    name_ru: 'Apple iPhone 15 Pro 128GB Натуральный титан | 100% Оригинал',
    category: 'telefon-planshetlar',
    brand: 'Apple',
    price: 13990000,
    old_price: 15200000,
    discount_percent: 8,
    priceUsd: 1099,
    rating: 5.0,
    reviews_count: 142,
    badge_uz: 'Top Flagman',
    badge_ru: 'Флагман',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'images/iphone-15-pro-natural-titanium.png',
    images: ['images/iphone-15-pro-natural-titanium.png'],
    colors: ['Natural Titanium', 'Black Titanium', 'White Titanium', 'Blue Titanium'],
    specs_uz: {
      'Protsessor': 'Apple A17 Pro (3 nm) 6 yadroli GPU',
      'Ekran': '6.1" Super Retina XDR OLED, 120Hz ProMotion, Dynamic Island',
      'Xotira': '128 GB / 256 GB NVMe',
      'Kamera': '48 MP asosiy (f/1.78) + 12 MP ultra-keng + 12 MP 3x telefoto',
      'Korpus': 'Aerokosmik sinfdagi titan ramka (Grade 5 Titanium)',
      'Ulagich': 'USB Type-C (USB 3 - 10 Gbit/s gacha)'
    },
    specs_ru: {
      'Процессор': 'Apple A17 Pro (3 нм) с 6-ядерным GPU',
      'Экран': '6.1" Super Retina XDR OLED, 120Гц ProMotion, Dynamic Island',
      'Память': '128 ГБ / 256 ГБ NVMe',
      'Камера': '48 МП основная (f/1.78) + 12 МП ультраширокая + 12 МП 3x телефото',
      'Корпус': 'Аэрокосмический титан (Grade 5 Titanium)',
      'Разъем': 'USB Type-C (USB 3 - до 10 Гбит/с)'
    },
    description_uz: 'Apple iPhone 15 Pro Natural Titanium — aerokosmik titan korpus, eng kuchli A17 Pro chipi, 48 MP professional kamera tizimi va yangi dasturlanuvchi Action Button bilan jihozlangan flagman smartfon.',
    description_ru: 'Apple iPhone 15 Pro Натуральный титан — премиальный флагманский смартфон в легком титановом корпусе с мощнейшим процессором A17 Pro, передовой 48 МП камерой и кнопкой Action Button.'
  },
  {
    id: 101,
    name_uz: 'Apple EarPods Type-C simli quloqchin | 100% Original',
    name_ru: 'Apple EarPods Type-C проводные наушники | 100% Оригинал',
    category: 'naushniki-quloqchinlar',
    brand: 'Apple',
    price: 379000,
    old_price: 450000,
    discount_percent: 16,
    rating: 4.9,
    reviews_count: 128,
    badge_uz: 'Original',
    badge_ru: 'Оригинал',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80'],
    colors: ['Oq'],
    specs_uz: {
      'Ulagich': 'USB Type-C',
      'Mikrofon': 'Ovoz va qo\'ng\'iroq boshqaruv pulti',
      'Moslik': 'iPhone 15/16, iPad, Mac'
    },
    specs_ru: {
      'Разъем': 'USB Type-C',
      'Микрофон': 'Пульт управления громкостью и вызовами',
      'Совместимость': 'iPhone 15/16, iPad, Mac'
    },
    description_uz: 'Apple sertifikatlangan Type-C ulagichli original EarPods quloqchini. Yuqori sifatli tiniq ovoz va chuqur bas.',
    description_ru: 'Оригинальные проводные наушники Apple с разъемом Type-C для новейших iPhone 15/16, iPad и компьютеров Mac.'
  },
  {
    id: 102,
    name_uz: 'Apple TYPE-C Power Adapter 20W (3-Pin / 2-Pin) | 100% Original',
    name_ru: 'Apple TYPE-C Power Adapter 20W | 100% Оригинал',
    category: 'zaryadka-kabel',
    brand: 'Apple',
    price: 299000,
    old_price: 360000,
    discount_percent: 17,
    rating: 5.0,
    reviews_count: 245,
    badge_uz: '20W Fast',
    badge_ru: '20W Быстрая',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80'],
    colors: ['Oq'],
    specs_uz: {
      'Quvvat': '20W Power Delivery',
      'Port': '1x USB Type-C',
      'Standart': 'Britaniya / Yevropa standarti'
    },
    specs_ru: {
      'Мощность': '20W Power Delivery',
      'Порт': '1x USB Type-C',
      'Стандарт': 'Британский / Европейский стандарт'
    },
    description_uz: 'Apple original 20W tezkor zaryadlash adapteri. iPhone 8 dan to iPhone 16 Pro Max gacha tezkor va xavfsiz quvvatlaydi.',
    description_ru: 'Оригинальный адаптер питания Apple 20W USB-C обеспечивает быструю и эффективную зарядку дома и в дороге.'
  },
  {
    id: 103,
    name_uz: 'AirPods Pro / Pro 2 Silikon Quloq Yostiqchalari | 3 O\'lchamli to\'plam (S, M, L)',
    name_ru: 'AirPods Pro / Pro 2 Силиконовые амбушюры | Набор 3 размера (S, M, L)',
    category: 'telefon-aksessuar',
    brand: 'Apple',
    price: 35000,
    old_price: 50000,
    discount_percent: 30,
    rating: 4.8,
    reviews_count: 88,
    badge_uz: '3 Juft',
    badge_ru: '3 Пары',
    badge_type: 'rec',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&auto=format&fit=crop&q=80'],
    colors: ['Oq'],
    specs_uz: {
      'Material': 'Gipoallergen elastik silikon',
      'To\'plam': 'S, M, L o\'lchamlari'
    },
    specs_ru: {
      'Материал': 'Гипоаллергенный мягкий силикон',
      'Комплект': 'Размеры S, M, L'
    },
    description_uz: 'AirPods Pro va Pro 2 uchun yumshoq, quloqqa qulay o\'tiruvchi silikon yostiqchalar komplekti.',
    description_ru: 'Качественные сменные амбушюры для AirPods Pro / Pro 2, надежно фиксируются и улучшают шумоизоляцию.'
  },
  {
    id: 120,
    name_uz: 'Apple iPhone 16 Pro / Pro Max Silicone Case MagSafe bilan',
    name_ru: 'Силиконовый чехол Apple Silicone Case с MagSafe для iPhone 16 Pro / Pro Max',
    category: 'telefon-aksessuar',
    brand: 'Apple',
    price: 320000,
    old_price: 390000,
    discount_percent: 18,
    rating: 4.9,
    reviews_count: 142,
    badge_uz: 'MagSafe · Original',
    badge_ru: 'MagSafe · Оригинал',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora (Black)', 'Denim Moviy', 'Plum Binafsha', 'Yulduzli Oq'],
    variant_note: 'Silicone Case / MagSafe',
    specs_uz: {
      'Mos kelishi': 'iPhone 16 Pro / 16 Pro Max',
      'Material': 'Soft-touch silikon va mikrofibra astar',
      'Funksiya': 'O\'rnatilgan MagSafe magnit halqasi'
    },
    specs_ru: {
      'Совместимость': 'iPhone 16 Pro / 16 Pro Max',
      'Материал': 'Soft-touch силикон с подкладкой из микрофибры',
      'Функция': 'Встроенные магниты MagSafe'
    },
    description_uz: 'Tashqi yuzasi ipakday mayin soft-touch silikon bilan qoplangan, ichki qismi esa iPhone korpusini ehtiyotkorona asrovchi mikrofibra astardan iborat. MagSafe zaryadlovchilar va aksessuarlarga bir zumda mustahkam ulanadi.',
    description_ru: 'Внешняя шелковистая поверхность soft-touch дарит приятные тактильные ощущения, а внутренняя подкладка из микрофибры защищает корпус iPhone. Идеально совместим со всеми аксессуарами MagSafe.'
  },
  {
    id: 121,
    name_uz: 'Apple iPhone 16 Pro Clear Case MagSafe Shaffof Zarbaga Chidamli Chexol',
    name_ru: 'Прозрачный чехол Apple Clear Case с MagSafe для iPhone 16 Pro',
    category: 'telefon-aksessuar',
    brand: 'Apple',
    price: 290000,
    old_price: 350000,
    discount_percent: 17,
    rating: 4.9,
    reviews_count: 98,
    badge_uz: 'Anti-Yellowing',
    badge_ru: 'Не желтеет',
    badge_type: 'rec',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=700&auto=format&fit=crop&q=80'],
    colors: ['Kristall Shaffof'],
    variant_note: 'Shaffof / Clear',
    specs_uz: {
      'Material': 'Optik tiniq polikarbonat va TPU',
      'Himoya': 'Zarbaga chidamli burchak himoyasi',
      'Xususiyat': 'Sarg\'ayishga qarshi maxsus qoplama'
    },
    specs_ru: {
      'Материал': 'Оптически прозрачный поликарбонат и TPU',
      'Защита': 'Усиленные ударопрочные углы',
      'Особенность': 'Покрытие против пожелтения'
    },
    description_uz: 'iPhone rangining asl jozibasini ko\'rsatib turuvchi tiniq shaffof g\'ilof. Maxsus qoplama tufayli vaqt o\'tishi bilan sarg\'aymaydi va tirnalishlardan ishonchli himoyalaydi.',
    description_ru: 'Прозрачный и тонкий чехол позволяет наслаждаться дизайном и цветом iPhone. Специальное покрытие предотвращает появление царапин и пожелтение со временем.'
  },
  {
    id: 122,
    name_uz: 'Pitaka Ultra-Slim Aramid Carbon Fiber Case iPhone 16 Pro Max',
    name_ru: 'Ультратонкий чехол Pitaka Aramid Carbon Fiber для iPhone 16 Pro Max',
    category: 'telefon-aksessuar',
    brand: 'Apple',
    price: 590000,
    old_price: 690000,
    discount_percent: 14,
    rating: 5.0,
    reviews_count: 67,
    badge_uz: 'Aramid 600D Carbon',
    badge_ru: 'Арамид 600D Карбон',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora / Kulrang Carbon'],
    variant_note: 'Qora / Carbon',
    specs_uz: {
      'Qalinligi': 'Atigi 0.95 mm ultra-yupqa',
      'Og\'irligi': '18 gramm',
      'Material': 'Haqiqiy 600D aerokosmik aramid tolasi'
    },
    specs_ru: {
      'Толщина': 'Всего 0.95 мм ультратонкий',
      'Вес': '18 грамм',
      'Материал': 'Аэрокосмическое арамидное волокно 600D'
    },
    description_uz: 'Po\'latdan 5 barobar mustahkam haqiqiy aramid uglerod tolasidan tayyorlangan premium darajadagi eng yupqa va yengil himoya g\'ilofi.',
    description_ru: 'Легендарный ультратонкий чехол из настоящего арамидного волокна 600D. В 5 раз прочнее стали при минимальной толщине.'
  },
  {
    id: 124,
    name_uz: 'iPhone uchun MagSafe Magnitli Simsiz Zaryadlovchi | 15W',
    name_ru: 'Магнитная беспроводная зарядка MagSafe для iPhone | 15W',
    category: 'zaryadka-kabel',
    brand: 'Apple',
    price: 99000,
    old_price: 150000,
    discount_percent: 34,
    rating: 4.8,
    reviews_count: 87,
    badge_uz: 'MagSafe 15W',
    badge_ru: 'MagSafe 15W',
    badge_type: 'hot',
    in_stock: true,
    variant_note: 'Normal',
    main_image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=700&auto=format&fit=crop&q=80'],
    colors: ['Oq (White)'],
    specs_uz: {
      'Quvvat': '15W Fast Wireless',
      'Ulagich': 'USB Type-C',
      'Moslik': 'iPhone 12/13/14/15/16 Pro Max'
    },
    specs_ru: {
      'Мощность': '15W Fast Wireless',
      'Разъем': 'USB Type-C',
      'Совместимость': 'iPhone 12/13/14/15/16 Pro Max'
    },
    description_uz: 'iPhone uchun xavfsiz va qulay MagSafe magnitli simsiz tezkor zaryadlovchi qurilma.',
    description_ru: 'Магнитная беспроводная зарядка MagSafe обеспечивает быстрое и удобное пополнение энергии.'
  },
  {
    id: 125,
    name_uz: 'Pitaka Case for iPhone 17 Pro Max | MagSafe Aramid Fiber',
    name_ru: 'Чехол Pitaka Case для iPhone 17 Pro Max | MagSafe Aramid Fiber',
    category: 'telefon-aksessuar',
    brand: 'Apple',
    price: 699000,
    old_price: 799000,
    discount_percent: 13,
    rating: 5.0,
    reviews_count: 42,
    badge_uz: 'Aramid 1500D',
    badge_ru: 'Арамид 1500D',
    badge_type: 'hot',
    in_stock: true,
    variant_note: 'qora',
    main_image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora (Black)'],
    specs_uz: {
      'Material': 'Aerokosmik aramid tolasi',
      'MagSafe': 'Kuchli magnit halqa o\'rnatilgan',
      'Vazni': 'Atigi 19 gramm'
    },
    specs_ru: {
      'Материал': 'Аэрокосмическое арамидное волокно',
      'MagSafe': 'Встроенное мощное магнитное кольцо',
      'Вес': 'Всего 19 грамм'
    },
    description_uz: 'Pitaka original aramid tolali yupqa va yuqori darajada mustahkam chexoli.',
    description_ru: 'Оригинальный премиум чехол Pitaka из арамидного волокна с поддержкой MagSafe.'
  },
  {
    id: 126,
    name_uz: 'Pitaka Sunset G\'ilofi iPhone Air uchun | Aramid tolali himoya',
    name_ru: 'Чехол Pitaka Sunset для iPhone Air | Арамидная защита',
    category: 'telefon-aksessuar',
    brand: 'Apple',
    price: 699000,
    old_price: 799000,
    discount_percent: 13,
    rating: 4.9,
    reviews_count: 36,
    badge_uz: 'Sunset Edition',
    badge_ru: 'Sunset Edition',
    badge_type: 'rec',
    in_stock: true,
    variant_note: 'Sunset (quyosh)',
    main_image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=700&auto=format&fit=crop&q=80'],
    colors: ['Sunset To\'q Sariq / Qora'],
    specs_uz: {
      'Dizayn': 'Sunset gradient to\'qimali naqsh',
      'Moslik': 'iPhone Air / 16 / 17',
      'Himoya': 'Kamera ramkasi bo\'rtma metall'
    },
    specs_ru: {
      'Дизайн': 'Градиентный узор Sunset',
      'Совместимость': 'iPhone Air / 16 / 17',
      'Защита': 'Металлическое обрамление камеры'
    },
    description_uz: 'Quyosh botishi aks etgan maxsus Sunset to\'qimali nafis aramid g\'ilof.',
    description_ru: 'Эксклюзивная серия Pitaka Sunset с градиентным плетением и титановым кольцом.'
  },
  {
    id: 127,
    name_uz: 'Metal Pure Frame Case | iPhone 13/14/15/16 Pro Max uchun',
    name_ru: 'Чехол Metal Pure Frame Case для iPhone 13/14/15/16 Pro Max',
    category: 'telefon-aksessuar',
    brand: 'Apple',
    price: 150000,
    old_price: 199000,
    discount_percent: 25,
    rating: 4.7,
    reviews_count: 59,
    badge_uz: 'Aluminiy Ramka',
    badge_ru: 'Алюминиевая рамка',
    badge_type: 'sale',
    in_stock: true,
    variant_note: 'Qizil / 15 pro max',
    main_image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qizil (Red)', 'Qora', 'Kumush'],
    specs_uz: {
      'Material': 'Aviatsiya aluminiy ramkasi',
      'Orqa qismi': 'Tiniq qattiq polikarbonat',
      'Moslik': 'iPhone 13/14/15/16 Pro Max'
    },
    specs_ru: {
      'Материал': 'Авиационный алюминий и поликарбонат',
      'Совместимость': 'iPhone 13/14/15/16 Pro Max'
    },
    description_uz: 'Mustahkam metall ramka va shaffof orqa panel uyg\'unligi.',
    description_ru: 'Стильный чехол с прочной алюминиевой рамкой и прозрачной задней панелью.'
  },
  {
    id: 128,
    name_uz: 'Battery Case 4500mAh for iPhone 12 Pro Max | Zaryadlovchi chexol',
    name_ru: 'Чехол-аккумулятор Battery Case 4500mAh для iPhone 12 Pro Max',
    category: 'telefon-aksessuar',
    brand: 'Apple',
    price: 279000,
    old_price: 349000,
    discount_percent: 20,
    rating: 4.6,
    reviews_count: 31,
    badge_uz: '4500mAh Power',
    badge_ru: '4500mAh Аккумулятор',
    badge_type: 'hot',
    in_stock: true,
    variant_note: 'Normal',
    main_image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora (Black)'],
    specs_uz: {
      'Sig\'im': '4500 mAh qo\'shimcha quvvat',
      'Himoya': 'Qisqa tutashuvdan ko\'p bosqichli himoya'
    },
    specs_ru: {
      'Емкость': '4500 мАч дополнительной энергии',
      'Защита': 'Многоуровневая защита от перегрузок'
    },
    description_uz: 'Kun bo\'yi qo\'shimcha quvvat ta\'minlovchi o\'rnatilgan batareyali g\'ilof.',
    description_ru: 'Надежный чехол со встроенным аккумулятором для длительной автономной работы.'
  },
  {
    id: 129,
    name_uz: 'Keephone Kevlar Norra Case | iPhone 17 Pro uchun | MagSafe',
    name_ru: 'Чехол Keephone Kevlar Norra для iPhone 17 Pro | MagSafe',
    category: 'telefon-aksessuar',
    brand: 'Apple',
    price: 380000,
    old_price: 450000,
    discount_percent: 16,
    rating: 4.8,
    reviews_count: 45,
    badge_uz: 'Kevlar Armor',
    badge_ru: 'Кевлар Броня',
    badge_type: 'rec',
    in_stock: true,
    variant_note: 'Normal',
    main_image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=700&auto=format&fit=crop&q=80'],
    colors: ['Kevlar Matt Qora'],
    specs_uz: {
      'Material': 'Dupont Kevlar sintetik tolasi',
      'MagSafe': 'Maksimal magnit kuchi'
    },
    specs_ru: {
      'Материал': 'Синтетическое волокно Dupont Kevlar',
      'MagSafe': 'Максимальная сила притяжения'
    },
    description_uz: 'Haqiqiy Dupont Kevlar tolasidan ishlangan zarbaga nihoyatda chidamli korpus.',
    description_ru: 'Ударопрочный чехол из оригинального кевлара с поддержкой MagSafe.'
  },
  {
    id: 130,
    name_uz: '7 Milliard Phone Case | iPhone 16 Pro Max uchun | Premium Matt',
    name_ru: 'Чехол 7 Milliard Phone Case для iPhone 16 Pro Max | Премиум матт',
    category: 'telefon-aksessuar',
    brand: 'Apple',
    price: 79000,
    old_price: 120000,
    discount_percent: 34,
    rating: 4.9,
    reviews_count: 112,
    badge_uz: 'Hamyonbop',
    badge_ru: 'Выгодный',
    badge_type: 'sale',
    in_stock: true,
    variant_note: 'Qora matt',
    main_image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora matt', 'To\'q Ko\'k', 'Binafsha'],
    specs_uz: {
      'Material': 'Matt soft-touch polimer',
      'Xususiyat': 'Barmoq izi qolmaydi'
    },
    specs_ru: {
      'Материал': 'Матовый полимер soft-touch',
      'Особенность': 'Не оставляет отпечатков'
    },
    description_uz: 'Qo\'lda sirpanmaydigan, yoqimli teginish hissini beruvchi zamonaviy matviy g\'ilof.',
    description_ru: 'Стильный матовый чехол с защитой от отпечатков и скольжения.'
  },
  {
    id: 131,
    name_uz: 'Pitaka Ultra Guard Sunset G\'ilofi iPhone 17 Pro uchun',
    name_ru: 'Чехол Pitaka Ultra Guard Sunset для iPhone 17 Pro',
    category: 'telefon-aksessuar',
    brand: 'Apple',
    price: 699000,
    old_price: 799000,
    discount_percent: 13,
    rating: 5.0,
    reviews_count: 28,
    badge_uz: 'Ultra Guard',
    badge_ru: 'Ultra Guard',
    badge_type: 'hot',
    in_stock: true,
    variant_note: 'Normal',
    main_image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=700&auto=format&fit=crop&q=80'],
    colors: ['Sunset / Carbon Black'],
    specs_uz: {
      'Himoya': 'Harbiy standartdagi MIL-STD zarba himoyasi',
      'Material': 'Aramid tolasi va zarba yutuvchi TPU ramka'
    },
    specs_ru: {
      'Защита': 'Военный стандарт противоударности MIL-STD',
      'Материал': 'Арамидное волокно и амортизирующий бампер'
    },
    description_uz: 'Pitaka kompaniyasining eng yuqori darajada himoya qiluvchi kuchaytirilgan g\'ilofi.',
    description_ru: 'Усиленная версия чехла Pitaka Ultra Guard для максимальной защиты устройства.'
  },
  {
    id: 123,
    name_uz: 'Samsung Galaxy S24 Ultra Standing Grip Silikon Chexol',
    name_ru: 'Чехол со встроенным ремешком Standing Grip для Samsung Galaxy S24 Ultra',
    category: 'telefon-aksessuar',
    brand: 'Samsung',
    price: 340000,
    old_price: 410000,
    discount_percent: 17,
    rating: 4.8,
    reviews_count: 53,
    badge_uz: 'Standing Grip',
    badge_ru: 'Подставка-ремешок',
    badge_type: 'rec',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=700&auto=format&fit=crop&q=80'],
    colors: ['To\'q Kulrang', 'Moviy Kulrang', 'Sariq'],
    specs_uz: {
      'Mos kelishi': 'Samsung Galaxy S24 Ultra',
      'Material': 'Premium matviy silikon',
      'Qo\'shimcha': 'Qulay sirg\'almas tasma va tayanch stend'
    },
    specs_ru: {
      'Совместимость': 'Samsung Galaxy S24 Ultra',
      'Материал': 'Премиальный матовый силикон',
      'Особенность': 'Удобный ремешок-подставка'
    },
    description_uz: 'Orqa qismidagi sirg\'alib chiquvchi maxsus tutqich-tasma telefonni bir qo\'lda ushlashni juda qulay qiladi va videolarni tomosha qilish uchun qulay stend vazifasini ham bajaradi.',
    description_ru: 'Удобный встроенный ремешок помогает надежно удерживать смартфон в руке или использовать его как устойчивую подставку.'
  },
  {
    id: 104,
    name_uz: 'Apple MagSafe Magnitli Simsiz Power Bank 15W Tezkor Quvvatlash',
    name_ru: 'Apple MagSafe Магнитный внешний аккумулятор 15W',
    category: 'zaryadka-kabel',
    brand: 'Apple',
    price: 420000,
    old_price: 520000,
    discount_percent: 19,
    rating: 4.9,
    reviews_count: 112,
    badge_uz: 'MagSafe',
    badge_ru: 'MagSafe',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=700&auto=format&fit=crop&q=80'],
    colors: ['Oq', 'Space Gray'],
    specs_uz: {
      'Texnologiya': 'MagSafe 15W simsiz',
      'Sig\'im': '10 000 mAh'
    },
    specs_ru: {
      'Технология': 'MagSafe 15W беспроводная',
      'Емкость': '10 000 мАч'
    },
    description_uz: 'iPhone orqasiga kuchli magnitlar orqali biriktiriladi va hech qanday simlarsiz tezkor quvvatlaydi.',
    description_ru: 'Компактный аккумулятор MagSafe легко крепится к iPhone одним щелчком и заряжает устройство на ходу.'
  },
  {
    id: 105,
    name_uz: 'Apple AirPods Pro 2 (USB-C) MagSafe Keys bilan',
    name_ru: 'Apple AirPods Pro 2 (USB-C) с кейсом MagSafe',
    category: 'naushniki-quloqchinlar',
    brand: 'Apple',
    price: 2690000,
    old_price: 3100000,
    discount_percent: 13,
    rating: 5.0,
    reviews_count: 310,
    badge_uz: 'ANC Pro',
    badge_ru: 'ANC Pro',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=700&auto=format&fit=crop&q=80'],
    colors: ['Oq'],
    specs_uz: {
      'Chip': 'Apple H2 chip',
      'ANC': '2x kuchli faol shovqin to\'sish',
      'Himoya': 'IP54 chang va suvdan himoya'
    },
    specs_ru: {
      'Чип': 'Apple H2',
      'ANC': 'В 2 раза более мощное шумоподавление',
      'Защита': 'IP54 от пыли и воды'
    },
    description_uz: 'Eng ilg\'or faol shovqin to\'sish, shaffoflik rejimi va moslashuvchan audio bilan original AirPods Pro 2.',
    description_ru: 'Флагманские наушники Apple с активным шумоподавлением 2-го поколения, адаптивным звуком и разъемом Type-C.'
  },
  {
    id: 106,
    name_uz: 'Apple Watch Ultra 2 Titanyum 49mm Sport Soat',
    name_ru: 'Apple Watch Ultra 2 Титановый корпус 49мм',
    category: 'smart-watch-fitnes',
    brand: 'Apple',
    price: 8900000,
    old_price: 9800000,
    discount_percent: 9,
    rating: 5.0,
    reviews_count: 73,
    badge_uz: 'Ultra 2',
    badge_ru: 'Ultra 2',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80'],
    colors: ['Titan Kulrang', 'Moviy Okean'],
    specs_uz: {
      'Korpus': 'Aerokosmik Titan 49mm',
      'Yorqinlik': '3000 nit Retina ekran',
      'Batareya': '72 soatgacha tejamkor rejim'
    },
    specs_ru: {
      'Корпус': 'Аэрокосмический титан 49мм',
      'Яркость': 'Дисплей 3000 нит Retina',
      'Батарея': 'До 72 часов работы'
    },
    description_uz: 'Ekstremal sharoitlar, sport va sho\'ng\'ish uchun eng baquvvat Apple Watch.',
    description_ru: 'Самые надежные и функциональные часы Apple Watch для тренировок на выносливость, походов и погружений.'
  },

  // --- SAMSUNG ---
  {
    id: 201,
    name_uz: 'Samsung Galaxy Buds 3 Pro | 24-bit Hi-Fi & Blade Lights',
    name_ru: 'Samsung Galaxy Buds 3 Pro | 24-бит Hi-Fi и Blade Lights',
    category: 'naushniki-quloqchinlar',
    brand: 'Samsung',
    price: 2150000,
    old_price: 2500000,
    discount_percent: 14,
    rating: 4.9,
    reviews_count: 67,
    badge_uz: 'Hi-Fi Audio',
    badge_ru: 'Hi-Fi Звук',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&auto=format&fit=crop&q=80'],
    colors: ['Kumushrang', 'Oq'],
    specs_uz: {
      'Ovoz': '24-bit/96kHz Ultra High Quality Audio',
      'ANC': 'Adaptiv shovqin to\'sish + Blade yoritgich'
    },
    specs_ru: {
      'Звук': '24-бит/96кГц Ultra High Quality',
      'ANC': 'Адаптивное шумоподавление + подсветка Blade'
    },
    description_uz: 'Samsungning eng so\'nggi premium quloqchini: studiyaviy kristaldek tiniq ovoz va ergonomik pichoqsimon korpus.',
    description_ru: 'Флагманские TWS наушники Samsung с подсветкой Blade Lights, адаптивным ANC и кристальным звуком.'
  },
  {
    id: 202,
    name_uz: 'Samsung 45W Super Fast Wall Charger Type-C Adapter',
    name_ru: 'Сетевое зарядное устройство Samsung 45W Super Fast Type-C',
    category: 'zaryadka-kabel',
    brand: 'Samsung',
    price: 310000,
    old_price: 380000,
    discount_percent: 18,
    rating: 4.9,
    reviews_count: 142,
    badge_uz: '45W Fast',
    badge_ru: '45W Быстрая',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora', 'Oq'],
    specs_uz: {
      'Standart': 'Super Fast Charging 2.0 (PD 3.0 PPS)',
      'Quvvat': '45W Max'
    },
    specs_ru: {
      'Стандарт': 'Super Fast Charging 2.0 (PD 3.0 PPS)',
      'Мощность': '45W Max'
    },
    description_uz: 'Galaxy S24 Ultra va Galaxy Tab qurilmalari uchun rasmiy 45W ultra-tezkor zaryadlash bloki.',
    description_ru: 'Оригинальный адаптер питания Samsung 45W с протоколом Super Fast Charging 2.0 для флагманских смартфонов.'
  },
  {
    id: 203,
    name_uz: 'Samsung Galaxy Watch 6 Classic 47mm LTE Soat',
    name_ru: 'Samsung Galaxy Watch 6 Classic 47mm LTE',
    category: 'smart-watch-fitnes',
    brand: 'Samsung',
    price: 3650000,
    old_price: 4200000,
    discount_percent: 13,
    rating: 4.8,
    reviews_count: 53,
    badge_uz: 'Bezel Pro',
    badge_ru: 'Безель',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora', 'Kumushrang'],
    specs_uz: {
      'Boshqaruv': 'Aylanuvchi mexanik bezel halqasi',
      'Ekran': 'Super AMOLED Sapfir oyna'
    },
    specs_ru: {
      'Управление': 'Вращающийся механический безель',
      'Экран': 'Super AMOLED сапфировое стекло'
    },
    description_uz: 'Klassik mexanik aylanuvchi bezel va to\'liq salomatlik datchiklariga ega Samsung premium smart soati.',
    description_ru: 'Премиальные смарт-часы с культовым вращающимся безелем, мониторингом сна и датчиком состава тела.'
  },
  {
    id: 204,
    name_uz: 'Samsung Wireless Charger Trio 15W Fast Charge Pad',
    name_ru: 'Беспроводное зарядное устройство Samsung Wireless Trio 15W',
    category: 'zaryadka-kabel',
    brand: 'Samsung',
    price: 680000,
    old_price: 850000,
    discount_percent: 20,
    rating: 4.9,
    reviews_count: 38,
    badge_uz: 'Trio 3-in-1',
    badge_ru: '3-в-1',
    badge_type: 'rec',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora', 'Oq'],
    specs_uz: {
      'Imkoniyat': 'Telefon + Soat + Quloqchinni bir vaqtda quvvatlash',
      'Quvvat': '15W Fast Wireless'
    },
    specs_ru: {
      'Возможности': 'Одновременная зарядка смартфона, часов и наушников',
      'Мощность': '15W Fast Wireless'
    },
    description_uz: 'Stolingizdagi barcha Samsung qurilmalarini bir vaqtning o\'zida simsiz quvvatlovchi zamonaviy platforma.',
    description_ru: 'Элегантная беспроводная станция для трех устройств: заряжайте телефон, наушники и Galaxy Watch одновременно.'
  },

  // --- WHOOP ---
  {
    id: 301,
    name_uz: 'WHOOP 4.0 Aqlli Fitnes Tracker & SuperKnit Band',
    name_ru: 'WHOOP 4.0 Умный фитнес-трекер и браслет SuperKnit',
    category: 'smart-watch-fitnes',
    brand: 'WHOOP',
    price: 3450000,
    old_price: 3900000,
    discount_percent: 11,
    rating: 5.0,
    reviews_count: 49,
    badge_uz: 'Pro Sport',
    badge_ru: 'Про Спорт',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=700&auto=format&fit=crop&q=80'],
    colors: ['Onyx Qora', 'Arctic Oq'],
    specs_uz: {
      'Datchiklar': 'Yurak urishi, HRV, Teri harorati, Kislorod SpO2',
      'Suvga chidamlilik': 'IP68 10 metr chuqurlikgacha'
    },
    specs_ru: {
      'Датчики': 'Пульс, ВСР (HRV), температура кожи, кислород SpO2',
      'Водозащита': 'IP68 погружение до 10 метров'
    },
    description_uz: 'Professional sportchilar va chempionlar tanlovi: uyqu, tiklanish va jismoniy yuklamani eng aniq hisoblovchi ekran-siz bilaguzuk.',
    description_ru: 'Лучший в мире трекер восстановления, сна и физической нагрузки, которому доверяют мировые атлеты.'
  },
  {
    id: 302,
    name_uz: 'WHOOP Pro Bicep Band & Any-Wear Elastik Tasma',
    name_ru: 'WHOOP Pro Bicep Band Эластичный ремешок на бицепс',
    category: 'smart-watch-fitnes',
    brand: 'WHOOP',
    price: 650000,
    old_price: 780000,
    discount_percent: 16,
    rating: 4.9,
    reviews_count: 27,
    badge_uz: 'Any-Wear',
    badge_ru: 'Any-Wear',
    badge_type: 'rec',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora'],
    specs_uz: {
      'Joylashuv': 'Yelka / Bilak mushagi (Bicep)',
      'Material': 'Yuqori sifatli nafas oluvchi poliamid'
    },
    specs_ru: {
      'Размещение': 'На бицепс руки',
      'Материал': 'Дышащий высокопрочный полиамид'
    },
    description_uz: 'Jang san\'atlari, basketbol va fitnes mashg\'ulotlarida bilakdan xalaqit bermasligi uchun yelkaga taqiladigan maxsus elastik tasma.',
    description_ru: 'Ремешок на бицепс освобождает запястье во время контактных видов спорта, единоборств и кроссфита.'
  },
  {
    id: 303,
    name_uz: 'WHOOP 4.0 Simsiz Zaryadlash Battery Pack 4.0',
    name_ru: 'Беспроводной блок зарядки WHOOP Battery Pack 4.0',
    category: 'zaryadka-kabel',
    brand: 'WHOOP',
    price: 780000,
    old_price: 920000,
    discount_percent: 15,
    rating: 4.9,
    reviews_count: 34,
    badge_uz: 'Simsiz',
    badge_ru: 'Беспроводной',
    badge_type: 'new',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora'],
    specs_uz: {
      'Afzalligi': 'Taqilgan holda (bilakdan yechmasdan) quvvatlaydi',
      'Himoya': 'Suv o\'tkazmaydigan suv osti zaryadlash'
    },
    specs_ru: {
      'Преимущество': 'Заряжает прямо на ходу не снимая трекер с руки',
      'Защита': 'Водонепроницаемый корпус'
    },
    description_uz: 'WHOOP 4.0 trekerini bilakdan yechmasdan, to\'g\'ridan-to\'g\'ri ustiga kiydirib quvvatlash imkonini beruvchi suvga chidamli batareya bloki.',
    description_ru: 'Уникальный водонепроницаемый пауэрбанк: надевается поверх трекера и заряжает его прямо на запястье.'
  },

  // --- META (RAY-BAN META SMART GLASSES) ---
  {
    id: 401,
    name_uz: 'Ray-Ban Meta Wayfarer Smart Audio Ko\'zoynak (Matte Black)',
    name_ru: 'Умные очки Ray-Ban Meta Wayfarer (Matte Black)',
    category: 'telefon-aksessuar',
    brand: 'Meta',
    price: 4200000,
    old_price: 4900000,
    discount_percent: 14,
    rating: 5.0,
    reviews_count: 85,
    badge_uz: 'Meta AI',
    badge_ru: 'Meta AI',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&auto=format&fit=crop&q=80'],
    colors: ['Matte Black / G-15 Green', 'Shiny Black'],
    specs_uz: {
      'Kamera': '12MP Ultra-Wide HD video va surat',
      'Audio': 'Ochiq quloq akustik stereo karnaylar va 5 ta mikrofon'
    },
    specs_ru: {
      'Камера': '12МП сверхширокоугольная для фото и видео 1080p',
      'Аудио': 'Встроенные динамики открытого типа и 5 микрофонов'
    },
    description_uz: 'Meta va Ray-Ban hamkorligidagi smart ko\'zoynak: 12MP kamerada video olish, musiqa tinglash va qo\'ng\'iroqlarga javob berish.',
    description_ru: 'Культовые умные очки со встроенной камерой 12МП, качественными динамиками для музыки и звонков и поддержкой Meta AI.'
  },
  {
    id: 402,
    name_uz: 'Ray-Ban Meta Skyler Smart Audio Ko\'zoynak (Chalky Gray)',
    name_ru: 'Умные очки Ray-Ban Meta Skyler (Chalky Gray)',
    category: 'telefon-aksessuar',
    brand: 'Meta',
    price: 4450000,
    old_price: 5100000,
    discount_percent: 13,
    rating: 4.9,
    reviews_count: 41,
    badge_uz: 'Yangi Dizayn',
    badge_ru: 'Новый стиль',
    badge_type: 'new',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=700&auto=format&fit=crop&q=80'],
    colors: ['Chalky Gray', 'Qora'],
    specs_uz: {
      'Dizayn': 'Klassik retro-zamonaviy Skyler shakli',
      'Xotira': '32GB ichki xotira (500+ fotosurat / 100+ video)'
    },
    specs_ru: {
      'Дизайн': 'Элегантная форма Skyler',
      'Память': '32ГБ встроенной памяти (более 500 фото и видео)'
    },
    description_uz: 'Zamonaviy blogerlar va qulaylikni sevuvchilar uchun ideal ko\'zoynak. Birgina teginish bilan Instagram va stories uchun video yozadi.',
    description_ru: 'Стильные смарт-очки Skyler с премиальной оправой, мгновенной съемкой видео от первого лица и чистым звуком.'
  },
  {
    id: 403,
    name_uz: 'Ray-Ban Aviator Classic Polarized Quyosh Ko\'zoynagi',
    name_ru: 'Солнцезащитные очки Ray-Ban Aviator Classic Polarized',
    category: 'telefon-aksessuar',
    brand: 'Meta',
    price: 1850000,
    old_price: 2200000,
    discount_percent: 16,
    rating: 4.9,
    reviews_count: 95,
    badge_uz: 'Polarized',
    badge_ru: 'Polarized',
    badge_type: 'rec',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1508296695146-257a814070b4?w=700&auto=format&fit=crop&q=80'],
    colors: ['Oltinrang / Yashil', 'Qora'],
    specs_uz: {
      'Linza': 'Polarizatsiyalangan mineral shisha G-15',
      'Himoya': '100% UV400 quyosh nuridan himoya'
    },
    specs_ru: {
      'Линзы': 'Поляризационное минеральное стекло G-15',
      'Защита': '100% блокировка UV400'
    },
    description_uz: 'Dunyodagi eng mashhur klassik aviator modeli. Haqiqiy polarizatsiya va shisha optika.',
    description_ru: 'Легендарные поляризованные солнцезащитные очки Ray-Ban Aviator с золотой оправой и стеклянными линзами G-15.'
  },

  // --- GOOGLE ---
  {
    id: 501,
    name_uz: 'Google Pixel Buds Pro 2 | ANC & Gemini AI integratsiya',
    name_ru: 'Google Pixel Buds Pro 2 | ANC и Gemini AI',
    category: 'naushniki-quloqchinlar',
    brand: 'Google',
    price: 2390000,
    old_price: 2800000,
    discount_percent: 15,
    rating: 4.9,
    reviews_count: 62,
    badge_uz: 'Gemini AI',
    badge_ru: 'Gemini AI',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80'],
    colors: ['Porcelain Oq', 'Hazel Yashil', 'Obsidian Qora'],
    specs_uz: {
      'Protsessor': 'Google Tensor A1 audio chipi',
      'ANC': 'Silent Seal 2.0 moslashuvchan shovqin to\'sish'
    },
    specs_ru: {
      'Процессор': 'Аудиочип Google Tensor A1',
      'ANC': 'Адаптивное шумоподавление Silent Seal 2.0'
    },
    description_uz: 'Google Tensor A1 chipi va Gemini sun\'iy intellekti integratsiyalangan eng yengil va qulay flagman quloqchin.',
    description_ru: 'Первые наушники с чипом Tensor A1 и прямой поддержкой искусственного интеллекта Gemini Live для мгновенного перевода.'
  },
  {
    id: 502,
    name_uz: 'Google Pixel Watch 3 Fast Charger & Stand',
    name_ru: 'Быстрая зарядка для Google Pixel Watch 3',
    category: 'smart-watch-fitnes',
    brand: 'Google',
    price: 450000,
    old_price: 550000,
    discount_percent: 18,
    rating: 4.8,
    reviews_count: 36,
    badge_uz: 'Pixel Fast',
    badge_ru: 'Быстрая',
    badge_type: 'new',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=700&auto=format&fit=crop&q=80'],
    colors: ['Oq'],
    specs_uz: {
      'Ulagich': 'USB-C magnitli dok-stansiya',
      'Tezlik': '30 daqiqada 50% gacha zaryadlash'
    },
    specs_ru: {
      'Разъем': 'Магнитная док-станция USB-C',
      'Скорость': 'До 50% всего за 30 минут'
    },
    description_uz: 'Pixel Watch 3 soatlari uchun magnitli mustahkam va tezkor original quvvatlagich stend.',
    description_ru: 'Оригинальный магнитный зарядный кабель USB-C для умных часов Google Pixel Watch 3.'
  },
  {
    id: 503,
    name_uz: 'Google 30W USB-C Tezkor Quvvatlash Adapteri',
    name_ru: 'Оригинальный адаптер питания Google 30W USB-C',
    category: 'zaryadka-kabel',
    brand: 'Google',
    price: 340000,
    old_price: 410000,
    discount_percent: 17,
    rating: 4.9,
    reviews_count: 84,
    badge_uz: '30W PD',
    badge_ru: '30W PD',
    badge_type: 'rec',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80'],
    colors: ['Oq'],
    specs_uz: {
      'Quvvat': '30W Power Delivery PPS',
      'Moslik': 'Google Pixel 9 / 8 / 7 seriyasi, Pixel Fold'
    },
    specs_ru: {
      'Мощность': '30W Power Delivery PPS',
      'Совместимость': 'Смартфоны Pixel 9 / 8 / 7 и Pixel Fold'
    },
    description_uz: 'Google Pixel smartfonlari va planshetlari uchun original 30W tezkor xavfsiz zaryadlovchi blok.',
    description_ru: 'Фирменный адаптер питания Google 30W USB-C обеспечивает максимально быструю и безопасную зарядку устройств Pixel.'
  },

  // --- CANON ---
  {
    id: 601,
    name_uz: 'Canon EOS R50 Mirrorless Creator Vlogging Kamera Kit',
    name_ru: 'Беззеркальная камера Canon EOS R50 Creator Kit',
    category: 'telefon-aksessuar',
    brand: 'Canon',
    price: 8900000,
    old_price: 9900000,
    discount_percent: 10,
    rating: 5.0,
    reviews_count: 47,
    badge_uz: '4K Vlogging',
    badge_ru: '4K Влогинг',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora', 'Oq'],
    specs_uz: {
      'Sensor': '24.2 MP APS-C Dual Pixel CMOS AF II',
      'Video': '4K UHD 30p va Full HD 120p sekinlashtirilgan'
    },
    specs_ru: {
      'Сенсор': '24.2 МП APS-C Dual Pixel CMOS AF II',
      'Видео': '4K UHD 30p и Full HD 120p замедленное'
    },
    description_uz: 'YouTube, Instagram reels va blogerlar uchun eng yengil va qulay 4K kamera. Aylanuvchi sensorli ekran va aqlli avtofokus.',
    description_ru: 'Идеальная компактная беззеркалка для блогеров: поворотный экран, передовой автофокус по глазам и съемка 4K без кропа.'
  },
  {
    id: 602,
    name_uz: 'Canon LP-E17 Original Batareya & Dual USB Zaryadlovchi',
    name_ru: 'Оригинальный аккумулятор Canon LP-E17 и зарядное устройство',
    category: 'telefon-aksessuar',
    brand: 'Canon',
    price: 540000,
    old_price: 650000,
    discount_percent: 17,
    rating: 4.9,
    reviews_count: 59,
    badge_uz: 'Original',
    badge_ru: 'Оригинал',
    badge_type: 'rec',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora'],
    specs_uz: {
      'Sig\'im': '1040 mAh Li-Ion',
      'Moslik': 'Canon EOS R50, R10, RP, 250D'
    },
    specs_ru: {
      'Емкость': '1040 мАч Li-Ion',
      'Совместимость': 'Canon EOS R50, R10, RP, 250D'
    },
    description_uz: 'Canon foto va video kameralari uchun original quvvat manbai hamda LCD ekranli dual USB quvvatlovchi dok.',
    description_ru: 'Надежный оригинальный аккумулятор для фотокамер Canon и двойное зарядное устройство с индикатором.'
  },
  {
    id: 603,
    name_uz: 'Canon RF 50mm f/1.8 STM Portret Ob\'yektivi',
    name_ru: 'Портретный объектив Canon RF 50mm f/1.8 STM',
    category: 'telefon-aksessuar',
    brand: 'Canon',
    price: 2150000,
    old_price: 2500000,
    discount_percent: 14,
    rating: 5.0,
    reviews_count: 76,
    badge_uz: 'f/1.8 Boke',
    badge_ru: 'f/1.8 Боке',
    badge_type: 'hot',
    in_stock: true,
    main_image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=700&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=700&auto=format&fit=crop&q=80'],
    colors: ['Qora'],
    specs_uz: {
      'Diafragma': 'f/1.8 yorug\'lik o\'tkazuvchanlik',
      'Fokus': 'STM sokin va tezkor qadamli motor'
    },
    specs_ru: {
      'Светосила': 'f/1.8 красивое размытие фона (боке)',
      'Фокус': 'Бесшумный шаговый мотор STM'
    },
    description_uz: 'Orqa fonni chiroyli xiralashtiruvchi (boke), portretlar va mahsulot suratga olish uchun afsonaviy RF linza.',
    description_ru: 'Компактный и светосильный фикс-объектив для эффектных портретов с мягким художественным боке.'
  }
];

// Server (HTTP) orqali ishlaganda mahsulotlar bazadan (/api/products) to'liq sinxronlanadi.
// Admin barcha tovarlarni o'chirsa, mijozlar panelida ham 0 ta tovar bo'ladi va demo tovarlar qayta chiqmaydi.
let PRODUCTS = (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) ? [] : [...DEMO_PRODUCTS];

function formatPrice(amount, explicitCurrency = null) {
  if (typeof amount === 'string' && isNaN(Number(amount))) return amount;
  if (!amount && amount !== 0) return '';
  const num = Math.round(Number(amount) || 0);

  // Faqat explicit currency === '$' bo'lsa dollarda ko'rsatiladi
  if (explicitCurrency === '$') {
    return new Intl.NumberFormat('en-US').format(num).replace(/,/g, ' ') + ' $';
  }

  const currentLang = (typeof APP_STATE !== 'undefined' && APP_STATE.lang) ? APP_STATE.lang : 'uz';
  const currency = currentLang === 'ru' ? 'сум' : "so'm";
  const locale = currentLang === 'ru' ? 'ru-RU' : 'uz-UZ';
  return new Intl.NumberFormat(locale).format(num).replace(/,/g, ' ') + ' ' + currency;
}
