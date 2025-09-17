-- HMSI Tracker schema (cleaned for MySQL / XAMPP)
SET FOREIGN_KEY_CHECKS=0;

-- create database (if not exists) and use it
CREATE DATABASE IF NOT EXISTS `hmsi_tracker` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `hmsi_tracker`;

-- Drop tables if exist
DROP TABLE IF EXISTS `Evaluasi`;
DROP TABLE IF EXISTS `Laporan`;
DROP TABLE IF EXISTS `Notifikasi`;
DROP TABLE IF EXISTS `Program_kerja`;
DROP TABLE IF EXISTS `User`;

-- Table: Evaluasi
CREATE TABLE `Evaluasi` (
  `id_evaluasi` VARCHAR(50) NOT NULL,
  `komentar` VARCHAR(200),
  `status_konfirmasi` VARCHAR(50),
  `tanggal_evaluasi` DATE,
  `id_laporan` VARCHAR(50),
  CONSTRAINT `PK_Evaluasi` PRIMARY KEY (`id_evaluasi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Laporan
CREATE TABLE `Laporan` (
  `id_laporan` VARCHAR(50) NOT NULL,
  `judul_laporan` VARCHAR(150),
  `deskripsi_kegiatan` VARCHAR(300),
  `sasaran` VARCHAR(100),
  `waktu_tempat` VARCHAR(100),
  `dana_digunakan` VARCHAR(100),
  `sumber_dana` VARCHAR(50),
  `persentase_kualitatif` VARCHAR(100),
  `persentase_kuantitatif` VARCHAR(100),
  `kendala` VARCHAR(100),
  `solusi` VARCHAR(100),
  `dokumentasi` VARCHAR(255),
  `id_ProgramKerja` VARCHAR(50),
  `tanggal` DATE,
  `dokumentasi_mime` VARCHAR(100),
  CONSTRAINT `PK_Laporan` PRIMARY KEY (`id_laporan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Program_kerja
CREATE TABLE `Program_kerja` (
  `id_ProgramKerja` VARCHAR(50) NOT NULL,
  `Nama_ProgramKerja` VARCHAR(50),
  `Divisi` ENUM('Internal','Medkraf','Eksternal','Bikraf','PSI','PSDM','RTK'),
  `Deskripsi` VARCHAR(200),
  `Tanggal_mulai` DATE,
  `Tanggal_selesai` DATE,
  `Penanggung_jawab` VARCHAR(50),
  `id_anggota` VARCHAR(50),
  `Dokumen_pendukung` VARCHAR(255),
  CONSTRAINT `PK_Program_kerja` PRIMARY KEY (`id_ProgramKerja`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: User
CREATE TABLE `User` (
  `id_anggota` VARCHAR(50) NOT NULL,
  `nama` VARCHAR(50),
  `email` VARCHAR(50),
  `password` VARCHAR(255),
  `role` ENUM('Admin','HMSI','DPA'),
  CONSTRAINT `PK_User` PRIMARY KEY (`id_anggota`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Notifikasi
CREATE TABLE `Notifikasi` (
  `id_notifikasi` VARCHAR(50) NOT NULL,
  `pesan` VARCHAR(200),
  `status_baca` TINYINT(1),
  `id_anggota` VARCHAR(50),
  `id_evaluasi` VARCHAR(50),
  `id_ProgramKerja` VARCHAR(50),
  `id_laporan` VARCHAR(50),
  CONSTRAINT `PK_Notifikasi` PRIMARY KEY (`id_notifikasi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Foreign Keys
ALTER TABLE `Evaluasi` 
  ADD CONSTRAINT `FK_Evaluasi_Laporan`
  FOREIGN KEY (`id_laporan`) REFERENCES `Laporan` (`id_laporan`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Laporan` 
  ADD CONSTRAINT `FK_Laporan_Program_kerja`
  FOREIGN KEY (`id_ProgramKerja`) REFERENCES `Program_kerja` (`id_ProgramKerja`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Notifikasi` 
  ADD CONSTRAINT `FK_Notifikasi_Evaluasi`
  FOREIGN KEY (`id_evaluasi`) REFERENCES `Evaluasi` (`id_evaluasi`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Notifikasi` 
  ADD CONSTRAINT `FK_Notifikasi_Laporan`
  FOREIGN KEY (`id_laporan`) REFERENCES `Laporan` (`id_laporan`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Notifikasi` 
  ADD CONSTRAINT `FK_Notifikasi_Program_kerja`
  FOREIGN KEY (`id_ProgramKerja`) REFERENCES `Program_kerja` (`id_ProgramKerja`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Notifikasi` 
  ADD CONSTRAINT `FK_Notifikasi_User`
  FOREIGN KEY (`id_anggota`) REFERENCES `User` (`id_anggota`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Program_kerja` 
  ADD CONSTRAINT `FK_Program_kerja_User`
  FOREIGN KEY (`id_anggota`) REFERENCES `User` (`id_anggota`) ON DELETE SET NULL ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS=1;
