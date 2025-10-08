-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 08, 2025 at 09:21 AM
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
-- Table structure for table `divisi`
--

CREATE TABLE `divisi` (
  `id_divisi` int(11) NOT NULL,
  `nama_divisi` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `divisi`
--

INSERT INTO `divisi` (`id_divisi`, `nama_divisi`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 'Internal', NULL, '2025-10-07 05:46:39', '2025-10-07 19:09:38'),
(2, 'Eksternal', NULL, '2025-10-07 05:46:39', '2025-10-07 19:09:29'),
(4, 'Medkraf', NULL, '2025-10-07 11:34:50', '2025-10-07 11:34:50'),
(5, 'Bikraf', NULL, '2025-10-07 11:34:50', '2025-10-07 11:34:50'),
(6, 'PSI', NULL, '2025-10-07 11:34:50', '2025-10-07 11:34:50'),
(7, 'PSDM', NULL, '2025-10-07 11:34:50', '2025-10-07 11:34:50'),
(8, 'RTK', NULL, '2025-10-07 11:34:50', '2025-10-07 11:34:50'),
(11, 'sosmasling', NULL, '2025-10-07 17:36:18', '2025-10-07 17:43:51');

-- --------------------------------------------------------

--
-- Table structure for table `evaluasi`
--

CREATE TABLE `evaluasi` (
  `id_evaluasi` varchar(50) NOT NULL,
  `komentar` varchar(200) DEFAULT NULL,
  `komentar_hmsi` text DEFAULT NULL,
  `pemberi_evaluasi` varchar(50) DEFAULT NULL,
  `status_konfirmasi` varchar(50) DEFAULT NULL,
  `tanggal_evaluasi` date DEFAULT NULL,
  `id_laporan` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `keuangan`
--

CREATE TABLE `keuangan` (
  `id_keuangan` varchar(50) NOT NULL,
  `tanggal` date NOT NULL,
  `tipe` enum('Pemasukan','Pengeluaran') NOT NULL,
  `sumber` varchar(150) DEFAULT NULL,
  `jumlah` decimal(15,2) NOT NULL,
  `id_laporan` varchar(50) DEFAULT NULL,
  `id_anggota` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
  `sumber_dana_lainnya` varchar(255) DEFAULT NULL,
  `dana_terpakai` decimal(15,2) DEFAULT NULL,
  `persentase_kualitatif` varchar(100) DEFAULT NULL,
  `persentase_kuantitatif` varchar(100) DEFAULT NULL,
  `deskripsi_target_kuantitatif` text DEFAULT NULL,
  `deskripsi_target_kualitatif` text DEFAULT NULL,
  `kendala` varchar(100) DEFAULT NULL,
  `solusi` varchar(100) DEFAULT NULL,
  `dokumentasi` varchar(255) DEFAULT NULL,
  `id_ProgramKerja` varchar(50) DEFAULT NULL,
  `divisi` enum('Internal','Medkraf','Eksternal','Bikraf','PSI','PSDM','RTK') NOT NULL,
  `tanggal` date DEFAULT NULL,
  `dokumentasi_mime` varchar(100) DEFAULT NULL,
  `id_divisi` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifikasi`
--

CREATE TABLE `notifikasi` (
  `id_notifikasi` varchar(50) NOT NULL,
  `pesan` varchar(200) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `divisi` enum('Internal','Medkraf','Eksternal','Bikraf','PSI','PSDM','RTK') NOT NULL,
  `status_baca` tinyint(1) DEFAULT NULL,
  `id_anggota` varchar(50) DEFAULT NULL,
  `id_evaluasi` varchar(50) DEFAULT NULL,
  `id_ProgramKerja` varchar(50) DEFAULT NULL,
  `id_laporan` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_divisi` int(11) DEFAULT NULL,
  `target_role` enum('Admin','HMSI','DPA') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `Dokumen_pendukung` varchar(255) DEFAULT NULL,
  `Status` enum('Belum Dimulai','Sedang Berjalan','Selesai','Gagal') DEFAULT 'Belum Dimulai',
  `id_divisi` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `foto_profile` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `foto_focus` varchar(50) DEFAULT 'center 50%',
  `theme` enum('light','dark') DEFAULT 'light',
  `id_divisi` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_anggota`, `nama`, `email`, `password`, `role`, `foto_profile`, `updated_at`, `foto_focus`, `theme`, `id_divisi`) VALUES
('230022', 'abdul', 'abdul@example', '123', 'HMSI', NULL, '2025-10-07 19:14:31', 'center 50%', 'light', 4),
('23115111000', 'Alex', 'hmsi@hmail.com', '$2b$10$un7qXvgsofKpBFMZ50uJCevhg0R76E8zSoUTpDx/BitTkD.FRMNea', 'DPA', NULL, '2025-09-26 08:01:36', 'center 50%', 'light', NULL),
('2311522002', 'agung', 'admin@example.com', 'admin123', 'Admin', 'uploads/profile/1759898922694-867141794.png', '2025-10-08 04:48:42', 'center 50%', 'light', NULL),
('2311522032', 'Ridho Dwi Syahputra', 'eksternal@gmail.com', '$2b$10$IKLgcUfh0BQX8PQRB1HLcO1SuuPgMEfXEIPgykJNR7h4jAbvHf.vm', 'HMSI', 'profile/1759907707011-653127549.jpg', '2025-10-08 07:15:07', 'center 50%', 'light', 2),
('2311522033', 'Ketua Divisi Internal', 'internal@gmail.com', 'hmsi123', 'HMSI', NULL, '2025-10-07 05:46:39', 'center 50%', 'light', 1),
('2311523020', 'H.Afiq Jakhel', 'dpa@gmail.com', '$2b$10$rqXdZe1/OuGanuOxO1wK9uk7O1t5UPoXIa332kVHAbqabIZP31NeC', 'DPA', 'uploads/profile/1759907098101-786242602.png', '2025-10-08 07:04:58', 'center 50%', 'light', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `divisi`
--
ALTER TABLE `divisi`
  ADD PRIMARY KEY (`id_divisi`),
  ADD UNIQUE KEY `nama_divisi` (`nama_divisi`);

--
-- Indexes for table `evaluasi`
--
ALTER TABLE `evaluasi`
  ADD PRIMARY KEY (`id_evaluasi`),
  ADD KEY `FK_Evaluasi_Laporan` (`id_laporan`),
  ADD KEY `FK_Evaluasi_User` (`pemberi_evaluasi`);

--
-- Indexes for table `keuangan`
--
ALTER TABLE `keuangan`
  ADD PRIMARY KEY (`id_keuangan`),
  ADD UNIQUE KEY `unik_laporan` (`id_laporan`),
  ADD KEY `FK_Keuangan_Laporan` (`id_laporan`),
  ADD KEY `FK_Keuangan_User` (`id_anggota`);

--
-- Indexes for table `laporan`
--
ALTER TABLE `laporan`
  ADD PRIMARY KEY (`id_laporan`),
  ADD KEY `FK_Laporan_Program_kerja` (`id_ProgramKerja`),
  ADD KEY `fk_laporan_divisi` (`id_divisi`);

--
-- Indexes for table `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD PRIMARY KEY (`id_notifikasi`),
  ADD KEY `FK_Notifikasi_Evaluasi` (`id_evaluasi`),
  ADD KEY `FK_Notifikasi_Laporan` (`id_laporan`),
  ADD KEY `FK_Notifikasi_Program_kerja` (`id_ProgramKerja`),
  ADD KEY `FK_Notifikasi_User` (`id_anggota`),
  ADD KEY `fk_notifikasi_divisi` (`id_divisi`);

--
-- Indexes for table `program_kerja`
--
ALTER TABLE `program_kerja`
  ADD PRIMARY KEY (`id_ProgramKerja`),
  ADD KEY `FK_Program_kerja_User` (`id_anggota`),
  ADD KEY `fk_proker_divisi` (`id_divisi`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_anggota`),
  ADD KEY `fk_user_divisi` (`id_divisi`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `divisi`
--
ALTER TABLE `divisi`
  MODIFY `id_divisi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
-- Constraints for table `keuangan`
--
ALTER TABLE `keuangan`
  ADD CONSTRAINT `FK_Keuangan_Laporan` FOREIGN KEY (`id_laporan`) REFERENCES `laporan` (`id_laporan`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_Keuangan_User` FOREIGN KEY (`id_anggota`) REFERENCES `user` (`id_anggota`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `laporan`
--
ALTER TABLE `laporan`
  ADD CONSTRAINT `FK_Laporan_Program_kerja` FOREIGN KEY (`id_ProgramKerja`) REFERENCES `program_kerja` (`id_ProgramKerja`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_laporan_divisi` FOREIGN KEY (`id_divisi`) REFERENCES `divisi` (`id_divisi`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD CONSTRAINT `FK_Notifikasi_Evaluasi` FOREIGN KEY (`id_evaluasi`) REFERENCES `evaluasi` (`id_evaluasi`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_Notifikasi_Laporan` FOREIGN KEY (`id_laporan`) REFERENCES `laporan` (`id_laporan`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_Notifikasi_Program_kerja` FOREIGN KEY (`id_ProgramKerja`) REFERENCES `program_kerja` (`id_ProgramKerja`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_Notifikasi_User` FOREIGN KEY (`id_anggota`) REFERENCES `user` (`id_anggota`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notifikasi_divisi` FOREIGN KEY (`id_divisi`) REFERENCES `divisi` (`id_divisi`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `program_kerja`
--
ALTER TABLE `program_kerja`
  ADD CONSTRAINT `FK_Program_kerja_User` FOREIGN KEY (`id_anggota`) REFERENCES `user` (`id_anggota`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_proker_divisi` FOREIGN KEY (`id_divisi`) REFERENCES `divisi` (`id_divisi`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `fk_user_divisi` FOREIGN KEY (`id_divisi`) REFERENCES `divisi` (`id_divisi`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
