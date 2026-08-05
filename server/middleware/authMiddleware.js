const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token bulunamadı, giriş yapmalısınız' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer TOKEN" formatından TOKEN'ı ayır

  if (!token) {
    return res.status(401).json({ error: 'Geçersiz token formatı' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // req.user artık { id, email, role } içerir
    next(); // her şey doğruysa isteğe devam et
  } catch (err) {
    return res.status(403).json({ error: 'Token geçersiz veya süresi dolmuş' });
  }
};

module.exports = authMiddleware;