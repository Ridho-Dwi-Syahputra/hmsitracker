// __tests__/auth.test.js

const request = require('supertest');
const express = require('express');
const session = require('express-session'); // Untuk mock session

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
// Buat "aplikasi mini" Express hanya untuk tes ini
// Tujuannya adalah agar router kita punya middleware yg dibutuhkan (session, json)
const app = express();

// Middleware yang dibutuhkan oleh router auth
app.use(express.urlencoded({ extended: false })); // Untuk req.body dari form
app.use(express.json()); // Untuk req.body
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: true,
}));

// Mock res.render, karena kita tidak pakai view engine di tes
// Kita buat agar res.render mengembalikan JSON dari data yg di-pass
app.use((req, res, next) => {
  res.render = jest.fn((view, data) => {
    // Kirim status 200 (karena render biasanya 200)
    // dan kirim 'data' sebagai JSON agar bisa kita cek
    res.status(200).json({ view, data });
  });
  next();
});

// Pasang router yang mau dites
app.use('/auth', authRoutes);


// =SI========================================
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
      password: '$2b$hashedpassword', // Password hash
      role: 'Admin',
      id_divisi: null,
      foto_profile: null,
      nama_divisi: null,
    };

    // 2. Atur 'return value' dari Mocks
    // Saat db.query dipanggil, kembalikan mockUser
    db.query.mockResolvedValue([ [mockUser] ]); 
    // Saat bcrypt.compare dipanggil, kembalikan 'true' (password cocok)
    bcrypt.compare.mockResolvedValue(true);

    // 3. Kirim Request
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' }); // Kirim body

    // 4. Cek Hasil (Assertions)
    expect(db.query).toHaveBeenCalledTimes(1); // Pastikan DB dipanggil
    expect(bcrypt.compare).toHaveBeenCalledTimes(1); // Pastikan bcrypt dipanggil
    expect(res.statusCode).toBe(302); // 302 adalah status 'Redirect'
    expect(res.headers.location).toBe('/admin/dashboard'); // Cek tujuan redirect
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
    // (Ingat, mock res.render kita mengembalikan status 200 + JSON)
    expect(res.statusCode).toBe(200); 
    expect(bcrypt.compare).not.toHaveBeenCalled(); // bcrypt.compare tidak boleh terpanggil
    expect(res.body.view).toBe('auth/login'); // Cek view yg di-render
    expect(res.body.data.errorMsg).toBe('Email atau password salah!'); // Cek pesannya
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