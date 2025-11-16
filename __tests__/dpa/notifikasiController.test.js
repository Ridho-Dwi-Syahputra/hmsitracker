// __tests__/dpa/notifikasiController.test.js

// 1. Import controller yang akan ditest
const notifikasiController = require('../../controllers/DPA/notifikasiController');

// 2. Import dependensi yang akan kita mock
const db = require('../../config/db');

// 3. Beritahu Jest untuk me-mock dependensi ini
// Hanya 'db' yang perlu di-mock untuk controller ini
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
let mockJson;
let consoleErrorMock; // Untuk membungkam console.error

// Bungkam console.log/warn/error
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Setup sebelum setiap test
beforeEach(() => {
  // Reset semua mock (termasuk implementasi dan panggilan)
  jest.resetAllMocks();

  // Re-mock console.error setelah di-reset
  consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

  // Mock response methods
  mockRender = jest.fn();
  mockRedirect = jest.fn();
  mockSend = jest.fn();
  mockJson = jest.fn();
  mockStatus = jest.fn(() => ({ send: mockSend, json: mockJson }));

  mockRes = {
    render: mockRender,
    redirect: mockRedirect,
    status: mockStatus,
    send: mockSend,
    json: mockJson
  };

  // Mock db.query (akan di-override di tiap tes jika perlu)
  db.query = jest.fn();

  // Mock request default
  mockReq = {
    session: {
      user: {
        id_anggota: 'dpa001',
        nama: 'Test DPA',
        role: 'DPA'
      }
    },
    params: {},
    body: {},
    query: {},
  };
});

// ==========================================
// TEST SUITES
// ==========================================

