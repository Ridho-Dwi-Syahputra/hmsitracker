-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 29, 2025 at 05:39 AM
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
  `komentar_hmsi` text DEFAULT NULL,
  `pemberi_evaluasi` varchar(50) DEFAULT NULL,
  `status_konfirmasi` varchar(50) DEFAULT NULL,
  `tanggal_evaluasi` date DEFAULT NULL,
  `id_laporan` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evaluasi`
--

INSERT INTO `evaluasi` (`id_evaluasi`, `komentar`, `komentar_hmsi`, `pemberi_evaluasi`, `status_konfirmasi`, `tanggal_evaluasi`, `id_laporan`) VALUES
('036c9513-a567-4a86-a05f-d0f327e24df3', 'hhfwjfjwofjwo', 'jbjbbkhkho', '2311523020', 'Revisi', '2025-09-28', 'f7a4176a-c169-45ea-9c34-5036156ac44d'),
('4ac9b112-6fee-44bd-a0c8-1cce44922349', 'salahhh inii', NULL, '2311523020', 'Revisi', '2025-09-23', '118b1c1a-b9c5-4080-9e28-04b0a95811bb'),
('5487551e-5456-42a2-9b40-03620610eeeb', 'salahh ini woyy', 'iyaa maaf\r\n', '2311523020', 'Revisi', '2025-09-28', '9a316e7d-0c48-42ea-837d-0fbf8d09a7de'),
('864a3635-f53f-46f1-b184-1ee4bdbd6330', 'bagus', NULL, '2311523020', 'Selesai', '2025-09-28', '1995361d-cb7e-4f1c-96fe-cccd89e44b2d'),
('ae1f9187-9f6e-4995-925d-eea9a3c9c873', 'ulang lagii', NULL, '2311523020', 'Revisi', '2025-09-28', NULL),
('d5e377b7-36bf-4e23-ba71-cc6c62d4fbb1', 'gsavdacveuicvdchsvcyeccbdcbhdb', NULL, '2311523020', 'Revisi', '2025-09-20', NULL),
('ea4c6373-dba7-4f38-a292-a7c11e146a78', 'jelekkk', 'ma adoo jelekk', '2311523020', 'Revisi', '2025-09-20', '19e74317-6e15-4513-bd59-3ee4351692c1');

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

--
-- Dumping data for table `keuangan`
--

INSERT INTO `keuangan` (`id_keuangan`, `tanggal`, `tipe`, `sumber`, `jumlah`, `id_laporan`, `id_anggota`, `created_at`, `updated_at`) VALUES
('1b0cb609-6d35-4886-9403-2af7613ab7f0', '2025-09-26', 'Pemasukan', 'Uang Kas Bulanan', 600000000.00, NULL, '2311522002', '2025-09-26 04:12:09', '2025-09-26 04:12:09'),
('5519764e-9bf5-4bd7-9e37-2e8a85a5df5e', '2025-09-25', 'Pengeluaran', 'Pengeluaran dari Laporan: AAAAAAAAAAAABbbbbbb', 1000000.00, '1995361d-cb7e-4f1c-96fe-cccd89e44b2d', '2311522032', '2025-09-25 12:16:40', '2025-09-25 12:16:40'),
('d0e52582-ae55-485f-97d1-2f7236f7361b', '2025-09-25', 'Pemasukan', 'Sponsor Kahf', 20000000.00, NULL, NULL, '2025-09-25 12:49:13', '2025-09-25 12:49:13'),
('d650b0cc-eaaa-4f67-9b94-9762d32af535', '2025-09-26', 'Pemasukan', 'Uang Kas September', 200000.00, NULL, '2311522002', '2025-09-26 04:22:33', '2025-09-26 04:22:33'),
('e9b6d0f1-a732-4f16-ba99-5d9936066674', '2025-09-29', 'Pemasukan', 'Uang Kas Bulanan', 4000000.00, NULL, '2311522002', '2025-09-29 03:16:27', '2025-09-29 03:16:27');

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
  `dokumentasi_mime` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `laporan`
--

INSERT INTO `laporan` (`id_laporan`, `judul_laporan`, `deskripsi_kegiatan`, `sasaran`, `waktu_tempat`, `dana_digunakan`, `sumber_dana`, `sumber_dana_lainnya`, `dana_terpakai`, `persentase_kualitatif`, `persentase_kuantitatif`, `deskripsi_target_kuantitatif`, `deskripsi_target_kualitatif`, `kendala`, `solusi`, `dokumentasi`, `id_ProgramKerja`, `divisi`, `tanggal`, `dokumentasi_mime`) VALUES
('118b1c1a-b9c5-4080-9e28-04b0a95811bb', 'test evaluasi', '-', '', '09:00 - 10:00 WIB, gedung C', '1000000', 'Uang Kas HMSI', NULL, NULL, '', '', NULL, NULL, '', '', NULL, '279a187d-95eb-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-23', NULL),
('1995361d-cb7e-4f1c-96fe-cccd89e44b2d', 'AAAAAAAAAAAABbbbbbb', 'akdnkdna', '', '09:00-12:00 WIB, gedung C', '1000000', 'Uang Kas HMSI', NULL, 1000000.00, '', '', NULL, NULL, '', '', NULL, 'c2518baa-99bc-11f0-999f-6daf25adf4c1', 'Eksternal', '2025-09-25', NULL),
('19e74317-6e15-4513-bd59-3ee4351692c1', 'testtttt notif', '-', '', '08-00', '', '', NULL, NULL, '', '', NULL, NULL, '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('2293aeeb-043f-4190-a48f-6de582c1f15c', 'Technofest testing 2', '-', '', '08-00', '', '', NULL, NULL, '', '', NULL, NULL, '', '', NULL, 'a260f2eb-9490-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('364c658b-95eb-11f0-981a-442e1c01b37c', 'pdf', 'testt', '', '08-00', '', 'pinjol', NULL, NULL, '', '', NULL, NULL, '', '', NULL, '279a187d-95eb-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-20', NULL),
('3fa7ea5f-6b0e-4d35-8a9c-6caa7c3b8fa2', 'test notiff', '-', '', '09', '', '', NULL, NULL, '', '', NULL, NULL, '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('444501ad-c260-41d5-87f0-db166369abc8', 'testtttttttt notif 4', '-', '', '08-00', '', '', NULL, NULL, '', '', NULL, NULL, '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('45df83b8-4e6b-44d1-8e95-011798aa22cc', 'test laporan', 'hbiiJDML', ' bnm', '09:00 - 10:00 WIB, gedung C', '200000000', NULL, NULL, 200000000.00, '40', '40', 'b nm,', 'n kml,', 'hbjhnkl', 'bnm', 'test file.pdf', '3ab0989e-9496-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-28', NULL),
('6bed7d89-1030-4fd5-8532-00ce5fbe1b61', 'test pengeluaran ', 'jjkjk', '', '09:00-12:00 WIB, gedung C', '200000', NULL, NULL, 200000.00, '', '', NULL, NULL, '', '', NULL, '3ab0989e-9496-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-25', NULL),
('9a316e7d-0c48-42ea-837d-0fbf8d09a7de', 'Program Kerja 11', ' hkjl', 'lmfslfm', '09:00-12:00 WIB, gedung C', '40000000', NULL, NULL, 40000000.00, '50', '50', 'dfsdxbdgn', 'addfbgnnb', ' bnm,', ' bnm,', 'test file.pdf', '9e554648-9ab6-11f0-b703-7845f2f0da73', 'Eksternal', '2025-09-28', NULL),
('a59fb91b-8ef6-41e3-92df-813748aae78b', 'test notif local host say', 'xscdvfd', 'xascdsvfd', '09:00-12:00 WIB, gedung C', '100000', NULL, NULL, 100000.00, '40', '40', 'cdavsfbdgnf', 'asczdvbd', 'xcdvxbcg', 'scadsvfd', 'test file.pdf', '279a187d-95eb-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-28', NULL),
('b7e33127-8bcd-466b-bc5a-d83900bf3c32', 'laporan 1', 'gaa da', '', '08-00', '', '', NULL, NULL, '', '', NULL, NULL, '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-21', NULL),
('c4c4ad09-166b-47e0-8874-223558e28cce', 'bayar pinjol 2', 'sssd', '', '09:00-12:00 WIB, gedung C', '3000000', 'Uang Kas HMSI', NULL, NULL, '', '', NULL, NULL, '', '', NULL, '279a187d-95eb-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-25', NULL),
('cf3371f4-949c-11f0-981a-442e1c01b37c', 'test tanggal', '-', '-', '08-000', '', '', NULL, NULL, '34', '20', NULL, NULL, '-', '-', 'dokumentasi-1758206268668-273573665.pdf', '3ab0989e-9496-11f0-981a-442e1c01b37c', '', '2025-09-18', NULL),
('d0c6a89d-b659-4104-bfe1-8e2a1a669890', 'AAAAAAAAAAAAAA', 'm m m', '', '09:00-12:00 WIB, gedung C', '100000000000', 'Uang Kas HMSI', NULL, NULL, '', '', NULL, NULL, '', '', NULL, '279a187d-95eb-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-25', NULL),
('d417b914-a5f3-44f3-9c03-8be40230bfbb', 'test deskripsi target kual kuan', 'safavsv', 'ssfdngv', '09:00-12:00 WIB, gedung C', '1000000000', NULL, NULL, 1000000000.00, '50', '45', 'acvsbdnfg', 'czxvbfcgnvm', 'sdfdg', 'ssxfbcgn', 'test file.pdf', '3ab0989e-9496-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-27', NULL),
('e8b358bf-0071-46a6-9b32-b50bed406be9', 'bayar pinjol', 'mjadjoa', '', '09:00-12:00 WIB, gedung C', '2000000', 'Uang Kas HMSI', NULL, NULL, '', '', NULL, NULL, '', '', NULL, '3ab0989e-9496-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-24', NULL),
('f296bbac-e89d-4b1c-9eca-af5ad229e5e4', 'Technofest testing 3', '-', '', '08-00', '', '', NULL, NULL, '', '', NULL, NULL, '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('f7747de4-b52a-48f2-b7e4-9c853e7663da', 'test pdf', 'DSavd', 'asvsa', '08-00', '10000000000', NULL, NULL, 10000000000.00, '20', '20', NULL, NULL, 'savs', 'ascasc', 'test file.pdf', '570a40fc-9ab6-11f0-b703-7845f2f0da73', 'Eksternal', '2025-09-26', NULL),
('f7a4176a-c169-45ea-9c34-5036156ac44d', 'test laporan', 'dsaasd', 'svafasv', 'sacsd', '2000000', NULL, NULL, 2000000.00, '30', '20', NULL, NULL, 'asfas', 'asvsa', 'PPSI Mind Map.pdf', '3ab0989e-9496-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-26', NULL);

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifikasi`
--

