-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 19, 2025 at 05:26 PM
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
  `divisi` varchar(100) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `dokumentasi_mime` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `laporan`
--

INSERT INTO `laporan` (`id_laporan`, `judul_laporan`, `deskripsi_kegiatan`, `sasaran`, `waktu_tempat`, `dana_digunakan`, `sumber_dana`, `persentase_kualitatif`, `persentase_kuantitatif`, `kendala`, `solusi`, `dokumentasi`, `id_ProgramKerja`, `divisi`, `tanggal`, `dokumentasi_mime`) VALUES
('cf3371f4-949c-11f0-981a-442e1c01b37c', 'test tanggal', '-', '-', '08-000', '', '', '34', '20', '-', '-', 'dokumentasi-1758206268668-273573665.pdf', '3ab0989e-9496-11f0-981a-442e1c01b37c', NULL, '2025-09-18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifikasi`
--

CREATE TABLE `notifikasi` (
  `id_notifikasi` varchar(50) NOT NULL,
  `pesan` varchar(200) DEFAULT NULL,
  `divisi` enum('Internal','Medkraf','Eksternal','Bikraf','PSI','PSDM','RTK') DEFAULT NULL,
  `status_baca` tinyint(1) DEFAULT NULL,
  `id_anggota` varchar(50) DEFAULT NULL,
  `id_evaluasi` varchar(50) DEFAULT NULL,
  `id_ProgramKerja` varchar(50) DEFAULT NULL,
  `id_laporan` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifikasi`
--

INSERT INTO `notifikasi` (`id_notifikasi`, `pesan`, `divisi`, `status_baca`, `id_anggota`, `id_evaluasi`, `id_ProgramKerja`, `id_laporan`) VALUES
('33361f20-07e7-406d-9f89-6155099c6cb3', 'DPA memberi evaluasi pada laporan \"test tanggal\"', NULL, 0, NULL, NULL, '3ab0989e-9496-11f0-981a-442e1c01b37c', 'cf3371f4-949c-11f0-981a-442e1c01b37c'),
('3392bce9-1153-460d-af8e-6c5678e60fc1', 'DPA memberi evaluasi pada laporan \"test tanggal\"', NULL, 0, NULL, NULL, '3ab0989e-9496-11f0-981a-442e1c01b37c', 'cf3371f4-949c-11f0-981a-442e1c01b37c'),
('f4ac9628-4241-4cf7-a60c-110eb1502ac0', 'DPA memberi evaluasi pada laporan \"test tanggal\"', NULL, 0, NULL, NULL, '3ab0989e-9496-11f0-981a-442e1c01b37c', 'cf3371f4-949c-11f0-981a-442e1c01b37c');

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
('3ab0989e-9496-11f0-981a-442e1c01b37c', 'Proker eksternal 1', '-', '2025-09-13', '2025-10-29', 'jakhel', '8d488fd7-9464-11f0-981a-442e1c01b37c', NULL),
('48779a2a-9491-11f0-981a-442e1c01b37c', 'Proker 2', '-', '2025-09-30', '2025-10-31', 'Hafizh', '3581d577-946a-11f0-981a-442e1c01b37c', 'dokumen_pendukung-1758201201969-982370291.png'),
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
