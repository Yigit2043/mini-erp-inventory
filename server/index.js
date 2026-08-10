const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Mini ERP backend çalışıyor 🚀');
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/customers', customerRoutes);
app.use('/orders', orderRoutes);

// errorHandler EN SONDA olmalı, tüm route'lardan sonra
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});