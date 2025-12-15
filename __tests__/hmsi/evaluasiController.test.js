// __tests__/hmsi/evaluasiController.test.js

// 1. Import controller yang akan ditest
const evaluasiController = require('../../controllers/hmsi/evaluasiController');

// 2. Import dependensi yang akan kita mock
const db = require('../../config/db');

// 3. Beritahu Jest untuk me-mock dependensi ini
// Kita memalsukan DB agar Controller tidak mengakses database sungguhan.
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


// Setup sebelum setiap test (memastikan setiap tes bersih dari pengaruh tes sebelumnya)
beforeEach(() => {
  // Reset semua mock
  jest.clearAllMocks();

  // Mock response methods (untuk mencatat apa yang dipanggil oleh Controller)
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

  // Mock request default (menyiapkan user yang sedang login)
  mockReq = {
    session: {
      user: {
        id_anggota: 1,
        id_divisi: 10, // User adalah anggota Divisi 10
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

  // Mengambil daftar evaluasi (halaman kelola evaluasi)
  describe('getKelolaEvaluasi', () => {

    it('seharusnya mengambil data evaluasi dengan sukses dan me-render view', async () => {
      // Siapkan data evaluasi dan hitungan revisi belum dibaca
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
        .mockResolvedValueOnce([mockEvaluasiData]) 
        .mockResolvedValueOnce([mockUnreadCount]); 

      // Act (Aksi): Panggil fungsi controller
      await evaluasiController.getKelolaEvaluasi(mockReq, mockRes);

      // Assert (Pengecekan)
      // Cek DB dipanggil 2 kali
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query.mock.calls[0][1]).toEqual([10]);
      expect(mockRender).toHaveBeenCalledWith('HMSI/kelolaEvaluasi', expect.objectContaining({
        title: 'Laporan Revisi',
        // Cek bahwa status 'Revisi' diolah menjadi isRevisi: true
        evaluasi: expect.arrayContaining([
          expect.objectContaining({
            id_evaluasi: 1,
            tanggalFormatted: expect.any(String),
            isRevisi: true
          })
        ]),
        unreadCount: 3 // Cek hitungan notifikasi masuk
      }));
    });

    it('seharusnya menangani data evaluasi yang kosong', async () => {
      // Arrange: Siapkan DB agar mengembalikan array kosong
      const mockEvaluasiData = [];
      const mockUnreadCount = [{ count: 0 }];

      db.query
        .mockResolvedValueOnce([mockEvaluasiData])
        .mockResolvedValueOnce([mockUnreadCount]);

      // Act
      await evaluasiController.getKelolaEvaluasi(mockReq, mockRes);

      // Assert
      // Cek res.render dipanggil dengan array 'evaluasi' kosong
      expect(mockRender).toHaveBeenCalledWith('HMSI/kelolaEvaluasi', expect.objectContaining({
        evaluasi: [],
        unreadCount: 0
      }));
    });

    it('seharusnya menangani error database dan mengembalikan 500', async () => {
      // Arrange: Paksa DB mengembalikan error
      db.query.mockRejectedValue(new Error('Database error'));

      // Act
      await evaluasiController.getKelolaEvaluasi(mockReq, mockRes);

      // Assert
      // Cek server merespons 500
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Gagal mengambil data evaluasi');
    });

  });

  // KELOMPOK UJI: Mengambil detail satu evaluasi
  describe('getDetailEvaluasi', () => {

    it('seharusnya mengambil detail evaluasi dengan sukses', async () => {
      // Arrange: Siapkan ID di params dan data detail evaluasi
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
        .mockResolvedValueOnce([mockEvaluasiDetail]) 
        .mockResolvedValueOnce([mockUnreadCount]); 

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

    it('seharusnya menangani evaluasi yang tidak ditemukan dan mengembalikan 404', async () => {
      // Arrange: Siapkan DB agar mengembalikan hasil kosong
      mockReq.params.id = '999';
      db.query.mockResolvedValueOnce([[]]); 

      // Act
      await evaluasiController.getDetailEvaluasi(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith('Evaluasi tidak ditemukan');
    });

    it('seharusnya memblokir akses evaluasi divisi lain dan mengembalikan 403', async () => {
      // Arrange: Siapkan data evaluasi yang id_divisi-nya berbeda dengan user (99 != 10)
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
      // Cek server merespons 403 (Forbidden)
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockSend).toHaveBeenCalledWith('Tidak boleh akses evaluasi divisi lain');
    });

    it('seharusnya menangani error database dan mengembalikan 500', async () => {
      // Arrange: Paksa DB mengembalikan error
      mockReq.params.id = '1';
      db.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await evaluasiController.getDetailEvaluasi(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Gagal mengambil detail evaluasi');
    });

  });

  // Menambahkan komentar balasan dari HMSI ke DPA
  describe('addKomentar', () => {

    it('seharusnya menambahkan komentar dengan sukses dan membuat notifikasi', async () => {
      // Arrange: Siapkan ID evaluasi, body komentar, dan mock untuk 3 panggilan DB
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
        .mockResolvedValueOnce([]) // Panggilan 1: Update komentar (sukses)
        .mockResolvedValueOnce([mockLaporanInfo]) // Panggilan 2: Ambil info laporan
        .mockResolvedValueOnce([]); // Panggilan 3: Insert notifikasi (sukses)

      // Act
      await evaluasiController.addKomentar(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(3);
      
      // Cek update komentar (Panggilan 1)
      expect(db.query.mock.calls[0][0]).toContain('UPDATE Evaluasi SET komentar_hmsi');
      expect(db.query.mock.calls[0][1]).toEqual([mockReq.body.komentar_hmsi, '1']);
      
      // Cek insert notifikasi (Panggilan 3)
      expect(db.query.mock.calls[2][0]).toContain('INSERT INTO Notifikasi');

      // Cek redirect ke halaman kelola dengan pesan sukses
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/kelola-evaluasi?success=Komentar berhasil ditambahkan');
    });

    it('seharusnya menangani komentar kosong dan mengarahkan dengan pesan error', async () => {
      // Arrange: Siapkan body dengan komentar kosong
      mockReq.params.id = '1';
      mockReq.body = { komentar_hmsi: '' }; 

      // Act
      await evaluasiController.addKomentar(mockReq, mockRes);

      // Assert
      // Cek tidak ada interaksi DB
      expect(db.query).not.toHaveBeenCalled();
      // Cek redirect dengan pesan error
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/kelola-evaluasi?error=Komentar tidak boleh kosong');
    });
    
    it('seharusnya menangani komentar hanya spasi dan mengarahkan dengan pesan error', async () => {
      // Arrange: Siapkan body dengan komentar hanya spasi
      mockReq.params.id = '1';
      mockReq.body = { komentar_hmsi: '   ' }; 

      // Act
      await evaluasiController.addKomentar(mockReq, mockRes);

      // Assert
      expect(db.query).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/kelola-evaluasi?error=Komentar tidak boleh kosong');
    });

    it('seharusnya menangani field komentar yang hilang', async () => {
      // Arrange: Siapkan body tanpa field komentar_hmsi
      mockReq.params.id = '1';
      mockReq.body = {};

      // Act
      await evaluasiController.addKomentar(mockReq, mockRes);

      // Assert
      expect(db.query).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/kelola-evaluasi?error=Komentar tidak boleh kosong');
    });

    it('seharusnya menangani error database dan mengembalikan 500', async () => {
      // Arrange: Paksa DB mengembalikan error pada panggilan pertama (UPDATE)
      mockReq.params.id = '1';
      mockReq.body = { komentar_hmsi: 'Valid comment' };

      db.query.mockRejectedValue(new Error('Database update failed'));

      // Act
      await evaluasiController.addKomentar(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Gagal menambahkan komentar');
    });

  });

});