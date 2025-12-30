//controllers/Admin/adminDashboardController.js

// 1. Impor 'db' AGAR KITA BISA MOCK
// Path-nya ../../../ karena kita ada di __tests__/admin/
const db = require("../../config/db");

// 2. Impor FUNGSI YANG MAU DIUJI
// Path-nya ../../controllers/ karena kita ada di __tests__/admin/
const { getDashboard } = require("../../controllers/admin/adminDashboardController");

// 3. Mock 'db'
jest.mock("../../config/db", () => ({
  query: jest.fn(),
}));

// =====================================================
// MULAI TEST SUITE
// =====================================================

describe("Tes untuk Admin Dashboard Controller", () => {
  let mockReq;
  let mockRes;

  // 'beforeEach' berjalan sebelum setiap tes 'it(...)'
  beforeEach(() => {
    // Bersihkan semua riwayat panggilan mock
    db.query.mockClear();

    // Buat 'req' palsu (stub)
    mockReq = {
      session: {
        user: { id_anggota: "admin-001", name: "Admin Utama" },
      },
    };

    // Buat 'res' palsu (stub)
    mockRes = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(() => mockRes), // '() => mockRes' penting agar bisa chaining
      send: jest.fn(),
    };
  });

  // =====================================================
  // TES UNTUK: getDashboard
  // =====================================================
  describe("getDashboard", () => {
    
    // Tes Skenario 1: Sukses (Happy Path)
    it("seharusnya me-render dashboard dengan data ringkasan yang benar", async () => {
      // A. ATUR (Arrange)
      
      // Siapkan data palsu untuk 2 panggilan DB
      const mockTotalUsers = [[{ total_users: 50 }]];
      const mockTotalDivisi = [[{ total_divisi: 8 }]];

      // Suruh 'db.query' mengembalikan data palsu secara berurutan
      db.query.mockResolvedValueOnce(mockTotalUsers);  // Panggilan pertama
      db.query.mockResolvedValueOnce(mockTotalDivisi); // Panggilan kedua

      // B. JALANKAN (Act)
      await getDashboard(mockReq, mockRes);

      // C. PERIKSA (Assert)
      
      // 1. Pastikan 'db.query' dipanggil 2 kali
      expect(db.query).toHaveBeenCalledTimes(2);

      // 2. Periksa query pertama (total users)
      expect(db.query).toHaveBeenCalledWith(
        "SELECT COUNT(id_anggota) AS total_users FROM user"
      );
      
      // 3. Periksa query kedua (total divisi)
      expect(db.query).toHaveBeenCalledWith(
        "SELECT COUNT(id_divisi) AS total_divisi FROM divisi"
      );

      // 4. Periksa 'res.render' dipanggil dengan data yang benar
      expect(mockRes.render).toHaveBeenCalledWith("admin/adminDashboard", {
        title: "Dashboard Admin",
        user: mockReq.session.user,
        activeNav: "dashboard",
        dashboardData: {
          totalUsers: 50,
          totalDivisi: 8,
        },
      });
    });

    // Tes Skenario 2: Gagal (Tidak ada user di session)
    it("seharusnya me-redirect ke halaman login jika tidak ada user di session", async () => {
      // A. ATUR (Arrange)
      // Hapus user dari session
      mockReq.session.user = null; 
      
      // atau mockReq = { session: {} }; juga bisa

      // B. JALANKAN (Act)
      await getDashboard(mockReq, mockRes);

      // C. PERIKSA (Assert)
      
      // 1. Pastikan 'res.redirect' dipanggil ke /auth/login
      expect(mockRes.redirect).toHaveBeenCalledWith("/auth/login");

      // 2. Pastikan 'db.query' TIDAK dipanggil sama sekali
      expect(db.query).not.toHaveBeenCalled();

      // 3. Pastikan 'res.render' TIDAK dipanggil
      expect(mockRes.render).not.toHaveBeenCalled();
    });

    // Tes Skenario 3: Gagal (Database error)
    it("seharusnya mengirim status 500 jika database error", async () => {
      // A. ATUR (Arrange)
      
      // Buat pesan error palsu
      const dbError = new Error("Koneksi gagal");

      // Suruh 'db.query' untuk GAGAL pada panggilan pertama
      db.query.mockRejectedValueOnce(dbError);

      // B. JALANKAN (Act)
      await getDashboard(mockReq, mockRes);

      // C. PERIKSA (Assert)
      
      // 1. Pastikan 'db.query' dipanggil (walaupun gagal)
      expect(db.query).toHaveBeenCalled();

      // 2. Pastikan 'res.status' dipanggil dengan 500
      expect(mockRes.status).toHaveBeenCalledWith(500);

      // 3. Pastikan 'res.send' dipanggil dengan pesan error
      expect(mockRes.send).toHaveBeenCalledWith("Gagal memuat dashboard admin");

      // 4. Pastikan 'res.render' TIDAK dipanggil
      expect(mockRes.render).not.toHaveBeenCalled();
    });
  });
});