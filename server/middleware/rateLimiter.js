const rateLimit = require('express-rate-limit');

// Genel API limiti: 15 dakikada 100 istek
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Çok fazla istek gönderildi, lütfen biraz sonra tekrar deneyin' },
});

// Login/register için daha sıkı limit: 15 dakikada 5 deneme
// Brute-force (şifre tahmin etme) saldırılarına karşı koruma
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Çok fazla giriş denemesi, lütfen 15 dakika sonra tekrar deneyin' },
});

module.exports = { generalLimiter, authLimiter };