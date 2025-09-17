-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 16, 2025 at 11:07 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hmsi_tracker`
--

-- --------------------------------------------------------

--
-- Table structure for table `evaluasi`
--

CREATE TABLE `evaluasi` (
  `id_evaluasi` varchar(50) NOT NULL,
  `komentar` varchar(200) DEFAULT NULL,
  `pemberi_evaluasi` varchar(50) DEFAULT NULL,
  `status_konfirmasi` varchar(50) DEFAULT NULL,
  `tanggal_evaluasi` date DEFAULT NULL,
  `id_laporan` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `laporan`
--

CREATE TABLE `laporan` (
  `id_laporan` varchar(50) NOT NULL,
  `judul_laporan` varchar(150) DEFAULT NULL,
  `deskripsi_kegiatan` varchar(300) DEFAULT NULL,
  `sasaran` varchar(100) DEFAULT NULL,
  `waktu_tempat` varchar(100) DEFAULT NULL,
  `dana_digunakan` varchar(100) DEFAULT NULL,
  `sumber_dana` varchar(50) DEFAULT NULL,
  `persentase_kualitatif` varchar(100) DEFAULT NULL,
  `persentase_kuantitatif` varchar(100) DEFAULT NULL,
  `kendala` varchar(100) DEFAULT NULL,
  `solusi` varchar(100) DEFAULT NULL,
  `dokumentasi` varchar(255) DEFAULT NULL,
  `id_ProgramKerja` varchar(50) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `dokumentasi_mime` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `laporan`
--

INSERT INTO `laporan` (`id_laporan`, `judul_laporan`, `deskripsi_kegiatan`, `sasaran`, `waktu_tempat`, `dana_digunakan`, `sumber_dana`, `persentase_kualitatif`, `persentase_kuantitatif`, `kendala`, `solusi`, `dokumentasi`, `id_ProgramKerja`, `tanggal`, `dokumentasi_mime`) VALUES
('21eea0d9-921a-11f0-981a-442e1c01b37c', 'AAAAAAAAAAAAAA', 'xxvccv', 'mm', '09:00-12:00 WIB, gedung C', '2333', 'pinjol', '45', '23', '4343', 'gddg', 'dokumentasi-1757930130113-687954416.pdf', 'PK003', '2025-09-14', NULL),
('57ce7e88-917e-11f0-981a-442e1c01b37c', 'pdf test', 'xxxzxz', 'sfsf', '09', '2344', 'pinjol', '25', '34', 'sfsf', 'ssf', NULL, NULL, '2025-09-15', NULL),
('638c489b-92b1-11f0-981a-442e1c01b37c', 'BBBBBBBBBBBBBBBBBBBBBB', 'knkn', 'saadssda', '08-000', '324', 'pinjol', '12', '32', 'sdasdasd', 'saasd', 'dokumentasi-1757995093216-729181579.jpg', 'PK003', '2025-09-17', NULL),
('6e633aaa-9188-11f0-981a-442e1c01b37c', 'test ', 'da', 'mkkkm', '09', '324231', 'pinjol', '32', '23', 'sfsfs', 'dsdad', 'dokumentasi-1757868769137-916318174.pdf', '4f5b27a6-907c-11f0-981a-442e1c01b37c', '2025-09-10', NULL),
('79e5b8ec-92b1-11f0-981a-442e1c01b37c', 'ccccccccc', 'saasd', 'asddas', 'sacsd', '32424', 'pinjol', '31', '23', 'ssikkdfja', 'saknaskdf', NULL, '0f04c882-925d-11f0-981a-442e1c01b37c', '2025-09-17', NULL),
('7a7927ed-9168-11f0-981a-442e1c01b37c', 'png', 'xx', 'cscscs', '09', '456', 'pinjol', '13', '14', 'cddc', 'cscscs', 'dokumentasi-1757853830692-250857329.png', '4f5b27a6-907c-11f0-981a-442e1c01b37c', '2025-09-16', NULL),
('83cfb96b-92b1-11f0-981a-442e1c01b37c', 'adadada', 'caad', '', '08-000', '', 'pinjol', '', '', '', '', NULL, '1c507e2c-929b-11f0-981a-442e1c01b37c', '2025-09-17', NULL),
('8c9cfb22-92b1-11f0-981a-442e1c01b37c', 'caadad', 'caadca', '', '08-000', '', '', '', '', '', '', NULL, NULL, '2025-09-18', NULL),
('9a06e5ac-9168-11f0-981a-442e1c01b37c', 'pdf', 'dcsfdgh', 'ccc', '09', '34546', 'pinjol', '1', '1', 'dd', 'cc', 'dokumentasi-1757853883640-487151459.pdf', 'PK003', '2025-09-11', NULL),
('aeb43cd6-9251-11f0-981a-442e1c01b37c', 'cccccccccccc', 'knn', 'm', '09:00 - 10:00 WIB, gedung C', '2333', 'pinjol', '67', '67', 'n', ',', 'dokumentasi-1757953988645-704461363.jpg', NULL, '2025-09-18', NULL),
('ed6a75ea-917c-11f0-981a-442e1c01b37c', 'pdf', 'ssfsf', 'ccc', '09', '2233', 'pinjol', '23', '33', 'ccc', 'ccccc', 'dokumentasi-1757862613470-931200449.pdf', '0f04c882-925d-11f0-981a-442e1c01b37c', '2025-09-09', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifikasi`
--

