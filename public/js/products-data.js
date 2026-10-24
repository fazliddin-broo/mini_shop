// ==========================================================================
// BLACK STORE — MAHSULOTLAR VA TARJIMALAR BAZASI (DATA & I18N)
// ==========================================================================

const CATEGORIES = [
  { id: 'all', name_uz: 'Barchasi', name_ru: 'Все', name_en: 'All', icon: 'grid', count: 35 },
  { id: 'telefon-planshetlar', name_uz: 'Telefon va planshetlar', name_ru: 'Телефоны и планшеты', name_en: 'Phones & Tablets', icon: 'tablet', count: 12 },
  { id: 'noutbuklar', name_uz: 'Noutbuklar va MacBook', name_ru: 'Ноутбуки и MacBook', name_en: 'Laptops & MacBook', icon: 'laptop', count: 0 },
  { id: 'kompyuterlar', name_uz: 'Kompyuterlar va Monobloklar', name_ru: 'Компьютеры и Моноблоки', name_en: 'Computers & Desktops', icon: 'monitor', count: 0 },
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
  { id: 'Canon', name: 'Canon', logo: 'images/brands/canon.png' },
  { id: 'ASUS', name: 'ASUS' },
  { id: 'Lenovo', name: 'Lenovo' },
  { id: 'HP', name: 'HP' },
  { id: 'Dell', name: 'Dell' }
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
    bg_style: 'linear-gradient(90deg, rgba(8, 8, 12, 0.92) 0%, rgba(12, 12, 16, 0.72) 45%, rgba(0, 0, 0, 0.2) 100%)',
    image: 'https://res.cloudinary.com/zhdah4g2/image/upload/v1792866635/black_store_banners/tms2amxczkekrcqj9f9v.jpg',
    image_ru: 'https://res.cloudinary.com/zhdah4g2/image/upload/v1792866636/black_store_banners/y9z1jaw7kcrmfisysifi.jpg',
    mobile_image: 'https://res.cloudinary.com/zhdah4g2/image/upload/v1792866638/black_store_banners/di2q0ygcxwhxzxwbrptn.jpg',
    mobile_image_ru: 'https://res.cloudinary.com/zhdah4g2/image/upload/v1792866642/black_store_banners/cblijnekxsehzx4tembx.jpg',
    features: ['iPhone 16 Pro Max', 'AirPods Max', 'Apple Watch Ultra', 'MagSafe Ecosystem']
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
    bg_style: 'linear-gradient(90deg, rgba(8, 8, 12, 0.92) 0%, rgba(15, 15, 20, 0.72) 45%, rgba(0, 0, 0, 0.2) 100%)',
    image: 'https://res.cloudinary.com/zhdah4g2/image/upload/v1792866645/black_store_banners/l12wj6oew7vpr1kf2xvo.jpg',
    image_ru: 'https://res.cloudinary.com/zhdah4g2/image/upload/v1792866647/black_store_banners/nafmjm3vbrqhwu8teakh.jpg',
    mobile_image: 'https://res.cloudinary.com/zhdah4g2/image/upload/v1792866650/black_store_banners/us5fk9n4ic28lckhs0sl.jpg',
    mobile_image_ru: 'https://res.cloudinary.com/zhdah4g2/image/upload/v1792866654/black_store_banners/uweywa0dnoiec3yjenvu.jpg',
    features: ['Shockproof Cases', 'MagSafe Wireless', 'Ultra-Durable Glass', 'Fast Power']
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
    image: 'https://res.cloudinary.com/zhdah4g2/image/upload/v1792864046/black_store_products/px1wfmhm3kjaf1ujenvs.jpg',
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
    image: 'https://res.cloudinary.com/zhdah4g2/image/upload/v1792864097/black_store_products/jsw90nvc6bfkkl09hbvq.jpg',
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

// Barcha demo mahsulotlar foydalanuvchi talabiga ko'ra o'chirildi
const DEMO_PRODUCTS = [];

let PRODUCTS = [];

function formatPrice(amount, explicitCurrency = null) {
  if (typeof amount === 'string' && isNaN(Number(amount))) return amount;
  if (!amount && amount !== 0) return '';
  const num = Math.round(Number(amount) || 0);

  // Explicit USD yoki qiymat <= 5000 bo'lsa dollarda formatlash
  if (explicitCurrency === '$' || explicitCurrency === 'USD' || (!explicitCurrency && num > 0 && num <= 5000)) {
    return new Intl.NumberFormat('en-US').format(num).replace(/,/g, ' ') + ' $';
  }

  const currentLang = (typeof APP_STATE !== 'undefined' && APP_STATE.lang) ? APP_STATE.lang : 'uz';
  const currency = currentLang === 'ru' ? 'сум' : "so'm";
  const locale = currentLang === 'ru' ? 'ru-RU' : 'uz-UZ';
  return new Intl.NumberFormat(locale).format(num).replace(/,/g, ' ') + ' ' + currency;
}

