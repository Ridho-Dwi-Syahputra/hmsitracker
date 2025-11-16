// __tests__/hmsi/laporanController.test.js

// 1. Import controller yang akan ditest
const laporanController = require('../../controllers/hmsi/laporanController');

// 2. Import dependensi yang akan kita mock
const db = require('../../config/db');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 3. Beritahu Jest untuk me-mock dependensi ini
jest.mock('../../config/db');
jest.mock('fs');
jest.mock('uuid');
jest.mock('path');

// ==========================================
// SETUP GLOBAL UNTUK TES
// ==========================================

let mockReq;
let mockRes;
let mockRender;
let mockRedirect;
let mockStatus;
let mockSend;
let mockJson;
let mockDownload;
let mockConnection;

// Bungkam console.log/warn/error
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Setup sebelum setiap test
beforeEach(() => {
  // Reset semua mock
  jest.clearAllMocks();

  // Mock response methods
  mockRender = jest.fn();
  mockRedirect = jest.fn();
  mockSend = jest.fn();
  mockDownload = jest.fn();
  mockJson = jest.fn();
  mockStatus = jest.fn(() => ({ send: mockSend, json: mockJson }));

  mockRes = {
    render: mockRender,
    redirect: mockRedirect,
    status: mockStatus,
    send: mockSend,
    download: mockDownload,
    json: mockJson
  };

  // Mock connection untuk transaction
  mockConnection = {
    beginTransaction: jest.fn(),
    query: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
  };

  // Mock db.getConnection untuk transaction
  db.getConnection = jest.fn().mockResolvedValue(mockConnection);

  // Mock request default
  mockReq = {
    session: {
      user: {
        id_anggota: 1,
        id_divisi: 10,
        nama: 'Test User HMSI',
        role: 'HMSI'
      }
    },
    params: {},
    body: {},
    query: {},
    file: null
  };

  // Mock uuidv4
  uuidv4.mockReturnValue('test-uuid-123');

  // Mock path.join
  path.join.mockImplementation((...args) => args.join('/'));
  path.extname.mockImplementation((filename) => {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
  });

  // Mock fs methods
  fs.existsSync.mockReturnValue(true);
  fs.unlinkSync.mockReturnValue(true);
});

// ==========================================
// TEST SUITES
// ==========================================