CREATE TABLE `notifikasi` (
  `id_notifikasi` varchar(50) NOT NULL,
  `pesan` varchar(200) DEFAULT NULL,
  `status_baca` tinyint(1) DEFAULT NULL,
  `id_anggota` varchar(50) DEFAULT NULL,
  `id_evaluasi` varchar(50) DEFAULT NULL,
  `id_ProgramKerja` varchar(50) DEFAULT NULL,
  `id_laporan` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifikasi`
--

INSERT INTO `notifikasi` (`id_notifikasi`, `pesan`, `status_baca`, `id_anggota`, `id_evaluasi`, `id_ProgramKerja`, `id_laporan`) VALUES
('N001', 'Evaluasi baru untuk Laporan Webinar Teknologi', 0, 'U001', NULL, NULL, NULL),
('N002', 'Evaluasi baru untuk Laporan Workshop AI', 0, 'U001', NULL, NULL, NULL),
('N003', 'Evaluasi final untuk Laporan TechnoFest 2025', 1, 'U001', NULL, 'PK003', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `program_kerja`
--

CREATE TABLE `program_kerja` (
  `id_ProgramKerja` varchar(50) NOT NULL,
  `Nama_ProgramKerja` varchar(50) DEFAULT NULL,
  `Divisi` enum('Internal','Medkraf','Eksternal','Bikraf','PSI','PSDM','RTK') DEFAULT NULL,
  `Deskripsi` varchar(200) DEFAULT NULL,
  `Tanggal_mulai` date DEFAULT NULL,
  `Tanggal_selesai` date DEFAULT NULL,
  `Penanggung_jawab` varchar(50) DEFAULT NULL,
  `id_anggota` varchar(50) DEFAULT NULL,
  `Dokumen_pendukung` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program_kerja`
--

INSERT INTO `program_kerja` (`id_ProgramKerja`, `Nama_ProgramKerja`, `Divisi`, `Deskripsi`, `Tanggal_mulai`, `Tanggal_selesai`, `Penanggung_jawab`, `id_anggota`, `Dokumen_pendukung`) VALUES
('0f04c882-925d-11f0-981a-442e1c01b37c', 'HMSI FEST', 'Medkraf', 'xx', '2025-09-19', '2025-09-01', 'xcx', NULL, NULL),
('1c507e2c-929b-11f0-981a-442e1c01b37c', 'fhvjbkn', 'Eksternal', 'hgjbknl', '2025-09-17', '2025-09-18', 'vghbjknl', NULL, NULL),
('44a1059b-92b7-11f0-981a-442e1c01b37c', 'HMSI FEST', 'Medkraf', 'kjiji', '2025-09-15', '2025-09-19', 'jjjj', NULL, 'dokumen_pendukung-1757997618231-7341680.pdf'),
('4f5b27a6-907c-11f0-981a-442e1c01b37c', 'mmm', NULL, '   kk', NULL, NULL, 'mm', NULL, NULL),
('6925fb54-92b7-11f0-981a-442e1c01b37c', 'webinar', 'Internal', 'caadxaxd', '2025-09-09', '2025-09-20', 'xasdasd', NULL, 'dokumen_pendukung-1757997679569-950525043.pdf'),
('8830855f-929a-11f0-981a-442e1c01b37c', 'jjojjoo', 'Eksternal', 'knlknl', '2025-09-16', '2025-09-20', 'hihhi', NULL, 'dokumen_pendukung-1757985276261-690230660.png'),
('eb5e3d6b-9219-11f0-981a-442e1c01b37c', 'ww', 'Medkraf', 'cscss', '2025-09-10', '2025-09-17', 'xx', NULL, 'dokumen_pendukung-1757930038548-853056450.pdf'),
('fd7748ee-925c-11f0-981a-442e1c01b37c', 'apalah', 'Medkraf', 'dssd', '2025-09-27', '2025-09-07', 'xx', NULL, 'dokumen_pendukung-1758016752763-372236524.pdf'),
('fdd06680-91a5-11f0-981a-442e1c01b37c', 'HMSI FEST', 'Medkraf', 'lmm', '2025-10-01', '2025-09-07', 'ffhgjbk', NULL, 'dokumen_pendukung-1757930999719-112014362.png'),
('PK003', 'TechnoFest 2025', NULL, 'Festival teknologi tahunan HMSI', NULL, NULL, 'Ridho Syahputra', 'U001', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_anggota` varchar(50) NOT NULL,
  `nama` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('Admin','HMSI','DPA') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_anggota`, `nama`, `email`, `password`, `role`) VALUES
('U001', 'Admin HMSI', 'admin@hmsi.local', 'admin123', 'Admin'),
('U002', 'Ketua HMSI', 'hmsi@unand.ac.id', 'hmsi123', 'HMSI'),
('U003', 'Dosen Pembimbing', 'dpa@unand.ac.id', 'dpa123', 'DPA'),
('U004', 'Ridho Syahputra', 'ridho@example.com', 'hashed_password', 'HMSI'),
('U005', 'Budi Santoso', 'budi@example.com', 'hashed_password', 'DPA'),
('U006', 'Admin Satu', 'admin@example.com', 'hashed_password', 'Admin'),
('U008', 'Ridho Syahputra', 'ridho@example.com', 'hashed_password', 'HMSI'),
('U009', 'Budi Santoso', 'budi@example.com', 'hashed_password', 'DPA'),
('U010', 'Admin Satu', 'admin@example.com', 'hashed_password', 'Admin'),
('U1', 'Admin One', 'admin@hmsi.com', 'admin123', 'Admin'),
('U2', 'HMSI One', 'hmsi@hmsi.com', 'hmsi123', 'HMSI'),
('U3', 'DPA One', 'dpa@hmsi.com', 'dpa123', 'DPA');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `evaluasi`
--
ALTER TABLE `evaluasi`
  ADD PRIMARY KEY (`id_evaluasi`),
  ADD KEY `FK_Evaluasi_Laporan` (`id_laporan`),
  ADD KEY `FK_Evaluasi_User` (`pemberi_evaluasi`);

--
-- Indexes for table `laporan`
--
ALTER TABLE `laporan`
  ADD PRIMARY KEY (`id_laporan`),
  ADD KEY `FK_Laporan_Program_kerja` (`id_ProgramKerja`);

--
-- Indexes for table `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD PRIMARY KEY (`id_notifikasi`),
  ADD KEY `FK_Notifikasi_Evaluasi` (`id_evaluasi`),
  ADD KEY `FK_Notifikasi_Laporan` (`id_laporan`),
  ADD KEY `FK_Notifikasi_Program_kerja` (`id_ProgramKerja`),
  ADD KEY `FK_Notifikasi_User` (`id_anggota`);

--
-- Indexes for table `program_kerja`
--
ALTER TABLE `program_kerja`
  ADD PRIMARY KEY (`id_ProgramKerja`),
  ADD KEY `FK_Program_kerja_User` (`id_anggota`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_anggota`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `evaluasi`
--
ALTER TABLE `evaluasi`
  ADD CONSTRAINT `FK_Evaluasi_Laporan` FOREIGN KEY (`id_laporan`) REFERENCES `laporan` (`id_laporan`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_Evaluasi_User` FOREIGN KEY (`pemberi_evaluasi`) REFERENCES `user` (`id_anggota`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `laporan`
--
ALTER TABLE `laporan`
  ADD CONSTRAINT `FK_Laporan_Program_kerja` FOREIGN KEY (`id_ProgramKerja`) REFERENCES `program_kerja` (`id_ProgramKerja`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD CONSTRAINT `FK_Notifikasi_Evaluasi` FOREIGN KEY (`id_evaluasi`) REFERENCES `evaluasi` (`id_evaluasi`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_Notifikasi_Laporan` FOREIGN KEY (`id_laporan`) REFERENCES `laporan` (`id_laporan`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_Notifikasi_Program_kerja` FOREIGN KEY (`id_ProgramKerja`) REFERENCES `program_kerja` (`id_ProgramKerja`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_Notifikasi_User` FOREIGN KEY (`id_anggota`) REFERENCES `user` (`id_anggota`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `program_kerja`
--
ALTER TABLE `program_kerja`
  ADD CONSTRAINT `FK_Program_kerja_User` FOREIGN KEY (`id_anggota`) REFERENCES `user` (`id_anggota`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
