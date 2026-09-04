const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');
const ApiError = require('../utils/ApiError');

const getWarehouses = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('warehouses').select('*');
  if (error) throw new ApiError(400, error.message);
  res.json(data);
});

const createWarehouse = asyncHandler(async (req, res) => {
  const { name, location } = req.body;

  if (!name) throw new ApiError(400, 'name zorunlu');

  const { data, error } = await supabase
    .from('warehouses')
    .insert([{ name, location }])
    .select();

  if (error) throw new ApiError(400, error.message);
  res.status(201).json(data[0]);
});

const getWarehouseStock = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('product_stock')
    .select('*, products(name, sku)')
    .eq('warehouse_id', id);

  if (error) throw new ApiError(400, error.message);
  res.json(data);
});

const setProductStock = asyncHandler(async (req, res) => {
  const { product_id, warehouse_id, stock_qty } = req.body;

  if (!product_id || !warehouse_id || stock_qty === undefined) {
    throw new ApiError(400, 'product_id, warehouse_id ve stock_qty zorunlu');
  }

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
    if (error) throw new ApiError(400, error.message);
    result = data[0];
  } else {
    const { data, error } = await supabase
      .from('product_stock')
      .insert([{ product_id, warehouse_id, stock_qty }])
      .select();
    if (error) throw new ApiError(400, error.message);
    result = data[0];
  }

  res.status(201).json(result);
});

const getProductStockByWarehouse = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const { data, error } = await supabase
    .from('product_stock')
    .select('*, warehouses(name, location)')
    .eq('product_id', productId);

  if (error) throw new ApiError(400, error.message);
  res.json(data);
});

module.exports = { getWarehouses, createWarehouse, getWarehouseStock, setProductStock, getProductStockByWarehouse };