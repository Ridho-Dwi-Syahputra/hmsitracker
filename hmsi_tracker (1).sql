-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 21, 2025 at 09:07 AM
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

--
-- Dumping data for table `evaluasi`
--

INSERT INTO `evaluasi` (`id_evaluasi`, `komentar`, `pemberi_evaluasi`, `status_konfirmasi`, `tanggal_evaluasi`, `id_laporan`) VALUES
('88cb5ef8-677b-4846-879f-0252996e30c2', 'Salah nih', '8d477929-9464-11f0-981a-442e1c01b37c', 'Revisi', '2025-09-20', '17426d59-9571-11f0-981a-442e1c01b37c'),
('b58c233f-dce8-427c-b8f2-1d76d2fac568', 'Keren Banget', '8d477929-9464-11f0-981a-442e1c01b37c', 'Selesai', '2025-09-20', '790ae88d-9571-11f0-981a-442e1c01b37c'),
('bb7aca3e-db5b-4539-8a60-e7cb1fece1c2', 'Kelazz king\r\n', '8d477929-9464-11f0-981a-442e1c01b37c', 'Selesai', '2025-09-20', '7eba709a-95e5-11f0-981a-442e1c01b37c'),
('d5e377b7-36bf-4e23-ba71-cc6c62d4fbb1', 'gsavdacveuicvdchsvcyeccbdcbhdb', '8d477929-9464-11f0-981a-442e1c01b37c', 'Revisi', '2025-09-20', NULL),
('ea4c6373-dba7-4f38-a292-a7c11e146a78', 'jelekkk', '8d477929-9464-11f0-981a-442e1c01b37c', 'Revisi', '2025-09-20', '19e74317-6e15-4513-bd59-3ee4351692c1');

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
  `divisi` enum('Internal','Medkraf','Eksternal','Bikraf','PSI','PSDM','RTK') NOT NULL,
  `tanggal` date DEFAULT NULL,
  `dokumentasi_mime` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `laporan`
--

