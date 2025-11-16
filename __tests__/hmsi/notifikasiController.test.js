// __tests__/hmsi/notifikasiController.test.js

// 1. Import controller yang akan ditest
const notifikasiController = require('../../controllers/hmsi/notifikasiController');

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
    params: {}
  };
});

// ==========================================
// TEST SUITES
// ==========================================

describe('Notifikasi Controller', () => {

  describe('getAllNotifikasi', () => {

    it('should fetch all notifications successfully', async () => {
      // Arrange
      const mockNotifikasiData = [
        {
          id_notifikasi: 1,
          pesan: 'Laporan Anda perlu revisi',
          created_at: '2024-01-15 10:30:00',
          status_baca: 0,
          id_laporan: 1,
          id_ProgramKerja: null,
          id_evaluasi: null,
          nama_divisi: 'BPH',
          judul_laporan: 'Laporan Kegiatan A',
          Nama_ProgramKerja: null,
          status_evaluasi: null,
          tipe_notifikasi: 'laporan',
          is_deleted: 0
        },
        {
          id_notifikasi: 2,
          pesan: 'Laporan Anda telah diterima',
          created_at: '2024-01-14 09:15:00',
          status_baca: 1,
          id_laporan: 2,
          id_ProgramKerja: null,
          id_evaluasi: null,
          nama_divisi: 'BPH',
          judul_laporan: 'Laporan Kegiatan B',
          Nama_ProgramKerja: null,
          status_evaluasi: null,
          tipe_notifikasi: 'laporan',
          is_deleted: 0
        }
      ];

      db.query.mockResolvedValue([mockNotifikasiData]);

      // Act
      await notifikasiController.getAllNotifikasi(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(1);
      
      // Cek query dipanggil dengan parameter yang benar
      expect(db.query.mock.calls[0][1]).toEqual([10, 10]); // id_divisi twice for LEFT JOIN

      expect(mockRender).toHaveBeenCalledWith('hmsi/hmsiNotifikasi', {
        title: 'Notifikasi',
        user: mockReq.session.user,
        activeNav: 'notifikasi',
        notifikasi: expect.arrayContaining([
          expect.objectContaining({
            id_notifikasi: 1,
            tanggalFormatted: expect.any(String),
            status_baca: 0,
            linkUrl: '/hmsi/notifikasi/read/1',
            linkLabel: 'Lihat',
            tipe: 'laporan'
          }),
          expect.objectContaining({
            id_notifikasi: 2,
            tanggalFormatted: expect.any(String),
            status_baca: 1,
            linkUrl: '/hmsi/notifikasi/read/2',
            linkLabel: 'Lihat',
            tipe: 'laporan'
          })
        ]),
        unreadCount: 1 // Hanya 1 notifikasi yang belum dibaca
      });
    });

    it('should handle unauthorized access', async () => {
      // Arrange
      mockReq.session.user = null;

      // Act
      await notifikasiController.getAllNotifikasi(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockSend).toHaveBeenCalledWith('Unauthorized');
    });

    it('should handle non-HMSI user', async () => {
      // Arrange
      mockReq.session.user.role = 'DPA';

      // Act
      await notifikasiController.getAllNotifikasi(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockSend).toHaveBeenCalledWith('Unauthorized');
    });

    it('should handle user without id_divisi', async () => {
      // Arrange
      mockReq.session.user.id_divisi = null;

      // Act
      await notifikasiController.getAllNotifikasi(mockReq, mockRes);

      // Assert
      expect(mockRender).toHaveBeenCalledWith('hmsi/hmsiNotifikasi', {
        title: 'Notifikasi',
        user: mockReq.session.user,
        activeNav: 'notifikasi',
        notifikasi: [],
        unreadCount: 0
      });
    });

    it('should handle empty notifications', async () => {
      // Arrange
      db.query.mockResolvedValue([[]]);

      // Act
      await notifikasiController.getAllNotifikasi(mockReq, mockRes);

      // Assert
      expect(mockRender).toHaveBeenCalledWith('hmsi/hmsiNotifikasi', {
        title: 'Notifikasi',
        user: mockReq.session.user,
        activeNav: 'notifikasi',
        notifikasi: [],
        unreadCount: 0
      });
    });

    it('should handle database error', async () => {
      // Arrange
      db.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await notifikasiController.getAllNotifikasi(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Gagal mengambil notifikasi HMSI');
    });

  });

  describe('readAndRedirect', () => {

    it('should mark notification as read and redirect to laporan detail', async () => {
      // Arrange
      mockReq.params.id = '1';
      
      const mockNotifikasi = [
        {
          id_notifikasi: 1,
          jenis: 'evaluasi',
          id_laporan: 5,
          status_baca: 0
        }
      ];

      const mockLaporanData = [
        {
          id_laporan: 5,
          judul_laporan: 'Test Laporan'
        }
      ];

      db.query
        .mockResolvedValueOnce([mockNotifikasi]) // Get notification
        .mockResolvedValueOnce([]) // Update status_baca
        .mockResolvedValueOnce([mockLaporanData]); // Get laporan data

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      
      // Cek update status_baca dipanggil dengan benar
      expect(db.query.mock.calls[1][0]).toContain('UPDATE Notifikasi SET status_baca = 1');
      expect(db.query.mock.calls[1][1]).toEqual(['1']);

      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/laporan/5');
    });

    it('should redirect to evaluasi detail for evaluasi notification', async () => {
      // Arrange
      mockReq.params.id = '2';
      
      const mockNotifikasi = [
        {
          id_notifikasi: 2,
          id_evaluasi: 7,
          id_laporan: null,
          id_ProgramKerja: null,
          status_baca: 0
        }
      ];

      const mockEvaluasiData = [
        {
          id_evaluasi: 7
        }
      ];

      db.query
        .mockResolvedValueOnce([mockNotifikasi]) // SELECT notifikasi
        .mockResolvedValueOnce([]) // UPDATE status_baca
        .mockResolvedValueOnce([mockEvaluasiData]); // SELECT evaluasi untuk validate

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      
      // Cek bahwa ada SELECT untuk validasi evaluasi
      expect(db.query.mock.calls[2][0]).toContain('SELECT id_evaluasi FROM Evaluasi WHERE id_evaluasi = ?');
      expect(db.query.mock.calls[2][1]).toEqual([7]);
      
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/kelola-evaluasi/7');
    });

    it('should handle notification not found', async () => {
      // Arrange
      mockReq.params.id = '999';
      db.query.mockResolvedValue([[]]);

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(mockRender).toHaveBeenCalledWith('partials/error', {
        title: 'Notifikasi Tidak Ditemukan',
        message: 'Notifikasi yang Anda cari tidak ditemukan.',
        user: mockReq.session.user
      });
    });

    it('should fallback to error page when laporan not found', async () => {
      // Arrange
      mockReq.params.id = '3';
      
      const mockNotifikasi = [
        {
          id_notifikasi: 3,
          id_laporan: 999,
          id_evaluasi: null,
          id_ProgramKerja: null,
          status_baca: 0
        }
      ];

      db.query
        .mockResolvedValueOnce([mockNotifikasi]) // SELECT notifikasi
        .mockResolvedValueOnce([]) // UPDATE status_baca
        .mockResolvedValueOnce([[]]); // SELECT laporan (empty - not found)

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(mockRender).toHaveBeenCalledWith('partials/error', {
        title: 'Laporan Dihapus',
        message: 'Data yang Anda cari mungkin telah dihapus.',
        user: mockReq.session.user
      });
    });

    it('should handle database error in readAndRedirect', async () => {
      // Arrange
      mockReq.params.id = '1';
      db.query.mockRejectedValue(new Error('Database error'));

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(mockRender).toHaveBeenCalledWith('partials/error', {
        title: 'Terjadi Kesalahan',
        message: 'Gagal membuka notifikasi. Silakan coba lagi.',
        user: mockReq.session.user
      });
    });

    it('should handle proker type notification', async () => {
      // Arrange
      mockReq.params.id = '3';
      
      const mockNotifikasi = [
        {
          id_notifikasi: 3,
          id_ProgramKerja: 15,
          id_laporan: null,
          id_evaluasi: null,
          status_baca: 0
        }
      ];

      const mockProkerData = [
        {
          id_ProgramKerja: 15
        }
      ];

      db.query
        .mockResolvedValueOnce([mockNotifikasi]) // SELECT notifikasi
        .mockResolvedValueOnce([]) // UPDATE status_baca
        .mockResolvedValueOnce([mockProkerData]); // SELECT proker untuk validate

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/proker/15');
    });

  });

  // Test untuk helper functions (opsional, tapi baik untuk coverage)
  describe('deleteAllRelatedNotif', () => {

    it('should delete related notifications successfully', async () => {
      // Arrange
      const entityId = 'test-laporan-id';
      const type = 'laporan';

      db.query.mockResolvedValue([]);

      // Act
      await notifikasiController.deleteAllRelatedNotif(entityId, type);

      // Assert
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM Notifikasi WHERE id_laporan = ?',
        [entityId]
      );
    });

    it('should handle proker type deletion', async () => {
      // Arrange
      const entityId = 'test-proker-id';
      const type = 'proker';

      db.query.mockResolvedValue([]);

      // Act
      await notifikasiController.deleteAllRelatedNotif(entityId, type);

      // Assert
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM Notifikasi WHERE id_ProgramKerja = ?',
        [entityId]
      );
    });

  });

  describe('deleteOldProkerNotif', () => {

    it('should delete old proker notifications', async () => {
      // Arrange
      const idProker = 'test-proker-id';
      db.query.mockResolvedValue([]);

      // Act
      await notifikasiController.deleteOldProkerNotif(idProker);

      // Assert
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM Notifikasi WHERE id_ProgramKerja = ?',
        [idProker]
      );
    });

    it('should handle database error in deleteOldProkerNotif', async () => {
      // Arrange
      const idProker = 'test-proker-id';
      db.query.mockRejectedValue(new Error('Delete failed'));

      // Act (should not throw)
      await notifikasiController.deleteOldProkerNotif(idProker);

      // Assert (function handles error internally)
      expect(db.query).toHaveBeenCalledTimes(1);
    });

  });

});