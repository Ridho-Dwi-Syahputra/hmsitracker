// 1. Impor 'db' AGAR KITA BISA MOCK
const db = require("../../config/db");

// 2. Impor 'uuid' AGAR KITA BISA MOCK
const { v4: uuidv4 } = require("uuid");

// 3. Impor FUNGSI YANG MAU DIUJI
const {
  getAllLaporanDPA,
  getLaporanDiterima,
  getDetailLaporanDPA,
  getFormEvaluasi,
  postEvaluasi,
  getAllEvaluasiDPA,
} = require("../../controllers/dpa/laporanController");

// =====================================================
// MOCK SEMUA DEPENDENSI EKSTERNAL
// =====================================================

// Mock 'db'
jest.mock("../../config/db", () => ({
  query: jest.fn(),
}));

// Mock 'uuid'
jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

// =====================================================
// MULAI TEST SUITE
// =====================================================

describe("Tes untuk DPA Laporan Controller", () => {
  let mockReq;
  let mockRes;
  let consoleErrorSpy;

  // 'beforeEach' berjalan sebelum setiap tes 'it(...)'
  beforeEach(() => {
    // Bersihkan semua riwayat panggilan mock
    db.query.mockClear();
    uuidv4.mockClear();

    // Buat 'req' palsu (stub)
    mockReq = {
      session: {
        user: { id_anggota: "dpa-001", name: "DPA Utama", role: "DPA" },
      },
      params: {},
      body: {},
      query: {},
    };

    // Buat 'res' palsu (stub)
    mockRes = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(() => mockRes),
      send: jest.fn(),
    };

    // Mata-matai console.error
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  // 'afterEach' berjalan setelah setiap tes
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // =====================================================
  // TES UNTUK: getAllLaporanDPA (Laporan Belum Dievaluasi)
  // =====================================================
  describe("getAllLaporanDPA", () => {
    it("seharusnya me-render halaman dengan daftar laporan yang belum dievaluasi", async () => {
      // A. ATUR (Arrange)
      const mockLaporanData = [
        [
          {
            id_laporan: "L001",
            judul_laporan: "Laporan A",
            tanggal: "2025-11-10",
            namaProker: "Proker A",
            nama_divisi: "Divisi A",
          },
        ],
      ];
      db.query.mockResolvedValueOnce(mockLaporanData);

      // B. JALANKAN (Act)
      await getAllLaporanDPA(mockReq, mockRes);

      // C. PERIKSA (Assert)
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining("WHERE e.id_evaluasi IS NULL"));
      expect(mockRes.render).toHaveBeenCalledWith("dpa/kelolaLaporan", {
        title: "Laporan Belum Dievaluasi",
        user: mockReq.session.user,
        activeNav: "Belum dievaluasi",
        laporan: [
          {
            id_laporan: "L001",
            judul_laporan: "Laporan A",
            namaProker: "Proker A",
            divisi: "Divisi A",
            tanggalFormatted: "Senin, 10 November 2025", // Hasil dari helper formatTanggal
            status: "Belum Dievaluasi",
          },
        ],
        successMsg: null,
        errorMsg: null,
      });
    });

    it("seharusnya mengirim status 500 jika database error", async () => {
      // A. ATUR
      const dbError = new Error("DB fail");
      db.query.mockRejectedValueOnce(dbError);

      // B. JALANKAN
      await getAllLaporanDPA(mockReq, mockRes);

      // C. PERIKSA
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("Gagal mengambil laporan");
      expect(consoleErrorSpy).toHaveBeenCalledWith("❌ Error getAllLaporanDPA:", "DB fail");
    });
  });

  // =====================================================
  // TES UNTUK: getLaporanDiterima (Laporan Telah Dievaluasi)
  // =====================================================
  describe("getLaporanDiterima", () => {
    it("seharusnya me-render halaman dengan laporan yang Diterima dan Revisi", async () => {
      // A. ATUR
      const mockLaporanData = [
        [
          { id_laporan: "L002", judul_laporan: "Laporan B", tanggal: "2025-11-11", namaProker: "Proker B", nama_divisi: "Divisi B", status_konfirmasi: "Selesai" },
          { id_laporan: "L003", judul_laporan: "Laporan C", tanggal: "2025-11-12", namaProker: "Proker C", nama_divisi: "Divisi C", status_konfirmasi: "Revisi" },
        ],
      ];
      db.query.mockResolvedValueOnce(mockLaporanData);

      // B. JALANKAN
      await getLaporanDiterima(mockReq, mockRes);

      // C. PERIKSA
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining("WHERE e.status_konfirmasi IN ('Selesai', 'Revisi')"));
      expect(mockRes.render).toHaveBeenCalledWith("dpa/laporanDiterima", {
        title: "Laporan Telah Dievaluasi",
        user: mockReq.session.user,
        activeNav: "Telah Dievaluasi",
        laporan: [
          { id_laporan: "L002", judul_laporan: "Laporan B", namaProker: "Proker B", divisi: "Divisi B", tanggalFormatted: "Selasa, 11 November 2025", status: "Diterima" },
          { id_laporan: "L003", judul_laporan: "Laporan C", namaProker: "Proker C", divisi: "Divisi C", tanggalFormatted: "Rabu, 12 November 2025", status: "Revisi" },
        ],
        successMsg: null,
        errorMsg: null,
      });
    });
  });

  // =====================================================
  // TES UNTUK: getDetailLaporanDPA
  // =====================================================
  describe("getDetailLaporanDPA", () => {
    it("seharusnya me-render detail laporan dengan evaluasi (activeNav: Telah Dievaluasi)", async () => {
      // A. ATUR
      mockReq.params.id = "L001";
      const mockLaporan = [[{ id_laporan: "L001", judul_laporan: "Laporan Detail", tanggal: "2025-11-10", dokumentasi: "file.pdf" }]];
      const mockEvaluasi = [[{ id_evaluasi: "E001", komentar: "Bagus", tanggal_evaluasi: "2025-11-11", status_konfirmasi: "Selesai" }]];
      
      db.query.mockResolvedValueOnce(mockLaporan); // Panggilan 1: Get Laporan
      db.query.mockResolvedValueOnce(mockEvaluasi); // Panggilan 2: Get Evaluasi

      // B. JALANKAN
      await getDetailLaporanDPA(mockReq, mockRes);

      // C. PERIKSA
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining("WHERE l.id_laporan = ?"), ["L001"]);
      expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining("WHERE e.id_laporan = ?"), ["L001"]);
      expect(mockRes.render).toHaveBeenCalledWith("dpa/detailLaporan", expect.objectContaining({
        activeNav: "Telah Dievaluasi", // Penting, karena status 'Selesai'
        laporan: expect.objectContaining({ judul_laporan: "Laporan Detail", dokumentasi_mime: "application/pdf" }),
        evaluasi: expect.objectContaining({ komentar: "Bagus", tanggal_evaluasi: "Selasa, 11 November 2025" }),
      }));
    });
    
    it("seharusnya me-render detail laporan tanpa evaluasi (activeNav: Belum dievaluasi)", async () => {
      // A. ATUR
      mockReq.params.id = "L002";
      const mockLaporan = [[{ id_laporan: "L002", judul_laporan: "Laporan Baru" }]];
      const mockEvaluasiKosong = [[]]; // Tidak ada evaluasi
      
      db.query.mockResolvedValueOnce(mockLaporan);
      db.query.mockResolvedValueOnce(mockEvaluasiKosong);

      // B. JALANKAN
      await getDetailLaporanDPA(mockReq, mockRes);

      // C. PERIKSA
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(mockRes.render).toHaveBeenCalledWith("dpa/detailLaporan", expect.objectContaining({
        activeNav: "Belum dievaluasi", // Penting
        laporan: expect.objectContaining({ judul_laporan: "Laporan Baru" }),
        evaluasi: null,
      }));
    });

    it("seharusnya mengirim status 404 jika laporan tidak ditemukan", async () => {
      // A. ATUR
      mockReq.params.id = "L999";
      const mockLaporanKosong = [[]];
      db.query.mockResolvedValueOnce(mockLaporanKosong);

      // B. JALANKAN
      await getDetailLaporanDPA(mockReq, mockRes);

      // C. PERIKSA
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith("Laporan tidak ditemukan");
      expect(mockRes.render).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // TES UNTUK: getFormEvaluasi
  // =====================================================
  describe("getFormEvaluasi", () => {
    it("seharusnya me-render form evaluasi dengan data laporan", async () => {
      // A. ATUR
      mockReq.params.id = "L001";
      const mockLaporan = [[{ id_laporan: "L001", judul_laporan: "Laporan Form" }]];
      const mockEvaluasiKosong = [[]];
      
      db.query.mockResolvedValueOnce(mockLaporan);
      db.query.mockResolvedValueOnce(mockEvaluasiKosong);

      // B. JALANKAN
      await getFormEvaluasi(mockReq, mockRes);

      // C. PERIKSA
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(mockRes.render).toHaveBeenCalledWith("dpa/formEvaluasi", expect.objectContaining({
        title: "Evaluasi Laporan",
        activeNav: "Belum dievaluasi",
        laporan: expect.objectContaining({ judul_laporan: "Laporan Form" }),
        evaluasi: null,
      }));
    });
    
    it("seharusnya mengirim status 404 jika laporan tidak ditemukan", async () => {
      // A. ATUR
      mockReq.params.id = "L999";
      db.query.mockResolvedValueOnce([[]]); // Laporan tidak ditemukan

      // B. JALANKAN
      await getFormEvaluasi(mockReq, mockRes);

      // C. PERIKSA
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith("Laporan tidak ditemukan");
    });
  });

  // =====================================================
  // TES UNTUK: postEvaluasi
  // =====================================================
  describe("postEvaluasi", () => {
    it("seharusnya INSERT evaluasi baru dan notifikasi jika belum ada", async () => {
      // A. ATUR
      mockReq.params.id = "L001";
      mockReq.body = { komentar: "Tolong revisi bagian dana", status_konfirmasi: "Revisi" };
      const evaluatorId = mockReq.session.user.id_anggota; // "dpa-001"
      
      const mockCek = [[]]; // 1. Cek: Kosong (belum ada evaluasi)
      const mockUuidEvaluasi = "uuid-eval-123";
      const mockUuidNotif = "uuid-notif-456";
      const mockLaporanInfo = [[{ judul_laporan: "Laporan Keuangan", id_divisi: "DIV-01" }]]; // 3. Get Info Laporan

      uuidv4.mockReturnValueOnce(mockUuidEvaluasi).mockReturnValueOnce(mockUuidNotif);
      db.query
        .mockResolvedValueOnce(mockCek)           // 1. Cek Evaluasi
        .mockResolvedValueOnce(true)              // 2. INSERT Evaluasi
        .mockResolvedValueOnce(mockLaporanInfo)   // 3. Get Info Laporan
        .mockResolvedValueOnce(true);             // 4. INSERT Notifikasi

      // B. JALANKAN
      await postEvaluasi(mockReq, mockRes);

      // C. PERIKSA
      expect(db.query).toHaveBeenCalledTimes(4);
      expect(uuidv4).toHaveBeenCalledTimes(2);
      
      // 2. Cek INSERT Evaluasi
      expect(db.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining("INSERT INTO Evaluasi"),
        [mockUuidEvaluasi, "Tolong revisi bagian dana", "Revisi", "L001", evaluatorId]
      );
      
      // 4. Cek INSERT Notifikasi
      expect(db.query).toHaveBeenNthCalledWith(4,
        expect.stringContaining("INSERT INTO Notifikasi"),
        [mockUuidNotif, 'DPA meminta revisi untuk laporan "Laporan Keuangan".', "DIV-01", "L001", mockUuidEvaluasi]
      );
      
      expect(mockRes.redirect).toHaveBeenCalledWith("/dpa/laporanDiterima?success=Evaluasi berhasil disimpan");
    });
    
    it("seharusnya UPDATE evaluasi yang ada dan kirim notifikasi", async () => {
      // A. ATUR
      mockReq.params.id = "L002";
      mockReq.body = { komentar: "Sudah OK", status_konfirmasi: "Selesai" };
      const evaluatorId = mockReq.session.user.id_anggota;
      const idEvaluasiAda = "E-EXISTING-007";
      
      const mockCek = [[{ id_evaluasi: idEvaluasiAda }]]; // 1. Cek: Ditemukan
      const mockUuidNotif = "uuid-notif-789";
      const mockLaporanInfo = [[{ judul_laporan: "Laporan Final", id_divisi: "DIV-02" }]];

      uuidv4.mockReturnValueOnce(mockUuidNotif); // Hanya 1 uuid untuk notifikasi
      db.query
        .mockResolvedValueOnce(mockCek)           // 1. Cek Evaluasi
        .mockResolvedValueOnce(true)              // 2. UPDATE Evaluasi
        .mockResolvedValueOnce(mockLaporanInfo)   // 3. Get Info Laporan
        .mockResolvedValueOnce(true);             // 4. INSERT Notifikasi

      // B. JALANKAN
      await postEvaluasi(mockReq, mockRes);

      // C. PERIKSA
      expect(db.query).toHaveBeenCalledTimes(4);
      expect(uuidv4).toHaveBeenCalledTimes(1); // Hanya 1x untuk notif
      
      // 2. Cek UPDATE Evaluasi
      expect(db.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining("UPDATE Evaluasi SET"),
        ["Sudah OK", "Selesai", evaluatorId, idEvaluasiAda]
      );
      
      // 4. Cek INSERT Notifikasi
      expect(db.query).toHaveBeenNthCalledWith(4,
        expect.stringContaining("INSERT INTO Notifikasi"),
        [mockUuidNotif, '"Laporan Final" telah diterima oleh DPA.', "DIV-02", "L002", idEvaluasiAda]
      );
      
      expect(mockRes.redirect).toHaveBeenCalledWith("/dpa/laporanDiterima?success=Evaluasi berhasil disimpan");
    });

    it("seharusnya me-redirect dengan error jika validasi gagal (komentar kosong)", async () => {
      // A. ATUR
      mockReq.params.id = "L001";
      mockReq.body = { komentar: "", status_konfirmasi: "Revisi" }; // Komentar kosong

      // B. JALANKAN
      await postEvaluasi(mockReq, mockRes);

      // C. PERIKSA
      expect(mockRes.redirect).toHaveBeenCalledWith("/dpa/laporan/L001/evaluasi?error=Komentar dan status wajib diisi");
      expect(db.query).not.toHaveBeenCalled();
    });
  });
  
  // =====================================================
  // TES UNTUK: getAllEvaluasiDPA
  // =====================================================
  describe("getAllEvaluasiDPA", () => {
    it("seharusnya me-render halaman dengan semua daftar evaluasi", async () => {
      // A. ATUR
      const mockEvaluasiData = [
        [
          { id_evaluasi: "E001", komentar: "OK", tanggal_evaluasi: "2025-11-10", judul_laporan: "Laporan A" },
          { id_evaluasi: "E002", komentar: "Revisi", tanggal_evaluasi: "2025-11-11", judul_laporan: "Laporan B" }
        ]
      ];
      db.query.mockResolvedValueOnce(mockEvaluasiData);

      // B. JALANKAN
      await getAllEvaluasiDPA(mockReq, mockRes);

      // C. PERIKSA
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(mockRes.render).toHaveBeenCalledWith("dpa/kelolaEvaluasi", expect.objectContaining({
        title: "Kelola Evaluasi",
        activeNav: "Evaluasi",
        evaluasi: expect.arrayContaining([
          expect.objectContaining({ id_evaluasi: "E001", tanggalFormatted: "Senin, 10 November 2025" }),
          expect.objectContaining({ id_evaluasi: "E002", tanggalFormatted: "Selasa, 11 November 2025" })
        ])
      }));
    });
  });
});