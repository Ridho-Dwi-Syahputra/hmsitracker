// __tests__/prokerController.test.js

// 1. Import controller yang mau dites
const prokerController = require('../../controllers/hmsi/prokerController');

// 2. Import dependensi yang akan kita mock
const db = require('../../config/db');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 3. Beritahu Jest untuk me-mock dependensi ini
// Setiap kali 'require' dipanggil di controller, Jest akan berikan versi palsu
jest.mock('../../config/db');
jest.mock('fs');
jest.mock('uuid');

// ==========================================
// SETUP GLOBAL UNTUK TES
// ==========================================

// Variabel untuk menampung objek req dan res palsu
let mockReq;
let mockRes;
let mockRender;
let mockRedirect;
let mockStatus;
let mockSend;
let mockDownload; // <-- Ditambahkan untuk tes download

// (Opsional tapi direkomendasikan) Bungkam console.log/warn/error
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// 'beforeEach' dijalankan sebelum SETIAP tes ('it')
beforeEach(() => {
  // 4. Reset semua mock agar tes tidak saling memengaruhi
  jest.clearAllMocks();

  // 5. Buat objek res palsu yang bisa di-"spy"
  mockRender = jest.fn();
  mockRedirect = jest.fn();
  mockSend = jest.fn();
  mockStatus = jest.fn(() => ({ send: mockSend })); // Ini untuk .status(403).send(...)
  mockDownload = jest.fn(); // <-- Ditambahkan

  mockRes = {
    render: mockRender,
    redirect: mockRedirect,
    status: mockStatus,
    send: mockSend,
    download: mockDownload, // <-- Ditambahkan
  };

  // 6. Buat objek req palsu (default)
  mockReq = {
    session: {
      user: {
        id_anggota: 1,
        id_divisi: 10, // Divisi BPH (misalnya)
        role: 'HMSI',
        nama_divisi: 'BPH',
      },
    },
    params: {},
    body: {},
    file: null,
  };
});


// ==========================================
// MULAI TEST SUITES
// ==========================================

