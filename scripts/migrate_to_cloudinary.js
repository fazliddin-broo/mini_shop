require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const productsFile = path.join(__dirname, '..', 'data', 'products.json');
const productsDataJsFile = path.join(__dirname, '..', 'public', 'js', 'products-data.js');
const mapFile = path.join(__dirname, '..', 'data', 'cloudinary_map.json');

async function main() {
  console.log('🚀 Cloudinary migratsiyasi boshlandi...');

  // Mavjud xaritani o'qish (agar oldin yuklangan bo'lsa, qayta yuklamaymiz)
  let urlMap = {};
  if (fs.existsSync(mapFile)) {
    try {
      urlMap = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
    } catch (_) {}
  }

  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  const uniqueImages = new Set();

  products.forEach(p => {
    if (p.image) uniqueImages.add(p.image);
    if (Array.isArray(p.images)) {
      p.images.forEach(img => uniqueImages.add(img));
    }
  });

  console.log(`📦 Jami noyob rasmlar soni: ${uniqueImages.size}`);

  let uploadedCount = 0;
  for (const imgUrl of uniqueImages) {
    if (urlMap[imgUrl]) {
      console.log(`⏩ Allaqachon Cloudinary-da mavjud: ${urlMap[imgUrl]}`);
      continue;
    }

    if (imgUrl.includes('res.cloudinary.com')) {
      urlMap[imgUrl] = imgUrl;
      continue;
    }

    try {
      let source = imgUrl;
      // Agar lokal fayl bo'lsa
      if (!imgUrl.startsWith('http://') && !imgUrl.startsWith('https://')) {
        const cleanPath = imgUrl.replace(/^\/?/, '');
        source = path.join(__dirname, '..', 'public', cleanPath);
        if (!fs.existsSync(source)) {
          console.warn(`⚠️ Lokal fayl topilmadi: ${source}`);
          continue;
        }
      }

      console.log(`⏳ Yuklanmoqda: ${imgUrl.slice(0, 50)}...`);
      const uploadRes = await cloudinary.uploader.upload(source, {
        folder: 'black_store_products',
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      urlMap[imgUrl] = uploadRes.secure_url;
      uploadedCount++;
      console.log(`✅ [${uploadedCount}] Muvaffaqiyatli: ${uploadRes.secure_url}`);

      // Har bir yuklashdan so'ng xaritani xavfsiz saqlab boramiz
      fs.writeFileSync(mapFile, JSON.stringify(urlMap, null, 2), 'utf8');
    } catch (err) {
      console.error(`❌ Xatolik (${imgUrl}):`, err.message);
    }
  }

  console.log(`\n🎉 Yangi yuklangan rasmlar: ${uploadedCount}`);

  // 1. data/products.json ni yangilash
  let updatedProductsCount = 0;
  products.forEach(p => {
    let changed = false;
    if (p.image && urlMap[p.image]) {
      p.image = urlMap[p.image];
      changed = true;
    }
    if (Array.isArray(p.images)) {
      p.images = p.images.map(img => {
        if (urlMap[img]) {
          changed = true;
          return urlMap[img];
        }
        return img;
      });
    }
    if (changed) updatedProductsCount++;
  });

  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');
  console.log(`✅ data/products.json yangilandi (${updatedProductsCount} ta mahsulot).`);

  // 2. public/js/products-data.js dagi Unsplash havolalarini yangilash
  if (fs.existsSync(productsDataJsFile)) {
    let jsContent = fs.readFileSync(productsDataJsFile, 'utf8');
    let jsReplacedCount = 0;

    for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
      if (jsContent.includes(oldUrl)) {
        jsContent = jsContent.split(oldUrl).join(newUrl);
        jsReplacedCount++;
      }
    }

    fs.writeFileSync(productsDataJsFile, jsContent, 'utf8');
    console.log(`✅ public/js/products-data.js yangilandi (${jsReplacedCount} ta URL almashtirildi).`);
  }

  console.log('\n✨ Barcha mahsulot rasmlari endi to\'liq Cloudinary CDN-ga ulandi!');
}

main().catch(console.error);