describe('DPA Notifikasi Controller', () => {

  // ==========================================
  // 📄 getAllNotifikasi
  // ==========================================
  describe('getAllNotifikasi', () => {
    
    it('should fetch, map, and render notifications correctly', async () => {
      // Arrange
      const mockNotifData = [
        { id_notifikasi: 1, pesan: 'Laporan baru', status_baca: 0, created_at: new Date('2025-11-16T10:00:00Z'), is_deleted: 0, tipe_notifikasi: 'laporan' },
        { id_notifikasi: 2, pesan: 'Proker dihapus', status_baca: 1, created_at: new Date('2025-11-15T11:00:00Z'), is_deleted: 1, tipe_notifikasi: 'proker' },
        { id_notifikasi: 3, pesan: 'Evaluasi baru', status_baca: 0, created_at: new Date('2025-11-14T12:00:00Z'), is_deleted: 0, tipe_notifikasi: 'evaluasi' }
      ];
      db.query.mockResolvedValue([mockNotifData]);
      mockReq.query.success = 'Pesan sukses';

      // Act
      await notifikasiController.getAllNotifikasi(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining("WHERE n.target_role = 'DPA'"));
      expect(mockRender).toHaveBeenCalledWith('dpa/dpaNotifikasi', {
        title: "Notifikasi",
        user: mockReq.session.user,
        activeNav: "Notifikasi",
        notifikasi: expect.arrayContaining([
          expect.objectContaining({ id_notifikasi: 1, status_baca: 0, is_deleted: 0, linkLabel: "Lihat" }),
          expect.objectContaining({ id_notifikasi: 2, status_baca: 1, is_deleted: 1, linkLabel: "Data Dihapus" }),
          expect.objectContaining({ id_notifikasi: 3, status_baca: 0, is_deleted: 0, linkLabel: "Lihat" })
        ]),
        unreadCount: 2, // 1 dan 3 belum dibaca
        successMsg: 'Pesan sukses',
        errorMsg: null,
      });
    });

    it('should handle DB error', async () => {
      // Arrange
      const error = new Error('DB Error');
      db.query.mockRejectedValue(error);

      // Act
      await notifikasiController.getAllNotifikasi(mockReq, mockRes);

      // Assert
      expect(consoleErrorMock).toHaveBeenCalledWith("❌ getAllNotifikasi error:", 'DB Error');
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Gagal mengambil notifikasi');
    });

  });

  // ==========================================
  // ✅ markAsRead (AJAX)
  // ==========================================
  describe('markAsRead', () => {

    it('should update status_baca and return success JSON', async () => {
      // Arrange
      mockReq.params.id = 'notif-123';
      db.query.mockResolvedValue([{}]); // Mock sukses UPDATE

      // Act
      await notifikasiController.markAsRead(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE Notifikasi SET status_baca = 1 WHERE id_notifikasi = ?",
        ['notif-123']
      );
      expect(mockJson).toHaveBeenCalledWith({ success: true, message: "Notifikasi ditandai sudah dibaca" });
    });

    it('should handle DB error and return error JSON', async () => {
      // Arrange
      mockReq.params.id = 'notif-123';
      const error = new Error('DB Error');
      db.query.mockRejectedValue(error);

      // Act
      await notifikasiController.markAsRead(mockReq, mockRes);

      // Assert
      expect(consoleErrorMock).toHaveBeenCalledWith("❌ markAsRead error:", 'DB Error');
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ success: false, error: "Gagal menandai notifikasi" });
    });

  });

  // ==========================================
  // 🔄 readAndRedirect
  // ==========================================
  describe('readAndRedirect', () => {

    it('should render error page if notification not found', async () => {
      // Arrange
      mockReq.params.id = 'notif-999';
      db.query.mockResolvedValueOnce([[]]); // 1. Get Notifikasi (kosong)

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(1); // Hanya cek notifikasi
      expect(mockRender).toHaveBeenCalledWith('partials/error', expect.objectContaining({
        message: "Notifikasi yang Anda cari tidak ditemukan di sistem."
      }));
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect to PROKER if data exists', async () => {
      // Arrange
      const mockNotif = { id_notifikasi: 'notif-001', id_ProgramKerja: 'proker-123' };
      mockReq.params.id = 'notif-001';
      db.query
        .mockResolvedValueOnce([[mockNotif]]) // 1. Get Notifikasi
        .mockResolvedValueOnce([{}])           // 2. UPDATE status_baca
        .mockResolvedValueOnce([[{ id_ProgramKerja: 'proker-123' }]]); // 3. Cek Proker (ada)

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(db.query).toHaveBeenCalledWith("UPDATE Notifikasi SET status_baca = 1 WHERE id_notifikasi = ?", ['notif-001']);
      expect(mockRedirect).toHaveBeenCalledWith('/dpa/lihatProker/proker-123/detail');
      expect(mockRender).not.toHaveBeenCalled();
    });

    it('should redirect to LAPORAN if data exists', async () => {
      // Arrange
      const mockNotif = { id_notifikasi: 'notif-002', id_laporan: 'laporan-456' };
      mockReq.params.id = 'notif-002';
      db.query
        .mockResolvedValueOnce([[mockNotif]]) // 1. Get Notifikasi
        .mockResolvedValueOnce([{}])           // 2. UPDATE status_baca
        .mockResolvedValueOnce([[{ id_laporan: 'laporan-456' }]]); // 3. Cek Laporan (ada)

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(mockRedirect).toHaveBeenCalledWith('/dpa/laporan/laporan-456');
      expect(mockRender).not.toHaveBeenCalled();
    });
    
    it('should redirect to LAPORAN (via EVALUASI) if data exists', async () => {
      // Arrange
      const mockNotif = { id_notifikasi: 'notif-003', id_evaluasi: 'eval-789' };
      const mockEvaluasi = { id_evaluasi: 'eval-789', id_laporan: 'laporan-c' };
      mockReq.params.id = 'notif-003';
      db.query
        .mockResolvedValueOnce([[mockNotif]]) // 1. Get Notifikasi
        .mockResolvedValueOnce([{}])           // 2. UPDATE status_baca
        .mockResolvedValueOnce([[mockEvaluasi]]); // 3. Cek Evaluasi (ada)

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(mockRedirect).toHaveBeenCalledWith('/dpa/laporan/laporan-c');
      expect(mockRender).not.toHaveBeenCalled();
    });

    it('should render error page if PROKER is deleted', async () => {
      // Arrange
      const mockNotif = { id_notifikasi: 'notif-001', id_ProgramKerja: 'proker-123' };
      mockReq.params.id = 'notif-001';
      db.query
        .mockResolvedValueOnce([[mockNotif]]) // 1. Get Notifikasi
        .mockResolvedValueOnce([{}])           // 2. UPDATE status_baca
        .mockResolvedValueOnce([[]]);          // 3. Cek Proker (kosong/dihapus)

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(mockRender).toHaveBeenCalledWith('partials/error', expect.objectContaining({
        title: "Program Kerja Dihapus",
        message: "Program kerja ini telah dihapus oleh HMSI."
      }));
      expect(mockRedirect).not.toHaveBeenCalled();
    });
    
    it('should render error page if LAPORAN is deleted', async () => {
      // Arrange
      const mockNotif = { id_notifikasi: 'notif-002', id_laporan: 'laporan-456' };
      mockReq.params.id = 'notif-002';
      db.query
        .mockResolvedValueOnce([[mockNotif]]) // 1. Get Notifikasi
        .mockResolvedValueOnce([{}])           // 2. UPDATE status_baca
        .mockResolvedValueOnce([[]]);          // 3. Cek Laporan (kosong/dihapus)

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(mockRender).toHaveBeenCalledWith('partials/error', expect.objectContaining({
        title: "Laporan Dihapus",
        message: "Laporan ini telah dihapus oleh HMSI."
      }));
      expect(mockRedirect).not.toHaveBeenCalled();
    });
    
    it('should render error page if EVALUASI is deleted', async () => {
      // Arrange
      const mockNotif = { id_notifikasi: 'notif-003', id_evaluasi: 'eval-789' };
      mockReq.params.id = 'notif-003';
      db.query
        .mockResolvedValueOnce([[mockNotif]]) // 1. Get Notifikasi
        .mockResolvedValueOnce([{}])           // 2. UPDATE status_baca
        .mockResolvedValueOnce([[]]);          // 3. Cek Evaluasi (kosong/dihapus)

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(mockRender).toHaveBeenCalledWith('partials/error', expect.objectContaining({
        title: "Komentar Tidak Tersedia"
      }));
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should handle general DB error', async () => {
      // Arrange
      mockReq.params.id = 'notif-001';
      const error = new Error('DB Error');
      db.query.mockRejectedValue(error); // Gagal di query pertama (Get Notifikasi)

      // Act
      await notifikasiController.readAndRedirect(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(consoleErrorMock).toHaveBeenCalledWith("❌ readAndRedirect error:", 'DB Error');
      expect(mockRender).toHaveBeenCalledWith('partials/error', expect.objectContaining({
        title: "Terjadi Kesalahan"
      }));
    });

  });

});