// server/scripts/createAdmin.js
// Kullanım: node scripts/createAdmin.js admin@ornek.com GucluBirSifre123
//
// .env dosyasındaki SUPABASE_URL ve SUPABASE_SERVICE_KEY'i kullanır,
// role: 'admin' ile bir kullanıcı ekler. Register endpoint'i her zaman
// 'user' rolü verdiği için sistemdeki İLK admin'i oluşturmanın tek yolu bu.

require('dotenv').config();
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Kullanım: node scripts/createAdmin.js <email> <şifre>');
  process.exit(1);
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Geçersiz e-posta formatı.');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Şifre en az 8 karakter olmalı.');
  process.exit(1);
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_KEY .env dosyasında eksik.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash, role: 'admin' }])
    .select('id, email, role')
    .single();

  if (error) {
    console.error('Admin oluşturulamadı:', error.message);
    process.exit(1);
  }

  console.log('Admin oluşturuldu:', data);
  process.exit(0);
}

main();