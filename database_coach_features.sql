-- =====================================================
-- Database Schema for Enhanced Coach Features
-- =====================================================

-- Add availability status to players table if not exists
ALTER TABLE `players` 
ADD COLUMN IF NOT EXISTS `availability_status` enum('available','injured','suspended','unavailable') DEFAULT 'available' AFTER `status`,
ADD COLUMN IF NOT EXISTS `injury_details` text COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `availability_status`,
ADD COLUMN IF NOT EXISTS `suspension_end_date` date DEFAULT NULL AFTER `injury_details`;

-- Create Transfer Requests Table
CREATE TABLE IF NOT EXISTS `transfer_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `from_team_id` int NOT NULL,
  `to_team_id` int NOT NULL,
  `requested_by_coach_id` int DEFAULT NULL,
  `request_type` enum('loan','permanent','trial') DEFAULT 'permanent',
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `transfer_fee` decimal(10,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` datetime DEFAULT NULL,
  `responded_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  KEY `from_team_id` (`from_team_id`),
  KEY `to_team_id` (`to_team_id`),
  KEY `requested_by_coach_id` (`requested_by_coach_id`),
  KEY `responded_by` (`responded_by`),
  CONSTRAINT `transfer_requests_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfer_requests_ibfk_2` FOREIGN KEY (`from_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfer_requests_ibfk_3` FOREIGN KEY (`to_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfer_requests_ibfk_4` FOREIGN KEY (`requested_by_coach_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transfer_requests_ibfk_5` FOREIGN KEY (`responded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Friendly Fixtures Table
CREATE TABLE IF NOT EXISTS `friendly_fixtures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `home_team_id` int NOT NULL,
  `away_team_id` int NOT NULL,
  `created_by_coach_id` int DEFAULT NULL,
  `match_date` datetime NOT NULL,
  `venue_id` int DEFAULT NULL,
  `venue_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `home_score` int DEFAULT NULL,
  `away_score` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `home_team_id` (`home_team_id`),
  KEY `away_team_id` (`away_team_id`),
  KEY `created_by_coach_id` (`created_by_coach_id`),
  KEY `venue_id` (`venue_id`),
  CONSTRAINT `friendly_fixtures_ibfk_1` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friendly_fixtures_ibfk_2` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friendly_fixtures_ibfk_3` FOREIGN KEY (`created_by_coach_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `friendly_fixtures_ibfk_4` FOREIGN KEY (`venue_id`) REFERENCES `stadiums` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Training Sessions Table
CREATE TABLE IF NOT EXISTS `training_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `coach_id` int DEFAULT NULL,
  `session_date` datetime NOT NULL,
  `session_type` enum('regular','tactical','fitness','recovery','match_preparation') DEFAULT 'regular',
  `duration_minutes` int DEFAULT 90,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `focus_areas` text COLLATE utf8mb4_unicode_ci,
  `attendance` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  KEY `coach_id` (`coach_id`),
  CONSTRAINT `training_sessions_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `training_sessions_ibfk_2` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Player Statistics Table (if not exists)
CREATE TABLE IF NOT EXISTS `player_statistics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `match_id` int DEFAULT NULL,
  `season` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `goals` int DEFAULT 0,
  `assists` int DEFAULT 0,
  `yellow_cards` int DEFAULT 0,
  `red_cards` int DEFAULT 0,
  `minutes_played` int DEFAULT 0,
  `matches_started` int DEFAULT 0,
  `matches_substituted` int DEFAULT 0,
  `clean_sheets` int DEFAULT 0,
  `saves` int DEFAULT 0,
  `rating` decimal(3,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_player_match` (`player_id`, `match_id`),
  KEY `player_id` (`player_id`),
  KEY `match_id` (`match_id`),
  KEY `season` (`season`),
  CONSTRAINT `player_statistics_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
  CONSTRAINT `player_statistics_ibfk_2` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add submission deadline check to lineups
ALTER TABLE `lineups`
ADD COLUMN IF NOT EXISTS `submitted_at` datetime DEFAULT NULL AFTER `notes`,
ADD COLUMN IF NOT EXISTS `is_submitted` tinyint(1) DEFAULT '0' AFTER `submitted_at`;

-- =====================================================
-- Migration Complete!
-- =====================================================

