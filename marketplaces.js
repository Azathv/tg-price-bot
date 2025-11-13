const axios = require('axios');
const cheerio = require('cheerio');

// Oddiy user-agent qo'yamiz, aks holda ba'zi saytlar bot deb bloklashi mumkin
const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
};

// Yordamchi: narx string -> number (faqat raqamlar)
function parsePrice(text) {
  if (!text) return null;
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return null;
  return Number(digits);
}

// ASAXIY.UZ qidiruvi (taxminiy selector'lar)
async function searchAsaxiy(query) {
  try {
    const url = `https://asaxiy.uz/product?key=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: DEFAULT_HEADERS, timeout: 20000 });
    const $ = cheerio.load(data);

    const items = [];

    // Bu selector'lar taxminiy, kerak bo'lsa keyin to'g'rilanadi
    $('.product__item, .product-card, .product-item').each((i, el) => {
      if (items.length >= 3) return false;

      const title =
        $(el).find('.product__item__info-title, .product-title, .product-name').text().trim() ||
        $(el).find('a').first().text().trim();

      let priceText =
        $(el).find('.product__item__info-price, .product-price, .product__price').text().trim();

      const price = parsePrice(priceText);

      let link = $(el).find('a').first().attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = 'https://asaxiy.uz' + link;
      }

      if (title && link) {
        items.push({
          title,
          price,
          link,
          source: 'Asaxiy',
        });
      }
    });

    return items;
  } catch (err) {
    console.error('searchAsaxiy xatosi:', err.message);
    return [];
  }
}

// GOODZONE.UZ qidiruvi (taxminiy selector'lar)
async function searchGoodzone(query) {
  try {
    const url = `https://goodzone.uz/search?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: DEFAULT_HEADERS, timeout: 20000 });
    const $ = cheerio.load(data);

    const items = [];

    $('.product-card, .product-item').each((i, el) => {
      if (items.length >= 3) return false;

      const title =
        $(el).find('.product-card__title, .product-title, .product-name').text().trim() ||
        $(el).find('a').first().text().trim();

      let priceText =
        $(el).find('.product-card__price, .product-price, .price').text().trim();

      const price = parsePrice(priceText);

      let link = $(el).find('a').first().attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = 'https://goodzone.uz' + link;
      }

      if (title && link) {
        items.push({
          title,
          price,
          link,
          source: 'Goodzone',
        });
      }
    });

    return items;
  } catch (err) {
    console.error('searchGoodzone xatosi:', err.message);
    return [];
  }
}

// OLX.UZ qidiruvi (taxminiy selector'lar)
async function searchOlx(query) {
  try {
    const url = `https://www.olx.uz/d/obyavleniya/q-${encodeURIComponent(query)}/`;
    const { data } = await axios.get(url, { headers: DEFAULT_HEADERS, timeout: 20000 });
    const $ = cheerio.load(data);

    const items = [];

    // OLX yangi dizaynda listing'lar uchun har xil selector'lar bo'lishi mumkin
    $('[data-testid="l-card"], .offer-wrapper').each((i, el) => {
      if (items.length >= 3) return false;

      const title =
        $(el).find('[data-testid="ad-title"], .title-cell, .ads-list-title').text().trim() ||
        $(el).find('a').first().text().trim();

      let priceText =
        $(el).find('[data-testid="ad-price"], .price').text().trim();

      const price = parsePrice(priceText);

      let link = $(el).find('a').first().attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = 'https://www.olx.uz' + link;
      }

      if (title && link) {
        items.push({
          title,
          price,
          link,
          source: 'OLX',
        });
      }
    });

    return items;
  } catch (err) {
    console.error('searchOlx xatosi:', err.message);
    return [];
  }
}

// Barcha marketplace'lardan natijalarni olib, eng arzon 3 tasini tanlaymiz
async function findBestOffers(query) {
  const results = await Promise.allSettled([
    searchAsaxiy(query),
    searchGoodzone(query),
    searchOlx(query),
  ]);

  let allItems = [];

  for (const res of results) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      allItems = allItems.concat(res.value);
    }
  }

  if (allItems.length === 0) return [];

  // Narxi bo'lmaganlarni oxiriga surib, narxi borlarni o'sish tartibida sort qilamiz
  allItems.sort((a, b) => {
    if (!a.price && !b.price) return 0;
    if (!a.price) return 1;
    if (!b.price) return -1;
    return a.price - b.price;
  });

  // Eng yaxshi 3ta
  return allItems.slice(0, 3);
}

module.exports = {
  findBestOffers,
  // alohida test qilmoqchi bo'lsangiz, ichki funksiyalarni ham export qilishingiz mumkin:
  // searchAsaxiy,
  // searchGoodzone,
  // searchOlx,
};
