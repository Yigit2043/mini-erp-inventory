const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Müşteri girişi (portal_enabled=true olan müşteriler için)
const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email);

    if (error || !customers || customers.length === 0) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    const customer = customers[0];

    if (!customer.portal_enabled || !customer.password_hash) {
      return res.status(403).json({ error: 'Bu hesap için portal erişimi açık değil' });
    }

    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    const token = jwt.sign(
      { customerId: customer.id, email: customer.email, type: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Giriş başarılı', token, customerName: customer.name });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Admin'in bir müşteriye portal şifresi belirlemesini/atamasını sağlar
const setCustomerPortalAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, enabled } = req.body;

    const updates = { portal_enabled: enabled };

    if (password) {
      updates.password_hash = await bcrypt.hash(password, 10);
    }

    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, portal_enabled');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

module.exports = { customerLogin, setCustomerPortalAccess };