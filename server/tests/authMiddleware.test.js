const jwt = require('jsonwebtoken');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-anahtar';
});

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  test('Authorization header yoksa 401 döner', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('Geçersiz token ile 403 döner', () => {
    const req = { headers: { authorization: 'Bearer gecersiz.token.degeri' } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('Geçerli token ile req.user doldurulur ve next() çağrılır', () => {
    const token = jwt.sign({ id: 1, email: 'test@test.com', role: 'user' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: 1, email: 'test@test.com', role: 'user' });
  });
});

describe('requireRole', () => {
  test('req.user yoksa 401 döner', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('Rol uygun değilse 403 döner', () => {
    const req = { user: { role: 'user' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('Rol uygunsa next() çağrılır', () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('Birden fazla izinli rolden biri eşleşirse next() çağrılır', () => {
    const req = { user: { role: 'manager' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('admin', 'manager')(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});