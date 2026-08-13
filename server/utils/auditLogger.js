const supabase = require('../config/supabase');

// Bir işlemi audit_logs tablosuna kaydeder
// Hata verirse ana işlemi durdurmaz, sadece konsola yazar (loglama kritik değil, asıl işlem önceliklidir)
async function logAction(userId, action, entityType, entityId, details = '') {
  try {
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    }]);
  } catch (err) {
    console.error('Audit log kaydedilemedi:', err.message);
  }
}

module.exports = { logAction };