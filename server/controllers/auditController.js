const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

// Tüm audit log kayıtlarını getirir, en yeniden eskiye sıralı
const getAuditLogs = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100); // en fazla son 100 kayıt, performans için

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  res.json(data);
});

module.exports = { getAuditLogs };