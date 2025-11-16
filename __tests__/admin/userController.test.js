// =====================================================
// File: __tests__/admin/userController.test.js
// Unit test untuk userController
// =====================================================

// 1. Impor controller (sesuaikan path jika perlu)
const controller = require('../../controllers/Admin/userController');

// 2. Impor & Mock dependensi
const db = require('../../config/db');
const bcrypt = require('bcryptjs');

jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

// 3. Setup global mocks (console.error)
let consoleErrorMock;

beforeEach(() => {
  // Gunakan resetAllMocks untuk membersihkan implementasi antar tes
  jest.resetAllMocks();
  
  // Mock console.error SETELAH reset
  consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorMock.mockRestore();
});

// 4. Helper untuk mock req/res
const getMockReqRes = () => {
  const mockReq = {
    session: { user: { id_anggota: 'admin01', nama: 'Admin Utama' } },
    body: {},
    params: {},
  };
  const mockRes = {
    render: jest.fn(),
    redirect: jest.fn(),
    status: jest.fn(() => mockRes), // Chaining
    send: jest.fn(),
    json: jest.fn(), // Untuk checkUserActivity
  };
  return { mockReq, mockRes };
};

// =====================================================
// 📄 TES: getAllUsers
// =====================================================
describe('getAllUsers', () => {
  it('harus render halaman dengan daftar user dan divisi', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    const mockUsers = [{ id_anggota: '001', nama: 'User A' }];
    const mockDivisi = [{ id_divisi: 1, nama_divisi: 'BPM' }];

    // Mock untuk 2 panggilan db.query
    db.query
      .mockResolvedValueOnce([mockUsers])  // Panggilan 1: Ambil Users
      .mockResolvedValueOnce([mockDivisi]); // Panggilan 2: Ambil Divisi

    await controller.getAllUsers(mockReq, mockRes);

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(mockRes.render).toHaveBeenCalledWith('admin/kelolaUser', {
      title: 'Kelola User',
      user: mockReq.session.user,
      activeNav: 'users',
      users: mockUsers,
      divisiList: mockDivisi,
      errorMsg: null,
      successMsg: null,
    });
  });

  it('harus return 500 jika DB error', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    const error = new Error('DB Error');
    db.query.mockRejectedValue(error);

    await controller.getAllUsers(mockReq, mockRes);

    expect(console.error).toHaveBeenCalledWith("❌ Error getAllUsers:", error.message);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith("Terjadi kesalahan server");
  });
});

// =====================================================
// ➕ TES: getTambahUser
// =====================================================
describe('getTambahUser', () => {
  it('harus render form tambah user dengan daftar divisi', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    const mockDivisi = [{ id_divisi: 1, nama_divisi: 'BPM' }];
    
    db.query.mockResolvedValueOnce([mockDivisi]);

    await controller.getTambahUser(mockReq, mockRes);

    expect(db.query).toHaveBeenCalledWith("SELECT * FROM divisi ORDER BY nama_divisi ASC");
    expect(mockRes.render).toHaveBeenCalledWith('admin/tambahUser', expect.objectContaining({
      title: "Tambah User",
      divisiList: mockDivisi,
    }));
  });
});

// =====================================================
// ➕ TES: postTambahUser
// =====================================================
describe('postTambahUser', () => {
  const mockDivisi = [{ id_divisi: 1, nama_divisi: 'BPM' }];
  const mockBody = {
    id_anggota: '001',
    nama: 'User Baru',
    email: 'user@baru.com',
    password: 'pw123',
    role: 'HMSI',
    id_divisi: 1,
  };

  it('harus menambah user baru (role HMSI) dan redirect', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = mockBody;

    db.query.mockResolvedValueOnce([mockDivisi]); // Panggilan 1: Ambil Divisi
    db.query.mockResolvedValueOnce([{}]);        // Panggilan 2: INSERT
    bcrypt.hash.mockResolvedValue('hashed_pw');

    await controller.postTambahUser(mockReq, mockRes);

    expect(bcrypt.hash).toHaveBeenCalledWith('pw123', 10);
    expect(db.query).toHaveBeenNthCalledWith(2,
      expect.stringContaining("INSERT INTO user"),
      ['001', 'User Baru', 'user@baru.com', 'hashed_pw', 'HMSI', 1] // Cek divisiValue
    );
    expect(mockRes.redirect).toHaveBeenCalledWith("/admin/kelola-user");
  });

  it('harus menambah user (role Admin) dengan id_divisi null', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { ...mockBody, role: 'Admin', id_divisi: 1 }; // id_divisi akan diabaikan

    db.query.mockResolvedValueOnce([mockDivisi]).mockResolvedValueOnce([{}]);
    bcrypt.hash.mockResolvedValue('hashed_pw');

    await controller.postTambahUser(mockReq, mockRes);

    expect(db.query).toHaveBeenNthCalledWith(2,
      expect.stringContaining("INSERT INTO user"),
      ['001', 'User Baru', 'user@baru.com', 'hashed_pw', 'Admin', null] // Cek divisiValue jadi null
    );
    expect(mockRes.redirect).toHaveBeenCalledWith("/admin/kelola-user");
  });

  it('harus render ulang form jika field wajib kosong', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { ...mockBody, nama: '' }; // Nama dikosongkan

    db.query.mockResolvedValueOnce([mockDivisi]);

    await controller.postTambahUser(mockReq, mockRes);

    expect(mockRes.render).toHaveBeenCalledWith('admin/tambahUser', expect.objectContaining({
      errorMsg: "Semua field wajib diisi!",
      old: mockReq.body,
    }));
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(mockRes.redirect).not.toHaveBeenCalled();
  });

  it('harus render ulang form jika role HMSI tapi divisi kosong', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { ...mockBody, id_divisi: undefined };

    db.query.mockResolvedValueOnce([mockDivisi]);

    await controller.postTambahUser(mockReq, mockRes);

    expect(mockRes.render).toHaveBeenCalledWith('admin/tambahUser', expect.objectContaining({
      errorMsg: "Pilih divisi untuk role HMSI!",
      old: mockReq.body,
    }));
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });
});

// =====================================================
// ✏️ TES: getEditUser
// =====================================================
describe('getEditUser', () => {
  it('harus render form edit jika user ditemukan', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params.id = '001';
    const mockUser = { id_anggota: '001', nama: 'User A' };
    const mockDivisi = [{ id_divisi: 1, nama_divisi: 'BPM' }];

    db.query
      .mockResolvedValueOnce([[mockUser]])   // Panggilan 1: Ambil User
      .mockResolvedValueOnce([mockDivisi]); // Panggilan 2: Ambil Divisi

    await controller.getEditUser(mockReq, mockRes);

    expect(db.query).toHaveBeenNthCalledWith(1, "SELECT * FROM user WHERE id_anggota = ?", ['001']);
    expect(mockRes.render).toHaveBeenCalledWith('admin/editUser', expect.objectContaining({
      userData: mockUser,
      divisiList: mockDivisi,
    }));
  });

  it('harus return 404 jika user tidak ditemukan', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params.id = '999';
    
    db.query.mockResolvedValueOnce([[]]); // User tidak ditemukan

    await controller.getEditUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith("User tidak ditemukan");
  });
});

// =====================================================
// ✏️ TES: postEditUser
// =====================================================
describe('postEditUser', () => {
  it('harus update user TANPA password baru', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params.id = '001';
    mockReq.body = {
      nama: 'Nama Baru', email: 'email@baru.com', role: 'HMSI', id_divisi: 1, password: '' 
    };

    db.query.mockResolvedValueOnce([{}]);

    await controller.postEditUser(mockReq, mockRes);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("SET nama=?, email=?, role=?, id_divisi=?"), // Query tanpa password
      ['Nama Baru', 'email@baru.com', 'HMSI', 1, '001']
    );
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(mockRes.redirect).toHaveBeenCalledWith("/admin/kelola-user");
  });

  it('harus update user DENGAN password baru', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params.id = '001';
    mockReq.body = {
      nama: 'Nama Baru', email: 'email@baru.com', role: 'Admin', id_divisi: '', password: 'pwbaru' 
    };

    bcrypt.hash.mockResolvedValue('hashed_pw_baru');
    db.query.mockResolvedValueOnce([{}]);

    await controller.postEditUser(mockReq, mockRes);

    expect(bcrypt.hash).toHaveBeenCalledWith('pwbaru', 10);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("SET nama=?, email=?, password=?, role=?, id_divisi=?"), // Query DENGAN password
      ['Nama Baru', 'email@baru.com', 'hashed_pw_baru', 'Admin', null, '001']
    );
    expect(mockRes.redirect).toHaveBeenCalledWith("/admin/kelola-user");
  });
});

