// __tests__/auth.test.js

const request = require('supertest');
const express = require('express');
const session = require('express-session'); 

// Modul yang akan kita mock
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Router yang akan kita tes
const authRoutes = require('../routes/auth');

// ==========================================
// 1. MOCK DEPENDENCY
// ==========================================
// Kita mock seluruh modul 'db' dan 'bcryptjs'
jest.mock('../config/db');
jest.mock('bcryptjs');

// ==========================================
// 2. SETUP APLIKASI TES
// ==========================================
const app = express();

app.use(express.urlencoded({ extended: false })); 
app.use(express.json()); 
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: true,
}));

app.use((req, res, next) => {
  res.render = jest.fn((view, data) => {
    res.status(200).json({ view, data });
  });
  next();
});

// Pasang router yang mau dites
app.use('/auth', authRoutes);

// 3. TES SUITE
// ==========================================
describe('Auth Routes: POST /auth/login', () => {

  // Bersihkan semua mock setelah setiap tes
  // agar tes satu tidak memengaruhi tes lain
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================
  // TES CASE 1: LOGIN SUKSES
  // ==========================
  it('should login user and redirect to /admin/dashboard for Admin', async () => {
    // 1. Persiapan Mock Data
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

    // 2. Atur 'return value' dari Mocks
    // Saat db.query dipanggil, kembalikan mockUser
    db.query.mockResolvedValue([ [mockUser] ]); 
    bcrypt.compare.mockResolvedValue(true);

    // 3. Kirim Request
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' }); // Kirim body

    // 4. Cek Hasil (Assertions)
    expect(db.query).toHaveBeenCalledTimes(1); 
    expect(bcrypt.compare).toHaveBeenCalledTimes(1); 
    expect(res.statusCode).toBe(302); 
    expect(res.headers.location).toBe('/admin/dashboard'); 
  });

  // ==========================
  // TES CASE 2: EMAIL TIDAK DITEMUKAN
  // ==========================
  it('should return 200 and render login with error if email not found', async () => {
    // 1. Atur Mock
    // Kembalikan array kosong, seolah-olah user tidak ada
    db.query.mockResolvedValue([ [] ]);

    // 2. Kirim Request
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'salah@test.com', password: 'password123' });

    // 3. Cek Hasil
    expect(res.statusCode).toBe(200); 
    expect(bcrypt.compare).not.toHaveBeenCalled(); 
    expect(res.body.view).toBe('auth/login'); 
    expect(res.body.data.errorMsg).toBe('Email atau password salah!'); 
  });

  // ==========================
  // TES CASE 3: PASSWORD SALAH
  // ==========================
  it('should return 200 and render login with error if password mismatch', async () => {
    // 1. Persiapan Mock Data
    const mockUser = {
      id_anggota: 1,
      nama: 'Test Admin',
      email: 'admin@test.com',
      password: '$2b$hashedpassword',
      role: 'Admin',
    };

    // 2. Atur Mock
    db.query.mockResolvedValue([ [mockUser] ]);
    // Saat bcrypt.compare dipanggil, kembalikan 'false' (password salah)
    bcrypt.compare.mockResolvedValue(false);

    // 3. Kirim Request
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'passwordSALAH' });

    // 4. Cek Hasil
    expect(res.statusCode).toBe(200);
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(res.body.view).toBe('auth/login');
    expect(res.body.data.errorMsg).toBe('Email atau password salah!');
  });

  // ==========================
  // TES CASE 4: DATABASE ERROR
  // ==========================
  it('should render login with server error on database failure', async () => {
    // 1. Atur Mock
    // Kita buat db.query melempar (throw) error
    db.query.mockRejectedValue(new Error('Koneksi DB Gagal'));

    // 2. Kirim Request
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });

    // 4. Cek Hasil
    expect(res.statusCode).toBe(200);
    expect(res.body.view).toBe('auth/login');
    expect(res.body.data.errorMsg).toContain('Terjadi kesalahan server');
  });

});