describe('Proker Controller', () => {

  // ==========================
  // TES FUNGSI: getAllProker
  // ==========================
  describe('getAllProker', () => {
    
    it('should fetch prokers for user division and render view', async () => {
      // 1. Arrange (Persiapan)
      const mockProkerData = [
        { id: 1, namaProker: 'Proker A', status_db: 'Sedang Berjalan' },
        { id: 2, namaProker: 'Proker B', status_db: 'Selesai' },
        { id: 3, namaProker: 'Proker C', status_db: null }, // Tes helper getStatusFromDB
      ];
      
      // ✅ PERBAIKAN: Hapus satu lapisan array [ ]
      db.query.mockResolvedValue([ mockProkerData ]);

      // 2. Act (Panggil fungsi)
      await prokerController.getAllProker(mockReq, mockRes);

      // 3. Assert (Cek hasil)
      // Cek apakah query DB dipanggil dengan filter divisi yang benar
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.id_divisi = ?'), // Cek query-nya
        [10] // Cek parameternya (dari mockReq.session.user.id_divisi)
      );

      // Cek apakah res.render dipanggil dengan data yang benar
      expect(mockRender).toHaveBeenCalledTimes(1);
      expect(mockRender).toHaveBeenCalledWith(
        'hmsi/kelolaProker', // Nama view
        expect.objectContaining({ // Cek sebagian datanya
          activeNav: 'Program Kerja',
          user: mockReq.session.user,
          programs: expect.any(Array),
        })
      );

      // Cek apakah logic status berjalan
      const renderedPrograms = mockRender.mock.calls[0][1].programs;
      expect(renderedPrograms[0].status).toBe('Sedang Berjalan');
      expect(renderedPrograms[1].status).toBe('Selesai');
      expect(renderedPrograms[2].status).toBe('Sedang Berjalan'); // Karena null di DB
    });

  });

  // ==========================
  // TES FUNGSI: createProker
  // ==========================
  describe('createProker', () => {

    it('should create proker and notification, then redirect', async () => {
      // 1. Arrange
      mockReq.body = {
        namaProker: 'Proker Baru',
        deskripsi: 'Deskripsi baru',
        tanggal_mulai: '2025-01-01',
        tanggal_selesai: '2025-01-10',
        penanggungJawab: 'PJ Baru',
        targetKuantitatif: '100',
        targetKualitatif: 'Baik',
      };
      mockReq.file = { filename: 'dokumen-baru.pdf' };
      
      // Atur mock UUID agar bisa ditebak
      uuidv4.mockReturnValue('mock-uuid-12345');
      // Atur mock db.query (kita asumsikan sukses, jadi tidak perlu return value)
      db.query.mockResolvedValue([[]]); // Cukup mockResolvedValue() jika tidak ada [rows]

      // 2. Act
      await prokerController.createProker(mockReq, mockRes);

      // 3. Assert
      // Cek panggilan INSERT ke Program_kerja
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO Program_kerja'),
        [
          'mock-uuid-12345', // idProker dari uuid
          'Proker Baru',
          'Deskripsi baru',
          '2025-01-01',
          '2025-01-10',
          'PJ Baru',
          '100',
          'Baik',
          1, // id_anggota
          10, // id_divisi
          'dokumen-baru.pdf', // Dokumen
          'Sedang Berjalan', // Status (default)
        ]
      );

      // ✅ PERBAIKAN: Sesuaikan parameter notifikasi (4, bukan 6)
      // Cek panggilan INSERT ke Notifikasi
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO Notifikasi'),
        [
          'mock-uuid-12345', // idNotif (karena kita mock uuidv4)
          expect.stringContaining('menambahkan Program Kerja baru'), // pesan
          10, // id_divisi
          'mock-uuid-12345', // id_ProgramKerja
        ]
      );

      // Cek apakah user di-redirect
      expect(mockRedirect).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/kelola-proker?success=Program Kerja berhasil ditambahkan');
    });

    it('should re-render form with error if tanggal is invalid', async () => {
      // 1. Arrange
      // ✅ PERBAIKAN: Lengkapi semua field wajib
      mockReq.body = {
        namaProker: 'Proker Gagal',
        deskripsi: 'Deskripsi lengkap', // <-- DILENGKAPI
        tanggal_mulai: '2025-01-10',
        tanggal_selesai: '2025-01-01', // Tanggal selesai < tanggal mulai
        penanggungJawab: 'PJ Lengkap', // <-- DILENGKAPI
        targetKuantitatif: '100', // <-- DILENGKAPI
        targetKualitatif: 'Baik', // <-- DILENGKAPI
      };
      
      // 2. Act
      await prokerController.createProker(mockReq, mockRes);

      // 3. Assert
      // Pastikan DB TIDAK dipanggil
      expect(db.query).not.toHaveBeenCalled();
      // Pastikan render dipanggil dengan errorMsg yang TEPAT (validasi tanggal)
      expect(mockRender).toHaveBeenCalledWith(
        'hmsi/tambahProker',
        expect.objectContaining({
          errorMsg: expect.stringContaining('Tanggal selesai tidak boleh lebih awal'),
        })
      );
    });
  });

  // ==========================
  // TES FUNGSI: deleteProker
  // ==========================
  describe('deleteProker', () => {

    it('should return 403 (Forbidden) if proker status is "Selesai"', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-selesai';
      const mockProkerSelesai = {
        Nama_ProgramKerja: 'Proker Lama',
        Dokumen_pendukung: 'doc.pdf',
        Status: 'Selesai', // <-- Status final
      };
      // Mock SELECT proker
      db.query.mockResolvedValueOnce([ [mockProkerSelesai] ]);

      // 2. Act
      await prokerController.deleteProker(mockReq, mockRes);

      // 3. Assert
      // Pastikan HANYA 1x query (SELECT)
      expect(db.query).toHaveBeenCalledTimes(1);
      // Cek res.status(403).send(...)
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('tidak dapat dihapus'));
      // Pastikan fs.unlinkSync TIDAK dipanggil
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should delete proker, reports, files, and redirect if status is valid', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-valid';
      const mockProkerValid = {
        Nama_ProgramKerja: 'Proker Valid',
        Dokumen_pendukung: 'proker-doc.pdf', // file proker
        Status: 'Sedang Berjalan', // <-- Status valid
      };
      const mockLaporanTerkait = [
        { dokumentasi: 'laporan-1.pdf' }, // file laporan
        { dokumentasi: null },
      ];

      // Atur urutan mock db.query
      db.query
        .mockResolvedValueOnce([ [mockProkerValid] ]) // Panggilan 1: SELECT Program_kerja
        .mockResolvedValueOnce([ mockLaporanTerkait ]) // Panggilan 2: SELECT Laporan
        .mockResolvedValue([[]]); // Panggilan 3, 4, 5 (DELETE Laporan, INSERT Notif, DELETE Proker)

      // Atur mock fs (pura-pura file ada)
      fs.existsSync.mockReturnValue(true);
      // Atur mock uuid untuk notifikasi
      uuidv4.mockReturnValue('mock-uuid-delete');

      // 2. Act
      await prokerController.deleteProker(mockReq, mockRes);

      // 3. Assert
      // Cek fs.unlinkSync dipanggil untuk file proker DAN file laporan
      expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('proker-doc.pdf'));
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('laporan-1.pdf'));

      // Cek urutan query DB
      expect(db.query.mock.calls[0][0]).toContain('SELECT Nama_ProgramKerja'); // Panggilan 1
      expect(db.query.mock.calls[1][0]).toContain('SELECT dokumentasi FROM Laporan'); // Panggilan 2
      expect(db.query.mock.calls[2][0]).toContain('DELETE FROM Laporan'); // Panggilan 3
      expect(db.query.mock.calls[3][0]).toContain('INSERT INTO Notifikasi'); // Panggilan 4
      expect(db.query.mock.calls[4][0]).toContain('DELETE FROM Program_kerja'); // Panggilan 5

      // Cek redirect
      expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('telah dihapus'));
    });
  });

  // ========================================================
  //  TES BARU DITAMBAHKAN DI BAWAH INI 
  // ========================================================

  // ==========================
  // TES FUNGSI: getDetailProker
  // ==========================
  describe('getDetailProker', () => {

    it('should render detail proker if user is authorized', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-1';
      const mockProker = {
        id: 'proker-1',
        namaProker: 'Proker Detail',
        id_divisi: 10, // Divisi user adalah 10 (dari mockReq)
        status_db: 'Selesai',
        // ... field lain
      };
      db.query.mockResolvedValue([ [mockProker] ]);

      // 2. Act
      await prokerController.getDetailProker(mockReq, mockRes);

      // 3. Assert
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(mockRender).toHaveBeenCalledWith(
        'hmsi/detailProker',
        expect.objectContaining({
          proker: expect.objectContaining({
            id: 'proker-1',
            status: 'Selesai', // Cek logic getStatusFromDB
          }),
        })
      );
    });

    it('should return 403 (Forbidden) if user requests proker from other division', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-lain';
      const mockProkerLain = {
        id: 'proker-lain',
        id_divisi: 99, // Divisi user adalah 10, ini proker divisi 99
      };
      db.query.mockResolvedValue([ [mockProkerLain] ]);

      // 2. Act
      await prokerController.getDetailProker(mockReq, mockRes);

      // 3. Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Akses ditolak'));
    });

    it('should return 404 (Not Found) if proker does not exist', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-404';
      db.query.mockResolvedValue([ [] ]); // Mock DB return array kosong

      // 2. Act
      await prokerController.getDetailProker(mockReq, mockRes);

      // 3. Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('tidak ditemukan'));
    });
  });

  // ==========================
  // TES FUNGSI: getEditProker
  // ==========================
  describe('getEditProker', () => {
    
    it('should render edit form if proker status is valid', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-valid';
      const mockProker = { 
        Status: 'Sedang Berjalan', // Status valid
        Tanggal_mulai: '2025-01-01',
      };
      db.query.mockResolvedValue([ [mockProker] ]);

      // 2. Act
      await prokerController.getEditProker(mockReq, mockRes);

      // 3. Assert
      expect(mockRender).toHaveBeenCalledWith(
        'hmsi/editProker',
        expect.objectContaining({ proker: mockProker })
      );
    });

    it('should return 403 (Forbidden) if proker status is "Selesai"', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-selesai';
      const mockProker = { Status: 'Selesai' }; // Status final
      db.query.mockResolvedValue([ [mockProker] ]);

      // 2. Act
      await prokerController.getEditProker(mockReq, mockRes);

      // 3. Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('tidak dapat diubah'));
    });
  });

  // ==========================
  // TES FUNGSI: updateProker
  // ==========================
  describe('updateProker', () => {

    // Mock data untuk SELECT (panggilan DB pertama)
    const mockExistingProker = {
      Dokumen_pendukung: 'file-lama.pdf',
      Status: 'Sedang Berjalan', // Status valid
    };

    it('should update proker (no new file) and redirect', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-1';
      mockReq.body = { 
        namaProker: 'Proker Update', 
        deskripsi: 'Deskripsi Update', // <-- Tambahkan field wajib
        tanggal_mulai: '2025-01-01', 
        tanggal_selesai: '2025-01-10',
        penanggungJawab: 'PJ Update', // <-- Tambahkan field wajib
        targetKuantitatif: '100', // <-- Tambahkan field wajib
        targetKualitatif: 'Baik', // <-- Tambahkan field wajib
      };
      mockReq.file = null; // Tidak ada file baru
      
      db.query
        .mockResolvedValueOnce([ [mockExistingProker] ]) // Panggilan 1: SELECT
        .mockResolvedValue([[]]); // Panggilan 2 & 3: UPDATE & INSERT Notif

      uuidv4.mockReturnValue('mock-uuid-update');
      fs.existsSync.mockReturnValue(true); // Asumsikan file lama ada

      // 2. Act
      await prokerController.updateProker(mockReq, mockRes);

      // 3. Assert
      // Cek UPDATE query (panggilan ke-2 ke DB)
      const updateQueryCall = db.query.mock.calls[1];
      const updateQuery = updateQueryCall[0];
      const updateParams = updateQueryCall[1];
      
      expect(updateQuery).not.toContain('Dokumen_pendukung=?'); // Pastikan TIDAK update file
      expect(updateParams).toContain('Sedang Berjalan'); // Pastikan status lama dipertahankan
      expect(updateParams).toContain('proker-1'); // Cek WHERE id

      // Cek fs.unlinkSync (safeRemoveFile) TIDAK dipanggil
      expect(fs.unlinkSync).not.toHaveBeenCalled();
      
      // Cek redirect
      expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('berhasil diperbarui'));
    });

    it('should update proker (with new file) and remove old file', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-1';
      mockReq.body = { 
        namaProker: 'Proker Update', 
        deskripsi: 'Deskripsi Update', // <-- Tambahkan field wajib
        tanggal_mulai: '2025-01-01', 
        tanggal_selesai: '2025-01-10',
        penanggungJawab: 'PJ Update', // <-- Tambahkan field wajib
        targetKuantitatif: '100', // <-- Tambahkan field wajib
        targetKualitatif: 'Baik', // <-- Tambahkan field wajib
      };
      mockReq.file = { filename: 'file-baru.pdf' }; // Ada file baru
      
      db.query
        .mockResolvedValueOnce([ [mockExistingProker] ]) // Panggilan 1: SELECT
        .mockResolvedValue([[]]); // Panggilan 2 & 3: UPDATE & INSERT Notif

      uuidv4.mockReturnValue('mock-uuid-update');
      fs.existsSync.mockReturnValue(true); // Asumsikan file lama 'file-lama.pdf' ada

      // 2. Act
      await prokerController.updateProker(mockReq, mockRes);

      // 3. Assert
      // Cek UPDATE query
      const updateQuery = db.query.mock.calls[1][0];
      const updateParams = db.query.mock.calls[1][1];
      
      expect(updateQuery).toContain('Dokumen_pendukung=?'); // Pastikan UPDATE file
      expect(updateParams).toContain('file-baru.pdf'); // Cek file baru

      // Cek fs.unlinkSync (safeRemoveFile) DIPANGGIL untuk file lama
      expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('file-lama.pdf'));
      
      // Cek redirect
      expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('berhasil diperbarui'));
    });

    it('should return 403 (Forbidden) if updating a "Selesai" proker', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-selesai';
      const mockProkerSelesai = { Status: 'Selesai' }; // Status final
      
      db.query.mockResolvedValueOnce([ [mockProkerSelesai] ]); // Panggilan 1: SELECT
      
      // (Penting) Berikan body agar tidak gagal di validasi tanggal
      mockReq.body = { 
        tanggal_mulai: '2025-01-01', 
        tanggal_selesai: '2025-01-10',
      };

      // 2. Act
      await prokerController.updateProker(mockReq, mockRes);

      // 3. Assert
      expect(db.query).toHaveBeenCalledTimes(1); // Hanya SELECT, tidak ada UPDATE
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('tidak dapat diubah'));
    });

  });

  // ==========================
  // TES FUNGSI: downloadDokumenPendukung
  // ==========================
  describe('downloadDokumenPendukung', () => {

    it('should download the file if it exists', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-1';
      db.query.mockResolvedValue([ [{ Dokumen_pendukung: 'file-ada.pdf' }] ]);
      fs.existsSync.mockReturnValue(true); // File ada di server

      // 2. Act
      await prokerController.downloadDokumenPendukung(mockReq, mockRes);

      // 3. Assert
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(mockRes.download).toHaveBeenCalledWith(
        expect.stringContaining('file-ada.pdf'), // Cek path file
        'file-ada.pdf' // Cek nama file
      );
    });

    it('should return 404 if file not found in DB', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-2';
      // Mock proker ada, tapi Dokumen_pendukung = null
      db.query.mockResolvedValue([ [{ Dokumen_pendukung: null }] ]); 

      // 2. Act
      await prokerController.downloadDokumenPendukung(mockReq, mockRes);

      // 3. Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Dokumen pendukung tidak ditemukan'));
    });

    it('should return 404 if file not found on server (fs)', async () => {
      // 1. Arrange
      mockReq.params.id = 'proker-3';
      db.query.mockResolvedValue([ [{ Dokumen_pendukung: 'file-hilang.pdf' }] ]);
      fs.existsSync.mockReturnValue(false); // File ada di DB, tapi tidak ada di server

      // 2. Act
      await prokerController.downloadDokumenPendukung(mockReq, mockRes);

      // 3. Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('tidak ditemukan di server'));
    });
  });

}); // <- Ini adalah penutup dari 'describe('Proker Controller')'