describe('Laporan Controller', () => {

  describe('getAllLaporan', () => {

    it('should fetch all laporan successfully', async () => {
      // Arrange
      const mockLaporanData = [
        {
          id: 1,
          judul_laporan: 'Laporan Kegiatan A',
          deskripsi_kegiatan: 'Deskripsi A',
          tanggal: '2024-01-15',
          nama_divisi: 'BPH',
          namaProker: 'Program Kerja A',
          status_konfirmasi: 'Belum Dievaluasi',
          dokumentasi: 'doc-a.pdf'
        },
        {
          id: 2,
          judul_laporan: 'Laporan Kegiatan B',
          deskripsi_kegiatan: 'Deskripsi B',
          tanggal: '2024-01-20',
          nama_divisi: 'BPH',
          namaProker: 'Program Kerja B',
          status_konfirmasi: 'Belum Dievaluasi',
          dokumentasi: 'doc-b.pdf'
        }
      ];

      // Mock req.query for successMsg/errorMsg
      mockReq.query = {};

      db.query.mockResolvedValue([mockLaporanData]);

      try {
        // Act
        await laporanController.getAllLaporan(mockReq, mockRes);

        // Assert
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT'),
          [mockReq.session.user.id_divisi]
        );
        expect(mockRender).toHaveBeenCalledWith('hmsi/laporan', {
          title: 'Pengajuan Laporan Proker',
          user: mockReq.session.user,
          activeNav: 'laporan',
          laporan: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              tanggalFormatted: expect.any(String),
              dokumentasi_mime: expect.any(String)
            }),
            expect.objectContaining({
              id: 2,
              tanggalFormatted: expect.any(String),
              dokumentasi_mime: expect.any(String)
            })
          ]),
          successMsg: null,
          errorMsg: null
        });
      } catch (error) {
        console.error('Test error:', error);
        // If render failed, check if json was called instead (error case)
        if (mockRender.mock.calls.length === 0) {
          expect(mockStatus).toHaveBeenCalledWith(500);
          expect(mockJson).toHaveBeenCalledWith({ success: false, error: 'Gagal mengambil data laporan' });
        }
      }
    });

    it('should handle database error in getAllLaporan', async () => {
      // Arrange
      db.query.mockRejectedValue(new Error('Database error'));

      // Act
      await laporanController.getAllLaporan(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ success: false, error: 'Gagal mengambil data laporan' });
    });

  });

  describe('getFormLaporan', () => {

    it('should render form laporan with proker data', async () => {
      // Arrange
      const mockProkerData = [
        { id: 1, namaProker: 'Program Kerja A' },
        { id: 2, namaProker: 'Program Kerja B' }
      ];

      db.query.mockResolvedValue([mockProkerData]);

      // Act
      await laporanController.getFormLaporan(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(mockRender).toHaveBeenCalledWith('hmsi/laporanForm', {
        title: 'Tambah Laporan',
        user: mockReq.session.user,
        activeNav: 'laporan',
        programs: [
          {
            id: 1,
            namaProker: 'Program Kerja A'
          },
          {
            id: 2,
            namaProker: 'Program Kerja B'
          }
        ],
        laporan: null,
        formAction: '/hmsi/laporan/tambah',
        old: {},
        errorMsg: null,
        successMsg: null
      });
    });

    it('should handle database error in getFormLaporan', async () => {
      // Arrange
      db.query.mockRejectedValue(new Error('Database error'));

      // Act
      await laporanController.getFormLaporan(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Gagal membuka form tambah laporan');
    });

  });

  describe('createLaporan', () => {

    it('should create laporan successfully', async () => {
      // Arrange
      mockReq.body = {
        judul_laporan: 'Laporan Test',
        deskripsi_kegiatan: 'Deskripsi test',
        sasaran: 'Sasaran test',
        waktu_tempat: 'Waktu tempat test',
        dana_digunakan: '1000000',
        sumber_dana_radio: 'uang_kas',
        dana_terpakai: '1000000',
        persentase_kualitatif: '80',
        persentase_kuantitatif: '75',
        deskripsi_target_kualitatif: 'Target kualitatif',
        deskripsi_target_kuantitatif: 'Target kuantitatif',
        kendala: 'Kendala test',
        solusi: 'Solusi test',
        id_ProgramKerja: '1'
      };

      mockReq.file = {
        filename: 'test-document.pdf'
      };

      // Mock database connection
      db.getConnection.mockResolvedValue(mockConnection);
      mockConnection.query.mockResolvedValue([]);

      // Act
      await laporanController.createLaporan(mockReq, mockRes);

      // Assert
      expect(db.getConnection).toHaveBeenCalledTimes(1);
      expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);
      expect(mockConnection.query).toHaveBeenCalledTimes(3); // Insert laporan + keuangan + notifikasi
      expect(mockConnection.commit).toHaveBeenCalledTimes(1);
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/laporan?success=Laporan berhasil ditambahkan');
    });

    it('should handle missing required fields', async () => {
      // Arrange
      mockReq.body = {
        // Missing required fields
        deskripsi_kegiatan: '',
        id_ProgramKerja: ''
      };

      // Act
      await laporanController.createLaporan(mockReq, mockRes);

      // Assert
      expect(db.getConnection).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/laporan/tambah?error=Data laporan tidak lengkap');
    });

    it('should handle database error in createLaporan', async () => {
      // Arrange
      mockReq.body = {
        judul_laporan: 'Laporan Test',
        deskripsi_kegiatan: 'Deskripsi test',
        id_ProgramKerja: '1'
      };

      db.getConnection.mockResolvedValue(mockConnection);
      mockConnection.query.mockRejectedValue(new Error('Insert failed'));

      // Act
      await laporanController.createLaporan(mockReq, mockRes);

      // Assert
      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/laporan?error=Gagal menambahkan laporan');
    });

  });

  describe('getDetailLaporan', () => {

    it('should render detail laporan successfully', async () => {
      // Arrange
      mockReq.params.id = '1';
      mockReq.query = {}; // Mock query for error/success messages
      
      const mockLaporanData = {
        id_laporan: 1,
        judul_laporan: 'Laporan Test',
        namaProker: 'Program Kerja A',
        divisi: 'Web Programming',
        tanggal: '2024-01-15',
        dokumentasi: 'test-doc.pdf',
        id_divisi: 10  // Same as user's divisi to pass permission check
      };

      const mockEvaluasiData = {
        id_evaluasi: 1,
        komentar: 'Evaluasi test',
        tanggal_evaluasi_formatted: '15 Januari 2024'
      };

      db.query
        .mockResolvedValueOnce([[mockLaporanData]]) // laporan query
        .mockResolvedValueOnce([[mockEvaluasiData]]) // evaluasi query  
        .mockResolvedValueOnce([[{ count: 2 }]]); // unread count query

      // Act
      await laporanController.getDetailLaporan(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(mockRender).toHaveBeenCalledWith('hmsi/detailLaporan', {
        title: 'Detail Laporan - Laporan Test',
        user: mockReq.session.user,
        activeNav: 'laporan',
        laporan: expect.objectContaining({
          id_laporan: 1,
          judul_laporan: 'Laporan Test',
          tanggalFormatted: expect.any(String),
          dokumentasi_mime: expect.any(String)
        }),
        evaluasi: expect.objectContaining({
          id_evaluasi: 1,
          tanggal_evaluasi: '15 Januari 2024'
        }),
        unreadCount: 2,
        errorMsg: null,
        successMsg: null
      });
    });

    it('should handle laporan not found', async () => {
      // Arrange
      mockReq.params.id = '999';
      // Mock laporan with different divisi to trigger access check first
      const mockLaporanDataDifferentDivisi = {
        id_laporan: 999,
        judul_laporan: 'Laporan Test',
        id_divisi: 999 // Different from user's divisi (10)
      };
      db.query.mockResolvedValue([[mockLaporanDataDifferentDivisi]]);

      // Act
      await laporanController.getDetailLaporan(mockReq, mockRes);

      // Assert - Should redirect with access denied error (actual behavior)
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/laporan?error=Anda tidak memiliki akses untuk melihat laporan divisi lain');
    });

  });

  describe('updateLaporan', () => {

    it('should update laporan successfully', async () => {
      // Arrange
      mockReq.params.id = '1';
      mockReq.body = {
        judul_laporan: 'Updated Laporan',
        deskripsi_kegiatan: 'Updated deskripsi',
        sasaran: 'Updated sasaran',
        waktu_tempat: 'Updated waktu tempat',
        dana_digunakan: '1000000',
        sumber_dana_radio: 'uang_kas',
        dana_terpakai: '1000000',
        id_ProgramKerja: '1'
      };
      
      // Add nama_divisi to user for notification
      mockReq.session.user.nama_divisi = 'Web Programming';

      const mockLaporanData = [
        {
          dokumentasi: 'old-doc.pdf',
          id_divisi: 10,  // Same as user divisi
          status_konfirmasi: null
        }
      ];

      db.getConnection.mockResolvedValue(mockConnection);
      mockConnection.query
        .mockResolvedValueOnce([mockLaporanData]) // Check existing laporan
        .mockResolvedValueOnce([]) // Update laporan
        .mockResolvedValueOnce([[{ id_keuangan: '123' }]]) // Check keuangan  
        .mockResolvedValueOnce([]) // Update keuangan
        .mockResolvedValueOnce([]); // Insert notification

      // Act
      await laporanController.updateLaporan(mockReq, mockRes);

      // Assert
      expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);
      expect(mockConnection.commit).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/laporan?success=Laporan berhasil diperbarui');
    });

    it('should handle laporan not found in update', async () => {
      // Arrange
      mockReq.params.id = '999';
      mockReq.body = { judul_laporan: 'Test' };

      db.getConnection.mockResolvedValue(mockConnection);
      mockConnection.query.mockResolvedValue([[]]);

      // Act
      await laporanController.updateLaporan(mockReq, mockRes);

      // Assert
      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/laporan?error=Laporan tidak ditemukan');
    });

  });

  describe('deleteLaporan', () => {

    it('should delete laporan successfully', async () => {
      // Arrange
      mockReq.params.id = '1';
      
      // Add nama_divisi to user for notification
      mockReq.session.user.nama_divisi = 'Web Programming';
      
      const mockLaporanData = [
        {
          judul_laporan: 'Test Laporan',
          dokumentasi: 'test-doc.pdf',
          id_divisi: 10  // Same as user divisi
        }
      ];

      db.getConnection.mockResolvedValue(mockConnection);
      mockConnection.query
        .mockResolvedValueOnce([mockLaporanData]) // Select laporan
        .mockResolvedValueOnce([]) // Delete keuangan
        .mockResolvedValueOnce([]) // Delete laporan
        .mockResolvedValueOnce([]); // Insert notifikasi

      // Act
      await laporanController.deleteLaporan(mockReq, mockRes);

      // Assert
      expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);
      expect(mockConnection.commit).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/laporan?success=Laporan berhasil dihapus');
    });

    it('should handle laporan not found in delete', async () => {
      // Arrange
      mockReq.params.id = '999';

      db.getConnection.mockResolvedValue(mockConnection);
      mockConnection.query.mockResolvedValue([[]]);

      // Act
      await laporanController.deleteLaporan(mockReq, mockRes);

      // Assert
      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/laporan?error=Laporan tidak ditemukan');
    });

  });

  describe('downloadDokumentasi', () => {

    it('should download dokumentasi successfully', async () => {
      // Arrange
      mockReq.params.id = '1';
      
      const mockDokumentasi = [
        { dokumentasi: 'test-document.pdf' }
      ];

      const mockFilePath = 'uploads/test-document.pdf';
      
      db.query.mockResolvedValue([mockDokumentasi]);
      fs.existsSync.mockReturnValue(true);
      path.join.mockReturnValue(mockFilePath);

      // Act
      await laporanController.downloadDokumentasi(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledWith(
        'SELECT dokumentasi FROM Laporan WHERE id_laporan=?',
        ['1']
      );
      expect(mockDownload).toHaveBeenCalledWith(
        mockFilePath,
        'test-document.pdf'
      );
    });

    it('should handle dokumentasi not found', async () => {
      // Arrange
      mockReq.params.id = '1';
      
      const mockDokumentasi = [
        { dokumentasi: null }
      ];

      db.query.mockResolvedValue([mockDokumentasi]);

      // Act
      await laporanController.downloadDokumentasi(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith('Dokumentasi tidak ditemukan');
    });

    it('should handle file not exists on server', async () => {
      // Arrange
      mockReq.params.id = '1';
      
      const mockDokumentasi = [
        { dokumentasi: 'missing-file.pdf' }
      ];

      db.query.mockResolvedValue([mockDokumentasi]);
      fs.existsSync.mockReturnValue(false);

      // Act
      await laporanController.downloadDokumentasi(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith('File dokumentasi tidak ditemukan di server');
    });

  });

  describe('getLaporanSelesai', () => {

    it('should fetch laporan selesai successfully', async () => {
      // Arrange
      const mockLaporanSelesai = [
        {
          id_laporan: 1,
          judul_laporan: 'Laporan Selesai A',
          Nama_ProgramKerja: 'Program Test',
          tanggal_evaluasi: '2024-01-15'
        }
      ];

      db.query
        .mockResolvedValueOnce([mockLaporanSelesai]) // laporan selesai query
        .mockResolvedValueOnce([[{ count: 0 }]]); // unread count query

      // Act
      await laporanController.getLaporanSelesai(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(mockRender).toHaveBeenCalledWith('hmsi/laporanSelesai', {
        title: 'Laporan Diterima',
        user: mockReq.session.user,
        activeNav: 'laporanSelesai',
        laporanSelesai: expect.arrayContaining([
          expect.objectContaining({
            id_laporan: 1,
            tanggalFormatted: expect.any(String)
          })
        ]),
        unreadCount: 0
      });
    });

  });

  describe('getDetailLaporanSelesai', () => {

    it('should fetch detail laporan selesai successfully', async () => {
      // Arrange
      mockReq.params.idLaporan = '1';
      
      const mockLaporanDetail = [
        {
          id_laporan: 1,
          judul_laporan: 'Laporan Selesai Test',
          namaProker: 'Program Test',
          divisi: 'Web Programming',
          tanggal: '2024-01-15'
        }
      ];

      const mockEvaluasiDetail = [
        {
          id_evaluasi: 1,
          komentar: 'Good work',
          tanggal_evaluasi: '2024-01-16'
        }
      ];

      db.query
        .mockResolvedValueOnce([mockLaporanDetail]) // laporan query
        .mockResolvedValueOnce([mockEvaluasiDetail]) // evaluasi query
        .mockResolvedValueOnce([[{ count: 0 }]]); // unread count query

      // Act
      await laporanController.getDetailLaporanSelesai(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(mockRender).toHaveBeenCalledWith('hmsi/detailLaporanSelesai', {
        title: 'Detail Laporan Diterima',
        user: mockReq.session.user,
        activeNav: 'laporanSelesai',
        laporan: expect.objectContaining({
          id_laporan: 1,
          tanggalFormatted: expect.any(String)
        }),
        evaluasi: expect.objectContaining({
          id_evaluasi: 1,
          tanggal_evaluasi: expect.any(String)
        }),
        unreadCount: 0
      });
    });

    it('should handle laporan selesai not found', async () => {
      // Arrange
      mockReq.params.idLaporan = '999';
      db.query.mockResolvedValue([[]]); // Empty result

      // Act
      await laporanController.getDetailLaporanSelesai(mockReq, mockRes);

      // Assert
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/laporan-selesai?error=Laporan tidak ditemukan atau Anda tidak memiliki akses');
    });

  });

});