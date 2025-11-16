// controllers/DPA/prokerController.test.js

// 1. Impor 'db' AGAR KITA BISA MOCK
//    Path ini diperbaiki: dari __tests__/dpa/ -> ../../ -> config/db
const db = require("../../config/db");

// 2. Impor 'uuid' AGAR KITA BISA MOCK
const { v4: uuidv4 } = require("uuid");

// 3. Impor notifikasiController AGAR KITA BISA MOCK
//    Path ini diperbaiki: dari __tests__/dpa/ -> ../../ -> controllers/hmsi/...
const notifikasiController = require("../../controllers/hmsi/notifikasiController");

// 4. Impor FUNGSI YANG MAU DIUJI
//    Path ini diperbaiki: dari __tests__/dpa/ -> ../../ -> controllers/DPA/...
const {
  getAllProkerDPA,
  getDetailProkerDPA,
  updateStatusProker,
  checkLaporanPending,
} = require("../../controllers/DPA/prokerController");

// =====================================================
// MOCK SEMUA DEPENDENSI EKSTERNAL
// =====================================================

// 5. Mock 'db'
//    Path ini diperbaiki
jest.mock("../../config/db", () => ({
  query: jest.fn(),
}));

// 6. Mock 'uuid' (ini global, tidak perlu diubah)
jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

// 7. Mock 'notifikasiController'
//    Path ini diperbaiki
jest.mock("../../controllers/hmsi/notifikasiController", () => ({
  deleteOldProkerNotif: jest.fn(),
}));

// =====================================================
// MULAI TEST SUITE
// =====================================================

