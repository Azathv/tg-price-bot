const axios = require('axios');

const HF_API_TOKEN = process.env.HUGGINGFACE_TOKEN;

// HuggingFace image classification modeli orqali rasmni aniqlash
// Default model: google/vit-base-patch16-224
async function detectProductFromImage(imageUrl) {
  if (!HF_API_TOKEN) {
    console.warn('HUGGINGFACE_TOKEN .env faylida topilmadi. Rasmni aniqlash o\'chirib qo\'yilgan.');
    return null;
  }

  try {
    // Telegram'dan rasmni yuklab olamiz
    const imgResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    const hfResponse = await axios.post(
      'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
      imgResponse.data,
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/octet-stream',
        },
        timeout: 30000,
      }
    );

    const data = hfResponse.data;

    // Modelga qarab format farq qilishi mumkin, eng keng tarqalgan variant:
    // [
    //   { "label": "potato", "score": 0.98 },
    //   { "label": "food", "score": 0.01 },
    //   ...
    // ]
    let bestLabel = null;

    if (Array.isArray(data) && data.length > 0) {
      const sorted = data.sort((a, b) => (b.score || 0) - (a.score || 0));
      bestLabel = sorted[0].label;
    } else if (
      Array.isArray(data) &&
      data.length > 0 &&
      Array.isArray(data[0]) &&
      data[0].length > 0
    ) {
      // Ba'zi modellarda nested array bo'ladi
      const sorted = data[0].sort((a, b) => (b.score || 0) - (a.score || 0));
      bestLabel = sorted[0].label;
    }

    if (!bestLabel) {
      console.warn('Rasmni aniqlash natijasidan label topilmadi:', data);
      return null;
    }

    // Label ba'zan "potato, food" ko'rinishida bo'lishi mumkin
    const cleaned = bestLabel.split(',')[0].trim();

    console.log('Aniqlangan mahsulot:', cleaned);
    return cleaned;
  } catch (err) {
    console.error('detectProductFromImage xatosi:', err.response?.data || err.message);
    return null;
  }
}

module.exports = {
  detectProductFromImage,
};
