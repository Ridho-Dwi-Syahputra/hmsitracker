// 1. Impor 'db' AGAR KITA BISA MOCK
// Path-nya ../../ karena kita ada di __tests__/dpa/
const db = require("../../config/db");

// 2. Impor FUNGSI YANG MAU DIUJI
// Path-nya ../../controllers/ karena kita ada di __tests__/dpa/
const { getDpaDashboardStats } = require("../../controllers/dpa/dpaDashboardController");

// =====================================================
// MOCK SEMUA DEPENDENSI EKSTERNAL
// =====================================================

// 3. Mock 'db'
jest.mock("../../config/db", () => ({
  query: jest.fn(),
}));

// =====================================================
// MULAI TEST SUITE
// =====================================================

describe("Tes untuk DPA Dashboard Controller", () => {
  let mockReq;
  let mockRes;
  let consoleErrorSpy; 

  // 'beforeEach' berjalan sebelum setiap tes 'it(...)'
  beforeEach(() => {
    // Bersihkan semua riwayat panggilan mock
    db.query.mockClear();

    // Buat 'req' palsu (stub) untuk skenario happy path
    mockReq = {
      session: {
        user: { 
          id_anggota: "dpa-001", 
          name: "DPA Utama", 
          role: "DPA" // Role sangat penting untuk controller ini
        },
      },
    };

    mockRes = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(() => mockRes), // '() => mockRes' penting agar bisa chaining
      send: jest.fn(),
    };
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Kembalikan console.error ke fungsi aslinya
    consoleErrorSpy.mockRestore();
  });

  // =====================================================
  // TES UNTUK: getDpaDashboardStats
  // =====================================================
  describe("getDpaDashboardStats", () => {
    
    // Tes Skenario 1: Sukses (Happy Path)
    it("seharusnya me-render dashboard DPA dengan data statistik yang benar", async () => {
      // A. ATUR (Arrange)
      
      // Siapkan data palsu untuk 7 panggilan DB di Promise.all
      const mockTotalProker = [[{ total: 20 }]];
      const mockProkerSelesai = [[{ total: 10 }]];
      const mockProkerBerjalan = [[{ total: 5 }]];
      const mockBelumEvaluasi = [[{ total: 3 }]];
      const mockLaporanRevisi = [[{ total: 2 }]];
      const mockRecentActivities = [[
        { description: "Mengajukan laporan 'LPJ Bulanan'", nama_divisi: "Infokom", activity_timestamp: "2025-11-15T10:00:00Z" },
        { description: "Membalas evaluasi pada: 'Proposal Acara'", nama_divisi: "PSDM", activity_timestamp: "2025-11-14T09:30:00Z" }
      ]];
      const mockTotalLaporan = [[{ total: 15 }]];

      // Suruh 'db.query' mengembalikan data palsu secara berurutan
      // Sesuai urutan di Promise.all
      db.query
        .mockResolvedValueOnce(mockTotalProker)         // Panggilan 1
        .mockResolvedValueOnce(mockProkerSelesai)      // Panggilan 2
        .mockResolvedValueOnce(mockProkerBerjalan)     // Panggilan 3
        .mockResolvedValueOnce(mockBelumEvaluasi)      // Panggilan 4
        .mockResolvedValueOnce(mockLaporanRevisi)      // Panggilan 5
        .mockResolvedValueOnce(mockRecentActivities)   // Panggilan 6
        .mockResolvedValueOnce(mockTotalLaporan);      // Panggilan 7

      // B. JALANKAN (Act)
      await getDpaDashboardStats(mockReq, mockRes);

      // C. PERIKSA (Assert)
      
      // 1. Pastikan 'db.query' dipanggil 7 kali
      expect(db.query).toHaveBeenCalledTimes(7);

      // 2. Periksa query pertama (total proker) - opsional tapi bagus
      expect(db.query).toHaveBeenNthCalledWith(1,
        `SELECT COUNT(*) AS total FROM Program_kerja`
      );
      
      // 3. Periksa query keenam (aktivitas) - opsional
      expect(db.query).toHaveBeenNthCalledWith(6,
        expect.stringContaining("ORDER BY activity_timestamp DESC") // Cek sebagian query
      );

      // 4. Periksa 'res.render' dipanggil dengan data yang benar
      expect(mockRes.render).toHaveBeenCalledWith("dpa/dpaDashboard", {
        title: "Dashboard DPA",
        user: mockReq.session.user,
        activeNav: "Dashboard",
        totalProker: 20,
        prokerSelesai: 10,
        prokerBerjalan: 5,
        totalLaporan: 15,
        laporanBelumEvaluasi: 3,
        laporanRevisi: 2,
        // Pastikan helper formatTanggal (internal) juga bekerja
        recentHmsiActivities: [
          { description: "Mengajukan laporan 'LPJ Bulanan'", nama_divisi: "Infokom", activity_timestamp: "2025-11-15T10:00:00Z", tanggalFormatted: "15 November 2025" },
          { description: "Membalas evaluasi pada: 'Proposal Acara'", nama_divisi: "PSDM", activity_timestamp: "2025-11-14T09:30:00Z", tanggalFormatted: "14 November 2025" }
        ],
      });
      
      // 5. Pastikan tidak ada redirect atau error
      expect(mockRes.redirect).not.toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    // Tes Skenario 2: Gagal (Tidak ada user di session)
    it("seharusnya me-redirect ke login jika tidak ada user di session", async () => {
      // A. ATUR (Arrange)
      mockReq.session.user = null; // Hapus user dari session

      // B. JALANKAN (Act)
      await getDpaDashboardStats(mockReq, mockRes);

      // C. PERIKSA (Assert)
      
      // 1. Pastikan 'res.redirect' dipanggil ke /auth/login
      expect(mockRes.redirect).toHaveBeenCalledWith("/auth/login?error=Akses ditolak.");

      // 2. Pastikan 'db.query' TIDAK dipanggil sama sekali
      expect(db.query).not.toHaveBeenCalled();

      // 3. Pastikan 'res.render' TIDAK dipanggil
      expect(mockRes.render).not.toHaveBeenCalled();
      
      // 4. Pastikan console.error dipanggil
      expect(consoleErrorSpy).toHaveBeenCalledWith("Akses ditolak: bukan DPA atau sesi tidak valid.");
    });
    
    // Tes Skenario 3: Gagal (Role user salah, misal 'HMSI')
    it("seharusnya me-redirect ke login jika role user bukan 'DPA'", async () => {
      // A. ATUR (Arrange)
      mockReq.session.user.role = "HMSI"; // Ganti role user

      // B. JALANKAN (Act)
      await getDpaDashboardStats(mockReq, mockRes);

      // C. PERIKSA (Assert)
      
      // 1. Pastikan 'res.redirect' dipanggil ke /auth/login
      expect(mockRes.redirect).toHaveBeenCalledWith("/auth/login?error=Akses ditolak.");

      // 2. Pastikan 'db.query' TIDAK dipanggil sama sekali
      expect(db.query).not.toHaveBeenCalled();

      // 3. Pastikan 'res.render' TIDAK dipanggil
      expect(mockRes.render).not.toHaveBeenCalled();
      
      // 4. Pastikan console.error dipanggil
      expect(consoleErrorSpy).toHaveBeenCalledWith("Akses ditolak: bukan DPA atau sesi tidak valid.");
    });

    // Tes Skenario 4: Gagal (Database error)
    it("seharusnya mengirim status 500 jika database error", async () => {
      // A. ATUR (Arrange)
      
      // Buat pesan error palsu
      const dbError = new Error("Koneksi gagal");

      // Suruh 'db.query' untuk GAGAL. Cukup 1 dari 7 query gagal,
      // maka Promise.all akan gagal.
      db.query.mockRejectedValueOnce(dbError);

      // B. JALANKAN (Act)
      await getDpaDashboardStats(mockReq, mockRes);

      // C. PERIKSA (Assert)
      
      // 1. Pastikan 'db.query' dipanggil (walaupun gagal)
      expect(db.query).toHaveBeenCalled();

      // 2. Pastikan 'res.status' dipanggil dengan 500
      expect(mockRes.status).toHaveBeenCalledWith(500);

      // 3. Pastikan 'res.send' dipanggil dengan pesan error
      expect(mockRes.send).toHaveBeenCalledWith("Terjadi kesalahan pada server. Cek log untuk detail.");

      // 4. Pastikan 'res.render' TIDAK dipanggil
      expect(mockRes.render).not.toHaveBeenCalled();
      
      // 5. Pastikan console.error dipanggil dengan error database
      expect(consoleErrorSpy).toHaveBeenCalledWith("❌ Error saat mengambil statistik DPA:", "Koneksi gagal");
    });
    
    // Tes Skenario 5: Sukses (Data kosong atau 0)
    it("seharusnya me-render dengan data 0 jika query mengembalikan null atau 0", async () => {
      // A. ATUR (Arrange)
      
      // Simulasikan hasil DB yang kosong atau 0
      const mockEmpty = [[{ total: 0 }]];
      const mockEmptyActivities = [[]]; // Array kosong untuk aktivitas

      // Set semua 7 query untuk mengembalikan 0 atau array kosong
      db.query
        .mockResolvedValueOnce(mockEmpty) // totalProker
        .mockResolvedValueOnce(mockEmpty) // prokerSelesai
        .mockResolvedValueOnce(mockEmpty) // prokerBerjalan
        .mockResolvedValueOnce(mockEmpty) // belumEvaluasi
        .mockResolvedValueOnce(mockEmpty) // laporanRevisi
        .mockResolvedValueOnce(mockEmptyActivities) // recentActivities
        .mockResolvedValueOnce(mockEmpty); // totalLaporan

      // B. JALANKAN (Act)
      await getDpaDashboardStats(mockReq, mockRes);

      // C. PERIKSA (Assert)
      
      // 1. Pastikan 'db.query' dipanggil 7 kali
      expect(db.query).toHaveBeenCalledTimes(7);

      // 2. Periksa 'res.render' dipanggil dengan data 0
      expect(mockRes.render).toHaveBeenCalledWith("dpa/dpaDashboard", {
        title: "Dashboard DPA",
        user: mockReq.session.user,
        activeNav: "Dashboard",
        totalProker: 0,
        prokerSelesai: 0,
        prokerBerjalan: 0,
        totalLaporan: 0,
        laporanBelumEvaluasi: 0,
        laporanRevisi: 0,
        recentHmsiActivities: [], // Array kosong
      });
      
      // 3. Pastikan tidak ada redirect atau error
      expect(mockRes.redirect).not.toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});