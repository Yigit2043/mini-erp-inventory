const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

// Tüm depoları listeler
const getWarehouses = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('warehouses').select('*');
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.json(data);
});

// Yeni depo ekler
const createWarehouse = asyncHandler(async (req, res) => {
  const { name, location } = req.body;

  if (!name) {
    const err = new Error('name zorunlu');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from('warehouses')
    .insert([{ name, location }])
    .select();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.status(201).json(data[0]);
});

// Bir deponun tüm ürün stoklarını getirir (ürün bilgisiyle birlikte)
const getWarehouseStock = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('product_stock')
    .select('*, products(name, sku)')
    .eq('warehouse_id', id);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.json(data);
});

// Bir ürünün depo bazlı stok dağılımını ayarlar/günceller (varsa günceller, yoksa oluşturur)
const setProductStock = asyncHandler(async (req, res) => {
  const { product_id, warehouse_id, stock_qty } = req.body;

  if (!product_id || !warehouse_id || stock_qty === undefined) {
    const err = new Error('product_id, warehouse_id ve stock_qty zorunlu');
    err.statusCode = 400;
    throw err;
  }

  // Bu ürün-depo kombinasyonu zaten var mı kontrol et
  const { data: existing } = await supabase
    .from('product_stock')
    .select('id')
    .eq('product_id', product_id)
    .eq('warehouse_id', warehouse_id)
    .single();

  let result;
  if (existing) {
    const { data, error } = await supabase
      .from('product_stock')
      .update({ stock_qty })
      .eq('id', existing.id)
      .select();
    if (error) {
      const err = new Error(error.message);
      err.statusCode = 400;
      throw err;
    }
    result = data[0];
  } else {
    const { data, error } = await supabase
      .from('product_stock')
      .insert([{ product_id, warehouse_id, stock_qty }])
      .select();
    if (error) {
      const err = new Error(error.message);
      err.statusCode = 400;
      throw err;
    }
    result = data[0];
  }

  res.status(201).json(result);
});

// Bir ürünün tüm depolardaki stok dağılımını getirir
const getProductStockByWarehouse = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const { data, error } = await supabase
    .from('product_stock')
    .select('*, warehouses(name, location)')
    .eq('product_id', productId);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  res.json(data);
});

module.exports = { getWarehouses, createWarehouse, getWarehouseStock, setProductStock, getProductStockByWarehouse };