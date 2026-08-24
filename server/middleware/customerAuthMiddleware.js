const jwt = require('jsonwebtoken');

const customerAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token bulunamadı, giriş yapmalısınız' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Geçersiz token formatı' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'customer') {
      return res.status(403).json({ error: 'Bu bir müşteri token\'ı değil' });
    }

    req.customer = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token geçersiz veya süresi dolmuş' });
  }
};

module.exports = customerAuthMiddleware;