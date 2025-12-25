// =====================================================
// File: __tests__/admin/profileController.test.js
// Unit test untuk profileController
// =====================================================

// 1. Impor controller yang akan diuji
// PASTIKAN path ini sesuai dengan struktur folder Anda
const controller = require('../../controllers/admin/profileController');

// 2. Impor modul yang perlu di-mock
const db = require('../../config/db');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// 3. Mock semua dependensi eksternal
jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')), // Mock simpel untuk path.join
}));
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

// 4. Inisialisasi mock objects
let consoleErrorMock;

beforeEach(() => {
  jest.resetAllMocks(); // <--- GANTI JADI INI
  
  // Pastikan mock console.error dibuat SETELAH reset
  consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Kembalikan implementasi console.error
  consoleErrorMock.mockRestore();
});

// 5. Helper untuk membuat mock req dan res
const getMockReqRes = () => {
  const mockUser = {
    id_anggota: '12345',
    nama: 'Admin Lama',
    email: 'admin@lama.com',
    role: 'Admin',
    foto_profile: 'uploads/default.png',
    theme: 'light',
  };
  
  const mockReq = {
    session: { user: { ...mockUser } }, // Buat salinan agar tidak terpengaruh tes lain
    body: {},
    params: {},
    file: null, // Untuk tes upload file
    flash: jest.fn(),
  };

  const mockRes = {
    render: jest.fn(),
    redirect: jest.fn(),
    status: jest.fn(() => mockRes), // Untuk chaining .status().send()
    send: jest.fn(),
  };

  return { mockReq, mockRes, mockUser };
};

// =====================================================
// 📄 TES: getProfile
// =====================================================
describe('getProfile', () => {
  it('harus render halaman profil jika user ditemukan', async () => {
    const { mockReq, mockRes, mockUser } = getMockReqRes();
    
    db.query.mockResolvedValue([[mockUser]]);

    await controller.getProfile(mockReq, mockRes);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT id_anggota, nama, email"), // Cek query
      ['12345']
    );
    expect(mockReq.session.user).toEqual(mockUser); // Pastikan session di-update
    expect(mockRes.render).toHaveBeenCalledWith('admin/profile', {
      title: 'Profil Admin',
      user: mockUser,
      activeNav: 'profile',
      errorMsg: undefined,
      successMsg: undefined,
    });
  });

  it('harus redirect ke login jika tidak ada session', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.session.user = null; // Hapus session

    await controller.getProfile(mockReq, mockRes);
    
    expect(db.query).not.toHaveBeenCalled();
    expect(mockRes.redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('harus return 404 jika user tidak ditemukan di DB', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    db.query.mockResolvedValue([[]]); // DB tidak mengembalikan apa-apa

    await controller.getProfile(mockReq, mockRes);

    expect(db.query).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith('Admin tidak ditemukan');
  });

  it('harus return 500 jika terjadi error database', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    const error = new Error('DB Error');
    db.query.mockRejectedValue(error);

    await controller.getProfile(mockReq, mockRes);

    expect(console.error).toHaveBeenCalledWith("❌ getProfile Admin Error:", error.message);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith('Gagal mengambil profil admin');
  });
});

// =====================================================
// 📄 TES: getEditProfile
// =====================================================
describe('getEditProfile', () => {
  // Tes ini identik dengan getProfile, hanya beda view
  it('harus render halaman edit profil jika user ditemukan', async () => {
    const { mockReq, mockRes, mockUser } = getMockReqRes();
    db.query.mockResolvedValue([[mockUser]]);

    await controller.getEditProfile(mockReq, mockRes);

    expect(db.query).toHaveBeenCalled();
    expect(mockReq.session.user).toEqual(mockUser);
    expect(mockRes.render).toHaveBeenCalledWith('admin/editProfile', {
      title: 'Edit Profil Admin',
      user: mockUser,
      errorMsg: undefined,
      successMsg: undefined,
    });
  });

  it('harus redirect ke login jika tidak ada session', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.session.user = null;

    await controller.getEditProfile(mockReq, mockRes);
    expect(mockRes.redirect).toHaveBeenCalledWith('/auth/login');
  });
});

