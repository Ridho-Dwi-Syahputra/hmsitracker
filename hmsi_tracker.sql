-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 11, 2025 at 06:55 AM
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
('a63575fb-b983-4cdc-8cb4-7d599f513e51', 'revisiiiiii', NULL, NULL, 'Revisi', '2025-10-10', NULL, '2025-10-11 00:29:53'),
('a9c010b4-efd9-4414-b598-642868aa1c49', 'revisiiii', 'iyaaaaaaa', NULL, 'Revisi', '2025-10-10', '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-11 11:17:54');

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
('0597ed4d-2388-41ff-8d89-7694f222d4c7', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:50', '2025-10-10 03:52:50'),
('131c219e-6581-42d0-b794-6b0cff4421f5', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:49', '2025-10-10 03:52:49'),
('1416414c-c8d1-4d7c-9393-0578cffc3508', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:51', '2025-10-10 03:52:51'),
('17356b6c-b2f5-4cd8-bc89-677c6e2543b1', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:50', '2025-10-10 03:52:50'),
('1ebaff03-c422-40d8-ba33-fdfd75ecafed', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: testtt ', 20000.00, '9e95aaa4-28b9-43b0-b09b-6dfb2687faa1', '2311522032', '2025-10-10 08:20:36', '2025-10-10 08:20:36'),
('20224041-1f4d-4a47-bfb8-709c67a0e17c', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:51', '2025-10-10 03:52:51'),
('2c95e4d9-2630-4f4e-a05d-b302ab845e75', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:48', '2025-10-10 03:52:48'),
('45944d4c-d553-40df-8ae7-92676d19e9db', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:51', '2025-10-10 03:52:51'),
('534dec13-cb21-45b8-a90a-ae9ab7fb717f', '2025-10-08', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234567', 200000.00, NULL, '2311522032', '2025-10-08 12:52:55', '2025-10-08 12:52:55'),
('53c2cb25-a08f-4bcb-9ee2-71196b5b5b62', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:48', '2025-10-10 03:52:48'),
('63362ebb-254b-43da-86a7-c2136164f133', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:51', '2025-10-10 03:52:51'),
('63e3d7e9-89ef-4353-8cb8-c8fd03874da9', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2311522032', '2025-10-10 07:17:28', '2025-10-10 07:17:28'),
('6775930a-b8ce-4863-b0c7-bf661aac9071', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 12345', 20000.00, NULL, '2311522032', '2025-10-10 03:53:01', '2025-10-10 03:53:01'),
('6929c513-7430-4ffb-9918-6ce28415e05a', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:50', '2025-10-10 03:52:50'),
('699267d5-c4ac-4383-9e63-364ed15f5b89', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234567890sadfdghtjyuioiuyetwrqe', 1000000.00, '657be243-e640-4ffc-bd30-f06ecb8222e5', '2311522032', '2025-10-10 15:48:14', '2025-10-10 15:48:14'),
('6b255879-28cf-4ff9-9055-07e1c900f403', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:52', '2025-10-10 03:52:52'),
('6b7b745b-52ff-41bf-b1f3-be7a59bfb8fd', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: tesstttttttttttttttttttgvcx', 10000.00, '1084f65b-3c31-4de3-9da4-bb94404656e3', '2311522032', '2025-10-10 08:42:18', '2025-10-10 08:42:18'),
('7258a87d-33bf-47a4-9508-c3085c036e59', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 12345', 20000.00, NULL, '2311522032', '2025-10-10 03:53:02', '2025-10-10 03:53:02'),
('735cb45b-5f01-4d13-ab1b-0edfaf7b9987', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 12345', 20000.00, NULL, '2311522032', '2025-10-10 03:53:02', '2025-10-10 03:53:02'),
('736ad446-fd13-485d-a70a-a6f3268c1ae8', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:50', '2025-10-10 03:52:50'),
('7a0dec3a-c13a-41fe-956d-6ae78c13c502', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:48', '2025-10-10 03:52:48'),
('8b961864-f7d7-4c16-9af5-135418b8f549', '2025-10-08', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234567890', 2900000.00, NULL, '2311522032', '2025-10-08 13:06:18', '2025-10-08 13:06:18'),
('8e4940d7-60e9-48e2-b950-8be40bb41cfc', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:50', '2025-10-10 03:52:50'),
('996160f1-ddc7-4c4e-a8e9-29bb539c99b6', '2025-10-08', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 10000000.00, NULL, '2311522032', '2025-10-08 08:51:26', '2025-10-08 14:22:40'),
('b7c494ed-7a6e-498f-b8c8-aa7c95d002ba', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:50', '2025-10-10 03:52:50'),
('bd62ae61-f03e-4c91-8700-598abb8c4530', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:51', '2025-10-10 03:52:51'),
('c11d30a7-b93d-4857-8eba-e6969fc0addb', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:51', '2025-10-10 03:52:51'),
('c79331df-a9a9-4a5e-b73a-8050d771e767', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 12345', 20000.00, NULL, '2311522032', '2025-10-10 03:53:02', '2025-10-10 03:53:02'),
('ccef813b-24c7-4f5c-9322-612c1d6d32f4', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:45', '2025-10-10 03:52:45'),
('ecc15297-ca96-4e1b-b65c-188944a757d0', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 1234', 20000.00, NULL, '2311522032', '2025-10-10 03:52:47', '2025-10-10 03:52:47'),
('f62fc1b6-8d09-4ef8-9447-65815dff9e5f', '2025-10-10', 'Pengeluaran', 'Pengeluaran dari Laporan: 12345545645', 20000.00, '2bcd7ad1-dc69-4606-b96e-30ae37914494', '2311522032', '2025-10-10 08:23:21', '2025-10-10 08:23:21');

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
('1084f65b-3c31-4de3-9da4-bb94404656e3', 'tesstttttttttttttttttttgvcx', 'svaavsa', 'asvvsasv', 'scdcsd', '10000', 'Uang Kas HMSI', NULL, 10000.00, '40', '20', 'csddcsdc', 'cvsdsd', ' svsva ', 'asvavs', 'fti_unand-24129eb4-e16b-40d4-9ecb-8f7f5b78d616.jpg', 'aebb616d-a596-11f0-97bb-432a08ab4041', '2025-10-10', NULL, 2),
('2bcd7ad1-dc69-4606-b96e-30ae37914494', '12345545645', 'svfsvf', 'vssd', 'ass', '20000', 'Uang Kas HMSI', NULL, 20000.00, '20', '20', 'fafas', 'fsfa', 'vassfa', 'vsdvds', 'test file-371491ec-81ee-485b-904d-c352be8214ba.pdf', 'aebb616d-a596-11f0-97bb-432a08ab4041', '2025-10-10', NULL, 2),
('6299599a-c586-4b2f-a117-0c988b3fa6c9', '1234', 'vssvd', 'vsasvx', '32ewrefdv', '20000', 'Uang Kas HMSI', NULL, 20000.00, '20', '20', 'adad', 'avssavd', 'asfasf', 'vasas', 'test file-5ba00601-485b-474e-a147-b6ce2306a8b1.pdf', 'd6fafd64-a5a7-11f0-97bb-432a08ab4041', '2025-10-10', NULL, 2),
('657be243-e640-4ffc-bd30-f06ecb8222e5', '1234567890sadfdghtjyuioiuyetwrqe', 'csacs', 'amllaxd', 'sgdsgdsgd', '1000000', 'Uang Kas HMSI', NULL, 1000000.00, '20', '20', 'sknkd', 'sc,kscn', 'akmakmx', 'a axmn', 'WhatsApp Image 2025-09-23 at 10.41.02_df38f28f-e4035ae2-2554-46e6-a26c-7b07e54d74f5.jpg', '954603bb-a55d-11f0-97bb-432a08ab4041', '2025-10-10', NULL, 2),
('9e95aaa4-28b9-43b0-b09b-6dfb2687faa1', 'testtt ', 'feswdf', 'svsd', '32ewrefdv', '20000', 'Uang Kas HMSI', NULL, 20000.00, '20', '20', 'cscs', 'dvssdv', 'csdsdc', 'scsca', 'test file-eda9ec2f-e212-40d6-9fef-51137c0ba2dd.pdf', 'd6fafd64-a5a7-11f0-97bb-432a08ab4041', '2025-10-10', NULL, 2);

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
('20530c05-c47e-44b7-a737-4c96842d2cd3', 'Divisi Eksternal menambahkan laporan baru: \"testtt \"', NULL, 0, NULL, NULL, NULL, '9e95aaa4-28b9-43b0-b09b-6dfb2687faa1', '2025-10-10 08:20:36', 2, 'DPA'),
('219436b3-56e0-4c7d-a438-a54126565a35', 'DPA memberi evaluasi pada laporan \"1234\"', NULL, 1, NULL, 'a9c010b4-efd9-4414-b598-642868aa1c49', NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-10 07:56:39', 2, 'HMSI'),
('374c72a8-a5ff-11f0-97bb-432a08ab4041', 'Divisi Eksternal telah memberikan revisi atau komentar baru untuk laporan \"1234\".', NULL, 0, NULL, 'a9c010b4-efd9-4414-b598-642868aa1c49', NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-10 17:33:18', 2, 'DPA'),
('389e4c88-48ce-4675-80c4-33401e02be0a', 'Divisi Eksternal menambahkan laporan baru: \"12345545645\"', NULL, 0, NULL, NULL, NULL, '2bcd7ad1-dc69-4606-b96e-30ae37914494', '2025-10-10 08:23:21', 2, 'DPA'),
('39bc24fb-046a-4f6e-9c6d-a6fbfa84b799', 'Divisi Eksternal menghapus laporan: \"1234567890\"', NULL, 0, NULL, NULL, NULL, NULL, '2025-10-10 07:55:53', 2, 'DPA'),
('438e9b07-a659-11f0-97bb-432a08ab4041', 'Divisi Eksternal telah memberikan revisi atau komentar baru untuk laporan \"1234\".', NULL, 0, NULL, 'a9c010b4-efd9-4414-b598-642868aa1c49', NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-11 04:17:54', 2, 'DPA'),
('4f022778-2b57-4213-b665-f840d93f51c7', 'Divisi Eksternal menambahkan laporan baru: \"1234\"', NULL, 0, NULL, NULL, NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-10 07:17:28', 2, 'DPA'),
('572d178b-4b29-40d5-a1ea-cad91a0a6398', 'Divisi Eksternal menambahkan Program Kerja baru: \"csasc\"', NULL, 0, NULL, NULL, NULL, NULL, '2025-10-10 07:07:49', 2, 'DPA'),
('5986c1e0-b9ed-4829-b03c-971000735b07', 'Divisi Eksternal menambahkan laporan baru: \"tesstttttttttttttttttttgvcx\"', NULL, 0, NULL, NULL, NULL, '1084f65b-3c31-4de3-9da4-bb94404656e3', '2025-10-10 08:42:18', 2, 'DPA'),
('6a53a3f5-a64e-11f0-97bb-432a08ab4041', 'Divisi Eksternal telah memberikan revisi atau komentar baru untuk laporan \"1234\".', NULL, 0, NULL, 'a9c010b4-efd9-4414-b598-642868aa1c49', NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-11 03:00:14', 2, 'DPA'),
('7ae81fd1-4184-43f2-aeb9-d629e13d347a', 'Divisi Eksternal menghapus laporan: \"1234\"', NULL, 0, NULL, NULL, NULL, NULL, '2025-10-10 08:05:50', 2, 'DPA'),
('7df49644-0a9d-405b-80a9-8c66e6ed2042', 'Divisi Eksternal menghapus laporan: \"testt recisiii 33\"', NULL, 0, NULL, NULL, NULL, NULL, '2025-10-10 08:22:39', 2, 'DPA'),
('8057cc7b-9521-43bb-afea-78c06cc04001', 'Divisi Eksternal menambahkan laporan baru: \"1234567890sadfdghtjyuioiuyetwrqe\"', NULL, 0, NULL, NULL, NULL, '657be243-e640-4ffc-bd30-f06ecb8222e5', '2025-10-10 15:48:14', 2, 'DPA'),
('8a0b633c-a64e-11f0-97bb-432a08ab4041', 'Divisi Eksternal telah memberikan revisi atau komentar baru untuk laporan \"1234\".', NULL, 0, NULL, 'a9c010b4-efd9-4414-b598-642868aa1c49', NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-11 03:01:07', 2, 'DPA'),
('a57c7503-606d-48d6-86f2-6e5b2fa16a8d', 'Divisi Eksternal menghapus laporan: \"1234\"', NULL, 0, NULL, NULL, NULL, NULL, '2025-10-10 07:03:22', 2, 'DPA'),
('aef1dddf-c221-41bf-9ed5-dbf0da3f88a5', 'Divisi Eksternal menambahkan Program Kerja baru: \"hmsi fest\"', NULL, 0, NULL, NULL, NULL, NULL, '2025-10-10 16:15:35', 2, 'DPA'),
('bd63c04f-9789-4142-a44d-0e5c3615be57', 'Divisi Eksternal memperbarui laporan: \"1234\"', NULL, 0, NULL, NULL, NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-10 07:54:40', 2, 'DPA'),
('bf91c918-11db-44ef-9484-4b3e74e1b391', 'Divisi Eksternal memperbarui laporan: \"1234\"', NULL, 0, NULL, NULL, NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-10 07:38:28', 2, 'DPA'),
('d11d9977-a657-11f0-97bb-432a08ab4041', 'Divisi Eksternal telah memberikan revisi atau komentar baru untuk laporan \"1234\".', NULL, 0, NULL, 'a9c010b4-efd9-4414-b598-642868aa1c49', NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-11 04:07:32', 2, 'DPA'),
('d26fe887-8c14-4797-b824-48c936adbbb4', 'Divisi Eksternal menambahkan Program Kerja baru: \"test\"', NULL, 0, NULL, NULL, NULL, NULL, '2025-10-10 05:05:00', 2, 'DPA'),
('d8db6bc8-a5fe-11f0-97bb-432a08ab4041', 'Divisi Eksternal telah memberikan revisi atau komentar baru untuk laporan \"1234\".', NULL, 0, NULL, 'a9c010b4-efd9-4414-b598-642868aa1c49', NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-10 17:30:40', 2, 'DPA'),
('dd9e7374-a657-11f0-97bb-432a08ab4041', 'Divisi Eksternal telah memberikan revisi atau komentar baru untuk laporan \"1234\".', NULL, 0, NULL, 'a9c010b4-efd9-4414-b598-642868aa1c49', NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-11 04:07:53', 2, 'DPA'),
('e0897da6-a657-11f0-97bb-432a08ab4041', 'Divisi Eksternal telah memberikan revisi atau komentar baru untuk laporan \"1234\".', NULL, 0, NULL, 'a9c010b4-efd9-4414-b598-642868aa1c49', NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-11 04:07:58', 2, 'DPA'),
('e0f1e1ba-a652-11f0-97bb-432a08ab4041', 'Divisi Eksternal telah memberikan revisi atau komentar baru untuk laporan \"1234\".', NULL, 0, NULL, 'a9c010b4-efd9-4414-b598-642868aa1c49', NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-11 03:32:11', 2, 'DPA'),
('e602327b-a657-11f0-97bb-432a08ab4041', 'Divisi Eksternal telah memberikan revisi atau komentar baru untuk laporan \"1234\".', NULL, 0, NULL, 'a9c010b4-efd9-4414-b598-642868aa1c49', NULL, '6299599a-c586-4b2f-a117-0c988b3fa6c9', '2025-10-11 04:08:07', 2, 'DPA');

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

--
-- Dumping data for table `program_kerja`
--

INSERT INTO `program_kerja` (`id_ProgramKerja`, `Nama_ProgramKerja`, `Deskripsi`, `Tanggal_mulai`, `Tanggal_selesai`, `Penanggung_jawab`, `id_anggota`, `Dokumen_pendukung`, `Status`, `id_divisi`) VALUES
('5c0a9f54-a5f4-11f0-97bb-432a08ab4041', 'hmsi fest', ',, m', '2025-10-15', '2025-10-24', 'lml', '2311522032', 'Logo HMSI Tracker-f6a1d10f-51ae-420a-bf99-1d7a29ae6f70.png', 'Belum Dimulai', 2),
('954603bb-a55d-11f0-97bb-432a08ab4041', 'go to school', 'mln', '2025-10-17', '2025-11-05', 'afiq', '2311522032', 'test file-83be3c4f-0d07-427c-84ca-5554b993626c.pdf', 'Belum Dimulai', 2),
('a5acfff2-a560-11f0-97bb-432a08ab4041', 'aaaaaaaaaaa', 'mnmns', '2025-10-29', '2025-11-06', 'ijon', '2311522032', 'fti_unand-154e64d2-2237-4750-a17d-4c7f8a99a297.jpg', 'Belum Dimulai', 2),
('aebb616d-a596-11f0-97bb-432a08ab4041', 'test', 'vdsds', '2025-10-07', '2025-10-23', 'ijon', '2311522032', 'HMSI_Tracker-68b0efd8-400b-412d-a266-341db2b638c0.png', 'Sedang Berjalan', 2),
('d6fafd64-a5a7-11f0-97bb-432a08ab4041', 'csasc', 'asas', '2025-10-22', '2025-10-29', 'csaasc', '2311522032', 'fti_unand-49f8bcd7-f0a3-48dc-97dd-f25a2a6070a8.jpg', 'Belum Dimulai', 2);

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
('2311522032', 'Ridho Dwi Syahputra', 'eksternal@gmail.com', '$2b$10$IKLgcUfh0BQX8PQRB1HLcO1SuuPgMEfXEIPgykJNR7h4jAbvHf.vm', 'HMSI', 'uploads/profile/1760111617098-523690732.jpg', '2025-10-10 15:53:37', 'center 50%', 'light', 2),
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
