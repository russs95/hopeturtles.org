-- ------------------------------------------------------------
-- 🐢 Hope Turtle Tracking Platform | Database Schema v1.1
-- ------------------------------------------------------------

-- USERS TABLE ------------------------------------------------------------
CREATE TABLE `users_tb` (
  `open_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buwana_id` int NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_status` enum('active','suspended','deleted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `terms_of_service` tinyint(1) NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `flagged` tinyint(1) NOT NULL DEFAULT '0',
  `profile_pic` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'null',
  `country_id` int DEFAULT NULL,
  `watershed_id` int DEFAULT NULL,
  `language_id` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `earthen_newsletter_join` tinyint(1) DEFAULT '1',
  `login_count` smallint DEFAULT '0',
  `birth_date` date DEFAULT NULL,
  `deleteable` tinyint(1) DEFAULT '0',
  `continent_code` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `earthling_emoji` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_full` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_watershed` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location_lat` decimal(10,8) DEFAULT NULL,
  `location_long` decimal(11,8) DEFAULT NULL,
  `community_id` int DEFAULT NULL,
  `time_zone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tour_taken` tinyint(1) DEFAULT '0',
  `last_sync_ts` datetime DEFAULT NULL,
  PRIMARY KEY (`buwana_id`),
  UNIQUE KEY `uniq_users_email` (`email`),
  UNIQUE KEY `open_id` (`open_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MISSIONS TABLE ------------------------------------------------------------
CREATE TABLE `missions_tb` (
  `mission_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `target_lat` DECIMAL(10,7),
  `target_lng` DECIMAL(10,7),
  `start_date` DATETIME,
  `end_date` DATETIME,
  `status` ENUM('planned','active','paused','completed') DEFAULT 'planned',
  `created_by` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`mission_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `missions_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users_tb`(`buwana_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HUBS TABLE ------------------------------------------------------------
CREATE TABLE `hubs_tb` (
  `hub_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `country` VARCHAR(80),
  `region` VARCHAR(80),
  `coordinator_id` INT,
  `lat` DECIMAL(10,7),
  `lng` DECIMAL(10,7),
  `description` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`hub_id`),
  KEY `coordinator_id` (`coordinator_id`),
  CONSTRAINT `hubs_coordinator_fk` FOREIGN KEY (`coordinator_id`) REFERENCES `users_tb`(`buwana_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BOATS TABLE ------------------------------------------------------------
CREATE TABLE `boats_tb` (
  `boat_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `owner` VARCHAR(100),
  `registration` VARCHAR(50),
  `capacity` DECIMAL(6,2),
  `hub_id` BIGINT UNSIGNED,
  `contact` VARCHAR(100),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`boat_id`),
  KEY `hub_id` (`hub_id`),
  CONSTRAINT `boats_hub_fk` FOREIGN KEY (`hub_id`) REFERENCES `hubs_tb`(`hub_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TURTLES TABLE ------------------------------------------------------------
CREATE TABLE `turtles_tb` (
  `turtle_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `buwana_id` INT,
  `mission_id` BIGINT UNSIGNED,
  `hub_id` BIGINT UNSIGNED,
  `boat_id` BIGINT UNSIGNED,
  `status` ENUM('idle','en_route','arrived','lost') DEFAULT 'idle',
  `solar_charge` DECIMAL(5,2),
  `last_lat` DECIMAL(10,7),
  `last_lng` DECIMAL(10,7),
  `last_update` DATETIME,
  `description` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`turtle_id`),
  KEY `mission_id` (`mission_id`),
  KEY `hub_id` (`hub_id`),
  KEY `boat_id` (`boat_id`),
  KEY `buwana_id` (`buwana_id`),
  CONSTRAINT `turtles_user_fk` FOREIGN KEY (`buwana_id`) REFERENCES `users_tb`(`buwana_id`) ON DELETE SET NULL,
  CONSTRAINT `turtles_mission_fk` FOREIGN KEY (`mission_id`) REFERENCES `missions_tb`(`mission_id`) ON DELETE SET NULL,
  CONSTRAINT `turtles_hub_fk` FOREIGN KEY (`hub_id`) REFERENCES `hubs_tb`(`hub_id`) ON DELETE SET NULL,
  CONSTRAINT `turtles_boat_fk` FOREIGN KEY (`boat_id`) REFERENCES `boats_tb`(`boat_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BOTTLES TABLE ------------------------------------------------------------
CREATE TABLE `bottles_tb` (
  `bottle_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `serial_number` VARCHAR(20) NOT NULL UNIQUE,
  `turtle_id` BIGINT UNSIGNED,
  `contents` TEXT,
  `weight_grams` DECIMAL(6,2),
  `packed_by` INT,
  `date_packed` DATETIME,
  `verified` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`bottle_id`),
  KEY `turtle_id` (`turtle_id`),
  CONSTRAINT `bottles_turtle_fk` FOREIGN KEY (`turtle_id`) REFERENCES `turtles_tb`(`turtle_id`) ON DELETE SET NULL,
  CONSTRAINT `bottles_user_fk` FOREIGN KEY (`packed_by`) REFERENCES `users_tb`(`buwana_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TELEMETRY TABLE ------------------------------------------------------------
CREATE TABLE `telemetry_tb` (
  `telemetry_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `turtle_id` BIGINT UNSIGNED,
  `timestamp` DATETIME NOT NULL,
  `latitude` DECIMAL(10,7),
  `longitude` DECIMAL(10,7),
  `battery_voltage` DECIMAL(5,2),
  `temp_c` DECIMAL(4,1),
  `connection` ENUM('wifi','gsm','satellite'),
  `raw_data` JSON,
  `recorded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`telemetry_id`),
  KEY `turtle_id` (`turtle_id`),
  CONSTRAINT `telemetry_turtle_fk` FOREIGN KEY (`turtle_id`) REFERENCES `turtles_tb`(`turtle_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SUCCESS TABLE ------------------------------------------------------------
CREATE TABLE `success_tb` (
  `success_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `turtle_id` BIGINT UNSIGNED,
  `found_by` INT,
  `date_found` DATETIME,
  `location_lat` DECIMAL(10,7),
  `location_lng` DECIMAL(10,7),
  `thank_you_message` TEXT,
  `photos` JSON,
  `verified_by` INT,
  `verified_at` DATETIME,
  PRIMARY KEY (`success_id`),
  KEY `turtle_id` (`turtle_id`),
  CONSTRAINT `success_turtle_fk` FOREIGN KEY (`turtle_id`) REFERENCES `turtles_tb`(`turtle_id`) ON DELETE SET NULL,
  CONSTRAINT `success_found_fk` FOREIGN KEY (`found_by`) REFERENCES `users_tb`(`buwana_id`) ON DELETE SET NULL,
  CONSTRAINT `success_verified_fk` FOREIGN KEY (`verified_by`) REFERENCES `users_tb`(`buwana_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ALERTS TABLE ------------------------------------------------------------
CREATE TABLE `alerts_tb` (
  `alert_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `message_body` TEXT NOT NULL,
  `featured_text` VARCHAR(100),
  `featured_url` VARCHAR(255),
  `emoji` VARCHAR(10),
  `status` ENUM('active','archived') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_by` INT,
  PRIMARY KEY (`alert_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `alerts_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users_tb`(`buwana_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PHOTOS TABLE ------------------------------------------------------------
CREATE TABLE `photos_tb` (
  `photo_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `related_type` ENUM('turtle','bottle','success','mission','hub') NOT NULL,
  `related_id` BIGINT UNSIGNED NOT NULL,
  `uploaded_by` INT,
  `url` VARCHAR(255) NOT NULL,
  `thumbnail_url` VARCHAR(255),
  `caption` TEXT,
  `uploaded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`photo_id`),
  KEY `related_index` (`related_type`, `related_id`),
  CONSTRAINT `photos_uploaded_by_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users_tb`(`buwana_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
