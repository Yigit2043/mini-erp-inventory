// Merkezi hata yakalayıcı middleware
// Express'te 4 parametreli middleware'ler otomatik olarak hata yakalayıcı sayılır
const errorHandler = (err, req, res, next) => {
  console.error('Hata:', err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Sunucuda beklenmeyen bir hata oluştu';

  res.status(statusCode).json({ error: message });
};

// async controller fonksiyonlarını try-catch yazmadan sarmalamak için yardımcı fonksiyon
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };