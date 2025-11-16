// =====================================================
// File: controllers/Admin/divisiController.test.js
// Unit test untuk divisiController
// =====================================================

// Impor controller yang akan diuji
const controller = require('../../controllers/Admin/divisiController');

// Impor mock db. Kita akan mock implementasinya
const db = require('../../config/db');

// Mock modul 'db'
// Semua panggilan ke db.query akan menggunakan implementasi mock ini
jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

// Mock console.error agar tidak mengotori output tes saat menguji skenario error
let consoleErrorMock;

beforeEach(() => {
  // Reset semua mock sebelum setiap tes
  jest.clearAllMocks();
  
  // Mock implementasi console.error
  consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Kembalikan implementasi console.error ke aslinya
  consoleErrorMock.mockRestore();
});

// Helper untuk membuat mock req dan res
const getMockReqRes = () => {
  const mockReq = {
    body: {},
    params: {},
    session: { user: { id: 1, username: 'admin' } },
    flash: jest.fn(),
  };
  const mockRes = {
    render: jest.fn(),
    redirect: jest.fn(),
  };
  return { mockReq, mockRes };
};

// =====================================================
// 📄 TES: getKelolaDivisi
// =====================================================
describe('getKelolaDivisi', () => {
  it('harus me-render halaman dengan daftar divisi', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    const mockDivisiList = [
      { id_divisi: 1, nama_divisi: 'Divisi A' },
      { id_divisi: 2, nama_divisi: 'Divisi B' },
    ];

    // Setup mock db.query untuk mengembalikan daftar divisi
    db.query.mockResolvedValue([mockDivisiList]);

    await controller.getKelolaDivisi(mockReq, mockRes);

    // Assert: Cek db.query dipanggil dengan benar
    expect(db.query).toHaveBeenCalledWith("SELECT * FROM divisi ORDER BY nama_divisi ASC");
    
    // Assert: Cek res.render dipanggil dengan data yang benar
    expect(mockRes.render).toHaveBeenCalledWith('admin/kelolaDivisi', {
      title: 'Kelola Divisi',
      user: mockReq.session.user,
      divisiList: mockDivisiList,
      activeNav: 'divisi',
    });
    expect(mockRes.redirect).not.toHaveBeenCalled();
  });

  it('harus redirect ke /admin jika terjadi error database', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    const error = new Error('DB Error');

    // Setup mock db.query untuk melempar error
    db.query.mockRejectedValue(error);

    await controller.getKelolaDivisi(mockReq, mockRes);

    // Assert: Cek error di-log
    expect(console.error).toHaveBeenCalledWith("❌ [divisiController.getKelolaDivisi] Error:", error);
    // Assert: Cek flash message di-set
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Gagal memuat daftar divisi!');
    // Assert: Cek redirect terjadi
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin');
    expect(mockRes.render).not.toHaveBeenCalled();
  });
});

// =====================================================
// ➕ TES: addDivisi
// =====================================================
describe('addDivisi', () => {
  it('harus menambahkan divisi baru dan redirect', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { nama_divisi: 'Divisi Baru  ', deskripsi: ' Deskripsi ' };

    // Mock 1: Cek duplikasi (return array kosong, artinya tidak ada duplikat)
    db.query.mockResolvedValueOnce([[]]); 
    // Mock 2: Insert (return hasil insert)
    db.query.mockResolvedValueOnce([{ insertId: 3 }]);

    await controller.addDivisi(mockReq, mockRes);

    // Assert: Cek duplikasi dipanggil dengan nama yang sudah di-trim
    expect(db.query).toHaveBeenCalledWith(
      "SELECT id_divisi FROM divisi WHERE nama_divisi = ?",
      ['Divisi Baru']
    );
    // Assert: Insert dipanggil dengan data yang sudah di-trim
    expect(db.query).toHaveBeenCalledWith(
      "INSERT INTO divisi (nama_divisi, deskripsi) VALUES (?, ?)",
      ['Divisi Baru', 'Deskripsi']
    );
    // Assert: Cek flash success
    expect(mockReq.flash).toHaveBeenCalledWith('success', 'Divisi "Divisi Baru" berhasil ditambahkan!');
    // Assert: Cek redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/kelola-divisi');
  });

  it('harus menampilkan error jika nama divisi kosong', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { nama_divisi: '   ', deskripsi: '' }; // Nama kosong setelah trim

    await controller.addDivisi(mockReq, mockRes);

    // Assert: Cek db.query TIDAK dipanggil
    expect(db.query).not.toHaveBeenCalled();
    // Assert: Cek flash error
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Nama divisi wajib diisi!');
    // Assert: Cek redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/kelola-divisi');
  });

  it('harus menampilkan error jika nama divisi duplikat', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { nama_divisi: 'Divisi Duplikat', deskripsi: '' };

    // Mock 1: Cek duplikasi (return data, artinya ada duplikat)
    db.query.mockResolvedValueOnce([[{ id_divisi: 1 }]]);

    await controller.addDivisi(mockReq, mockRes);

    // Assert: Cek duplikasi dipanggil
    expect(db.query).toHaveBeenCalledWith(
      "SELECT id_divisi FROM divisi WHERE nama_divisi = ?",
      ['Divisi Duplikat']
    );
    // Assert: Cek insert TIDAK dipanggil
    expect(db.query).toHaveBeenCalledTimes(1); 
    // Assert: Cek flash error
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Divisi "Divisi Duplikat" sudah ada!');
    // Assert: Cek redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/kelola-divisi');
  });

  it('harus menangani error database saat menambahkan', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { nama_divisi: 'Divisi Gagal', deskripsi: '' };
    const error = new Error('Insert DB Error');

    // Mock 1: Cek duplikasi (lolos)
    db.query.mockResolvedValueOnce([[]]);
    // Mock 2: Insert (gagal)
    db.query.mockRejectedValueOnce(error);

    await controller.addDivisi(mockReq, mockRes);

    // Assert: Cek error di-log
    expect(console.error).toHaveBeenCalledWith("❌ [divisiController.addDivisi] Error:", error);
    // Assert: Cek flash error
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Terjadi kesalahan saat menambahkan divisi!');
    // Assert: Cek redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/kelola-divisi');
  });
});

// =====================================================
// ✏️ TES: updateDivisi
// =====================================================
describe('updateDivisi', () => {
  it('harus meng-update divisi dan redirect', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { id_divisi: 1, nama_divisi: 'Nama Update ', deskripsi: ' Desc Update ' };

    // Mock 1: Cek duplikasi (return array kosong, tidak ada duplikat)
    db.query.mockResolvedValueOnce([[]]);
    // Mock 2: Update (return hasil update)
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await controller.updateDivisi(mockReq, mockRes);

    // Assert: Cek duplikasi dipanggil dengan benar
    expect(db.query).toHaveBeenCalledWith(
      "SELECT id_divisi FROM divisi WHERE nama_divisi = ? AND id_divisi != ?",
      ['Nama Update', 1]
    );
    // Assert: Update dipanggil dengan benar
    expect(db.query).toHaveBeenCalledWith(
      "UPDATE divisi SET nama_divisi = ?, deskripsi = ? WHERE id_divisi = ?",
      ['Nama Update', 'Desc Update', 1]
    );
    // Assert: Cek flash success
    expect(mockReq.flash).toHaveBeenCalledWith('success', 'Divisi "Nama Update" berhasil diperbarui!');
    // Assert: Cek redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/kelola-divisi');
  });

  it('harus menampilkan error jika nama divisi kosong', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { id_divisi: 1, nama_divisi: '', deskripsi: '' };

    await controller.updateDivisi(mockReq, mockRes);

    // Assert: Cek db.query TIDAK dipanggil
    expect(db.query).not.toHaveBeenCalled();
    // Assert: Cek flash error
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Nama divisi tidak boleh kosong!');
    // Assert: Cek redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/kelola-divisi');
  });

  it('harus menampilkan error jika nama duplikat dengan divisi lain', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { id_divisi: 1, nama_divisi: 'Nama Duplikat', deskripsi: '' };

    // Mock 1: Cek duplikasi (return data, ada duplikat milik id 2)
    db.query.mockResolvedValueOnce([[{ id_divisi: 2 }]]);

    await controller.updateDivisi(mockReq, mockRes);

    // Assert: Cek duplikasi dipanggil
    expect(db.query).toHaveBeenCalledWith(
      "SELECT id_divisi FROM divisi WHERE nama_divisi = ? AND id_divisi != ?",
      ['Nama Duplikat', 1]
    );
    // Assert: Cek update TIDAK dipanggil
    expect(db.query).toHaveBeenCalledTimes(1);
    // Assert: Cek flash error
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Divisi dengan nama "Nama Duplikat" sudah digunakan!');
    // Assert: Cek redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/kelola-divisi');
  });

  it('harus menangani error database saat update', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.body = { id_divisi: 1, nama_divisi: 'Nama Update', deskripsi: '' };
    const error = new Error('Update DB Error');

    // Mock 1: Cek duplikasi (lolos)
    db.query.mockResolvedValueOnce([[]]);
    // Mock 2: Update (gagal)
    db.query.mockRejectedValueOnce(error);

    await controller.updateDivisi(mockReq, mockRes);

    // Assert: Cek error di-log
    expect(console.error).toHaveBeenCalledWith("❌ [divisiController.updateDivisi] Error:", error);
    // Assert: Cek flash error
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Terjadi kesalahan saat memperbarui divisi!');
    // Assert: Cek redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/kelola-divisi');
  });
});

