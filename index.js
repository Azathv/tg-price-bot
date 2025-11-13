require('dotenv').config();
const { Telegraf } = require('telegraf');
const { detectProductFromImage } = require('./src/image');
const { findBestOffers } = require('./src/marketplaces');

const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  console.error('BOT_TOKEN .env faylida topilmadi!');
  process.exit(1);
}

const bot = new Telegraf(botToken);

bot.start((ctx) => {
  ctx.reply(
    "Salom! 👋\n" +
    "Menga mahsulot rasmini yuboring, men esa O'zbekiston online do'konlaridan eng arzon narxlarni topishga harakat qilaman.\n\n" +
    "Masalan: kartoshka, meva-sabzavot, telefon, gadjet va boshqalar."
  );
});

bot.help((ctx) => {
  ctx.reply(
    "Foydalanish juda oson:\n" +
    "1️⃣ Rasm yuboring\n" +
    "2️⃣ Men rasmni tahlil qilaman\n" +
    "3️⃣ Marketplace'lardan eng yaxshi 3 ta taklifni chiqarib beraman.\n\n" +
    "Hozircha demo rejimida ishlaydi, shuning uchun ba'zi mahsulotlarda natija bo'lmasligi mumkin."
  );
});

bot.on('photo', async (ctx) => {
  try {
    const photos = ctx.message.photo;
    const bestPhoto = photos[photos.length - 1]; // eng kattasi
    const fileId = bestPhoto.file_id;

    await ctx.reply("📸 Rasm qabul qilindi. Tahlil qilinyapti, biroz kuting...");

    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;

    const productName = await detectProductFromImage(fileUrl);

    if (!productName) {
      await ctx.reply(
        "Rasmni aniqlashda muammo bo'ldi 🤔\n" +
        "Iltimos, mahsulot nomini matn ko'rinishida yuboring."
      );
      return;
    }

    await ctx.reply(`🧠 Rasm bo'yicha taxminim: *${productName}*`, {
      parse_mode: 'Markdown',
    });

    await ctx.reply("🔎 Endi marketplace'larda qidiryapman...");

    const offers = await findBestOffers(productName);

    if (!offers || offers.length === 0) {
      await ctx.reply(
        "Afsuski, hozircha bu mahsulot bo'yicha natija topa olmadim 😔\n" +
        "Balki keyinroq yana urinib ko'rarsiz yoki boshqa rasm yuboring."
      );
      return;
    }

    let message = "Topilgan eng yaxshi takliflar:\n\n";
    offers.forEach((offer, idx) => {
      message += `${idx + 1}) *${offer.title}*\n`;
      if (offer.price) {
        message += `   Narxi: ~ ${offer.price.toLocaleString('ru-RU')} so'm\n`;
      }
      message += `   Manba: ${offer.source}\n`;
      message += `   Link: ${offer.link}\n\n`;
    });

    await ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Photo handler xatosi:', err);
    await ctx.reply(
      "Nimadir xato ketdi 😓\n" +
      "Iltimos, keyinroq yana urinib ko'ring yoki boshqa rasm yuboring."
    );
  }
});

// Matn bilan ham qidirish imkoni (fallback)
bot.on('text', async (ctx) => {
  const query = ctx.message.text.trim();
  if (!query) return;

  await ctx.reply(`🔎 \"${query}\" bo'yicha qidiryapman...`);

  try {
    const offers = await findBestOffers(query);

    if (!offers || offers.length === 0) {
      await ctx.reply(
        "Afsuski, hozircha bu mahsulot bo'yicha natija topa olmadim 😔\n" +
        "Balki boshqacha nom bilan urinib ko'rarsiz."
      );
      return;
    }

    let message = "Topilgan eng yaxshi takliflar:\n\n";
    offers.forEach((offer, idx) => {
      message += `${idx + 1}) *${offer.title}*\n`;
      if (offer.price) {
        message += `   Narxi: ~ ${offer.price.toLocaleString('ru-RU')} so'm\n`;
      }
      message += `   Manba: ${offer.source}\n`;
      message += `   Link: ${offer.link}\n\n`;
    });

    await ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Text handler xatosi:', err);
    await ctx.reply("Qidirishda xatolik yuz berdi 😓");
  }
});

bot.launch().then(() => {
  console.log('Bot ishga tushdi...');
});

// Graceful stop (hostinglar uchun)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