INSERT INTO `notifikasi` (`id_notifikasi`, `pesan`, `role`, `divisi`, `status_baca`, `id_anggota`, `id_evaluasi`, `id_ProgramKerja`, `id_laporan`, `created_at`) VALUES
('0057637e-2acb-46ba-840d-64a996e13b58', 'Divisi Eksternal telah menambahkan laporan baru: debug 2', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 10:32:44'),
('01b4ca81-970e-11f0-981a-442e1c01b37c', 'HMSI (Eksternal) memberikan komentar baru pada evaluasi program \"HMSI FEST\"', 'DPA', 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-21 17:11:12'),
('0513e13b-6306-482a-973f-7f8c6c32c0dd', 'Divisi Eksternal telah menambahkan laporan baru: test deskripsi target kual kuan', NULL, 'Internal', 0, NULL, NULL, NULL, 'd417b914-a5f3-44f3-9c03-8be40230bfbb', '2025-09-27 10:46:26'),
('10c03292-4f36-4c9e-a80b-0c988ef29e50', 'DPA memberi evaluasi pada laporan \"keuangan 1\"', NULL, 'Eksternal', 1, NULL, NULL, NULL, NULL, '2025-09-21 10:42:02'),
('1d9a2228-aaef-46f7-8acc-54e765806562', 'Divisi Internal telah menambahkan laporan baru: test notiff', NULL, 'Internal', 1, NULL, NULL, NULL, '3fa7ea5f-6b0e-4d35-8a9c-6caa7c3b8fa2', '2025-09-20 08:07:15'),
('21bf2f9b-9933-4c5d-a10c-e0486cf16f97', 'Divisi Eksternal telah menghapus laporan: AAAAAAAAAAAAAA', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 12:23:34'),
('22191db9-570d-4732-8406-f445de1df066', 'Divisi Eksternal telah menambahkan laporan baru: bayar pinjol', NULL, 'Internal', 0, NULL, NULL, NULL, 'e8b358bf-0071-46a6-9b32-b50bed406be9', '2025-09-24 16:22:31'),
('2528d177-18fe-461b-9222-c7dfce4b3b83', 'HMSI (Internal) telah membuat Program Kerja baru: \"test Notifff\"', NULL, 'Internal', 1, NULL, NULL, '0c3d6d76-95f9-11f0-981a-442e1c01b37c', NULL, '2025-09-20 08:08:38'),
('26a43567-5426-4889-bc5f-04ba2a5b45c9', 'Divisi Eksternal telah menghapus laporan: test keuangan', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 12:25:51'),
('29cf4fcc-06ed-4292-94a8-4adebd9d87ef', 'Divisi Eksternal telah menambahkan laporan baru: AAAAAAAAAAAABbbbbbb', NULL, 'Internal', 0, NULL, NULL, NULL, '1995361d-cb7e-4f1c-96fe-cccd89e44b2d', '2025-09-25 12:16:40'),
('2cecaa54-75e7-4ce8-b285-7075e8fd908c', 'Divisi Eksternal telah menambahkan laporan baru: bayar pinjol 2', NULL, 'Internal', 0, NULL, NULL, NULL, 'c4c4ad09-166b-47e0-8874-223558e28cce', '2025-09-25 03:06:03'),
('2fe8f12a-a451-4ace-8e82-28d4930eb0a4', 'Divisi Eksternal telah menambahkan laporan baru: test keuangan', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 10:53:06'),
('30f7e78c-c7cf-4580-a9b3-4302bd4b430a', 'DPA telah mengubah status Program Kerja \"test notif\" milik divisi Eksternal menjadi Selesai', 'HMSI', 'Eksternal', 1, NULL, NULL, '279a187d-95eb-11f0-981a-442e1c01b37c', NULL, '2025-09-24 03:48:35'),
('34b7078f-f7ff-4f32-99a9-9fdf789fac28', 'DPA telah mengubah status Program Kerja \"test\" milik divisi Eksternal menjadi Gagal', 'HMSI', 'Eksternal', 1, NULL, NULL, 'abc1ba2e-99bc-11f0-999f-6daf25adf4c1', NULL, '2025-09-28 12:40:27'),
('38b5b480-fa6f-4c1e-9f88-6f58d22adae9', 'Divisi Eksternal telah menambahkan laporan baru: AAAAAAAAAAAAAA', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 11:55:02'),
('39b6114a-739c-459a-bb0f-1b0afc335d5c', 'Divisi Eksternal telah mengupdate laporan: keuangan 1', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 04:45:18'),
('40ad6bce-0e62-4e10-8f6c-a3415ea55f52', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"fti berbagi\"', NULL, 'Eksternal', 1, NULL, NULL, '8c580c89-9ab6-11f0-b703-7845f2f0da73', NULL, '2025-09-26 08:55:27'),
('40fc6d8f-0521-468e-b9d1-d5324abb0a1e', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"test\"', NULL, 'Eksternal', 0, NULL, NULL, 'abc1ba2e-99bc-11f0-999f-6daf25adf4c1', NULL, '2025-09-25 03:06:39'),
('4481f63d-733f-46d6-a5d8-2770c707fc47', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"technofeat\"', NULL, 'Eksternal', 0, NULL, NULL, 'c2518baa-99bc-11f0-999f-6daf25adf4c1', NULL, '2025-09-25 03:07:17'),
('465c25a4-0084-4bf1-ab33-2a77297b6ce4', 'Divisi Eksternal telah menambahkan laporan baru: test fitur', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 03:50:11'),
('4997b5bc-d819-4b2b-9ac2-3a40319f0948', 'Divisi Internal telah menambahkan laporan baru: testtttt notif', NULL, 'Internal', 1, NULL, NULL, NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-20 08:06:59'),
('4a99e5ba-d464-444f-bdde-d2f93963eb27', 'Divisi Eksternal telah menambahkan laporan baru: bbbbbbbbbbbbbbbbbb', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 13:07:59'),
('4bbbb184-96d7-11f0-981a-442e1c01b37c', 'HMSI (Eksternal) memberikan komentar baru pada evaluasi program \"HMSI FEST\"', 'DPA', 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-21 10:39:34'),
('4bc65c72-0695-4e77-9e09-cd15fb377549', 'Divisi Eksternal telah mengupdate laporan: test evaluasi', NULL, 'Internal', 0, NULL, NULL, NULL, '118b1c1a-b9c5-4080-9e28-04b0a95811bb', '2025-09-24 16:21:59'),
('4f219dfd-a141-4ece-81be-68c9eb8e32b2', 'Divisi Eksternal telah menambahkan laporan baru: test keuangan', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 12:24:10'),
('4f35d510-04bd-4b37-8d12-c2f5ca767258', 'Divisi Eksternal telah menambahkan laporan baru: test 123345', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 13:07:39'),
('528a86e8-4692-4f42-8f4e-115a9dfe16ad', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"testt proker\"', NULL, 'Eksternal', 1, NULL, NULL, NULL, NULL, '2025-09-21 17:10:49'),
('52a5a464-5f97-4c95-ac7e-3a52c98aaf6e', 'Divisi Eksternal telah menghapus laporan: test tanggal', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 11:26:43'),
('56ebcfcb-63a5-4611-8fa2-af791e0b1d0d', 'Divisi Eksternal telah menghapus laporan: AAAAAAAAAAAAAA', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 12:23:26'),
('56fe9397-dccb-4649-a70b-3bb1872c6c20', 'Divisi Eksternal telah menghapus laporan: test fitur', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 12:23:29'),
('5858f66e-2e60-4d42-9b05-426f4cb92e47', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"testt\"', NULL, 'Eksternal', 0, NULL, NULL, '62ae6a36-9ab6-11f0-b703-7845f2f0da73', NULL, '2025-09-26 08:54:17'),
('598ec634-b7b4-4730-9132-336e0e826ab2', 'DPA memberi evaluasi pada laporan \"keuangan 1\"', NULL, 'Eksternal', 1, NULL, NULL, NULL, NULL, '2025-09-21 11:18:19'),
('5ac18cf2-f65d-4f10-9e51-3111f6cd6006', 'DPA memberi evaluasi pada laporan \"test laporan\"', 'HMSI', 'Eksternal', 1, NULL, '036c9513-a567-4a86-a05f-d0f327e24df3', NULL, 'f7a4176a-c169-45ea-9c34-5036156ac44d', '2025-09-28 09:58:36'),
('5e9708b9-8759-4844-b110-e569f4a78336', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"test tanggal proker\"', NULL, 'Eksternal', 0, NULL, NULL, 'cbb9a132-98b1-11f0-999f-6daf25adf4c1', NULL, '2025-09-23 19:16:20'),
('60e853b7-1cec-4cab-a182-4cd6156028a6', 'Divisi Internal telah menambahkan laporan baru: laporan 1', NULL, 'Internal', 1, NULL, NULL, NULL, 'b7e33127-8bcd-466b-bc5a-d83900bf3c32', '2025-09-21 09:08:08'),
('618c7e54-8036-40a0-adea-71227605ca10', 'DPA memberi evaluasi pada laporan \"test evaluasi\"', 'HMSI', 'Eksternal', 1, NULL, '4ac9b112-6fee-44bd-a0c8-1cce44922349', NULL, '118b1c1a-b9c5-4080-9e28-04b0a95811bb', '2025-09-23 16:15:22'),
('6322c669-faff-45f4-abec-da637c1d1451', 'Divisi Eksternal telah menghapus laporan: bbbbbbbbbbbbbbbbbb', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 13:08:20'),
('6468f7c8-b3bb-4078-80d4-94723d858811', 'Divisi Eksternal telah menghapus laporan: keuangan 1', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 12:41:43'),
('682fb376-16ed-420e-bcd9-5b394a2656d5', 'Divisi Eksternal telah mengupdate laporan: test keuangan', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-28 10:01:05'),
('6a38c551-f811-4828-b317-783300ba60cc', 'Divisi Eksternal telah menambahkan laporan baru: debug', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 10:32:26'),
('6b05441a-537f-4ce8-86c8-0371875008a1', 'Divisi Eksternal telah menambahkan laporan baru: test notif local host say', NULL, 'Internal', 0, NULL, NULL, NULL, 'a59fb91b-8ef6-41e3-92df-813748aae78b', '2025-09-28 13:15:55'),
('6c0d7bdb-e3c6-4fc3-b020-a4a1e2584d99', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"test proker\"', NULL, 'Eksternal', 0, NULL, NULL, '570a40fc-9ab6-11f0-b703-7845f2f0da73', NULL, '2025-09-26 08:53:58'),
('6d9aec1a-284a-4ce3-8202-b81cfa265530', 'Divisi Eksternal telah mengupdate laporan: test keuangan', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 11:03:29'),
('6e5f7282-6cac-41a3-9547-e0c721ca9171', 'DPA telah mengubah status Program Kerja \"Proker 2\" milik divisi Internal menjadi Sedang Berjalan', 'HMSI', 'Internal', 0, NULL, NULL, '48779a2a-9491-11f0-981a-442e1c01b37c', NULL, '2025-09-28 14:16:55'),
('72b8244c-1525-4e46-8f32-3dfb4701e820', 'Divisi Eksternal telah menghapus laporan: test notif', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 13:21:52'),
('744c7a2f-215c-4e52-ba7c-00cd3dc75867', 'Divisi Eksternal telah menambahkan laporan baru: test pdf', NULL, 'Internal', 0, NULL, NULL, NULL, 'f7747de4-b52a-48f2-b7e4-9c853e7663da', '2025-09-26 09:10:51'),
('76062edf-8e0d-4d74-92d3-b034636980b1', 'Divisi Eksternal telah menambahkan laporan baru: Program Kerja 10', NULL, 'Internal', 0, NULL, NULL, NULL, '9a316e7d-0c48-42ea-837d-0fbf8d09a7de', '2025-09-28 10:05:01'),
('7b8b3609-ddd0-467f-9619-442ccbaa1f7d', 'Divisi Eksternal telah menghapus laporan: test keuangan', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-28 10:03:42'),
('7deb4a62-a3ad-4c38-986a-d8d7e2209f5e', 'DPA memberi evaluasi pada laporan \"Program Kerja 10\"', 'HMSI', 'Eksternal', 1, NULL, '5487551e-5456-42a2-9b40-03620610eeeb', NULL, '9a316e7d-0c48-42ea-837d-0fbf8d09a7de', '2025-09-28 10:05:46'),
('8865d07c-7610-4159-b650-6a4f70857660', 'Divisi Eksternal telah menambahkan laporan baru: AAAAAAAAAAAAAA', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 12:42:25'),
('89344d81-ad0b-4d9e-a086-a42579c03161', 'Divisi Eksternal telah menghapus laporan: test evaluasi', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 12:23:36'),
('9017d86d-7a78-4673-b85d-3b0c13080ed0', 'DPA memberi evaluasi pada laporan \"test notif\"', NULL, 'Eksternal', 1, NULL, NULL, NULL, NULL, '2025-09-20 15:45:04'),
('910d92e3-6d5e-4da0-94db-24d8ae04588b', 'Divisi Eksternal telah menghapus laporan: debug 2', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 12:23:32'),
('93201aff-d256-4cf0-b290-7a6111443280', 'Divisi Eksternal telah menambahkan laporan baru: test evaluasi', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 03:07:53'),
('93795c8f-0bea-47be-a4dc-28d609563c98', 'Divisi Eksternal telah mengupdate laporan: debug', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 10:33:07'),
('9e4749d4-bd36-48e5-ac7b-3c37f6254696', 'Divisi Eksternal telah mengupdate laporan: Program Kerja 11', NULL, 'Internal', 0, NULL, NULL, NULL, '9a316e7d-0c48-42ea-837d-0fbf8d09a7de', '2025-09-28 13:58:15'),
('9fd565d7-0d25-430a-b3fa-4275ab9808c2', 'Divisi Eksternal telah menambahkan laporan baru: test pengeluaran ', NULL, 'Internal', 0, NULL, NULL, NULL, '6bed7d89-1030-4fd5-8532-00ce5fbe1b61', '2025-09-25 12:24:30'),
('a030f1de-96d2-11f0-981a-442e1c01b37c', 'HMSI (Internal) memberikan komentar baru pada evaluasi program \"Proker 3\"', 'DPA', 'Internal', 0, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-21 10:06:08'),
('a32de785-96d2-11f0-981a-442e1c01b37c', 'HMSI (Internal) memberikan komentar baru pada evaluasi program \"Proker 3\"', 'DPA', 'Internal', 0, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-21 10:06:13'),
('a52c48d5-9ca5-4065-ae17-f835ebfa9afc', 'Divisi Eksternal telah menambahkan laporan baru: test laporan', NULL, 'Internal', 0, NULL, NULL, NULL, 'f7a4176a-c169-45ea-9c34-5036156ac44d', '2025-09-26 10:36:58'),
('a77c2f87-96e3-11f0-981a-442e1c01b37c', 'HMSI (Internal) memberikan komentar baru pada evaluasi program \"Proker 3\"', 'DPA', 'Internal', 0, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-21 12:08:02'),
('a82d47a6-96d2-11f0-981a-442e1c01b37c', 'HMSI (Internal) memberikan komentar baru pada evaluasi program \"Proker 3\"', 'DPA', 'Internal', 0, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-21 10:06:22'),
('a8933f71-d247-44ca-98dd-1774e8bcf4de', 'Divisi Eksternal telah menambahkan laporan baru: AAAAAAAAAAAAAA', NULL, 'Internal', 0, NULL, NULL, NULL, 'd0c6a89d-b659-4104-bfe1-8e2a1a669890', '2025-09-25 11:43:53'),
('a990d844-223a-4fe3-ac6e-505775761d35', 'Divisi Eksternal telah menghapus laporan: debug', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 12:23:21'),
('ad71c95d-e2af-42c2-b07d-470ca0b1af32', 'Divisi Internal telah menghapus laporan: Technofest testing 1', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-21 06:36:03'),
('b02eb992-886d-4637-8020-3f1abccd34b5', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"Bina desa\"', NULL, 'Eksternal', 0, NULL, NULL, '744622e3-9ab6-11f0-b703-7845f2f0da73', NULL, '2025-09-26 08:54:47'),
('b0b5bbea-96d2-11f0-981a-442e1c01b37c', 'HMSI (Internal) memberikan komentar baru pada evaluasi program \"Proker 3\"', 'DPA', 'Internal', 0, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-21 10:06:36'),
('b12758a2-c7ee-4001-812c-12398e46bc66', 'Divisi Eksternal telah menghapus laporan: test 123345', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 13:07:43'),
('b2f29f8e-98bd-4d03-bb6d-4aebf9376121', 'Divisi Eksternal telah menambahkan laporan baru: test evaluasi', NULL, 'Internal', 0, NULL, NULL, NULL, '118b1c1a-b9c5-4080-9e28-04b0a95811bb', '2025-09-23 16:13:39'),
('b4fa7cd9-5b50-4d7e-a08b-c65a3fce0be2', 'Divisi Eksternal telah menambahkan laporan baru: test keuangan', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 12:24:48'),
('b594cdaf-9836-11f0-8165-dea394fc330b', 'HMSI (Eksternal) memberikan komentar baru pada evaluasi program \"HMSI FEST\"', 'DPA', 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-23 04:35:19'),
('b5bc6812-835c-4cc0-8be9-5cf6ae6b05ad', 'DPA memberi evaluasi pada laporan \"Technofest testing 1\"', NULL, 'Internal', 1, NULL, 'd5e377b7-36bf-4e23-ba71-cc6c62d4fbb1', NULL, NULL, '2025-09-20 15:47:06'),
('c1317040-f946-43e6-b55d-94c39da9bfa9', 'Divisi Eksternal telah menghapus laporan: debug', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 12:23:23'),
('c26e2b2d-c75d-4833-8455-49b0597e2040', 'Divisi Eksternal telah menghapus laporan: test login', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 12:42:37'),
('c530bb16-de28-4753-8ffd-dcaba567bed5', 'Divisi Eksternal telah menambahkan laporan baru: test keuangan', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-26 10:18:31'),
('cdef1d67-550f-43eb-87e0-486f562283d2', 'Divisi Eksternal telah menghapus laporan: test keuangan', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-28 10:03:32'),
('ce0a57c0-f76a-4f0b-8a41-8e4ad39b0689', 'Divisi Eksternal telah menambahkan laporan baru: test login', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-21 17:11:32'),
('cfff3d9b-415c-402c-a335-70209ada1030', 'Divisi Eksternal telah menghapus laporan: test keuangan', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 12:23:18'),
('d903267c-690d-49bd-a68a-3986b0ccf21f', 'DPA memberi evaluasi pada laporan \"test keuangan\"', 'HMSI', 'Eksternal', 0, NULL, 'ae1f9187-9f6e-4995-925d-eea9a3c9c873', NULL, NULL, '2025-09-28 09:58:53'),
('d9b6f561-602f-4e8d-9658-b59a6047dfb5', 'Divisi Eksternal telah menambahkan laporan baru: test laporan', NULL, 'Internal', 0, NULL, NULL, NULL, '45df83b8-4e6b-44d1-8e95-011798aa22cc', '2025-09-28 13:59:01'),
('dc6f5b3c-7998-4c79-8e5d-732190a59909', 'Divisi Eksternal telah menghapus laporan: AAAAAAAAAAAAAA', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 12:42:28'),
('e2acd0db-1b1c-4a91-baf9-dad3f87a9bee', 'HMSI (Internal) telah membuat Program Kerja baru: \"Proker 3\"', NULL, 'Internal', 1, NULL, NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', NULL, '2025-09-21 09:07:49'),
('e5ed267f-832c-451c-8c6e-2e51c05036d3', 'Divisi Eksternal telah mengupdate laporan: Program Kerja 11', NULL, 'Internal', 0, NULL, NULL, NULL, '9a316e7d-0c48-42ea-837d-0fbf8d09a7de', '2025-09-28 10:07:49'),
('e6323899-ea32-4513-9c5a-69274cb89ec5', 'DPA memberi evaluasi pada laporan \"AAAAAAAAAAAABbbbbbb\"', 'HMSI', 'Eksternal', 0, NULL, '864a3635-f53f-46f1-b184-1ee4bdbd6330', NULL, '1995361d-cb7e-4f1c-96fe-cccd89e44b2d', '2025-09-28 09:59:09'),
('e7655a96-e4ba-491a-869c-5977f922761b', 'DPA memberi evaluasi pada laporan \"testtttt notif\"', NULL, 'Internal', 1, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-20 08:41:29'),
('e8025c24-9169-42ba-8a2f-69b74a32e2f0', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"szxdfcgvhbjlkm;\"', NULL, 'Eksternal', 1, NULL, NULL, '9e554648-9ab6-11f0-b703-7845f2f0da73', NULL, '2025-09-26 08:55:57'),
('e80f5f55-3710-4b60-9da1-c5c6ddf9a99b', 'Divisi Eksternal telah menambahkan laporan baru: AAAAAAAAAAAAAA', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 10:44:26'),
('f3219f1f-9331-4ea1-a92b-a9ea5e8d9bc4', 'Divisi Internal telah menambahkan laporan baru: testtttttttt notif 4', NULL, 'Internal', 1, NULL, NULL, NULL, '444501ad-c260-41d5-87f0-db166369abc8', '2025-09-20 08:08:13'),
('f51406e0-9c52-11f0-909f-533e3d769ba5', 'HMSI (Eksternal) memberikan komentar baru pada evaluasi program \"szxdfcgvhbjlkm;\"', 'DPA', 'Internal', 0, NULL, '5487551e-5456-42a2-9b40-03620610eeeb', NULL, '9a316e7d-0c48-42ea-837d-0fbf8d09a7de', '2025-09-28 10:07:36'),
('f5df77b7-9c51-11f0-909f-533e3d769ba5', 'HMSI (Eksternal) memberikan komentar baru pada evaluasi program \"Proker eksternal 1\"', 'DPA', 'Internal', 0, NULL, '036c9513-a567-4a86-a05f-d0f327e24df3', NULL, 'f7a4176a-c169-45ea-9c34-5036156ac44d', '2025-09-28 10:00:27'),
('fa68a0a6-f757-4298-8286-c41b1acf90a9', 'Divisi Eksternal telah mengupdate laporan: Program Kerja 11', NULL, 'Internal', 0, NULL, NULL, NULL, '9a316e7d-0c48-42ea-837d-0fbf8d09a7de', '2025-09-28 13:16:23'),
('fbbb2613-b800-4bc2-96cc-a30a58e3290e', 'Divisi Eksternal telah menambahkan laporan baru: debug', NULL, 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-25 11:02:51');

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
  `Status` enum('Belum Dimulai','Sedang Berjalan','Selesai','Gagal') DEFAULT 'Belum Dimulai'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program_kerja`
--

INSERT INTO `program_kerja` (`id_ProgramKerja`, `Nama_ProgramKerja`, `Deskripsi`, `Tanggal_mulai`, `Tanggal_selesai`, `Penanggung_jawab`, `id_anggota`, `Dokumen_pendukung`, `Status`) VALUES
('0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Proker 3', '-', '2025-09-25', '2025-09-30', '-', '2311522033', NULL, 'Belum Dimulai'),
('0c3d6d76-95f9-11f0-981a-442e1c01b37c', 'test Notifff', '-', '2025-09-24', '2025-09-30', 'hbjkn', '2311522033', NULL, 'Sedang Berjalan'),
('279a187d-95eb-11f0-981a-442e1c01b37c', 'test notif', '-', '2025-09-26', '2025-09-30', 'afiq', '2311522032', NULL, 'Selesai'),
('3ab0989e-9496-11f0-981a-442e1c01b37c', 'Proker eksternal 1', '-', '2025-09-13', '2025-10-29', 'jakhel', '2311522032', NULL, 'Sedang Berjalan'),
('48779a2a-9491-11f0-981a-442e1c01b37c', 'Proker 2', '-', '2025-09-30', '2025-10-31', 'Hafizh', '2311522033', 'dokumen_pendukung-1758201201969-982370291.png', 'Sedang Berjalan'),
('570a40fc-9ab6-11f0-b703-7845f2f0da73', 'test proker', 'ssfafs', '2025-09-25', '2025-10-09', 'cell', '2311522032', NULL, 'Sedang Berjalan'),
('62ae6a36-9ab6-11f0-b703-7845f2f0da73', 'testt', 'asfdb', '2025-09-25', '2025-10-07', 'sdfcdvg', '2311522032', NULL, 'Sedang Berjalan'),
('744622e3-9ab6-11f0-b703-7845f2f0da73', 'Bina desa', 'dsfvdb', '2025-09-23', '2025-10-08', 'adsfgt', '2311522032', NULL, 'Sedang Berjalan'),
('7a3c598f-96ca-11f0-981a-442e1c01b37c', 'Proker 3', 'ga ada', '2025-09-10', '2025-09-24', 'ga ada', '2311522033', NULL, 'Sedang Berjalan'),
('8c580c89-9ab6-11f0-b703-7845f2f0da73', 'fti berbagi', 'sqwdcvcf', '2025-09-17', '2025-10-08', 'sadc', '2311522032', NULL, 'Sedang Berjalan'),
('9ae3807a-956e-11f0-981a-442e1c01b37c', 'HMSI FEST', '-', '2025-09-30', '2025-10-14', 'alex', '2311522032', 'dokumen_pendukung-1758296257954-72663265.pdf', 'Gagal'),
('9e554648-9ab6-11f0-b703-7845f2f0da73', 'szxdfcgvhbjlkm;', 'fxdfgchvjbk', '2025-09-19', '2025-10-08', 'dxcfghbj', '2311522032', NULL, 'Sedang Berjalan'),
('a260f2eb-9490-11f0-981a-442e1c01b37c', 'Proker 1', '-', '2025-09-19', '2025-09-23', 'Afiq', '2311522033', 'dokumen_pendukung-1758200923261-928409523.pdf', 'Belum Dimulai'),
('abc1ba2e-99bc-11f0-999f-6daf25adf4c1', 'test', 'ga ada', '2025-09-26', '2025-09-29', 'Diva', '2311522032', NULL, 'Gagal'),
('c2518baa-99bc-11f0-999f-6daf25adf4c1', 'technofeat', 'ga ada', '2025-09-28', '2025-10-10', 'afiq', '2311522032', NULL, 'Sedang Berjalan'),
('cbb9a132-98b1-11f0-999f-6daf25adf4c1', 'test tanggal proker', 'keren abiez', '2025-09-25', '2025-10-09', 'fatih', '2311522032', NULL, 'Sedang Berjalan');

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
  `foto_profile` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `foto_focus` varchar(50) DEFAULT 'center 50%',
  `theme` enum('light','dark') DEFAULT 'light'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_anggota`, `nama`, `email`, `password`, `role`, `divisi`, `foto_profile`, `updated_at`, `foto_focus`, `theme`) VALUES
('23115111000', 'Alex', 'hmsi@hmail.com', '$2b$10$un7qXvgsofKpBFMZ50uJCevhg0R76E8zSoUTpDx/BitTkD.FRMNea', 'DPA', NULL, NULL, '2025-09-26 08:01:36', 'center 50%', 'light'),
('2311522002', 'Fajri', 'admin@example.com', 'admin123', 'Admin', NULL, 'uploads/profile/1758817821214-838176852.jpg', '2025-09-25 17:40:12', 'center 50%', 'light'),
('2311522032', 'Ridho Dwi Syahputra', 'eksternal@gmail.com', '$2b$10$IKLgcUfh0BQX8PQRB1HLcO1SuuPgMEfXEIPgykJNR7h4jAbvHf.vm', 'HMSI', 'Eksternal', 'uploads/profile/1759053604967-737062880.png', '2025-09-28 10:00:04', 'center 50%', 'light'),
('2311522033', 'Ketua Divisi Internal', 'internal@gmail.com', 'hmsi123', 'HMSI', 'Internal', NULL, '2025-09-22 16:48:31', 'center 50%', 'light'),
('2311523020', 'H.Afiq Jakhel', 'dpa@gmail.com', '$2b$10$rqXdZe1/OuGanuOxO1wK9uk7O1t5UPoXIa332kVHAbqabIZP31NeC', 'DPA', NULL, 'uploads/profile/1758564758477-381273319.jpg', '2025-09-23 03:42:47', 'center 50%', 'light');

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
-- Indexes for table `keuangan`
--
ALTER TABLE `keuangan`
  ADD PRIMARY KEY (`id_keuangan`),
  ADD KEY `FK_Keuangan_Laporan` (`id_laporan`),
  ADD KEY `FK_Keuangan_User` (`id_anggota`);

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
-- Constraints for table `keuangan`
--
ALTER TABLE `keuangan`
  ADD CONSTRAINT `FK_Keuangan_Laporan` FOREIGN KEY (`id_laporan`) REFERENCES `laporan` (`id_laporan`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_Keuangan_User` FOREIGN KEY (`id_anggota`) REFERENCES `user` (`id_anggota`) ON DELETE SET NULL ON UPDATE CASCADE;

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