// =====================================================
// 💾 TES: postEditProfile
// =====================================================
describe('postEditProfile', () => {
  const dataBaru = {
    id_anggota: '54321',
    nama: 'Admin Baru',
    email: 'admin@baru.com',
  };
  const userUpdated = { ...getMockReqRes().mockUser, ...dataBaru };

  beforeEach(() => {
    // Default mock untuk query UPDATE dan SELECT session
    db.query.mockResolvedValue([[{ affectedRows: 1 }]]); // Mock Update
    db.query.mockResolvedValueOnce([[{ affectedRows: 1 }]]).mockResolvedValueOnce([[userUpdated]]); // Mock Select
  });

  it('harus update profil (tanpa password, tanpa file) dan redirect', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = dataBaru;

    await controller.postEditProfile(mockReq, mockRes);

    // 1. Cek query UPDATE
    expect(db.query).toHaveBeenNthCalledWith(1,
      "UPDATE user SET id_anggota = ?, nama = ?, email = ?, foto_profile = ? WHERE id_anggota = ? AND role = 'Admin'",
      ['54321', 'Admin Baru', 'admin@baru.com', 'uploads/default.png', '12345']
    );
    // 2. Cek query SELECT untuk update session
    expect(db.query).toHaveBeenNthCalledWith(2,
      expect.stringContaining("SELECT id_anggota, nama, email"),
      ['54321'] // Cek dengan ID baru
    );
    // 3. Cek session diperbarui
    expect(mockReq.session.user).toEqual(userUpdated);
    // 4. Cek flash dan redirect
    expect(mockReq.flash).toHaveBeenCalledWith('success', 'Profil admin berhasil diperbarui');
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/profile');
    // 5. Pastikan bcrypt dan fs tidak dipanggil
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it('harus update profil (DENGAN password baru)', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { ...dataBaru, password: 'pwbaru', confirm_password: 'pwbaru' };
    
    bcrypt.hash.mockResolvedValue('HASHED_PW_BARU');
    
    // Setup mock DB lagi khusus tes ini
    db.query.mockReset();
    db.query.mockResolvedValueOnce([[{ affectedRows: 1 }]]).mockResolvedValueOnce([[userUpdated]]);

    await controller.postEditProfile(mockReq, mockRes);

    // 1. Cek bcrypt.hash dipanggil
    expect(bcrypt.hash).toHaveBeenCalledWith('pwbaru', 10);
    // 2. Cek query UPDATE (harus mengandung password)
    expect(db.query).toHaveBeenNthCalledWith(1,
      expect.stringContaining(", password = ?"), // Cek query-nya mengandung update password
      ['54321', 'Admin Baru', 'admin@baru.com', 'uploads/default.png', 'HASHED_PW_BARU', '12345']
    );
    // 3. Cek flash dan redirect
    expect(mockReq.flash).toHaveBeenCalledWith('success', 'Profil admin berhasil diperbarui');
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/profile');
  });

  it('harus update profil (DENGAN file baru) dan hapus file lama', async () => {
    const { mockReq, mockRes, mockUser } = getMockReqRes();
    mockReq.body = dataBaru;
    mockReq.file = { filename: 'foto-baru.jpg' }; // Ada file baru di-upload
    
    // Mock bahwa file lama ADA
    fs.existsSync.mockReturnValue(true); 
    // Mock path.join
    path.join.mockReturnValue('public/uploads/default.png');
    
    // Setup mock DB lagi
    db.query.mockReset();
    db.query.mockResolvedValueOnce([[{ affectedRows: 1 }]]).mockResolvedValueOnce([[userUpdated]]);

    await controller.postEditProfile(mockReq, mockRes);

    // 1. Cek path join
    expect(path.join).toHaveBeenCalledWith('public', mockUser.foto_profile);
    // 2. Cek file lama dihapus
    expect(fs.existsSync).toHaveBeenCalledWith('public/uploads/default.png');
    expect(fs.unlinkSync).toHaveBeenCalledWith('public/uploads/default.png');
    // 3. Cek query UPDATE (harus mengandung foto_profile baru)
    expect(db.query).toHaveBeenNthCalledWith(1,
      "UPDATE user SET id_anggota = ?, nama = ?, email = ?, foto_profile = ? WHERE id_anggota = ? AND role = 'Admin'",
      ['54321', 'Admin Baru', 'admin@baru.com', 'uploads/profile/foto-baru.jpg', '12345']
    );
    // 4. Cek flash dan redirect
    expect(mockReq.flash).toHaveBeenCalledWith('success', 'Profil admin berhasil diperbarui');
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/profile');
  });

  it('harus gagal jika nama kosong', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { ...dataBaru, nama: '  ' }; // Nama kosong

    await controller.postEditProfile(mockReq, mockRes);

    expect(db.query).not.toHaveBeenCalled(); // Tidak boleh ada query DB
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Nama wajib diisi');
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/profile/edit');
  });

  it('harus gagal jika password tidak match', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { ...dataBaru, password: 'pw1', confirm_password: 'pw2' };

    await controller.postEditProfile(mockReq, mockRes);

    expect(db.query).not.toHaveBeenCalled();
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Password dan Konfirmasi Password tidak sama');
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/profile/edit');
  });

