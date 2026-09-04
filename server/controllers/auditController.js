const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const ApiError = require('../utils/ApiError');

const getAuditLogs = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw new ApiError(400, error.message);
  res.json(data);
});

module.exports = { getAuditLogs };