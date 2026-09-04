const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

const customerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new ApiError(400, 'Email ve şifre gerekli');

    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email);

    if (error || !customers || customers.length === 0) {
      throw new ApiError(401, 'Geçersiz email veya şifre');
    }

    const customer = customers[0];

    if (!customer.portal_enabled || !customer.password_hash) {
      throw new ApiError(403, 'Bu hesap için portal erişimi açık değil');
    }

    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) throw new ApiError(401, 'Geçersiz email veya şifre');

    const token = jwt.sign(
      { customerId: customer.id, email: customer.email, type: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Giriş başarılı', token, customerName: customer.name });
  } catch (err) {
    next(err);
  }
};

const setCustomerPortalAccess = async (req, res, next) => {
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

    if (error) throw new ApiError(400, error.message);

    res.json(data[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = { customerLogin, setCustomerPortalAccess };