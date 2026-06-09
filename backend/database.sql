-- =============================================
-- LAPOR KDM — Database Setup Script
-- Jalankan script ini di MySQL sebelum start server
-- =============================================

-- Buat database
CREATE DATABASE lapor_kdm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lapor_kdm;

-- ─── Tabel: users ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`          INT           NOT NULL AUTO_INCREMENT,
  `nama`        VARCHAR(100)  NOT NULL,
  `email`       VARCHAR(255)  NOT NULL,
  `password`    VARCHAR(255)  NOT NULL,
  `role`        ENUM('user','admin','super_admin') NOT NULL DEFAULT 'user',
  `avatar_url`  VARCHAR(500)  NULL DEFAULT NULL,
  `is_active`   TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Tabel: kategori ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `kategori` (
  `id`          INT           NOT NULL AUTO_INCREMENT,
  `nama`        VARCHAR(100)  NOT NULL,
  `deskripsi`   TEXT          NULL DEFAULT NULL,
  `warna`       VARCHAR(7)    NULL DEFAULT '#7a3dff',
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_kategori_nama` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Tabel: laporan ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `laporan` (
  `id`          INT           NOT NULL AUTO_INCREMENT,
  `user_id`     INT           NOT NULL,
  `kategori_id` INT           NOT NULL,
  `judul`       VARCHAR(255)  NOT NULL,
  `deskripsi`   TEXT          NOT NULL,
  `status`      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_laporan_user_id`     (`user_id`),
  INDEX `idx_laporan_kategori_id` (`kategori_id`),
  INDEX `idx_laporan_status`      (`status`),
  INDEX `idx_laporan_created_at`  (`created_at`),
  CONSTRAINT `fk_laporan_user`     FOREIGN KEY (`user_id`)     REFERENCES `users`(`id`)    ON DELETE CASCADE,
  CONSTRAINT `fk_laporan_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `kategori`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Tabel: komentar ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `komentar` (
  `id`          INT           NOT NULL AUTO_INCREMENT,
  `laporan_id`  INT           NOT NULL,
  `user_id`     INT           NOT NULL,
  `isi`         TEXT          NOT NULL,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_komentar_laporan_id` (`laporan_id`),
  INDEX `idx_komentar_user_id`    (`user_id`),
  CONSTRAINT `fk_komentar_laporan` FOREIGN KEY (`laporan_id`) REFERENCES `laporan`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_komentar_user`   FOREIGN KEY (`user_id`)    REFERENCES `users`(`id`)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Tabel: gambar ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `gambar` (
  `id`          INT           NOT NULL AUTO_INCREMENT,
  `laporan_id`  INT           NOT NULL,
  `url`         VARCHAR(500)  NOT NULL,
  `filename`    VARCHAR(255)  NOT NULL,
  `size_bytes`  INT           NOT NULL DEFAULT 0,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_gambar_laporan_id` (`laporan_id`),
  CONSTRAINT `fk_gambar_laporan` FOREIGN KEY (`laporan_id`) REFERENCES `laporan`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Verifikasi ───────────────────────────────────────────────────────────────
SELECT 'Database lapor_kdm berhasil dibuat!' AS status;
SHOW TABLES;