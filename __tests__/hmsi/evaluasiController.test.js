// __tests__/hmsi/evaluasiController.test.js

// 1. Import controller yang akan ditest
const evaluasiController = require('../../controllers/hmsi/evaluasiController');

// 2. Import dependensi yang akan kita mock
const db = require('../../config/db');

// 3. Beritahu Jest untuk me-mock dependensi ini
jest.mock('../../config/db');

// ==========================================
// SETUP GLOBAL UNTUK TES
// ==========================================

let mockReq;
let mockRes;
let mockRender;
let mockRedirect;
let mockStatus;
let mockSend;

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
  mockStatus = jest.fn(() => ({ send: mockSend }));

  mockRes = {
    render: mockRender,
    redirect: mockRedirect,
    status: mockStatus,
    send: mockSend
  };

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
    query: {}
  };
});

// ==========================================
// TEST SUITES
// ==========================================

describe('Evaluasi Controller', () => {

  describe('getKelolaEvaluasi', () => {

    it('should fetch evaluasi data successfully', async () => {
      // Arrange
      const mockEvaluasiData = [
        {
          id_evaluasi: 1,
          id_laporan: 1,
          tanggal_evaluasi: '2024-01-15',
          status_konfirmasi: 'Revisi',
          komentar: 'Perlu diperbaiki dokumentasi',
          judul_laporan: 'Laporan Kegiatan A',
          Nama_ProgramKerja: 'Program Kerja A',
          evaluator: 'DPA Test',
          nama_divisi: 'BPH'
        }
      ];

      const mockUnreadCount = [{ count: 3 }];

      db.query
        .mockResolvedValueOnce([mockEvaluasiData]) // Query evaluasi
        .mockResolvedValueOnce([mockUnreadCount]); // Query unread count

      // Act
      await evaluasiController.getKelolaEvaluasi(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query.mock.calls[0][1]).toEqual([10]); // id_divisi

      expect(mockRender).toHaveBeenCalledWith('HMSI/kelolaEvaluasi', {
        title: 'Laporan Revisi',
        user: mockReq.session.user,
        activeNav: 'kelolaEvaluasi',
        evaluasi: expect.arrayContaining([
          expect.objectContaining({
            id_evaluasi: 1,
            tanggalFormatted: expect.any(String),
            isRevisi: true
          })
        ]),
        successMsg: null,
        errorMsg: null,
        unreadCount: 3
      });
    });

    it('should handle empty evaluasi data', async () => {
      // Arrange
      const mockEvaluasiData = [];
      const mockUnreadCount = [{ count: 0 }];

      db.query
        .mockResolvedValueOnce([mockEvaluasiData])
        .mockResolvedValueOnce([mockUnreadCount]);

      // Act
      await evaluasiController.getKelolaEvaluasi(mockReq, mockRes);

      // Assert
      expect(mockRender).toHaveBeenCalledWith('HMSI/kelolaEvaluasi', {
        title: 'Laporan Revisi',
        user: mockReq.session.user,
        activeNav: 'kelolaEvaluasi',
        evaluasi: [],
        successMsg: null,
        errorMsg: null,
        unreadCount: 0
      });
    });

    it('should handle database error', async () => {
      // Arrange
      db.query.mockRejectedValue(new Error('Database error'));

      // Act
      await evaluasiController.getKelolaEvaluasi(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Gagal mengambil data evaluasi');
    });

  });

  describe('getDetailEvaluasi', () => {

    it('should fetch evaluasi detail successfully', async () => {
      // Arrange
      mockReq.params.id = '1';
      
      const mockEvaluasiDetail = [
        {
          id_evaluasi: 1,
          id_laporan: 1,
          id_divisi: 10, // Same as user divisi
          tanggal_evaluasi: '2024-01-15',
          status_konfirmasi: 'Revisi',
          komentar: 'Perlu diperbaiki dokumentasi',
          komentar_hmsi: 'Sudah diperbaiki sesuai saran',
          judul_laporan: 'Laporan Kegiatan A',
          Nama_ProgramKerja: 'Program Kerja A',
          evaluator: 'DPA Test',
          nama_divisi: 'BPH'
        }
      ];

      const mockUnreadCount = [{ count: 2 }];

      db.query
        .mockResolvedValueOnce([mockEvaluasiDetail]) // Query detail evaluasi
        .mockResolvedValueOnce([mockUnreadCount]); // Query unread count

      // Act
      await evaluasiController.getDetailEvaluasi(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query.mock.calls[0][1]).toEqual(['1']);

      expect(mockRender).toHaveBeenCalledWith('HMSI/detailEvaluasi', {
        title: 'Detail Evaluasi',
        user: mockReq.session.user,
        activeNav: 'kelolaEvaluasi',
        evaluasi: expect.objectContaining({
          id_evaluasi: 1,
          tanggalFormatted: expect.any(String)
        }),
        unreadCount: 2
      });
    });

    it('should handle evaluasi not found', async () => {
      // Arrange
      mockReq.params.id = '999';
      db.query.mockResolvedValueOnce([[]]); // Empty result

      // Act
      await evaluasiController.getDetailEvaluasi(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith('Evaluasi tidak ditemukan');
    });

    it('should handle access control for different division', async () => {
      // Arrange
      mockReq.params.id = '1';
      
      const mockEvaluasiDetail = [
        {
          id_evaluasi: 1,
          id_divisi: 99, // Different division
          judul_laporan: 'Laporan Divisi Lain'
        }
      ];

      db.query.mockResolvedValueOnce([mockEvaluasiDetail]);

      // Act
      await evaluasiController.getDetailEvaluasi(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockSend).toHaveBeenCalledWith('Tidak boleh akses evaluasi divisi lain');
    });

    it('should handle database error in getDetailEvaluasi', async () => {
      // Arrange
      mockReq.params.id = '1';
      db.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await evaluasiController.getDetailEvaluasi(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Gagal mengambil detail evaluasi');
    });

  });

  describe('addKomentar', () => {

    it('should add komentar successfully', async () => {
      // Arrange
      mockReq.params.id = '1';
      mockReq.body = {
        komentar_hmsi: 'Terima kasih atas evaluasinya, sudah kami perbaiki sesuai saran.'
      };

      const mockLaporanInfo = [
        {
          id_laporan: 1,
          judul_laporan: 'Laporan Test',
          Nama_ProgramKerja: 'Program Test',
          nama_divisi: 'BPH'
        }
      ];

      db.query
        .mockResolvedValueOnce([]) // Update komentar
        .mockResolvedValueOnce([mockLaporanInfo]) // Get laporan info
        .mockResolvedValueOnce([]); // Insert notifikasi

      // Act
      await evaluasiController.addKomentar(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      
      // Cek update komentar
      expect(db.query.mock.calls[0][0]).toContain('UPDATE Evaluasi SET komentar_hmsi');
      expect(db.query.mock.calls[0][1]).toEqual([mockReq.body.komentar_hmsi, '1']);
      
      // Cek insert notifikasi
      expect(db.query.mock.calls[2][0]).toContain('INSERT INTO Notifikasi');

      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/kelola-evaluasi?success=Komentar berhasil ditambahkan');
    });

    it('should handle empty komentar', async () => {
      // Arrange
      mockReq.params.id = '1';
      mockReq.body = {
        komentar_hmsi: '' // Empty comment
      };

      // Act
      await evaluasiController.addKomentar(mockReq, mockRes);

      // Assert
      expect(db.query).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/kelola-evaluasi?error=Komentar tidak boleh kosong');
    });

    it('should handle whitespace-only komentar', async () => {
      // Arrange
      mockReq.params.id = '1';
      mockReq.body = {
        komentar_hmsi: '   ' // Only whitespace
      };

      // Act
      await evaluasiController.addKomentar(mockReq, mockRes);

      // Assert
      expect(db.query).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/kelola-evaluasi?error=Komentar tidak boleh kosong');
    });

    it('should handle missing komentar field', async () => {
      // Arrange
      mockReq.params.id = '1';
      mockReq.body = {}; // No komentar_hmsi field

      // Act
      await evaluasiController.addKomentar(mockReq, mockRes);

      // Assert
      expect(db.query).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/kelola-evaluasi?error=Komentar tidak boleh kosong');
    });

    it('should handle database error in addKomentar', async () => {
      // Arrange
      mockReq.params.id = '1';
      mockReq.body = {
        komentar_hmsi: 'Valid comment'
      };

      db.query.mockRejectedValue(new Error('Database update failed'));

      // Act
      await evaluasiController.addKomentar(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Gagal menambahkan komentar');
    });

  });

});