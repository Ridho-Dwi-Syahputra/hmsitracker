# LAPORAN UNIT TESTING - DASHBOARD CONTROLLER HMSI

## Controller
**dashboardController** (HMSI Module)

---

## Unit: getDashboardStats()

### Deskripsi:
Fungsi `getDashboardStats()` menangani pengambilan dan kalkulasi statistik dashboard untuk modul HMSI (Himpunan Mahasiswa Sistem Informasi). Fungsi ini mengambil data program kerja (proker) berdasarkan divisi pengguna yang sedang login, menghitung total proker, jumlah proker selesai, jumlah proker yang sedang berjalan, dan total laporan yang telah dibuat oleh divisi tersebut.

**Alur Proses:**
1. Melakukan validasi session pengguna - redirect ke halaman login jika user tidak terautentikasi
2. Mengecek keberadaan `id_divisi` user - render dashboard dengan statistik 0 jika user tidak memiliki divisi
3. Query database untuk mengambil semua program kerja milik divisi user dengan JOIN ke tabel divisi
4. Menghitung statistik proker berdasarkan field `status_db`:
   - Total proker: COUNT semua proker divisi
   - Proker selesai: COUNT proker dengan `status_db = "Selesai"`
   - Proker berjalan: COUNT proker dengan `status_db = "Sedang Berjalan"`
5. Query database untuk menghitung total laporan divisi dari tabel Laporan
6. Mengambil unread notification count dari `res.locals.unreadCount` (di-set oleh middleware)
7. Render view `hmsi/hmsiDashboard` dengan semua data statistik
8. Error handling dengan status 500 jika terjadi kesalahan database

**Fitur Keamanan:**
- Session validation untuk memastikan hanya user terautentikasi yang bisa akses
- Query menggunakan parameterized statements untuk mencegah SQL injection
- Graceful error handling dengan pesan error yang user-friendly

**Data yang Dirender:**
- `title`: Judul halaman dashboard
- `user`: Objek user dari session (id_anggota, nama, id_divisi, role)
- `activeNav`: Indikator navigasi aktif untuk highlight menu
- `totalProker`: Total program kerja divisi
- `prokerSelesai`: Jumlah proker dengan status "Selesai"
- `prokerBerjalan`: Jumlah proker dengan status "Sedang Berjalan"
- `totalLaporan`: Total laporan yang dibuat divisi
- `unreadCount`: Jumlah notifikasi yang belum dibaca

### Test Case yang diuji:

1. **Redirect ke login jika user tidak ada di session**
   - Memastikan user yang belum login tidak bisa akses dashboard
   - Validasi redirect ke `/auth/login`

2. **Render dashboard dengan stats 0 jika user tidak memiliki id_divisi**
   - Handle edge case user tanpa divisi
   - Semua statistik diset ke 0
   - Dashboard tetap ter-render normal

3. **Fetch dashboard stats berhasil dengan data proker**
   - Query database berhasil mengambil data proker
   - Kalkulasi statistik sesuai dengan status proker
   - Handle berbagai status: "Selesai", "Sedang Berjalan", "Belum Dimulai"
   - Validasi query menggunakan parameter id_divisi yang benar
   - Memastikan hanya 2 SELECT queries dipanggil (read-only operation)

4. **Handle proker dengan berbagai status tanpa update**
   - Memastikan dashboard controller read-only (tidak melakukan UPDATE)
   - Menghitung statistik berdasarkan field `status_db` langsung
   - Handle status final: "Selesai", "Gagal"
   - Handle status sementara: "Sedang Berjalan", "Belum Dimulai"

5. **Handle database error dengan graceful**
   - Catch error koneksi database
   - Return status 500 dengan pesan error yang sesuai
   - Tidak crash aplikasi

6. **Handle missing laporan data dengan graceful**
   - Ketika query laporan return empty array
   - Default totalLaporan ke 0
   - Dashboard tetap ter-render normal

7. **Handle unreadCount dari res.locals**
   - Mengambil unread notification count dari middleware
   - Support berbagai nilai unreadCount (0, 5, 10, dst)
   - Pass unreadCount ke view untuk badge notifikasi

8. **Handle missing res.locals.unreadCount**
   - Edge case ketika middleware tidak set unreadCount
   - Default unreadCount ke 0
   - Tidak ada error meskipun property tidak ada

9. **Handle kalkulasi status dengan getDisplayStatus helper**
   - Test berbagai skenario status proker
   - Validasi perhitungan status berdasarkan tanggal dan status_db
   - Status final ("Selesai", "Gagal") tidak berubah
   - Status sementara dihitung berdasarkan tanggal mulai/selesai
   - Proker masa depan dihitung sebagai "Belum Dimulai"
   - Proker yang sedang berjalan dihitung berdasarkan tanggal current

### Kode Unit Testing:

```javascript
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
          status_db: 'Sedang Berjalan' 
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
```

### Output Hasil Testing Unit:

```
PASS  __tests__/hmsi/dashboardController.test.js
  Dashboard Controller
    getDashboardStats
      ✓ should redirect to login if user is not in session (8 ms)
      ✓ should render dashboard with zero stats if user has no id_divisi (3 ms)
      ✓ should fetch dashboard stats successfully with proker data (5 ms)
      ✓ should handle proker data without status updates needed (4 ms)
      ✓ should handle database error gracefully (3 ms)
      ✓ should handle missing laporan data gracefully (3 ms)
      ✓ should handle unreadCount from res.locals (3 ms)
      ✓ should handle missing res.locals.unreadCount (3 ms)
      ✓ should handle status calculation with getDisplayStatus helper correctly (4 ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        2.156 s
```

### Coverage Report:

```
---------------------------|---------|----------|---------|---------|-------------------
File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------------|---------|----------|---------|---------|-------------------
dashboardController.js     |   97.29 |    90.90 |     100 |   96.87 | 45-46             
---------------------------|---------|----------|---------|---------|-------------------
```

### Analisis Coverage:

**Statement Coverage: 97.29%**
- Hampir semua baris kode telah dieksekusi dalam test
- Hanya 2-3 baris yang belum tercakup (kemungkinan edge case tertentu)

**Branch Coverage: 90.90%**
- Mayoritas kondisi if/else telah ditest
- Beberapa conditional branch mungkin belum ter-cover sepenuhnya

**Function Coverage: 100%**
- Semua fungsi dalam controller telah ditest
- getDashboardStats() telah ter-cover lengkap

**Line Coverage: 96.87%**
- Line 45-46 belum ter-cover (kemungkinan error handling spesifik atau edge case)
- Coverage sangat baik untuk production code

### Kesimpulan:

Unit testing untuk `dashboardController.js` memiliki coverage yang sangat baik dengan 9 test cases yang mencakup:
- ✅ Happy path (data berhasil diambil dan dirender)
- ✅ Edge cases (user tanpa divisi, data kosong, missing properties)
- ✅ Error handling (database error, connection failed)
- ✅ Session validation (redirect jika tidak login)
- ✅ Kalkulasi statistik yang kompleks (berbagai status proker)
- ✅ Middleware integration (unreadCount dari res.locals)

Semua test passed dengan 100% success rate, menunjukkan bahwa controller berfungsi sesuai spesifikasi dan handle berbagai skenario dengan baik.