// =====================================================
// 🗑️ TES: deleteDivisi
// =====================================================
describe('deleteDivisi', () => {
  it('harus menghapus divisi jika tidak digunakan', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params = { id_divisi: 1 };

    // Mock 1: Cek penggunaan (total: 0, artinya tidak digunakan)
    db.query.mockResolvedValueOnce([[{ total: 0 }]]);
    // Mock 2: Delete (return hasil delete)
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await controller.deleteDivisi(mockReq, mockRes);

    // Assert: Cek penggunaan dipanggil
    expect(db.query).toHaveBeenCalledWith(
      "SELECT COUNT(*) AS total FROM user WHERE id_divisi = ?",
      [1]
    );
    // Assert: Delete dipanggil
    expect(db.query).toHaveBeenCalledWith(
      "DELETE FROM divisi WHERE id_divisi = ?",
      [1]
    );
    // Assert: Cek flash success
    expect(mockReq.flash).toHaveBeenCalledWith('success', 'Divisi berhasil dihapus!');
    // Assert: Cek redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/kelola-divisi');
  });

  it('harus gagal menghapus jika divisi sedang digunakan', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params = { id_divisi: 1 };

    // Mock 1: Cek penggunaan (total: 2, artinya digunakan)
    db.query.mockResolvedValueOnce([[{ total: 2 }]]);

    await controller.deleteDivisi(mockReq, mockRes);

    // Assert: Cek penggunaan dipanggil
    expect(db.query).toHaveBeenCalledWith(
      "SELECT COUNT(*) AS total FROM user WHERE id_divisi = ?",
      [1]
    );
    // Assert: Cek delete TIDAK dipanggil
    expect(db.query).toHaveBeenCalledTimes(1);
    // Assert: Cek flash error
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Divisi ini tidak dapat dihapus karena masih digunakan oleh user!');
    // Assert: Cek redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/kelola-divisi');
  });

  it('harus menangani error database saat delete', async () => {
    const { mockReq, mockRes } = getMockReqRes();
    mockReq.params = { id_divisi: 1 };
    const error = new Error('Delete DB Error');

    // Mock 1: Cek penggunaan (lolos)
    db.query.mockResolvedValueOnce([[{ total: 0 }]]);
    // Mock 2: Delete (gagal)
    db.query.mockRejectedValueOnce(error);

    await controller.deleteDivisi(mockReq, mockRes);

    // Assert: Cek error di-log
    expect(console.error).toHaveBeenCalledWith("❌ [divisiController.deleteDivisi] Error:", error);
    // Assert: Cek flash error
    expect(mockReq.flash).toHaveBeenCalledWith('error', 'Terjadi kesalahan saat menghapus divisi!');
    // Assert: Cd redirect
    expect(mockRes.redirect).toHaveBeenCalledWith('/admin/kelola-divisi');
  });
});