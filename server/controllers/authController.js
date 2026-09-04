const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new ApiError(400, 'Email ve şifre gerekli');

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash, role: 'user' }])
      .select();

    if (error) throw new ApiError(400, error.message);

    res.status(201).json({ message: 'Kullanıcı oluşturuldu', user: { id: data[0].id, email: data[0].email } });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new ApiError(400, 'Email ve şifre gerekli');

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error || !users || users.length === 0) {
      throw new ApiError(401, 'Geçersiz email veya şifre');
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new ApiError(401, 'Geçersiz email veya şifre');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Giriş başarılı', token });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Mevcut ve yeni şifre zorunlu');
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, 'Yeni şifre en az 6 karakter olmalı');
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    if (error || !user) throw new ApiError(404, 'Kullanıcı bulunamadı');

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) throw new ApiError(401, 'Mevcut şifre yanlış');

    const newHash = await bcrypt.hash(newPassword, 10);
    await supabase.from('users').update({ password_hash: newHash }).eq('id', req.user.id);

    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, changePassword };