const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const { logAction } = require('../utils/auditLogger');
const ApiError = require('../utils/ApiError');

const getUsers = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, created_at');

  if (error) throw new ApiError(400, error.message);
  res.json(data);
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    throw new ApiError(400, 'Geçerli bir rol girin: user veya admin');
  }

  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', id)
    .select('id, email, role');

  if (error) throw new ApiError(400, error.message);

  await logAction(req.user.id, 'update', 'user', id, `Rol değiştirildi: ${role}`);

  res.json(data[0]);
});

module.exports = { getUsers, updateUserRole };