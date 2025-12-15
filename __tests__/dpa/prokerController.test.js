// controllers/DPA/prokerController.test.js


const db = require("../../config/db");
const { v4: uuidv4 } = require("uuid");
const notifikasiController = require("../../controllers/hmsi/notifikasiController");

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
// Kita memalsukan DB agar Controller tidak mengakses database sungguhan.
jest.mock("../../config/db", () => ({
  query: jest.fn(),
}));

// 6. Mock 'uuid'
jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

// 7. Mock 'notifikasiController'
// Kita memalsukan fungsi helper notifikasi
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

  
    mockRes = {
      render: jest.fn(),
      json: jest.fn(),
      status: jest.fn(() => mockRes), 
      send: jest.fn(),
    };
  });

  // =====================================================
  // TES UNTUK: getAllProkerDPA (Membaca Daftar Proker)
  // =====================================================
  describe("getAllProkerDPA", () => {
    it("seharusnya me-render halaman dengan semua program kerja", async () => {
      // A. ATUR (Arrange): Siapkan data Proker tiruan dari DB
      const mockProkerRows = [
        {
          id: "proker-1",
          namaProker: "Proker A",
          status_db: "Belum Dimulai",
          tanggal_mulai: "2026-01-01",
        },
      ];
      db.query.mockResolvedValueOnce([mockProkerRows]);

      mockReq = {
        session: { user: { name: "Test DPA" } },
      };

      // B. JALANKAN (Act): Panggil fungsi yang diuji
      await getAllProkerDPA(mockReq, mockRes);

      // C. PERIKSA (Assert): Cek hasil render
      expect(db.query).toHaveBeenCalled();
      expect(mockRes.render).toHaveBeenCalledWith(
        "dpa/lihatProker",
        expect.objectContaining({
          title: "Daftar Program Kerja",
          programs: expect.any(Array),
        })
      );
    });

  	it("seharusnya me-render halaman error jika database gagal", async () => {
      // A. ATUR (Arrange): Paksa DB mengembalikan error
  	  db.query.mockRejectedValueOnce(new Error("DB Error"));
  	  mockReq = { session: { user: { name: "Test DPA" } } };

  	  // B. JALANKAN (Act)
  	  await getAllProkerDPA(mockReq, mockRes);

  	  // C. PERIKSA (Assert): Cek halaman error dirender
  	  expect(mockRes.render).toHaveBeenCalledWith(
  	    "dpa/lihatProker",
  	    expect.objectContaining({
  	      programs: [], 
  	      errorMsg: "Gagal memuat daftar program kerja.", 
  	    })
  	  );
  	});
  });

  // =====================================================
  // TES UNTUK: getDetailProkerDPA (Membaca Detail Proker)
  // =====================================================
  describe("getDetailProkerDPA", () => {
  	it("seharusnya me-render detail proker jika ditemukan", async () => {
  	  // A. ATUR: Siapkan data detail proker
  	  const mockDetailRow = [
  	    { id: "proker-123", namaProker: "Detail Proker", status_db: "Sedang Berjalan" },
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
  	  // A. ATUR: Mock DB mengembalikan data kosong
  	  db.query.mockResolvedValueOnce([[]]);
  	  mockReq = { params: { id: "proker-salah" }, session: { user: { name: "Test DPA" } } };

  	  // B. JALANKAN
  	  await getDetailProkerDPA(mockReq, mockRes);

  	  // C. PERIKSA
  	  expect(mockRes.status).toHaveBeenCalledWith(404);
  	  expect(mockRes.send).toHaveBeenCalledWith("Program Kerja tidak ditemukan");
  	});
  });

  // =====================================================
  // TES UNTUK: updateStatusProker (Mengubah Status Proker)
  // =====================================================
  describe("updateStatusProker", () => {
  	it("seharusnya berhasil mengubah status menjadi 'Selesai' jika ada laporan yang sudah diterima", async () => {
  	  // A. ATUR
  	  mockReq = {
  	    params: { id: "proker-abc" },
  	    body: { status: "Selesai" }, // Status yang diminta
  	  };
  	  uuidv4.mockReturnValue("mock-uuid-12345"); // ID Notifikasi stabil

  	  // Mock Panggilan DB ke-1: Ambil info proker
  	  const mockProkerInfo = [[{ namaProker: "Proker Keren", status_sekarang: "Sedang Berjalan", id_divisi: "div-01" }]];
  	  db.query.mockResolvedValueOnce(mockProkerInfo);

  	  // Mock Panggilan DB ke-2: Cek laporan (ditemukan > 0)
  	  const mockLaporanInfo = [[{ total: 1 }]];
  	  db.query.mockResolvedValueOnce(mockLaporanInfo);

  	  // Mock Panggilan DB ke-3 & ke-4: UPDATE proker & INSERT notifikasi
  	  db.query.mockResolvedValue([{}]); 

  	  // B. JALANKAN
  	  await updateStatusProker(mockReq, mockRes);

  	  // C. PERIKSA
  	  // 1. Cek validasi laporan dipanggil (Panggilan DB ke-2)
  	  expect(db.query).toHaveBeenCalledWith(expect.stringContaining("SELECT COUNT(*) AS total"), ["proker-abc"]);
  	  // 2. Cek update status dipanggil (Panggilan DB ke-3)
  	  expect(db.query).toHaveBeenCalledWith("UPDATE Program_kerja SET Status = ? WHERE id_ProgramKerja = ?", ["Selesai", "proker-abc"]);
  	  // 3. Cek notifikasi lama dihapus (helper)
  	  expect(notifikasiController.deleteOldProkerNotif).toHaveBeenCalledWith("proker-abc");
  	  // 4. Cek respons sukses
  	  expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Status program kerja berhasil diubah menjadi "Selesai"' });
  	});

  	it("seharusnya gagal 400 jika status yang dikirim tidak valid", async () => {
  	  // A. ATUR
  	  mockReq = { params: { id: "proker-abc" }, body: { status: "DITUNDA" } }; // Status 'DITUNDA' tidak diizinkan

  	  // B. JALANKAN
  	  await updateStatusProker(mockReq, mockRes);

  	  // C. PERIKSA
  	  expect(db.query).not.toHaveBeenCalled(); // DB tidak boleh dipanggil
  	  expect(mockRes.status).toHaveBeenCalledWith(400);
  	  expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("Status tidak valid") }));
  	});

  	it("seharusnya gagal 400 jika proker sudah berstatus final", async () => {
  	  // A. ATUR
  	  mockReq = { params: { id: "proker-abc" }, body: { status: "Sedang Berjalan" } };
  	  // Mock Panggilan DB ke-1: Status sudah 'Selesai'
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

  	it("seharusnya gagal 400 jika update 'Selesai' tapi laporan belum diterima (validasi bisnis)", async () => {
  	    // A. ATUR
  	    mockReq = { params: { id: "proker-abc" }, body: { status: "Selesai" } };
  	    // Mock Panggilan DB ke-1: Status 'Sedang Berjalan'
  	    const mockProkerInfo = [[{ status_sekarang: "Sedang Berjalan" }]];
  	    db.query.mockResolvedValueOnce(mockProkerInfo);

  	    // Mock Panggilan DB ke-2: Cek laporan (total: 0)
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

  	it("seharusnya gagal 500 jika database error pada saat proses", async () => {
  	    // A. ATUR
  	    mockReq = { params: { id: "proker-abc" }, body: { status: "Selesai" } };
  	    // Mock Panggilan DB ke-1: GAGAL
  	    db.query.mockRejectedValueOnce(new Error("DB Gagal Total"));

  	    // B. JALANKAN
  	    await updateStatusProker(mockReq, mockRes);

  	    // C. PERIKSA
  	    expect(mockRes.status).toHaveBeenCalledWith(500);
  	    expect(mockRes.json).toHaveBeenCalledWith({
  	        success: false,
  	        message: expect.stringContaining("Gagal mengubah status program kerja: DB Gagal Total"),
  	    });
  	});
  });

  // =====================================================
  // TES UNTUK: checkLaporanPending (Cek Status Laporan Pending)
  // =====================================================
  describe("checkLaporanPending", () => {
  	it("seharusnya mengembalikan { hasPending: true } jika ada laporan pending", async () => {
  	  // A. ATUR
  	  const mockDbResult = [[{ pending_count: 1 }]];
  	  db.query.mockResolvedValueOnce(mockDbResult);
  	  mockReq = { params: { id: "proker-123" } };

  	  // B. JALANKAN
  	  await checkLaporanPending(mockReq, mockRes);

  	  // C. PERIKSA
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
  	  // A. ATUR
  	  const dbError = new Error("Koneksi putus");
  	  db.query.mockRejectedValueOnce(dbError);
  	  mockReq = { params: { id: "proker-gagal" } };

  	  // B. JALANKAN
  	  await checkLaporanPending(mockReq, mockRes);

  	  // C. PERIKSA
  	  expect(mockRes.status).toHaveBeenCalledWith(500);
  	  expect(mockRes.json).toHaveBeenCalledWith({
  	    success: false,
  	    message: "Gagal memeriksa status laporan: Koneksi putus",
  	  });
  	});
  });
});