describe("Tes untuk Proker Controller (DPA)", () => {
  let mockReq;
  let mockRes;

  // 'beforeEach' berjalan sebelum setiap tes 'it(...)'
  beforeEach(() => {
    // Bersihkan semua riwayat panggilan mock
    db.query.mockClear();
    uuidv4.mockClear();
    notifikasiController.deleteOldProkerNotif.mockClear();

    // Buat 'res' palsu (stub)
    mockRes = {
      render: jest.fn(),
      json: jest.fn(),
      status: jest.fn(() => mockRes), // '() => mockRes' penting agar bisa chaining
      send: jest.fn(),
    };
  });

  // =====================================================
  // TES UNTUK: getAllProkerDPA
  // =====================================================
  describe("getAllProkerDPA", () => {
    it("seharusnya me-render halaman dengan semua program kerja", async () => {
      // A. ATUR (Arrange)
      const mockProkerRows = [
        {
          id: "proker-1",
          namaProker: "Proker A",
          status_db: "Belum Dimulai",
          tanggal_mulai: "2026-01-01",
        },
        {
          id: "proker-2",
          namaProker: "Proker B",
          status_db: "Selesai",
          tanggal_mulai: "2024-01-01",
        },
      ];
      db.query.mockResolvedValueOnce([mockProkerRows]);

      mockReq = {
        session: { user: { name: "Test DPA" } },
      };

      // B. JALANKAN (Act)
      await getAllProkerDPA(mockReq, mockRes);

      // C. PERIKSA (Assert)
      // Periksa 'db.query' dipanggil
      expect(db.query).toHaveBeenCalled();
      // Periksa halaman yang benar di-render
      expect(mockRes.render).toHaveBeenCalledWith(
        "dpa/lihatProker",
        expect.objectContaining({
          title: "Daftar Program Kerja",
          programs: expect.any(Array), // Pastikan 'programs' adalah array
          errorMsg: null,
        })
      );
      // Periksa apakah data proker diproses
      const renderArgs = mockRes.render.mock.calls[0][1];
      expect(renderArgs.programs.length).toBe(2);
      expect(renderArgs.programs[0].namaProker).toBe("Proker A");
    });

    it("seharusnya me-render halaman error jika database gagal", async () => {
      // A. ATUR (Arrange)
      db.query.mockRejectedValueOnce(new Error("DB Error"));
      mockReq = { session: { user: { name: "Test DPA" } } };

      // B. JALANKAN (Act)
      await getAllProkerDPA(mockReq, mockRes);

      // C. PERIKSA (Assert)
      expect(mockRes.render).toHaveBeenCalledWith(
        "dpa/lihatProker",
        expect.objectContaining({
          programs: [], // Program harus array kosong
          errorMsg: "Gagal memuat daftar program kerja.", // Pesan error harus ada
        })
      );
    });
  });

  // =====================================================
  // TES UNTUK: getDetailProkerDPA
  // =====================================================
  describe("getDetailProkerDPA", () => {
    it("seharusnya me-render detail proker jika ditemukan", async () => {
      // A. ATUR
      const mockDetailRow = [
        {
          id: "proker-123",
          namaProker: "Detail Proker",
          status_db: "Sedang Berjalan",
        },
      ];
      db.query.mockResolvedValueOnce([mockDetailRow]);

      mockReq = {
        params: { id: "proker-123" },
        session: { user: { name: "Test DPA" } },
      };

      // B. JALANKAN
      await getDetailProkerDPA(mockReq, mockRes);

      // C. PERIKSA
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE p.id_ProgramKerja = ?"),
        ["proker-123"]
      );
      expect(mockRes.render).toHaveBeenCalledWith(
        "dpa/detailProker",
        expect.objectContaining({
          proker: expect.objectContaining({ id: "proker-123" }),
        })
      );
    });

    it("seharusnya mengirim 404 jika proker tidak ditemukan", async () => {
      // A. ATUR
      db.query.mockResolvedValueOnce([[]]); // Database mengembalikan array kosong
      mockReq = {
        params: { id: "proker-salah" },
        session: { user: { name: "Test DPA" } },
      };

      // B. JALANKAN
      await getDetailProkerDPA(mockReq, mockRes);

      // C. PERIKSA
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith("Program Kerja tidak ditemukan");
    });
  });

  // =====================================================
  // TES UNTUK: updateStatusProker
  // =====================================================
  describe("updateStatusProker", () => {
    // Skenario Sukses Paling Kompleks
    it("seharusnya berhasil mengubah status menjadi 'Selesai' jika ada laporan", async () => {
      // A. ATUR
      mockReq = {
        params: { id: "proker-abc" },
        body: { status: "Selesai" },
      };
      
      // Atur 'uuidv4' untuk mengembalikan nilai tetap
      uuidv4.mockReturnValue("mock-uuid-12345");

      // Mock Panggilan DB ke-1: Ambil info proker
      const mockProkerInfo = [
        [{ namaProker: "Proker Keren", status_sekarang: "Sedang Berjalan", id_divisi: "div-01" }],
      ];
      db.query.mockResolvedValueOnce(mockProkerInfo);

      // Mock Panggilan DB ke-2: Cek laporan (ditemukan)
      const mockLaporanInfo = [[{ total: 1 }]];
      db.query.mockResolvedValueOnce(mockLaporanInfo);

      // Mock Panggilan DB ke-3: UPDATE proker
      const mockUpdateResult = [{ affectedRows: 1 }];
      db.query.mockResolvedValueOnce(mockUpdateResult);

      // Mock Panggilan DB ke-4: INSERT notifikasi
      db.query.mockResolvedValueOnce([{}]); // Sukses insert

      // B. JALANKAN
      await updateStatusProker(mockReq, mockRes);

      // C. PERIKSA
      // 1. Cek validasi laporan
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT COUNT(*) AS total"),
        ["proker-abc"]
      );
      // 2. Cek update status
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE Program_kerja SET Status = ? WHERE id_ProgramKerja = ?",
        ["Selesai", "proker-abc"]
      );
      // 3. Cek notifikasi lama dihapus
      expect(notifikasiController.deleteOldProkerNotif).toHaveBeenCalledWith("proker-abc");
      // 4. Cek notifikasi baru dibuat
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO Notifikasi"),
        ["mock-uuid-12345", expect.any(String), "div-01", "proker-abc"]
      );
      // 5. Cek respons sukses
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Status program kerja berhasil diubah menjadi "Selesai"',
      });
    });

    it("seharusnya gagal 400 jika status tidak valid", async () => {
      // A. ATUR
      mockReq = {
        params: { id: "proker-abc" },
        body: { status: "DITUNDA" }, // Status tidak valid
      };

      // B. JALANKAN
      await updateStatusProker(mockReq, mockRes);

      // C. PERIKSA
      expect(db.query).not.toHaveBeenCalled(); // DB tidak boleh dipanggil
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Status tidak valid"),
        })
      );
    });

    it("seharusnya gagal 400 jika proker sudah final", async () => {
      // A. ATUR
      mockReq = {
        params: { id: "proker-abc" },
        body: { status: "Sedang Berjalan" },
      };
      // Mock Panggilan DB ke-1: Ambil info proker (status sudah 'Selesai')
      const mockProkerInfo = [[{ namaProker: "Proker Keren", status_sekarang: "Selesai" }]];
      db.query.mockResolvedValueOnce(mockProkerInfo);

      // B. JALANKAN
      await updateStatusProker(mockReq, mockRes);

      // C. PERIKSA
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Status program kerja sudah final dan tidak dapat diubah kembali.",
      });
    });

    it("seharusnya gagal 400 jika update 'Selesai' tapi laporan belum diterima", async () => {
        // A. ATUR
        mockReq = {
            params: { id: "proker-abc" },
            body: { status: "Selesai" },
        };
        // Mock Panggilan DB ke-1: Ambil info proker
        const mockProkerInfo = [[{ status_sekarang: "Sedang Berjalan" }]];
        db.query.mockResolvedValueOnce(mockProkerInfo);

        // Mock Panggilan DB ke-2: Cek laporan (tidak ada)
        const mockLaporanInfo = [[{ total: 0 }]];
        db.query.mockResolvedValueOnce(mockLaporanInfo);

        // B. JALANKAN
        await updateStatusProker(mockReq, mockRes);

        // C. PERIKSA
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: "Belum ada laporan yang diterima pada proker ini.",
        });
    });

    it("seharusnya gagal 500 jika database error", async () => {
        // A. ATUR
        mockReq = {
            params: { id: "proker-abc" },
            body: { status: "Selesai" },
        };
        // Mock Panggilan DB ke-1: GAGAL
        db.query.mockRejectedValueOnce(new Error("DB Gagal Total"));

        // B. JALANKAN
        await updateStatusProker(mockReq, mockRes);

        // C. PERIKSA
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: "Gagal mengubah status program kerja: DB Gagal Total",
        });
    });
  });

  // =====================================================
  // TES UNTUK: checkLaporanPending (TES-mu YANG SEBELUMNYA)
  // =====================================================
  describe("checkLaporanPending", () => {
    it("seharusnya mengembalikan { hasPending: true } jika ada laporan pending", async () => {
      const mockDbResult = [[{ pending_count: 1 }]];
      db.query.mockResolvedValueOnce(mockDbResult);
      mockReq = { params: { id: "proker-123" } };

      await checkLaporanPending(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT COUNT(*) AS pending_count"),
        ["proker-123"]
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        hasPending: true,
        message: "Masih ada laporan belum diterima.",
      });
    });

    it("seharusnya mengembalikan status 500 jika database error", async () => {
      const dbError = new Error("Koneksi putus");
      db.query.mockRejectedValueOnce(dbError);
      mockReq = { params: { id: "proker-gagal" } };

      await checkLaporanPending(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Gagal memeriksa status laporan: Koneksi putus",
      });
    });
  });
});