const { z } = require('zod');
const validate = require('../middleware/validate');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const testSchema = z.object({
  name: z.string().min(1, 'İsim boş olamaz'),
  price: z.number().positive('Fiyat pozitif olmalı'),
});

describe('validate middleware', () => {
  test('Geçerli veri ile next() çağrılır ve req.body güncellenir', () => {
    const req = { body: { name: 'Test Ürün', price: 50 } };
    const res = mockRes();
    const next = jest.fn();

    validate(testSchema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'Test Ürün', price: 50 });
  });

  test('Eksik alan varsa 400 döner ve next() çağrılmaz', () => {
    const req = { body: { price: 50 } };
    const res = mockRes();
    const next = jest.fn();

    validate(testSchema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('Negatif fiyat varsa 400 döner', () => {
    const req = { body: { name: 'Test', price: -10 } };
    const res = mockRes();
    const next = jest.fn();

    validate(testSchema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('Hata mesajı hangi alanın sorunlu olduğunu belirtir', () => {
    const req = { body: { name: '', price: 50 } };
    const res = mockRes();
    const next = jest.fn();

    validate(testSchema)(req, res, next);

    const callArg = res.json.mock.calls[0][0];
    expect(callArg.error).toContain('İsim boş olamaz');
  });
});