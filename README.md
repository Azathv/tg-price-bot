# Telegram Price Bot (O'zbekiston marketplace'lari uchun)

Bu projekt — Telegram bot bo'lib, foydalanuvchi **rasm yuborganda**:

1. Rasmni sun'iy intellekt orqali tahlil qiladi (masalan: kartoshka, iPhone va hokazo).
2. Shu mahsulotni bir nechta O'zbekiston online do'konlarida qidiradi.
3. Eng arzon 3 ta taklifni **nomi + narxi + linki** bilan chiqarib beradi.

> Eslatma: marketplace saytlarining HTML strukturasi o'zgarishi mumkin. Shuning uchun scraping qismini va selector'larni vaqti-vaqti bilan tekshirib turish kerak bo'ladi.

---

## 1. Kerakli narsa

- Telegram bot token ([@BotFather](https://t.me/BotFather) orqali olasiz)
- HuggingFace API token (bepul account ochib olasiz)
- Node.js ishlaydigan hosting (masalan, Railway, Render va hokazo)

Kompyuteringizga alohida Python o'rnatish **shart emas**.

---

## 2. Konfiguratsiya

1. Fayl `.env` yarating (yoki hostingda environment variable sifatida qo'ying) va quyidagilarni kiriting:

```env
BOT_TOKEN=telegram_bot_token_here
HUGGINGFACE_TOKEN=huggingface_api_token_here
PORT=3000
```

2. `HUGGINGFACE_TOKEN` ni olish uchun:

- https://huggingface.co ga kirasiz
- Ro'yxatdan o'tasiz
- Profil → Settings → Access Tokens
- `Read` huquqiga ega token yaratasiz va shu yerga qo'yasiz.

---

## 3. O'rnatish (lokal ishlatmoqchi bo'lsangiz)

```bash
npm install
npm start
```

Lekin agar siz `Railway` yoki `Render` ishlatsangiz, ular o'zlari `npm install` va `npm start` ni ishga tushiradi.

---

## 4. Telegram'da webhook yoki polling

Bu bot **long polling** bilan ishlaydi, ya'ni server doimiy ravishda Telegram'dan yangi xabarlarni tekshiradi. Railway / Render kabi hostinglarda odatda bu usul yaxshi ishlaydi.

Agar keyinchalik webhook bilan ishlatmoqchi bo'lsangiz, index.js faylini biroz o'zgartirish kerak bo'ladi (Express qo'shish va b.).

---

## 5. Cheklovlar va ogohlantirish

- Bu kodda marketplace'lar uchun HTML selector'lar taxminiy yozilgan. Agar sayt dizayni o'zgarsa, natija bo'sh chiqishi mumkin.
- Bu loyiha "demo / boshlang'ich" sifatida yozilgan. Keyinroq siz:

  - Qo'shimcha saytlar qo'shishingiz,
  - Telefon va gadjetlar uchun maxsus filtrlar qo'shishingiz,
  - Mahsulot nomini foydalanuvchiga tasdiqlatish jarayonini yaxshilashingiz,

  mumkin.

---

## 6. Fayl strukturasi

```text
tg-price-bot/
  index.js
  package.json
  .env.example
  src/
    image.js
    marketplaces.js
```

Hammasi tayyor, faqat `.env` to'ldirasiz xolos.
