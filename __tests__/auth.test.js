// __tests__/auth.test.js 

// Mock dependency
const db = require('../config/db');
const bcrypt = require('bcryptjs');

jest.mock('../config/db');
jest.mock('bcryptjs');

// Import handler yang diekspos untuk unit test
const { __testables } = require('../routes/auth');
const { postLogin } = __testables;

// Helper untuk membuat mock req/res
function createMockReqRes() {
  const req = {
    body: {},
    session: {},
    flash: jest.fn(),
  };
  const res = {
    render: jest.fn(),
    redirect: jest.fn(),
  };
  return { req, res };
}

describe('Auth: postLogin (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login sukses: redirect sesuai role', async () => {
    const { req, res } = createMockReqRes();
    req.body = { email: 'admin@test.com', password: 'password123' };

    const mockUser = {
      id_anggota: 1,
      nama: 'Test Admin',
      email: 'admin@test.com',
      password: '$2b$hashedpassword',
      role: 'Admin',
      id_divisi: null,
      foto_profile: null,
      nama_divisi: null,
    };

    db.query.mockResolvedValue([[mockUser]]);
    bcrypt.compare.mockResolvedValue(true);

    await postLogin(req, res);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/admin/dashboard');
    expect(req.session.user).toBeDefined();
  });

  it('email tidak ditemukan: flash + redirect ke /auth/login', async () => {
    const { req, res } = createMockReqRes();
    req.body = { email: 'unknown@test.com', password: 'x' };

    db.query.mockResolvedValue([[]]);

    await postLogin(req, res);

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(req.flash).toHaveBeenCalledWith('error', 'Email atau password salah');
    expect(res.redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('password salah: flash + redirect ke /auth/login', async () => {
    const { req, res } = createMockReqRes();
    req.body = { email: 'admin@test.com', password: 'SALAH' };

    const mockUser = {
      id_anggota: 1,
      nama: 'Test Admin',
      email: 'admin@test.com',
      password: '$2b$hashedpassword',
      role: 'Admin',
    };

    db.query.mockResolvedValue([[mockUser]]);
    bcrypt.compare.mockResolvedValue(false);

    await postLogin(req, res);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(req.flash).toHaveBeenCalledWith('error', 'Email atau password salah');
    expect(res.redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('error database: render login dengan pesan server error', async () => {
    const { req, res } = createMockReqRes();
    req.body = { email: 'admin@test.com', password: 'password123' };

    db.query.mockRejectedValue(new Error('Koneksi DB Gagal'));

    await postLogin(req, res);

    expect(res.render).toHaveBeenCalledWith('auth/login', expect.objectContaining({
      errorMsg: expect.stringContaining('Terjadi kesalahan server'),
    }));
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('login sukses: redirect ke /dpa/dashboard untuk role DPA', async () => {
    const { req, res } = createMockReqRes();
    req.body = { email: 'dpa@test.com', password: 'password123' };

    const mockUser = {
      id_anggota: 2,
      nama: 'Test DPA',
      email: 'dpa@test.com',
      password: '$2b$hashedpassword',
      role: 'DPA',
      id_divisi: null,
      foto_profile: null,
      nama_divisi: null,
    };

    db.query.mockResolvedValue([[mockUser]]);
    bcrypt.compare.mockResolvedValue(true);

    await postLogin(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/dpa/dashboard');
    expect(req.session.user).toBeDefined();
  });

  it('login sukses: HMSI tanpa id_divisi set nama_divisi default dan warning', async () => {
    const { req, res } = createMockReqRes();
    req.body = { email: 'hmsi@test.com', password: 'password123' };

    const mockUser = {
      id_anggota: 3,
      nama: 'Anggota HMSI',
      email: 'hmsi@test.com',
      password: '$2b$hashedpassword',
      role: 'HMSI',
      id_divisi: null,
      foto_profile: null,
      nama_divisi: null,
    };

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    db.query.mockResolvedValue([[mockUser]]);
    bcrypt.compare.mockResolvedValue(true);

    await postLogin(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/hmsi/dashboard');
    expect(req.session.user).toBeDefined();
    expect(req.session.user.nama_divisi).toBe('Tidak Ada Divisi');
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('login sukses: password plain text (non-bcrypt) divalidasi tanpa bcrypt', async () => {
    const { req, res } = createMockReqRes();
    req.body = { email: 'plain@test.com', password: 'plainpass' };

    const mockUser = {
      id_anggota: 4,
      nama: 'User Plain',
      email: 'plain@test.com',
      password: 'plainpass', // bukan hash bcrypt
      role: 'Admin',
      id_divisi: null,
      nama_divisi: null,
    };

    db.query.mockResolvedValue([[mockUser]]);

    await postLogin(req, res);

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/admin/dashboard');
    expect(req.session.user).toBeDefined();
  });

  it('email tidak ditemukan tanpa req.flash: render login dengan pesan', async () => {
    const { req, res } = createMockReqRes();
    req.body = { email: 'unknown@test.com', password: 'x' };
    // Hilangkan flash agar cabang render dijalankan
    req.flash = undefined;

    db.query.mockResolvedValue([[]]);

    await postLogin(req, res);

    expect(res.render).toHaveBeenCalledWith('auth/login', expect.objectContaining({
      errorMsg: 'Email atau password salah',
    }));
    expect(res.redirect).not.toHaveBeenCalled();
  });
});