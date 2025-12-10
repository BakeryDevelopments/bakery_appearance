-- ============================================================================
-- TJ Appearance - Database Schema
-- ============================================================================
-- This schema only contains runtime/persistent data tables.
-- Configuration (theme, zones, restrictions, etc.) is managed via JSON files
-- in shared/data/ and loaded at runtime.
-- ============================================================================

-- Player appearance data (persistent character appearance)
CREATE TABLE IF NOT EXISTS `player_appearance` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `citizenid` VARCHAR(50) NOT NULL,
    `appearance_data` LONGTEXT NOT NULL COMMENT 'JSON: complete appearance data',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_citizenid` (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Player personal outfits (non-job/gang outfits)
CREATE TABLE IF NOT EXISTS `player_outfits` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `citizenid` VARCHAR(50) NOT NULL,
    `gender` ENUM('male', 'female') NOT NULL,
    `outfit_name` VARCHAR(100) NOT NULL,
    `outfit_data` LONGTEXT NOT NULL COMMENT 'JSON: outfit data',
    `share_code` VARCHAR(8) NULL UNIQUE COMMENT '8-character unique code for outfit sharing',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_citizenid_outfit` (`citizenid`, `outfit_name`, `gender`),
    INDEX `idx_citizenid_gender` (`citizenid`, `gender`),
    INDEX `idx_share_code` (`share_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Job and gang persistent outfits
CREATE TABLE IF NOT EXISTS `appearance_job_outfits` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `job` VARCHAR(50) NULL DEFAULT NULL,
    `gang` VARCHAR(50) NULL DEFAULT NULL,
    `gender` ENUM('male', 'female') NOT NULL,
    `outfit_name` VARCHAR(100) NOT NULL,
    `outfit_data` LONGTEXT NOT NULL COMMENT 'JSON: appearance data',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_job_gender` (`job`, `gender`),
    INDEX `idx_gang_gender` (`gang`, `gender`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

