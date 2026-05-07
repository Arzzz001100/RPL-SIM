-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for dbtridharma
CREATE DATABASE IF NOT EXISTS `dbtridharma` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `dbtridharma`;

-- Dumping structure for table dbtridharma.guru
CREATE TABLE IF NOT EXISTS `guru` (
  `id_guru` int NOT NULL AUTO_INCREMENT,
  `nama_guru` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `spesialisasi` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_guru`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table dbtridharma.guru: ~3 rows (approximately)
INSERT INTO `guru` (`id_guru`, `nama_guru`, `spesialisasi`) VALUES
	(1, 'Delvia Rumengan', NULL),
	(2, 'Meity Rory', NULL),
	(3, 'Maria Paat', NULL);

-- Dumping structure for table dbtridharma.konsultasi
CREATE TABLE IF NOT EXISTS `konsultasi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_siswa` int NOT NULL,
  `id_guru` int NOT NULL,
  `tanggal` date NOT NULL,
  `jam` time NOT NULL,
  `topik` text NOT NULL,
  `status` enum('MENUNGGU','DITERIMA','SELESAI','DITOLAK') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'MENUNGGU',
  `link_zoom` varchar(255) DEFAULT NULL,
  `pesan_admin` text,
  PRIMARY KEY (`id`),
  KEY `fk_konsultasi_siswa` (`id_siswa`),
  KEY `fk_konsultasi_guru` (`id_guru`),
  CONSTRAINT `fk_konsultasi_guru` FOREIGN KEY (`id_guru`) REFERENCES `guru` (`id_guru`) ON DELETE CASCADE,
  CONSTRAINT `fk_konsultasi_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table dbtridharma.konsultasi: ~6 rows (approximately)
INSERT INTO `konsultasi` (`id`, `id_siswa`, `id_guru`, `tanggal`, `jam`, `topik`, `status`, `link_zoom`, `pesan_admin`) VALUES
	(1, 1, 1, '2026-05-04', '10:00:00', 'Bully', 'SELESAI', '', ''),
	(2, 1, 1, '2026-05-04', '12:00:00', 'Bully', 'DITOLAK', '', ''),
	(3, 4, 1, '2026-05-14', '11:24:00', '', 'DITOLAK', '', 'maaf anda ditolak'),
	(4, 4, 1, '2026-05-12', '11:29:00', 'halo saya mau konsultasi tentang bullying\n', 'SELESAI', '', 'sudah ya'),
	(5, 1, 1, '2026-05-07', '12:31:00', 'mau bicara sesuatuu', 'DITERIMA', '', 'okeh'),
	(6, 4, 2, '2026-05-06', '13:24:00', 'saya sange', 'MENUNGGU', NULL, NULL),
	(7, 4, 3, '2026-05-08', '07:05:00', 'sesuatu rahasia', 'MENUNGGU', NULL, NULL);

-- Dumping structure for table dbtridharma.laporan
CREATE TABLE IF NOT EXISTS `laporan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_siswa` int NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `isi_laporan` text NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `tanggal_lapor` date NOT NULL DEFAULT (now()),
  `status` enum('TERKIRIM','DITERIMA','DIPROSES','SELESAI') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `catatan_admin` text,
  PRIMARY KEY (`id`),
  KEY `fk_laporan_siswa` (`id_siswa`),
  CONSTRAINT `fk_laporan_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table dbtridharma.laporan: ~13 rows (approximately)
INSERT INTO `laporan` (`id`, `id_siswa`, `kategori`, `isi_laporan`, `foto`, `tanggal_lapor`, `status`, `catatan_admin`) VALUES
	(1, 1, 'Fasilitas', 'ada yg rusak ini', NULL, '2026-05-01', 'SELESAI', NULL),
	(2, 1, 'Bullying', 'tolong akuuuu', NULL, '2026-05-01', 'SELESAI', NULL),
	(3, 1, 'Kekerasan', 'ada orang aneh', NULL, '2026-05-01', 'DIPROSES', NULL),
	(4, 1, 'Kekerasan', 'sakittt!', '1777697042006.png', '2026-05-02', 'DITERIMA', NULL),
	(5, 1, 'Lainnya', 'ada anomali di sini', '1777876319158.jpeg', '2026-05-04', 'TERKIRIM', NULL),
	(6, 1, 'Lainnya', 'Aku tak tau lagii', '1777999373771.jpeg', '2026-05-05', 'TERKIRIM', NULL),
	(7, 4, 'Lainnya', 'saya dilecehkan erick', NULL, '2026-05-06', 'TERKIRIM', NULL),
	(8, 4, 'Kekerasan', 'dasdsdas\r\n', NULL, '2026-05-06', 'DIPROSES', NULL),
	(9, 4, 'Fasilitas', 'ssdasdd', NULL, '2026-05-06', 'SELESAI', NULL),
	(10, 4, 'Lainnya', 'sdasdada a', NULL, '2026-05-06', 'SELESAI', NULL),
	(11, 4, 'Bullying', 'dsdadasd ', NULL, '2026-05-06', 'SELESAI', NULL),
	(12, 1, 'Lainnya', 'aku butuh bantuan', '1778038296148.png', '2026-05-06', 'SELESAI', NULL),
	(13, 4, 'Kekerasan', 'aavsbxnwxjxgejexgem', NULL, '2026-05-06', 'TERKIRIM', NULL),
	(14, 4, 'Bullying', 'helep aku', NULL, '2026-05-07', 'DITERIMA', NULL);

-- Dumping structure for table dbtridharma.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `kelas` varchar(50) DEFAULT NULL,
  `role` enum('siswa','admin','kepala sekolah') DEFAULT 'siswa',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table dbtridharma.users: ~4 rows (approximately)
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `kelas`, `role`, `created_at`) VALUES
	(1, 'Rafael Siby', 'rafaelsiby12@gmail.com', 'rafael#123', '9', 'siswa', '2026-04-21 19:09:30'),
	(2, 'Admin', 'smptridharmamanado7@gmail.com', 'admin123', NULL, 'admin', '2026-05-01 19:14:26'),
	(3, 'Damianus Buu', 'damianusBuu@gmail.com', 'dami123', NULL, 'kepala sekolah', '2026-05-02 03:41:46'),
	(4, 'aristo lukas', 'aistolukas@gmail.com', 'aristo123', '7', 'siswa', '2026-05-06 01:03:50');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