it('harus redirect ke /admin/profile/edit jika DB error', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = dataBaru;
    const error = new Error('Update Error');
    
    // TAMBAHKAN BARIS INI untuk membersihkan antrian mock dari beforeEach
    db.query.mockReset(); 
    db.query.mockRejectedValue(error); // Gagal saat UPDATE

    await controller.postEditProfile(mockReq, mockRes);

    expect(console.error).toHaveBeenCalledWith("❌ postEditProfile Admin Error:", error.message);
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Gagal menyimpan perubahan profil admin');
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/profile/edit');
  });
});
// =====================================================
// 🌙 TES: toggleTheme
// =====================================================
describe('toggleTheme', () => {
  it('harus ganti theme dari light ke dark', async () => {
    const { mockReq, mockRes, mockUser } = getMockReqRes();
    mockUser.theme = 'light';
    mockReq.session.user = mockUser;
    
    const userUpdated = { ...mockUser, theme: 'dark' };
    
    db.query.mockReset();
    db.query.mockResolvedValueOnce([[{ affectedRows: 1 }]]) // Mock UPDATE
           .mockResolvedValueOnce([[userUpdated]]); // Mock SELECT

    await controller.toggleTheme(mockReq, mockRes);

    // 1. Cek query UPDATE
    expect(db.query).toHaveBeenNthCalledWith(1,
      "UPDATE user SET theme = ? WHERE id_anggota = ? AND role = 'Admin'",
      ['dark', '12345']
    );
    // 2. Cek query SELECT
    expect(db.query).toHaveBeenNthCalledWith(2,
      expect.stringContaining("SELECT id_anggota, nama, email"),
      ['12345']
    );
    // 3. Cek session
    expect(mockReq.session.user.theme).toBe('dark');
    // 4. Cek redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/profile');
  });

  it('harus ganti theme dari dark ke light', async () => {
    const { mockReq, mockRes, mockUser } = getMockReqRes();
    mockUser.theme = 'dark'; // Set user ke dark
    mockReq.session.user = mockUser;
    
    const userUpdated = { ...mockUser, theme: 'light' };
    
    db.query.mockReset();
    db.query.mockResolvedValueOnce([[{ affectedRows: 1 }]]).mockResolvedValueOnce([[userUpdated]]);

    await controller.toggleTheme(mockReq, mockRes);

    // 1. Cek query UPDATE
    expect(db.query).toHaveBeenNthCalledWith(1,
      "UPDATE user SET theme = ? WHERE id_anggota = ? AND role = 'Admin'",
      ['light', '12345'] // Harusnya jadi light
    );
    // 2. Cek session
    expect(mockReq.session.user.theme).toBe('light');
    // 3. Cek redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/profile');
  });

  it('harus redirect jika DB error', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    const error = new Error('Theme Error');
    db.query.mockRejectedValue(error); // Gagal saat UPDATE

    await controller.toggleTheme(mockReq, mockRes);

    expect(console.error).toHaveBeenCalledWith("❌ toggleTheme Admin Error:", error.message);
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Gagal mengganti mode tampilan admin');
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/profile');
  });
});