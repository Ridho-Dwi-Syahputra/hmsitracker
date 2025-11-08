-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 17, 2025 at 03:08 AM
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
  `id_laporan` varchar(50) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evaluasi`
--

INSERT INTO `evaluasi` (`id_evaluasi`, `komentar`, `komentar_hmsi`, `pemberi_evaluasi`, `status_konfirmasi`, `tanggal_evaluasi`, `id_laporan`, `updated_at`) VALUES
('04de6e01-137d-420d-bf61-7b8f749ce18e', 'sadad', NULL, '2311523020', 'Revisi', '2025-10-08', NULL, '2025-10-11 00:29:53'),
('21f286ed-8fc1-410d-88b1-cbe1a84f2192', 'asscacas', NULL, '2311523020', 'Selesai', '2025-10-08', NULL, '2025-10-11 00:29:53'),
('37a5c3dd-c20d-4bc7-ac86-85b31a7b757e', 'xaaxax', NULL, '2311523020', 'Selesai', '2025-10-08', NULL, '2025-10-11 00:29:53'),
('7e54c290-8989-4830-b15e-ef11f5e5739a', 'fwffwfw', 'iyaaa dik', NULL, 'Revisi', '2025-10-12', NULL, '2025-10-16 13:03:42'),
('a63575fb-b983-4cdc-8cb4-7d599f513e51', 'revisiiiiii', NULL, NULL, 'Revisi', '2025-10-10', NULL, '2025-10-11 00:29:53'),
('a9c010b4-efd9-4414-b598-642868aa1c49', 'revisiiii', 'iyaaaaaaa', NULL, 'Revisi', '2025-10-10', NULL, '2025-10-11 11:17:54'),
('cd23c496-61e5-47c6-a16c-8e70fce611a6', 'bagus', NULL, NULL, 'Selesai', '2025-10-11', '72870221-3f9d-4d9e-9435-433a97bb380e', '2025-10-11 23:27:18'),
('ed9b5b48-6391-4c82-ae9e-40a0fc8572cc', 'salaahhhh', 'iyqqq', NULL, 'Revisi', '2025-10-11', NULL, '2025-10-11 23:35:01');

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
  `tanggal` date DEFAULT NULL,
  `dokumentasi_mime` varchar(100) DEFAULT NULL,
  `id_divisi` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `laporan`
--

INSERT INTO `laporan` (`id_laporan`, `judul_laporan`, `deskripsi_kegiatan`, `sasaran`, `waktu_tempat`, `dana_digunakan`, `sumber_dana`, `sumber_dana_lainnya`, `dana_terpakai`, `persentase_kualitatif`, `persentase_kuantitatif`, `deskripsi_target_kuantitatif`, `deskripsi_target_kualitatif`, `kendala`, `solusi`, `dokumentasi`, `id_ProgramKerja`, `tanggal`, `dokumentasi_mime`, `id_divisi`) VALUES
('72870221-3f9d-4d9e-9435-433a97bb380e', 'laporan 11', 'hfhj', 'vsvsvcs', '313', '20000', 'Uang Kas HMSI', NULL, 20000.00, '20', '20', 'jkholh', 'lknlkn', 'mn,mn', 'nvbj', 'Modul_Pratikum_Pertemuan_5__Material_Design_&_Animasi_di_Jetpack_Compose[1]-f8b189ba-b0cc-4217-874f-764a72aecf2a.pdf', '937e9da7-a678-11f0-97bb-432a08ab4041', '2025-10-11', NULL, 4);

-- --------------------------------------------------------

--
-- Table structure for table `notifikasi`
--

CREATE TABLE `notifikasi` (
  `id_notifikasi` varchar(50) NOT NULL,
  `pesan` varchar(200) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `status_baca` tinyint(1) DEFAULT NULL,
  `id_anggota` varchar(50) DEFAULT NULL,
  `id_evaluasi` varchar(50) DEFAULT NULL,
  `id_ProgramKerja` varchar(50) DEFAULT NULL,
  `id_laporan` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_divisi` int(11) DEFAULT NULL,
  `target_role` enum('Admin','HMSI','DPA') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifikasi`
--

INSERT INTO `notifikasi` (`id_notifikasi`, `pesan`, `role`, `status_baca`, `id_anggota`, `id_evaluasi`, `id_ProgramKerja`, `id_laporan`, `created_at`, `id_divisi`, `target_role`) VALUES
('106f6db4-0c33-42b2-9857-9075eb32f701', 'DPA telah mengubah status Program Kerja \"dokumentasi\" milik divisi Medkraf menjadi \"Selesai\"', NULL, 0, NULL, NULL, '937e9da7-a678-11f0-97bb-432a08ab4041', NULL, '2025-10-12 15:10:39', 4, 'HMSI'),
('1a5701fb-4e91-421b-8b23-c14a96dc166f', 'DPA telah mengubah status Program Kerja \"FTI Care\" milik divisi Eksternal menjadi \"Tidak Selesai\"', NULL, 0, NULL, NULL, 'f1b628b0-a724-4f0f-b69d-9939b5364db0', NULL, '2025-10-17 00:21:55', 2, 'HMSI'),
('1e4ccf0b-ef48-4513-9498-f39486a268be', 'Divisi Eksternal menambahkan Program Kerja baru: \"SI Connect\"', NULL, 1, NULL, NULL, 'e408d09e-713e-4645-910d-d76103ea2474', NULL, '2025-10-17 00:05:27', 2, 'DPA'),
('1e9cedd8-3757-426a-8cd4-1cd1e2d2b0ad', 'Divisi Eksternal memperbarui Program Kerja: \"FTI Sadar Lingkungan\"', NULL, 1, NULL, NULL, '42f84a83-570a-49de-a0fc-699f88ce339f', NULL, '2025-10-17 00:29:00', 2, 'DPA'),
('477f1c0c-073c-4fbe-b12c-64aabf5e0d7c', 'Divisi Eksternal menambahkan Program Kerja baru: \"caac\"', NULL, 1, NULL, NULL, NULL, NULL, '2025-10-16 23:56:12', 2, 'DPA'),
('532834ea-70e3-4848-b228-18973342d7a8', 'Divisi Eksternal menambahkan Program Kerja baru: \"FTI Sadar Lingkungan\"', NULL, 1, NULL, NULL, '42f84a83-570a-49de-a0fc-699f88ce339f', NULL, '2025-10-17 00:04:51', 2, 'DPA'),
('5dbcb8dd-5ee9-4675-8f4c-844cdcc9239d', 'Divisi Eksternal menambahkan Program Kerja baru: \"test tanggal proker\"', NULL, 1, NULL, NULL, '192467ea-3675-4102-8180-3a307e3a099c', NULL, '2025-10-17 00:25:16', 2, 'DPA'),
('6acd32a1-c080-4a95-87e3-aabb3d6d4c19', 'Divisi Eksternal menambahkan Program Kerja baru: \"FTI Sadar Lingkungan\"', NULL, 1, NULL, NULL, NULL, NULL, '2025-10-16 23:54:54', 2, 'DPA'),
('8263adfe-83ea-4632-80d9-f5a8b5bb6e76', 'Divisi Eksternal menambahkan Program Kerja baru: \"HMSI FEST\"', NULL, 1, NULL, NULL, '44dfea73-74a3-441e-b4fe-ccda0e7b6019', NULL, '2025-10-16 23:55:40', 2, 'DPA'),
('879f6ab9-0850-4537-8753-0f3395672221', 'Divisi Eksternal menambahkan Program Kerja baru: \"test\"', NULL, 1, NULL, NULL, 'd8f84000-873b-41be-9361-7793660b87a7', NULL, '2025-10-17 00:14:12', 2, 'DPA'),
('ac7667e3-df55-489a-83b3-819d20a8d13c', 'DPA telah mengubah status Program Kerja \"SI Peduli\" milik divisi Eksternal menjadi \"Selesai\"', NULL, 0, NULL, NULL, '64206e57-abec-416f-bee4-5d739b4236f7', NULL, '2025-10-17 00:41:47', 2, 'HMSI'),
('c1bf9757-aae8-11f0-9d0a-526c288319f3', 'Divisi Eksternal menambahkan laporan baru: \"testtt\"', NULL, 1, NULL, NULL, NULL, NULL, '2025-10-16 23:35:10', 2, 'DPA'),
('d693c8ce-aa55-11f0-988d-4534346a7613', 'Divisi Eksternal telah memberikan revisi atau komentar baru untuk laporan \"laporan 1\".', NULL, 1, NULL, '7e54c290-8989-4830-b15e-ef11f5e5739a', NULL, NULL, '2025-10-16 06:03:33', 2, 'DPA'),
('dbcca81e-aa55-11f0-988d-4534346a7613', 'Divisi Eksternal telah memberikan revisi atau komentar baru untuk laporan \"laporan 1\".', NULL, 1, NULL, '7e54c290-8989-4830-b15e-ef11f5e5739a', NULL, NULL, '2025-10-16 06:03:42', 2, 'DPA'),
('ef39032c-4017-4687-84e8-1bf3ad5704ba', 'Divisi Eksternal menghapus Program Kerja: \"test proker 1\"', NULL, 1, NULL, NULL, NULL, NULL, '2025-10-16 23:39:47', 2, 'DPA');

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
  `Target_Kuantitatif` text NOT NULL,
  `Target_Kualitatif` text NOT NULL,
  `id_anggota` varchar(50) DEFAULT NULL,
  `Dokumen_pendukung` varchar(255) DEFAULT NULL,
  `Status` enum('Belum Dimulai','Sedang Berjalan','Selesai','Tidak Selesai') DEFAULT 'Belum Dimulai',
  `id_divisi` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program_kerja`
