// __tests__/hmsi/dashboardController.test.js

// 1. Import controller yang akan ditest
const dashboardController = require('../../controllers/hmsi/dashboardController');

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
    send: mockSend,
    locals: {
      unreadCount: 5
    }
  };

  // Mock request default
  mockReq = {
    session: {
      user: {
        id_anggota: 1,
        id_divisi: 10,
        nama: 'Test User',
        role: 'HMSI'
      }
    }
  };
});

// ==========================================
// TEST SUITES
// ==========================================

describe('Dashboard Controller', () => {

  describe('getDashboardStats', () => {

    it('should redirect to login if user is not in session', async () => {
      // Arrange
      mockReq.session.user = null;

      // Act
      await dashboardController.getDashboardStats(mockReq, mockRes);

      // Assert
      expect(mockRedirect).toHaveBeenCalledWith('/auth/login');
    });

    it('should render dashboard with zero stats if user has no id_divisi', async () => {
      // Arrange
      mockReq.session.user.id_divisi = null;

      // Act
      await dashboardController.getDashboardStats(mockReq, mockRes);

      // Assert
      expect(mockRender).toHaveBeenCalledWith('hmsi/hmsiDashboard', {
        title: 'Dashboard HMSI',
        user: mockReq.session.user,
        activeNav: 'Dashboard',
        totalProker: 0,
        prokerSelesai: 0,
        prokerBerjalan: 0,
        totalLaporan: 0,
        unreadCount: 5
      });
    });

    it('should fetch dashboard stats successfully with proker data', async () => {
      // Arrange
      const mockProkerData = [
        {
          id: 'proker-1',
          namaProker: 'Proker A',
          Tanggal_mulai: '2025-01-01',
          Tanggal_selesai: '2025-12-31',
          status_db: 'Sedang Berjalan' // Status tidak akan diubah di dashboard (READ-ONLY)
        },
        {
          id: 'proker-2', 
          namaProker: 'Proker B',
          Tanggal_mulai: '2023-01-01',
          Tanggal_selesai: '2023-12-31',
          status_db: 'Selesai' // Status final
        },
        {
          id: 'proker-3',
          namaProker: 'Proker C', 
          Tanggal_mulai: '2026-06-01', // Proker masa depan
          Tanggal_selesai: '2026-08-31',
          status_db: 'Belum Dimulai' // Status tidak akan diubah di dashboard
        }
      ];

      const mockLaporanData = [{ total: 15 }];

      // Mock db queries - HANYA READ, TIDAK ADA UPDATE (controller sudah diperbaiki)
      db.query
        .mockResolvedValueOnce([mockProkerData]) // Query 1: SELECT Program_kerja
        .mockResolvedValueOnce([mockLaporanData]); // Query 2: SELECT laporan

      // Act
      await dashboardController.getDashboardStats(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(2); // Hanya 2 SELECT queries (READ-only)
      
      // Cek bahwa query proker dipanggil dengan id_divisi yang benar
      expect(db.query.mock.calls[0][0]).toContain('WHERE pk.id_divisi = ?');
      expect(db.query.mock.calls[0][1]).toEqual([10]);

      // Cek query laporan
      expect(db.query.mock.calls[1][0]).toContain('SELECT COUNT(*) AS total FROM Laporan WHERE id_divisi = ?');
      expect(db.query.mock.calls[1][1]).toEqual([10]);

      // Cek render dengan stats yang benar (berdasarkan getDisplayStatus helper)
      expect(mockRender).toHaveBeenCalledWith('hmsi/hmsiDashboard', {
        title: 'Dashboard HMSI',
        user: mockReq.session.user,
        activeNav: 'Dashboard',
        totalProker: 3,
        prokerSelesai: 1, // Hanya Proker B yang status_db = "Selesai"
        prokerBerjalan: 1, // Hanya Proker A yang status_db = "Sedang Berjalan"
        totalLaporan: 15,
        unreadCount: 5
      });
    });

    it('should handle proker data without status updates needed', async () => {
      // Arrange - semua proker dengan berbagai status (dashboard tidak mengupdate status)
      const mockProkerData = [
        {
          id: 'proker-1',
          namaProker: 'Proker Final A',
          Tanggal_mulai: '2023-01-01',
          Tanggal_selesai: '2023-12-31',
          status_db: 'Selesai' // Status final
        },
        {
          id: 'proker-2',
          namaProker: 'Proker Final B',
          Tanggal_mulai: '2024-01-01',
          Tanggal_selesai: '2024-12-31',
          status_db: 'Gagal' // Status final
        },
        {
          id: 'proker-3',
          namaProker: 'Proker Running',
          Tanggal_mulai: '2025-01-01',
          Tanggal_selesai: '2025-12-31',
          status_db: 'Sedang Berjalan' // Status sementara
        }
      ];

      const mockLaporanData = [{ total: 8 }];

      // Mock db queries - HANYA READ, tidak ada UPDATE (controller sudah read-only)
      db.query
        .mockResolvedValueOnce([mockProkerData]) // Query 1: SELECT Program_kerja
        .mockResolvedValueOnce([mockLaporanData]); // Query 2: SELECT laporan

      // Act
      await dashboardController.getDashboardStats(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(2); // Hanya 2 query: SELECT proker + SELECT laporan
      
      // Cek query proker
      expect(db.query.mock.calls[0][0]).toContain('WHERE pk.id_divisi = ?');
      expect(db.query.mock.calls[0][1]).toEqual([10]);

      // Cek query laporan
      expect(db.query.mock.calls[1][0]).toContain('SELECT COUNT(*) AS total FROM Laporan WHERE id_divisi = ?');
      expect(db.query.mock.calls[1][1]).toEqual([10]);

      // Cek render dengan stats yang benar (berdasarkan status_db langsung)
      expect(mockRender).toHaveBeenCalledWith('hmsi/hmsiDashboard', {
        title: 'Dashboard HMSI',
        user: mockReq.session.user,
        activeNav: 'Dashboard',
        totalProker: 3,
        prokerSelesai: 1, // Hanya Proker A yang status_db = "Selesai"
        prokerBerjalan: 1, // Hanya Proker Running yang status_db = "Sedang Berjalan"
        totalLaporan: 8,
        unreadCount: 5
      });
    });

    it('should handle database error gracefully', async () => {
      // Arrange
      db.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await dashboardController.getDashboardStats(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Terjadi kesalahan server saat memuat dashboard HMSI.');
    });

    it('should handle missing laporan data gracefully', async () => {
      // Arrange
      const mockProkerData = [];
      const mockLaporanData = []; // Empty laporan result

      db.query
        .mockResolvedValueOnce([mockProkerData]) // Query proker
        .mockResolvedValueOnce([mockLaporanData]); // Query laporan kosong

      // Act
      await dashboardController.getDashboardStats(mockReq, mockRes);

      // Assert
      expect(mockRender).toHaveBeenCalledWith('hmsi/hmsiDashboard', {
        title: 'Dashboard HMSI',
        user: mockReq.session.user,
        activeNav: 'Dashboard',
        totalProker: 0,
        prokerSelesai: 0,
        prokerBerjalan: 0,
        totalLaporan: 0, // Default 0 when no data
        unreadCount: 5
      });
    });

    it('should handle unreadCount from res.locals', async () => {
      // Arrange
      mockRes.locals.unreadCount = 0; // Tidak ada notifikasi
      const mockProkerData = [];
      const mockLaporanData = [{ total: 0 }];

      db.query
        .mockResolvedValueOnce([mockProkerData])
        .mockResolvedValueOnce([mockLaporanData]);

      // Act
      await dashboardController.getDashboardStats(mockReq, mockRes);

      // Assert
      expect(mockRender).toHaveBeenCalledWith('hmsi/hmsiDashboard', 
        expect.objectContaining({
          unreadCount: 0
        })
      );
    });

    it('should handle missing res.locals.unreadCount', async () => {
      // Arrange
      mockRes.locals = {}; // Tidak ada unreadCount
      const mockProkerData = [];
      const mockLaporanData = [{ total: 0 }];

      db.query
        .mockResolvedValueOnce([mockProkerData])
        .mockResolvedValueOnce([mockLaporanData]);

      // Act
      await dashboardController.getDashboardStats(mockReq, mockRes);

      // Assert
      expect(mockRender).toHaveBeenCalledWith('hmsi/hmsiDashboard', 
        expect.objectContaining({
          unreadCount: 0 // Default ke 0 jika tidak ada
        })
      );
    });

    it('should handle status calculation with getDisplayStatus helper correctly', async () => {
      // Arrange - test berbagai scenario status
      const mockProkerData = [
        {
          id: 'proker-1',
          namaProker: 'Proker Belum Mulai',
          Tanggal_mulai: '2026-06-01', // Masa depan
          Tanggal_selesai: '2026-08-31',
          status_db: 'Belum Dimulai' // Status non-final, akan dihitung berdasarkan tanggal
        },
        {
          id: 'proker-2',
          namaProker: 'Proker Berjalan',
          Tanggal_mulai: '2025-01-01', // Sudah mulai di tahun ini
          Tanggal_selesai: '2025-12-31',
          status_db: 'Belum Dimulai' // Status non-final, akan dihitung jadi "Sedang Berjalan"
        },
        {
          id: 'proker-3',
          namaProker: 'Proker Final Selesai',
          Tanggal_mulai: '2024-01-01',
          Tanggal_selesai: '2024-12-31',
          status_db: 'Selesai' // Status final, tidak akan berubah
        },
        {
          id: 'proker-4',
          namaProker: 'Proker Running Status',
          Tanggal_mulai: '2025-01-01',
          Tanggal_selesai: '2025-12-31',
          status_db: 'Sedang Berjalan' // Status sudah sesuai
        }
      ];

      const mockLaporanData = [{ total: 12 }];

      db.query
        .mockResolvedValueOnce([mockProkerData])
        .mockResolvedValueOnce([mockLaporanData]);

      // Act
      await dashboardController.getDashboardStats(mockReq, mockRes);

      // Assert
      expect(mockRender).toHaveBeenCalledWith('hmsi/hmsiDashboard', {
        title: 'Dashboard HMSI',
        user: mockReq.session.user,
        activeNav: 'Dashboard',
        totalProker: 4,
        prokerSelesai: 1, // Hanya proker-3 yang status final "Selesai"
        prokerBerjalan: 2, // proker-2 (dihitung berjalan) + proker-4 (sudah berjalan)
        totalLaporan: 12,
        unreadCount: 5
      });
    });

  });

});