// =====================================================
// 🔍 TES: checkUserActivity
// =====================================================
describe('checkUserActivity', () => {
  it('harus return canDelete: true jika role HMSI dan tidak ada aktivitas', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params.id = '001';

    db.query
      .mockResolvedValueOnce([[{ role: 'HMSI' }]])   // Panggilan 1: Cek Role
      .mockResolvedValueOnce([[{ count: 0 }]]);    // Panggilan 2: Cek Aktivitas

    await controller.checkUserActivity(mockReq, mockRes);

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(mockRes.json).toHaveBeenCalledWith({ canDelete: true });
  });

  it('harus return canDelete: false jika role Admin', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params.id = '001';

    db.query.mockResolvedValueOnce([[{ role: 'Admin' }]]); // Panggilan 1: Cek Role

    await controller.checkUserActivity(mockReq, mockRes);

    expect(db.query).toHaveBeenCalledTimes(1); // Tidak lanjut cek aktivitas
    expect(mockRes.json).toHaveBeenCalledWith({
      canDelete: false,
      message: `User dengan role "Admin" tidak dapat dihapus.`
    });
  });

  it('harus return canDelete: false jika role DPA', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params.id = '001';

    db.query.mockResolvedValueOnce([[{ role: 'DPA' }]]); // Panggilan 1: Cek Role

    await controller.checkUserActivity(mockReq, mockRes);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({
      canDelete: false,
      message: `User dengan role "DPA" tidak dapat dihapus.`
    });
  });
  
  it('harus return canDelete: false jika role HMSI dan punya aktivitas', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params.id = '001';

    db.query
      .mockResolvedValueOnce([[{ role: 'HMSI' }]])   // Panggilan 1: Cek Role
      .mockResolvedValueOnce([[{ count: 3 }]]);    // Panggilan 2: Cek Aktivitas (ada)

    await controller.checkUserActivity(mockReq, mockRes);

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(mockRes.json).toHaveBeenCalledWith({
      canDelete: false,
      message: `User ini tidak dapat dihapus karena sudah memiliki aktivitas (program kerja).`
    });
  });

  it('harus return 500 jika DB error', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params.id = '001';
    const error = new Error('DB Error');
    db.query.mockRejectedValue(error); // Gagal saat cek role

    await controller.checkUserActivity(mockReq, mockRes);

    expect(console.error).toHaveBeenCalledWith("❌ Error checkUserActivity:", error.message);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ canDelete: false, message: "Terjadi kesalahan server" });
  });
});

// =====================================================
// 🗑️ TES: deleteUser
// =====================================================
describe('deleteUser', () => {
  it('harus hapus user jika role HMSI dan tidak ada aktivitas', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params.id = '001';

    db.query
      .mockResolvedValueOnce([[{ role: 'HMSI' }]]) // Panggilan 1: Cek Role
      .mockResolvedValueOnce([[{ count: 0 }]])    // Panggilan 2: Cek Aktivitas
      .mockResolvedValueOnce([{}]);               // Panggilan 3: DELETE

    await controller.deleteUser(mockReq, mockRes);

    expect(db.query).toHaveBeenCalledTimes(3);
    expect(db.query).toHaveBeenNthCalledWith(3, "DELETE FROM user WHERE id_anggota = ?", ['001']);
    expect(mockRes.redirect).toHaveBeenCalledWith("/admin/kelola-user");
  });

  it('harus return 400 jika mencoba hapus role Admin', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params.id = '001';

    db.query.mockResolvedValueOnce([[{ role: 'Admin' }]]); // Panggilan 1: Cek Role

    await controller.deleteUser(mockReq, mockRes);

    expect(db.query).toHaveBeenCalledTimes(1); // Berhenti setelah cek role
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith(`User dengan role "Admin" tidak dapat dihapus.`);
    expect(mockRes.redirect).not.toHaveBeenCalled();
  });

  it('harus return 400 jika role HMSI tapi punya aktivitas', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params.id = '001';

    db.query
      .mockResolvedValueOnce([[{ role: 'HMSI' }]]) // Panggilan 1: Cek Role
      .mockResolvedValueOnce([[{ count: 1 }]]);    // Panggilan 2: Cek Aktivitas (ada)

    await controller.deleteUser(mockReq, mockRes);

    expect(db.query).toHaveBeenCalledTimes(2); // Berhenti setelah cek aktivitas
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith("User tidak dapat dihapus karena sudah memiliki aktivitas");
    expect(mockRes.redirect).not.toHaveBeenCalled();
  });
});