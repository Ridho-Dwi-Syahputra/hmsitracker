// __tests__/hmsi/profileController.test.js

// 1. Import controller yang akan ditest
const profileController = require('../../controllers/hmsi/profileController');

// 2. Import dependensi yang akan kita mock
const db = require('../../config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// 3. Beritahu Jest untuk me-mock dependensi ini
jest.mock('../../config/db');
jest.mock('fs');
jest.mock('path');
jest.mock('bcryptjs');

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
        nama: 'Test User HMSI',
        role: 'HMSI'
      }
    },
    body: {},
    file: null,
    flash: jest.fn(() => [])
  };

  // Mock path.join
  path.join.mockImplementation((...args) => args.join('/'));

  // Mock fs methods
  fs.existsSync.mockReturnValue(true);
  fs.unlinkSync.mockReturnValue(true);
});

// ==========================================
// TEST SUITES
// ==========================================

describe('Profile Controller', () => {

  describe('getProfile', () => {

    it('should fetch user profile successfully', async () => {
      // Arrange
      const mockUserData = [
        {
          id_anggota: 1,
          nama: 'Test User HMSI',
          email: 'hmsi@test.com',
          role: 'HMSI',
          foto_profile: 'profile.jpg',
          id_divisi: 10,
          nama_divisi: 'BPH'
        }
      ];

      db.query.mockResolvedValue([mockUserData]);

      // Act
      await profileController.getProfile(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query.mock.calls[0][1]).toEqual([1]);

      expect(mockRender).toHaveBeenCalledWith('hmsi/profile', {
        title: 'Profil HMSI',
        user: mockUserData[0],
        activeNav: 'Profil',
        errorMsg: [],
        successMsg: []
      });
    });

    it('should redirect to login if user not in session', async () => {
      // Arrange
      mockReq.session.user = null;

      // Act
      await profileController.getProfile(mockReq, mockRes);

      // Assert
      expect(mockRedirect).toHaveBeenCalledWith('/auth/login');
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should handle user not found in database', async () => {
      // Arrange
      db.query.mockResolvedValue([[]]);

      // Act
      await profileController.getProfile(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith('User tidak ditemukan');
    });

    it('should handle database error', async () => {
      // Arrange
      db.query.mockRejectedValue(new Error('Database error'));

      // Act
      await profileController.getProfile(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Gagal mengambil profil');
    });

  });

  describe('getEditProfile', () => {

    it('should render edit profile form successfully', async () => {
      // Arrange
      const mockUserData = [
        {
          id_anggota: 1,
          nama: 'Test User HMSI',
          email: 'hmsi@test.com',
          role: 'HMSI',
          foto_profile: 'profile.jpg',
          id_divisi: 10,
          nama_divisi: 'BPH'
        }
      ];

      db.query.mockResolvedValue([mockUserData]);

      // Act
      await profileController.getEditProfile(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(mockRender).toHaveBeenCalledWith('hmsi/editProfile', {
        title: 'Edit Profil HMSI',
        user: mockUserData[0],
        activeNav: 'Profil',
        errorMsg: [],
        successMsg: []
      });
    });

    it('should redirect to login if user not in session', async () => {
      // Arrange
      mockReq.session.user = null;

      // Act
      await profileController.getEditProfile(mockReq, mockRes);

      // Assert
      expect(mockRedirect).toHaveBeenCalledWith('/auth/login');
    });

  });

  describe('postEditProfile', () => {

    beforeEach(() => {
      // Mock bcrypt
      bcrypt.hash.mockResolvedValue('$2b$hashedpassword');
      
      // Mock flash method
      mockReq.flash = jest.fn();
    });

    it('should update profile successfully without password', async () => {
      // Arrange
      mockReq.body = {
        id_anggota: 1,
        nama: 'Updated Name',
        password: '',
        confirm_password: ''
      };
      mockReq.session.user.foto_profile = 'old-profile.jpg';

      // Mock database queries for session refresh
      const mockUpdatedUser = [
        {
          id_anggota: 1,
          nama: 'Updated Name',
          email: 'user@test.com',
          role: 'HMSI',
          id_divisi: 10,
          foto_profile: 'old-profile.jpg',
          nama_divisi: 'BPH'
        }
      ];

      db.query
        .mockResolvedValueOnce([]) // Update query
        .mockResolvedValueOnce([mockUpdatedUser]); // Session refresh query

      // Act
      await profileController.postEditProfile(mockReq, mockRes);

      // Assert
      expect(db.query).toHaveBeenCalledTimes(2);
      
      // Check update query
      expect(db.query.mock.calls[0][0]).toContain('UPDATE user SET');
      expect(db.query.mock.calls[0][1]).toEqual([1, 'Updated Name', 'old-profile.jpg', 1]);
      
      // Check session refresh
      expect(mockReq.session.user.nama).toBe('Updated Name');
      expect(mockReq.flash).toHaveBeenCalledWith('success', 'Profil berhasil diperbarui');
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/profile');
    });

    it('should update profile with new photo', async () => {
      // Arrange
      mockReq.body = {
        id_anggota: 1,
        nama: 'Updated Name',
        password: '',
        confirm_password: ''
      };
      mockReq.file = {
        filename: 'new-profile.jpg'
      };
      mockReq.session.user.foto_profile = 'old-profile.jpg';

      const mockUpdatedUser = [
        {
          id_anggota: 1,
          nama: 'Updated Name',
          email: 'user@test.com',
          role: 'HMSI',
          id_divisi: 10,
          foto_profile: 'uploads/profile/new-profile.jpg',
          nama_divisi: 'BPH'
        }
      ];

      db.query
        .mockResolvedValueOnce([]) // Update query
        .mockResolvedValueOnce([mockUpdatedUser]); // Session refresh query

      // Act
      await profileController.postEditProfile(mockReq, mockRes);

      // Assert
      expect(fs.unlinkSync).toHaveBeenCalledWith('public/old-profile.jpg');
      expect(db.query.mock.calls[0][1]).toEqual([1, 'Updated Name', 'uploads/profile/new-profile.jpg', 1]);
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/profile');
    });

    it('should update profile with password change', async () => {
      // Arrange
      mockReq.body = {
        id_anggota: 1,
        nama: 'Updated Name',
        password: 'newpassword',
        confirm_password: 'newpassword'
      };
      
      const mockUpdatedUser = [
        {
          id_anggota: 1,
          nama: 'Updated Name',
          email: 'user@test.com',
          role: 'HMSI',
          id_divisi: 10,
          foto_profile: null,
          nama_divisi: 'BPH'
        }
      ];

      db.query
        .mockResolvedValueOnce([]) // Update with password
        .mockResolvedValueOnce([mockUpdatedUser]); // Session refresh

      bcrypt.hash.mockResolvedValue('$2b$newhashedpassword');

      // Act
      await profileController.postEditProfile(mockReq, mockRes);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(db.query.mock.calls[0][0]).toContain('password = ?');
      expect(db.query.mock.calls[0][1]).toContain('$2b$newhashedpassword');
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/profile');
    });

    it('should handle password mismatch', async () => {
      // Arrange
      mockReq.body = {
        id_anggota: 1,
        nama: 'Updated Name',
        password: 'newpassword',
        confirm_password: 'differentpassword'
      };

      // Act
      await profileController.postEditProfile(mockReq, mockRes);

      // Assert
      expect(mockReq.flash).toHaveBeenCalledWith('error', 'Password dan konfirmasi tidak sama');
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/profile/edit');
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should handle missing required fields', async () => {
      // Arrange
      mockReq.body = {
        id_anggota: '',
        nama: ''
      };

      // Act
      await profileController.postEditProfile(mockReq, mockRes);

      // Assert
      expect(mockReq.flash).toHaveBeenCalledWith('error', 'NIM dan Nama wajib diisi');
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/profile/edit');
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should redirect to login if no user in session', async () => {
      // Arrange
      mockReq.session.user = null;
      mockReq.body = {
        id_anggota: 1,
        nama: 'Test'
      };

      // Act
      await profileController.postEditProfile(mockReq, mockRes);

      // Assert
      expect(mockRedirect).toHaveBeenCalledWith('/auth/login');
    });

    it('should handle database error', async () => {
      // Arrange
      mockReq.body = {
        id_anggota: 1,
        nama: 'Updated Name'
      };

      db.query.mockRejectedValue(new Error('Database error'));

      // Act
      await profileController.postEditProfile(mockReq, mockRes);

      // Assert
      expect(mockReq.flash).toHaveBeenCalledWith('error', 'Gagal menyimpan perubahan profil');
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/profile/edit');
    });

    it('should handle file deletion error gracefully', async () => {
      // Arrange
      mockReq.body = {
        id_anggota: 1,
        nama: 'Updated Name'
      };
      mockReq.file = { filename: 'new-profile.jpg' };
      mockReq.session.user.foto_profile = 'old-profile.jpg';
      
      const mockUpdatedUser = [
        {
          id_anggota: 1,
          nama: 'Updated Name',
          email: 'user@test.com',
          role: 'HMSI',
          id_divisi: 10,
          foto_profile: 'uploads/profile/new-profile.jpg',
          nama_divisi: 'BPH'
        }
      ];

      db.query
        .mockResolvedValueOnce([]) // Update
        .mockResolvedValueOnce([mockUpdatedUser]); // Session refresh

      // Mock file deletion to throw error
      fs.unlinkSync.mockImplementation(() => {
        throw new Error('File deletion failed');
      });

      // Act
      await profileController.postEditProfile(mockReq, mockRes);

      // Assert (should still succeed)
      expect(mockRedirect).toHaveBeenCalledWith('/hmsi/profile');
    });

  });

});