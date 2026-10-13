# 🛍️ MINI SHOP — Malika Bozori uchun Maxsus Elektron Savdo Tizimi

Ushbu platforma Toshkent shahri, Yunusobod tumani **Malika bozori**dagi gadjet va telefon do'konlari uchun maxsus ishlab chiqilgan yuqori darajadagi (premium) veb-vitrina va boshqaruv panelidir.

---

## 🌟 Asosiy Imkoniyatlar

1. **📱 Mobil-birinchi (Mobile-First) Zamonaviy Vitrina:**
   - Instagram bio va Telegram kanallarga joylash uchun moslashtirilgan ultra-zamonaviy qora/neon dizayn (Apple & Tech uslubida).
   - Qidiruv, toifalar (Smartfonlar, Noutbuklar, Aksessuarlar, Soatlar), saralash (narx, ommaboplik).
   - Har bir tovar uchun fotosuratlar, narx (so'm va USD), texnik xususiyatlar (specs), kafolat belgilari.
   - 1-klikda xarid va qulay savatcha (Cart Drawer).

2. **🤖 O'rnatilgan AI Savdo Maslahatchisi (Virtual Consultant):**
   - Saytda doimiy ochiq turuvchi virtual sotuvchi.
   - Do'kondagi barcha tovarlar, ularning narxlari va qoldiqlari haqida to'liq xabardor.
   - Xaridorlarga o'zbek va rus tillarida 24/7 tavsiyalar beradi va xaridga yo'naltiradi.
   - Google Gemini API ulanishi mumkin yoki o'rnatilgan aqlli mahalliy dvigatelda bepul ishlaydi.

3. **⚡ Telegram Bot orqali Tezkor Buyurtmalar:**
   - Xaridor saytda buyurtma berishi bilan 1 soniyada do'kon egasining shaxsiy Telegram botiga yoki guruhiga to'liq chek, mijoz ismi, telefon raqami (`tel:` bosish imkoni bilan) va manzili boradi.
   - Sotuvchi shunchaki xaridorga telefon qilib, Yandex Taxi orqali tovarni jo'natadi!

4. **🔐 Qulay Sotuvchi Paneli (Admin Dashboard):**
   - Xavfsiz PIN-kod bilan himoyalangan (standart PIN: `1234`).
   - Telefondan turib fotosurat yuklash (kamera orqali rasmga olib yoki galereyadan).
   - Mahsulot qo'shish, tahrirlash, narx o'zgartirish, o'chirish.
   - Kelib tushgan buyurtmalar ro'yxati va holatlari (Yangi, Jarayonda, Yetkazildi).
   - Telegram bot sozlamalari va "Sinov xabari yuborish" tugmasi.

---

## 🚀 Qanday Ishga Tushiriladi?

Loyihani kompyuteringizda ishga tushirish uchun:

```bash
# Loyiha papkasiga o'ting
cd c:\Users\user\Desktop\mini_shop

# Serverni yoqish
npm start
```

Brauzerda quyidagi manzillarni oching:
- **🌐 Xaridorlar uchun do'kon:** [http://localhost:3000](http://localhost:3000)
- **⚙️ Do'kon egasi uchun admin panel:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html) (PIN: `1234`)

---

## 🤖 Telegram Botni Ulashtirish (2 daqiqalik qo'llanma):

1. Telegramda [@BotFather](https://t.me/BotFather) ga kiring va `/newbot` buyrug'ini yuboring.
2. Botga nom va username bering (masalan: `MalikaStoreBot`).
3. BotFather bergan **HTTP API Token**ni nusxalang.
4. Telegramda [@userinfobot](https://t.me/userinfobot) ga `/start` bosing va o'z **ID raqamingizni** oling.
5. `admin.html` -> **Sozlamalar** bo'limiga kiring:
   - Token va Chat ID ni kiriting.
   - **"🚀 Sinov Xabarini Yuborish"** tugmasini bosing — botingizga darhol tasdiq xabari boradi!

---

## 💼 Malika Do'konlariga Sotish Strategiyasi ($1,000 topish rejasi)

### Taklif narxlari:
- **Variant 1:** Bir martalik o'rnatish + tovarlarni kiritib berish: **$50 (650,000 so'm)** -> 20 ta do'konga sotish.
- **Variant 2:** Premium to'liq paket (sayt + bot + AI + do'kon logotipi): **$100 (1,300,000 so'm)** -> 10 ta do'konga sotish.

### Sotuv skripti (Malikadagi do'kon egalariga nima deysiz?):
> *"Assalomu alaykum aka! Sizda Instagram sahifangizda yoki Telegramingizda har kuni 50 ta odam 'iPhone 15 nech pul?', 'Dostavka bormi?' deb yozib charchatmayaptimi?*
> 
> *Qarang, menda Malikadagi do'konlar uchun maxsus Mini Shop veb-ilovasi bor. Siz buni bio-ga qo'yasiz. Klientlar kirib, narxlarni ko'rib, 1 klikda buyurtma beradi. Tunda ham bizning AI robotimiz ularga javob beradi. Buyurtma berilishi bilan to'g'ridan-to'g'ri sizning Telegramingizga mijozning nomeri va tanlagan telefoni chek bo'lib tushadi.*
> 
> *Keling, hozir 1 daqiqada sizga ko'rsataman: mana o'z telefonimdan bitta test zakaz beraman, qarang..."*

---

## 🚀 Production Deployment (Render.com, Railway, VPS)

### 1. MongoDB Atlas Ulanishi
- `MONGO_URI` o'zgaruvchisini Render / Railway Environment Variables bo'limiga qo'shing.
- Network Access bo'limida `0.0.0.0/0` (Anywhere) ruxsati yoqilganiga ishonch hosil qiling.

### 2. Media Fayllar va Uploads (Rasmlar)
- **Render.com bepul/standart konteynerlari:** Server disk xotirasi *ephemeral* (har bir git push yoki redeploy paytida `uploads/` papkasi yangilanadi).
- **Tavsiya etiladigan yechimlar:**
  1. **Tashqi rasm havolalari (Unsplash / CDN):** Mahsulot rasmi sifatida to'g'ridan-to'g'ri `https://...` URL kiritish (eng oson va ishonchli).
  2. **Render Persistent Disk:** Render boshqaruv panelida `/uploads` yo'liga doimiy disk (Disk Mount) ulash.
  3. **Cloudinary / AWS S3:** Katta hajmdagi rasmlar uchun bepul Cloudinary yoki S3 bucket integratsiyasi.
  4. **Zaxira (Fallback):** Agar rasm yuklanmasa yoki tarmoq xatosi yuz bersa, tizim avtomatik ravishda `/images/placeholder.svg` zaxira rasmini ko'rsatadi.
