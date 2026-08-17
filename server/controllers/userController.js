const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const { logAction } = require('../utils/auditLogger');

// Tüm kullanıcıları getirir (şifre hash'i hariç)
const getUsers = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, created_at');

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.json(data);
});

// Bir kullanıcının rolünü günceller
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    const err = new Error('Geçerli bir rol girin: user veya admin');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', id)
    .select('id, email, role');

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  await logAction(req.user.id, 'update', 'user', id, `Rol değiştirildi: ${role}`);

  res.json(data[0]);
});

module.exports = { getUsers, updateUserRole };