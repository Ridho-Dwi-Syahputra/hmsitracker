-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 25, 2025 at 05:22 AM
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
('4ac9b112-6fee-44bd-a0c8-1cce44922349', 'salahhh inii', NULL, '2311523020', 'Revisi', '2025-09-23', '118b1c1a-b9c5-4080-9e28-04b0a95811bb'),
('d5e377b7-36bf-4e23-ba71-cc6c62d4fbb1', 'gsavdacveuicvdchsvcyeccbdcbhdb', NULL, '2311523020', 'Revisi', '2025-09-20', NULL),
('ea4c6373-dba7-4f38-a292-a7c11e146a78', 'jelekkk', 'ma adoo jelekk', '2311523020', 'Revisi', '2025-09-20', '19e74317-6e15-4513-bd59-3ee4351692c1');

-- --------------------------------------------------------

--
-- Table structure for table `keuangan`
--

CREATE TABLE `keuangan` (
  `id_keuangan` varchar(50) NOT NULL,
  `tanggal` date DEFAULT curdate(),
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
('8a28e221-5f14-49ff-abe9-363b19af9a2f', '2025-09-24', 'Pemasukan', 'pinjol', 200000000.00, NULL, NULL, '2025-09-24 16:19:41', '2025-09-24 16:48:41');

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

INSERT INTO `laporan` (`id_laporan`, `judul_laporan`, `deskripsi_kegiatan`, `sasaran`, `waktu_tempat`, `dana_digunakan`, `sumber_dana`, `sumber_dana_lainnya`, `dana_terpakai`, `persentase_kualitatif`, `persentase_kuantitatif`, `kendala`, `solusi`, `dokumentasi`, `id_ProgramKerja`, `divisi`, `tanggal`, `dokumentasi_mime`) VALUES
('118b1c1a-b9c5-4080-9e28-04b0a95811bb', 'test evaluasi', '-', '', '09:00 - 10:00 WIB, gedung C', '1000000', 'Uang Kas HMSI', NULL, NULL, '', '', '', '', NULL, '279a187d-95eb-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-23', NULL),
('19e74317-6e15-4513-bd59-3ee4351692c1', 'testtttt notif', '-', '', '08-00', '', '', NULL, NULL, '', '', '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('2293aeeb-043f-4190-a48f-6de582c1f15c', 'Technofest testing 2', '-', '', '08-00', '', '', NULL, NULL, '', '', '', '', NULL, 'a260f2eb-9490-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('364c658b-95eb-11f0-981a-442e1c01b37c', 'pdf', 'testt', '', '08-00', '', 'pinjol', NULL, NULL, '', '', '', '', NULL, '279a187d-95eb-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-20', NULL),
('3fa7ea5f-6b0e-4d35-8a9c-6caa7c3b8fa2', 'test notiff', '-', '', '09', '', '', NULL, NULL, '', '', '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('444501ad-c260-41d5-87f0-db166369abc8', 'testtttttttt notif 4', '-', '', '08-00', '', '', NULL, NULL, '', '', '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL),
('806e9909-e604-465a-8b94-2b6421cb3a62', 'test evaluasi', 'ga ada', '', '09:00-12:00 WIB, gedung C', '100000', 'Uang Kas HMSI', NULL, NULL, '', '', '', '', NULL, '279a187d-95eb-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-25', NULL),
('b7e33127-8bcd-466b-bc5a-d83900bf3c32', 'laporan 1', 'gaa da', '', '08-00', '', '', NULL, NULL, '', '', '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-21', NULL),
('c4c4ad09-166b-47e0-8874-223558e28cce', 'bayar pinjol 2', 'sssd', '', '09:00-12:00 WIB, gedung C', '3000000', 'Uang Kas HMSI', NULL, NULL, '', '', '', '', NULL, '279a187d-95eb-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-25', NULL),
('cf3371f4-949c-11f0-981a-442e1c01b37c', 'test tanggal', '-', '-', '08-000', '', '', NULL, NULL, '34', '20', '-', '-', 'dokumentasi-1758206268668-273573665.pdf', '3ab0989e-9496-11f0-981a-442e1c01b37c', '', '2025-09-18', NULL),
('e8b358bf-0071-46a6-9b32-b50bed406be9', 'bayar pinjol', 'mjadjoa', '', '09:00-12:00 WIB, gedung C', '2000000', 'Uang Kas HMSI', NULL, NULL, '', '', '', '', NULL, '3ab0989e-9496-11f0-981a-442e1c01b37c', 'Eksternal', '2025-09-24', NULL),
('f296bbac-e89d-4b1c-9eca-af5ad229e5e4', 'Technofest testing 3', '-', '', '08-00', '', '', NULL, NULL, '', '', '', '', NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', 'Internal', '2025-09-20', NULL);

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
('01b4ca81-970e-11f0-981a-442e1c01b37c', 'HMSI (Eksternal) memberikan komentar baru pada evaluasi program \"HMSI FEST\"', 'DPA', 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-21 17:11:12'),
('10c03292-4f36-4c9e-a80b-0c988ef29e50', 'DPA memberi evaluasi pada laporan \"keuangan 1\"', NULL, 'Eksternal', 1, NULL, NULL, NULL, NULL, '2025-09-21 10:42:02'),
('1d9a2228-aaef-46f7-8acc-54e765806562', 'Divisi Internal telah menambahkan laporan baru: test notiff', NULL, 'Internal', 1, NULL, NULL, NULL, '3fa7ea5f-6b0e-4d35-8a9c-6caa7c3b8fa2', '2025-09-20 08:07:15'),
('22191db9-570d-4732-8406-f445de1df066', 'Divisi Eksternal telah menambahkan laporan baru: bayar pinjol', NULL, 'Internal', 0, NULL, NULL, NULL, 'e8b358bf-0071-46a6-9b32-b50bed406be9', '2025-09-24 16:22:31'),
('2528d177-18fe-461b-9222-c7dfce4b3b83', 'HMSI (Internal) telah membuat Program Kerja baru: \"test Notifff\"', NULL, 'Internal', 1, NULL, NULL, '0c3d6d76-95f9-11f0-981a-442e1c01b37c', NULL, '2025-09-20 08:08:38'),
('2cecaa54-75e7-4ce8-b285-7075e8fd908c', 'Divisi Eksternal telah menambahkan laporan baru: bayar pinjol 2', NULL, 'Internal', 0, NULL, NULL, NULL, 'c4c4ad09-166b-47e0-8874-223558e28cce', '2025-09-25 03:06:03'),
('30f7e78c-c7cf-4580-a9b3-4302bd4b430a', 'DPA telah mengubah status Program Kerja \"test notif\" milik divisi Eksternal menjadi Selesai', 'HMSI', 'Eksternal', 1, NULL, NULL, '279a187d-95eb-11f0-981a-442e1c01b37c', NULL, '2025-09-24 03:48:35'),
('39b6114a-739c-459a-bb0f-1b0afc335d5c', 'Divisi Eksternal telah mengupdate laporan: keuangan 1', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 04:45:18'),
('40fc6d8f-0521-468e-b9d1-d5324abb0a1e', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"test\"', NULL, 'Eksternal', 0, NULL, NULL, 'abc1ba2e-99bc-11f0-999f-6daf25adf4c1', NULL, '2025-09-25 03:06:39'),
('4481f63d-733f-46d6-a5d8-2770c707fc47', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"technofeat\"', NULL, 'Eksternal', 0, NULL, NULL, 'c2518baa-99bc-11f0-999f-6daf25adf4c1', NULL, '2025-09-25 03:07:17'),
('4997b5bc-d819-4b2b-9ac2-3a40319f0948', 'Divisi Internal telah menambahkan laporan baru: testtttt notif', NULL, 'Internal', 1, NULL, NULL, NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-20 08:06:59'),
('4a99e5ba-d464-444f-bdde-d2f93963eb27', 'Divisi Eksternal telah menambahkan laporan baru: bbbbbbbbbbbbbbbbbb', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 13:07:59'),
('4bbbb184-96d7-11f0-981a-442e1c01b37c', 'HMSI (Eksternal) memberikan komentar baru pada evaluasi program \"HMSI FEST\"', 'DPA', 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-21 10:39:34'),
('4bc65c72-0695-4e77-9e09-cd15fb377549', 'Divisi Eksternal telah mengupdate laporan: test evaluasi', NULL, 'Internal', 0, NULL, NULL, NULL, '118b1c1a-b9c5-4080-9e28-04b0a95811bb', '2025-09-24 16:21:59'),
('4f35d510-04bd-4b37-8d12-c2f5ca767258', 'Divisi Eksternal telah menambahkan laporan baru: test 123345', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 13:07:39'),
('528a86e8-4692-4f42-8f4e-115a9dfe16ad', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"testt proker\"', NULL, 'Eksternal', 1, NULL, NULL, NULL, NULL, '2025-09-21 17:10:49'),
('52a5a464-5f97-4c95-ac7e-3a52c98aaf6e', 'Divisi Eksternal telah menghapus laporan: test tanggal', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 11:26:43'),
('598ec634-b7b4-4730-9132-336e0e826ab2', 'DPA memberi evaluasi pada laporan \"keuangan 1\"', NULL, 'Eksternal', 1, NULL, NULL, NULL, NULL, '2025-09-21 11:18:19'),
('5e9708b9-8759-4844-b110-e569f4a78336', 'HMSI (Eksternal) telah membuat Program Kerja baru: \"test tanggal proker\"', NULL, 'Eksternal', 0, NULL, NULL, 'cbb9a132-98b1-11f0-999f-6daf25adf4c1', NULL, '2025-09-23 19:16:20'),
('60e853b7-1cec-4cab-a182-4cd6156028a6', 'Divisi Internal telah menambahkan laporan baru: laporan 1', NULL, 'Internal', 1, NULL, NULL, NULL, 'b7e33127-8bcd-466b-bc5a-d83900bf3c32', '2025-09-21 09:08:08'),
('618c7e54-8036-40a0-adea-71227605ca10', 'DPA memberi evaluasi pada laporan \"test evaluasi\"', 'HMSI', 'Eksternal', 1, NULL, '4ac9b112-6fee-44bd-a0c8-1cce44922349', NULL, '118b1c1a-b9c5-4080-9e28-04b0a95811bb', '2025-09-23 16:15:22'),
('6322c669-faff-45f4-abec-da637c1d1451', 'Divisi Eksternal telah menghapus laporan: bbbbbbbbbbbbbbbbbb', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 13:08:20'),
('6468f7c8-b3bb-4078-80d4-94723d858811', 'Divisi Eksternal telah menghapus laporan: keuangan 1', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 12:41:43'),
('72b8244c-1525-4e46-8f32-3dfb4701e820', 'Divisi Eksternal telah menghapus laporan: test notif', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 13:21:52'),
('8865d07c-7610-4159-b650-6a4f70857660', 'Divisi Eksternal telah menambahkan laporan baru: AAAAAAAAAAAAAA', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 12:42:25'),
('9017d86d-7a78-4673-b85d-3b0c13080ed0', 'DPA memberi evaluasi pada laporan \"test notif\"', NULL, 'Eksternal', 1, NULL, NULL, NULL, NULL, '2025-09-20 15:45:04'),
('93201aff-d256-4cf0-b290-7a6111443280', 'Divisi Eksternal telah menambahkan laporan baru: test evaluasi', NULL, 'Internal', 0, NULL, NULL, NULL, '806e9909-e604-465a-8b94-2b6421cb3a62', '2025-09-25 03:07:53'),
('a030f1de-96d2-11f0-981a-442e1c01b37c', 'HMSI (Internal) memberikan komentar baru pada evaluasi program \"Proker 3\"', 'DPA', 'Internal', 0, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-21 10:06:08'),
('a32de785-96d2-11f0-981a-442e1c01b37c', 'HMSI (Internal) memberikan komentar baru pada evaluasi program \"Proker 3\"', 'DPA', 'Internal', 0, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-21 10:06:13'),
('a77c2f87-96e3-11f0-981a-442e1c01b37c', 'HMSI (Internal) memberikan komentar baru pada evaluasi program \"Proker 3\"', 'DPA', 'Internal', 0, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-21 12:08:02'),
('a82d47a6-96d2-11f0-981a-442e1c01b37c', 'HMSI (Internal) memberikan komentar baru pada evaluasi program \"Proker 3\"', 'DPA', 'Internal', 0, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-21 10:06:22'),
('ad71c95d-e2af-42c2-b07d-470ca0b1af32', 'Divisi Internal telah menghapus laporan: Technofest testing 1', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-21 06:36:03'),
('b0b5bbea-96d2-11f0-981a-442e1c01b37c', 'HMSI (Internal) memberikan komentar baru pada evaluasi program \"Proker 3\"', 'DPA', 'Internal', 0, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-21 10:06:36'),
('b12758a2-c7ee-4001-812c-12398e46bc66', 'Divisi Eksternal telah menghapus laporan: test 123345', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 13:07:43'),
('b2f29f8e-98bd-4d03-bb6d-4aebf9376121', 'Divisi Eksternal telah menambahkan laporan baru: test evaluasi', NULL, 'Internal', 0, NULL, NULL, NULL, '118b1c1a-b9c5-4080-9e28-04b0a95811bb', '2025-09-23 16:13:39'),
('b594cdaf-9836-11f0-8165-dea394fc330b', 'HMSI (Eksternal) memberikan komentar baru pada evaluasi program \"HMSI FEST\"', 'DPA', 'Internal', 0, NULL, NULL, NULL, NULL, '2025-09-23 04:35:19'),
('b5bc6812-835c-4cc0-8be9-5cf6ae6b05ad', 'DPA memberi evaluasi pada laporan \"Technofest testing 1\"', NULL, 'Internal', 1, NULL, 'd5e377b7-36bf-4e23-ba71-cc6c62d4fbb1', NULL, NULL, '2025-09-20 15:47:06'),
('c26e2b2d-c75d-4833-8455-49b0597e2040', 'Divisi Eksternal telah menghapus laporan: test login', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 12:42:37'),
('ce0a57c0-f76a-4f0b-8a41-8e4ad39b0689', 'Divisi Eksternal telah menambahkan laporan baru: test login', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-21 17:11:32'),
('dc6f5b3c-7998-4c79-8e5d-732190a59909', 'Divisi Eksternal telah menghapus laporan: AAAAAAAAAAAAAA', NULL, 'Internal', 1, NULL, NULL, NULL, NULL, '2025-09-23 12:42:28'),
('e2acd0db-1b1c-4a91-baf9-dad3f87a9bee', 'HMSI (Internal) telah membuat Program Kerja baru: \"Proker 3\"', NULL, 'Internal', 1, NULL, NULL, '0376b2cd-95f1-11f0-981a-442e1c01b37c', NULL, '2025-09-21 09:07:49'),
('e7655a96-e4ba-491a-869c-5977f922761b', 'DPA memberi evaluasi pada laporan \"testtttt notif\"', NULL, 'Internal', 1, NULL, 'ea4c6373-dba7-4f38-a292-a7c11e146a78', NULL, '19e74317-6e15-4513-bd59-3ee4351692c1', '2025-09-20 08:41:29'),
('f3219f1f-9331-4ea1-a92b-a9ea5e8d9bc4', 'Divisi Internal telah menambahkan laporan baru: testtttttttt notif 4', NULL, 'Internal', 1, NULL, NULL, NULL, '444501ad-c260-41d5-87f0-db166369abc8', '2025-09-20 08:08:13');

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
('48779a2a-9491-11f0-981a-442e1c01b37c', 'Proker 2', '-', '2025-09-30', '2025-10-31', 'Hafizh', '2311522033', 'dokumen_pendukung-1758201201969-982370291.png', 'Selesai'),
('7a3c598f-96ca-11f0-981a-442e1c01b37c', 'Proker 3', 'ga ada', '2025-09-10', '2025-09-24', 'ga ada', '2311522033', NULL, 'Sedang Berjalan'),
('9ae3807a-956e-11f0-981a-442e1c01b37c', 'HMSI FEST', '-', '2025-09-30', '2025-10-14', 'alex', '2311522032', 'dokumen_pendukung-1758296257954-72663265.pdf', 'Gagal'),
('a260f2eb-9490-11f0-981a-442e1c01b37c', 'Proker 1', '-', '2025-09-19', '2025-09-23', 'Afiq', '2311522033', 'dokumen_pendukung-1758200923261-928409523.pdf', 'Belum Dimulai'),
('abc1ba2e-99bc-11f0-999f-6daf25adf4c1', 'test', 'ga ada', '2025-09-26', '2025-09-29', 'Diva', '2311522032', NULL, 'Belum Dimulai'),
('c2518baa-99bc-11f0-999f-6daf25adf4c1', 'technofeat', 'ga ada', '2025-09-28', '2025-10-10', 'afiq', '2311522032', NULL, 'Belum Dimulai'),
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
('2311522032', 'Ridho Dwi Syahputra', 'eksternal@gmail.com', '$2b$10$IKLgcUfh0BQX8PQRB1HLcO1SuuPgMEfXEIPgykJNR7h4jAbvHf.vm', 'HMSI', 'Eksternal', 'uploads/profile/1758599250284-903610089.jpg', '2025-09-23 03:47:30', 'center 50%', 'light'),
('2311522033', 'Ketua Divisi Internal', 'internal@gmail.com', 'hmsi123', 'HMSI', 'Internal', NULL, '2025-09-22 16:48:31', 'center 50%', 'light'),
('2311523020', 'H.Afiq Jakhel', 'dpa@gmail.com', '$2b$10$rqXdZe1/OuGanuOxO1wK9uk7O1t5UPoXIa332kVHAbqabIZP31NeC', 'DPA', NULL, 'uploads/profile/1758564758477-381273319.jpg', '2025-09-23 03:42:47', 'center 50%', 'light'),
('8d43d10d-9464-11f0-981a-442e1c01b37c', 'Admin User', 'admin', 'admin123', 'Admin', NULL, NULL, '2025-09-21 14:50:35', 'center 50%', 'light');

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