INSERT INTO `laporan` (`id_laporan`, `judul_laporan`, `deskripsi_kegiatan`, `sasaran`, `waktu_tempat`, `dana_digunakan`, `sumber_dana`, `persentase_kualitatif`, `persentase_kuantitatif`, `kendala`, `solusi`, `dokumentasi`, `id_ProgramKerja`, `divisi`, `tanggal`, `dokumentasi_mime`) VALUES
('17426d59-9571-11f0-981a-442e1c01b37c', 'keuangan 1', 'nkkhj', '-', '08-000', '80909', 'pinjol', '68', '76', 'jbj', '-', 'dokumentasi-1758297325631-669895215.pdf', '9ae3807a-956e-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-19', NULL),
('19e74317-6e15-4513-bd59-3ee4351692c1', 'testtttt notif', '-', '', '08-00', '', '', '', '', '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('2293aeeb-043f-4190-a48f-6de582c1f15c', 'Technofest testing 2', '-', '', '08-00', '', '', '', '', '', '', NULL, 'a260f2eb-9490-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('364c658b-95eb-11f0-981a-442e1c01b37c', 'pdf', 'testt', '', '08-00', '', 'pinjol', '', '', '', '', NULL, '279a187d-95eb-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-20', NULL),
('3fa7ea5f-6b0e-4d35-8a9c-6caa7c3b8fa2', 'test notiff', '-', '', '09', '', '', '', '', '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('444501ad-c260-41d5-87f0-db166369abc8', 'testtttttttt notif 4', '-', '', '08-00', '', '', '', '', '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('790ae88d-9571-11f0-981a-442e1c01b37c', 'test tanggal', '-', '', '09', '', '', '', '', '', '', NULL, '9ae3807a-956e-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-19', NULL),
('7eba709a-95e5-11f0-981a-442e1c01b37c', 'test notif', '-', '', '09:00 - 10:00 WIB, gedung C', '', '', '', '', '', '', NULL, '3ab0989e-9496-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-20', NULL),
('cf3371f4-949c-11f0-981a-442e1c01b37c', 'test tanggal', '-', '-', '08-000', '', '', '34', '20', '-', '-', 'dokumentasi-1758206268668-273573665.pdf', '3ab0989e-9496-11f0-981a-442e1c01b37c', '', '2025-09-18', NULL),
('f296bbac-e89d-4b1c-9eca-af5ad229e5e4', 'Technofest testing 3', '-', '', '08-00', '', '', '', '', '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifikasi`
--

CREATE TABLE `notifikasi` (
  `id_notifikasi` varchar(50) NOT NULL,
  `pesan` varchar(200) DEFAULT NULL,
  `divisi` enum('Internal','Medkraf','Eksternal','Bikraf','PSI','PSDM','RTK') NOT NULL,
  `status_baca` tinyint(1) DEFAULT NULL,
  `id_anggota` varchar(50) DEFAULT NULL,
  `id_evaluasi` varchar(50) DEFAULT NULL,
  `id_ProgramKerja` varchar(50) DEFAULT NULL,
  `id_laporan` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifikasi`
--

INSERT INTO `notifikasi` (`id_notifikasi`, `pesan`, `divisi`, `status_baca`, `id_anggota`, `id_evaluasi`, `id_ProgramKerja`, `id_laporan`, `created_at`) VALUES
('1d9a2228-aaef-46f7-8acc-54e765806562', 'Divisi Internal telah menambahkan laporan baru: test notiff', 'Internal', 1, NULL, NULL, NULL, '3fa7ea5f-6b0e-4d35-8a9c-6caa7c3b8fa2', '2025-09-20 08:07:15'),
('2528d177-18fe-461b-9222-c7dfce4b3b83', 'HMSI (Internal) telah membuat Program Kerja baru: \"test Notifff\"', 'Internal', 1, NULL, NULL, '0c3d6d76-95f9-11f0-981a-442e1c01b37c', NULL, '2025-09-20 08:08:38'),
('4997b5bc-d819-4b2b-9ac2-3a40319f0948', 'Divisi Internal telah menambahkan laporan baru: testtttt notif', 'Internal', 1, NULL, NULL, NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-20 08:06:59'),
('9017d86d-7a78-4673-b85d-3b0c13080ed0', 'DPA memberi evaluasi pada laporan \"test notif\"', 'Eksternal', 1, NULL, 'bb7aca3e-db5b-4539-8a60-e7cb1fece1c2', NULL, '7eba709a-95e5-11f0-981a-442e1c01b37c', '2025-09-20 15:45:04'),
('ad71c95d-e2af-42c2-b07d-470ca0b1af32', 'Divisi Internal telah menghapus laporan: Technofest testing 1', 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-21 06:36:03'),
('b5bc6812-835c-4cc0-8be9-5cf6ae6b05ad', 'DPA memberi evaluasi pada laporan \"Technofest testing 1\"', 'Internal', 1, NULL, 'd5e377b7-36bf-4e23-ba71-cc6c62d4fbb1', NULL, NULL, '2025-09-20 15:47:06'),
('e7655a96-e4ba-491a-869c-5977f922761b', 'DPA memberi evaluasi pada laporan \"testtttt notif\"', 'Internal', 1, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-20 08:41:29'),
('f3219f1f-9331-4ea1-a92b-a9ea5e8d9bc4', 'Divisi Internal telah menambahkan laporan baru: testtttttttt notif 4', 'Internal', 1, NULL, NULL, NULL, '444501ad-c260-41d5-87f0-db166369abc8', '2025-09-20 08:08:13');

-- --------------------------------------------------------

--
-- Table structure for table `program_kerja`
--

CREATE TABLE `program_kerja` (
  `id_ProgramKerja` varchar(50) NOT NULL,
  `Nama_ProgramKerja` varchar(50) DEFAULT NULL,
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

INSERT INTO `program_kerja` (`id_ProgramKerja`, `Nama_ProgramKerja`, `Deskripsi`, `Tanggal_mulai`, `Tanggal_selesai`, `Penanggung_jawab`, `id_anggota`, `Dokumen_pendukung`) VALUES
('0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Proker 3', '-', '2025-09-25', '2025-09-30', '-', '3581d577-946a-11f0-981a-442e1c01b37c', NULL),
('0c3d6d76-95f9-11f0-981a-442e1c01b37c', 'test Notifff', '-', '2025-09-24', '2025-09-30', 'hbjkn', '3581d577-946a-11f0-981a-442e1c01b37c', NULL),
('279a187d-95eb-11f0-981a-442e1c01b37c', 'test notif', '-', '2025-09-26', '2025-09-30', 'afiq', '8d488fd7-9464-11f0-981a-442e1c01b37c', NULL),
('3ab0989e-9496-11f0-981a-442e1c01b37c', 'Proker eksternal 1', '-', '2025-09-13', '2025-10-29', 'jakhel', '8d488fd7-9464-11f0-981a-442e1c01b37c', NULL),
('48779a2a-9491-11f0-981a-442e1c01b37c', 'Proker 2', '-', '2025-09-30', '2025-10-31', 'Hafizh', '3581d577-946a-11f0-981a-442e1c01b37c', 'dokumen_pendukung-1758201201969-982370291.png'),
('6dd8c0b7-95e5-11f0-981a-442e1c01b37c', 'test notif', '-', '2025-09-19', '2025-09-24', '-', '8d488fd7-9464-11f0-981a-442e1c01b37c', NULL),
('9ae3807a-956e-11f0-981a-442e1c01b37c', 'HMSI FEST', '-', '2025-09-30', '2025-10-14', 'alex', '8d488fd7-9464-11f0-981a-442e1c01b37c', 'dokumen_pendukung-1758296257954-72663265.pdf'),
('a260f2eb-9490-11f0-981a-442e1c01b37c', 'Proker 1', '-', '2025-09-19', '2025-09-23', 'Afiq', '3581d577-946a-11f0-981a-442e1c01b37c', 'dokumen_pendukung-1758200923261-928409523.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_anggota` varchar(50) NOT NULL,
  `nama` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('Admin','HMSI','DPA') DEFAULT NULL,
  `divisi` enum('Internal','Medkraf','Eksternal','Bikraf','PSI','PSDM','RTK') DEFAULT NULL,
  `foto_profile` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_anggota`, `nama`, `email`, `password`, `role`, `divisi`, `foto_profile`) VALUES
('3581d577-946a-11f0-981a-442e1c01b37c', 'Ketua Divisi Internal', 'internal', 'hmsi123', 'HMSI', 'Internal', NULL),
('8d43d10d-9464-11f0-981a-442e1c01b37c', 'Admin User', 'admin', 'admin123', 'Admin', NULL, NULL),
('8d477929-9464-11f0-981a-442e1c01b37c', 'DPA User', 'dpa', 'dpa123', 'DPA', NULL, NULL),
('8d488fd7-9464-11f0-981a-442e1c01b37c', 'Ketua Divisi Eksternal', 'eksternal', 'hmsi123', 'HMSI', 'Eksternal', NULL);

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