--

INSERT INTO `program_kerja` (`id_ProgramKerja`, `Nama_ProgramKerja`, `Deskripsi`, `Tanggal_mulai`, `Tanggal_selesai`, `Penanggung_jawab`, `Target_Kuantitatif`, `Target_Kualitatif`, `id_anggota`, `Dokumen_pendukung`, `Status`, `id_divisi`) VALUES
('192467ea-3675-4102-8180-3a307e3a099c', 'test tanggal proker', 'contoh', '2025-09-28', '2025-10-15', 'contoj', 'contoh', 'contoh', '2311522032', 'Laporan E-Bisnis Kelompok 4 (1)-f0e6fb8b-2203-417e-886e-b7726f6262ad.pdf', 'Sedang Berjalan', 2),
('42f84a83-570a-49de-a0fc-699f88ce339f', 'FTI Sadar Lingkungan', 'contoh', '2025-10-21', '2025-11-07', 'Norii', 'contoh', 'contoh', '2311522032', 'PKM-KI PROPOSAL EARLY DETECTION APPLICATION FOR SKIN DISEASES ON SMARTPHONE CAMERAS (2)-d7853a49-7252-4d97-848f-eae64e9709b7.pdf', 'Belum Dimulai', 2),
('44dfea73-74a3-441e-b4fe-ccda0e7b6019', 'HMSI FEST', 'xaxa', '2025-10-24', '2025-10-30', 'xcx', 'xaa', 'xaax', '2311522032', 'ChatGPT Image Oct 15, 2025, 07_27_28 PM-c073d727-0878-476c-a8c1-8c89752380c9.png', 'Belum Dimulai', 2),
('64206e57-abec-416f-bee4-5d739b4236f7', 'SI Peduli', 'contoh', '2025-10-01', '2025-11-08', 'Zakky', 'contoh', 'contoh', '2311522032', 'skintify-high-resolution-logo-grayscale-transparent-5472f7e9-01b6-4439-9485-6a8a32036792.png', 'Selesai', 2),
('937e9da7-a678-11f0-97bb-432a08ab4041', 'dokumentasi', 'dvsdvdsvsd', '2025-10-07', '2025-10-24', 'abdul', 'svdsvd', 'svdds', '230022', 'Logo Sako-1eb011c4-5e29-4b3b-9a4a-98c979453b26.png', 'Selesai', 4),
('d8f84000-873b-41be-9361-7793660b87a7', 'test', 'test', '2025-10-01', '2025-10-09', 'test', 'test', 'test', '2311522032', 'krs smster 5-dd1383cf-99f2-4769-b5ca-f2f53897771b.pdf', 'Selesai', 2),
('e408d09e-713e-4645-910d-d76103ea2474', 'SI Connect', 'contoh', '2025-09-29', '2025-10-24', 'Nala', 'contoh', 'contoh', '2311522032', 'foto zzz-001493c0-7463-40ec-8b8d-54a077f6fe4d.jpg', 'Sedang Berjalan', 2),
('f1b628b0-a724-4f0f-b69d-9939b5364db0', 'FTI Care', 'Mengunjungi panti', '2025-10-08', '2025-10-30', 'Afiq', 'contoh', 'contoh', '2311522032', 'Laporan E-Bisnis Kelompok 4 (1)-36f0f4db-5f8c-40f9-8140-5793165a6209.pdf', 'Tidak Selesai', 2);

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
('230022', 'abdul', 'abdul@example.com', '123', 'HMSI', 'uploads/profile/1760163587958-629762817.png', '2025-10-16 23:44:57', 'center 50%', 'light', 4),
('2311522002', 'agung', 'admin@example.com', 'admin123', 'Admin', 'uploads/profile/1759898922694-867141794.png', '2025-10-08 04:48:42', 'center 50%', 'light', NULL),
('2311522032', 'Ridho Dwi Syahputra', 'ridhooo@example.com', '$2b$10$Yo1dhr.KmCiVwBrZT0dLAOnvRA846eDPkc6nZi2HNGV0NnjnicXVG', 'HMSI', 'uploads/profile/1760274982983-541130210.jpg', '2025-10-16 23:41:38', 'center 50%', 'light', 2),
('2311523020', 'Pengurus DPA', 'akundpa@example.com', '$2b$10$rqXdZe1/OuGanuOxO1wK9uk7O1t5UPoXIa332kVHAbqabIZP31NeC', 'DPA', 'uploads/profile/1760189631099-88826773.jpg', '2025-10-17 00:17:45', 'center 50%', 'light', NULL);

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
  MODIFY `id_divisi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
