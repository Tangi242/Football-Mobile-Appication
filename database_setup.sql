-- =====================================================
-- NFA Football Database Setup Script
-- Run this in phpMyAdmin to set up the complete database
-- =====================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- =====================================================
-- Drop existing tables (if any) - BE CAREFUL!
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `lineup_players`;
DROP TABLE IF EXISTS `lineups`;
DROP TABLE IF EXISTS `poll_votes`;
DROP TABLE IF EXISTS `poll_options`;
DROP TABLE IF EXISTS `polls`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `team_sponsors`;
DROP TABLE IF EXISTS `standings`;
DROP TABLE IF EXISTS `player_match_stats`;
DROP TABLE IF EXISTS `match_events`;
DROP TABLE IF EXISTS `disciplinary_records`;
DROP TABLE IF EXISTS `injuries`;
DROP TABLE IF EXISTS `news`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `matches`;
DROP TABLE IF EXISTS `players`;
DROP TABLE IF EXISTS `teams`;
DROP TABLE IF EXISTS `stadiums`;
DROP TABLE IF EXISTS `sponsors`;
DROP TABLE IF EXISTS `referees`;
DROP TABLE IF EXISTS `leagues`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Create Users Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','referee','club_manager','player','fan','coach','journalist') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fan',
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_photo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Leagues Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `leagues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `season` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Stadiums Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `stadiums` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `established_year` int DEFAULT NULL,
  `surface_type` enum('grass','artificial','mixed') COLLATE utf8mb4_unicode_ci DEFAULT 'grass',
  `status` enum('active','under_renovation','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Teams Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `league_id` int DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `founded_year` int DEFAULT NULL,
  `logo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `stadium_id` int DEFAULT NULL,
  `primary_color` varchar(7) DEFAULT NULL,
  `secondary_color` varchar(7) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `league_id` (`league_id`),
  KEY `manager_id` (`manager_id`),
  KEY `stadium_id` (`stadium_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Players Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `players` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `first_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dob` date DEFAULT NULL,
  `nationality` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jersey_number` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','injured','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `photo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Matches Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `matches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `league_id` int NOT NULL,
  `home_team_id` int NOT NULL,
  `away_team_id` int NOT NULL,
  `referee_id` int DEFAULT NULL,
  `venue` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `match_date` datetime NOT NULL,
  `status` enum('scheduled','in_progress','completed','postponed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `home_score` int DEFAULT '0',
  `away_score` int DEFAULT '0',
  `is_friendly` tinyint(1) NOT NULL DEFAULT '0',
  `report_status` enum('draft','submitted','reviewed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `referee_report` mediumtext COLLATE utf8mb4_unicode_ci,
  `report_submitted_at` datetime DEFAULT NULL,
  `report_reviewed_at` datetime DEFAULT NULL,
  `report_review_notes` text COLLATE utf8mb4_unicode_ci,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `competition` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `league_id` (`league_id`),
  KEY `home_team_id` (`home_team_id`),
  KEY `away_team_id` (`away_team_id`),
  KEY `referee_id` (`referee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Lineups Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `lineups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_id` int NOT NULL,
  `team_id` int NOT NULL,
  `coach_id` int NOT NULL,
  `formation` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '4-4-2',
  `submitted_at` datetime DEFAULT NULL,
  `status` enum('draft','submitted','confirmed') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_match_team` (`match_id`, `team_id`),
  KEY `match_id` (`match_id`),
  KEY `team_id` (`team_id`),
  KEY `coach_id` (`coach_id`),
  CONSTRAINT `lineups_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lineups_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lineups_ibfk_3` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Lineup Players Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `lineup_players` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lineup_id` int NOT NULL,
  `player_id` int NOT NULL,
  `position` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_starting` tinyint(1) NOT NULL DEFAULT '1',
  `is_captain` tinyint(1) NOT NULL DEFAULT '0',
  `jersey_number` int DEFAULT NULL,
  `order` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_lineup_player` (`lineup_id`, `player_id`),
  KEY `lineup_id` (`lineup_id`),
  KEY `player_id` (`player_id`),
  CONSTRAINT `lineup_players_ibfk_1` FOREIGN KEY (`lineup_id`) REFERENCES `lineups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lineup_players_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Match Events Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `match_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_id` int NOT NULL,
  `event_type` enum('goal','yellow_card','red_card','substitution','penalty','own_goal','injury') COLLATE utf8mb4_unicode_ci NOT NULL,
  `minute_mark` int NOT NULL,
  `player_id` int DEFAULT NULL,
  `assisting_player_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `match_id` (`match_id`),
  KEY `player_id` (`player_id`),
  KEY `assisting_player_id` (`assisting_player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create News Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `summary` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `media_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_id` int DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'announcement',
  `priority` enum('low','normal','high') COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `poll_id` int DEFAULT NULL,
  `is_poll` tinyint(1) DEFAULT '0',
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `author_id` (`author_id`),
  KEY `poll_id` (`poll_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Referees Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `referees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `license_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience_years` int DEFAULT NULL,
  `region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Sponsors Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `sponsors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Standings Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `standings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `league_id` int NOT NULL,
  `team_id` int NOT NULL,
  `played` int DEFAULT '0',
  `wins` int DEFAULT '0',
  `draws` int DEFAULT '0',
  `losses` int DEFAULT '0',
  `goals_for` int DEFAULT '0',
  `goals_against` int DEFAULT '0',
  `goal_difference` int DEFAULT '0',
  `points` int DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_league` (`league_id`,`team_id`),
  KEY `team_id` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Player Match Stats Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `player_match_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_id` int NOT NULL,
  `player_id` int NOT NULL,
  `club_id` int NOT NULL,
  `manager_id` int NOT NULL,
  `minutes_played` int DEFAULT '0',
  `goals` int DEFAULT '0',
  `assists` int DEFAULT '0',
  `shots` int DEFAULT '0',
  `passes_completed` int DEFAULT '0',
  `tackles` int DEFAULT '0',
  `yellow_cards` int DEFAULT '0',
  `red_cards` int DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_player_match` (`match_id`,`player_id`),
  KEY `fk_stats_player` (`player_id`),
  KEY `fk_stats_club` (`club_id`),
  KEY `fk_stats_manager` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Injuries Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `injuries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `injury_type` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `injury_date` date DEFAULT NULL,
  `recovery_date` date DEFAULT NULL,
  `severity` enum('minor','moderate','severe') COLLATE utf8mb4_unicode_ci DEFAULT 'minor',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Disciplinary Records Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `disciplinary_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `match_id` int DEFAULT NULL,
  `issued_by` int NOT NULL,
  `offense` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sanction` text COLLATE utf8mb4_unicode_ci,
  `status` enum('open','under_review','resolved') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  KEY `team_id` (`team_id`),
  KEY `match_id` (`match_id`),
  KEY `issued_by` (`issued_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Team Sponsors Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `team_sponsors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `sponsor_id` int NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  KEY `sponsor_id` (`sponsor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Sessions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Password Resets Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Products/Merchandise Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` enum('Jerseys','Accessories','Equipment') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Accessories',
  `price` decimal(10,2) NOT NULL,
  `discount` int DEFAULT '0',
  `stock` int DEFAULT '0',
  `in_stock` tinyint(1) DEFAULT '1',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sizes` json DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '4.5',
  `reviews` int DEFAULT '0',
  `shipping_days` int DEFAULT '3',
  `shipping_cost` decimal(10,2) DEFAULT '50.00',
  `free_shipping_threshold` decimal(10,2) DEFAULT '500.00',
  `status` enum('active','inactive','discontinued') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT TEST DATA
-- =====================================================

-- Insert Leagues
INSERT INTO `leagues` (`id`, `name`, `season`, `start_date`, `end_date`, `description`, `logo_path`, `image_path`) VALUES
(1, 'Namibia Premier League', '2025/2026', '2025-08-01', '2026-05-31', 'Top-flight professional football league in Namibia.', '/images/leagues/npl_logo.png', '/images/leagues/npl_banner.jpg'),
(2, 'Debmarine Cup', '2025', '2025-03-10', '2025-10-15', 'National knockout cup competition.', '/images/leagues/debmarine_cup_logo.png', '/images/leagues/debmarine_cup_banner.jpg'),
(3, 'First Division', '2025/2026', '2025-08-15', '2026-05-15', 'Second tier of Namibian football.', '/images/leagues/first_division_logo.png', '/images/leagues/first_division_banner.jpg'),
(4, 'Women\'s Premier League', '2025/2026', '2025-09-01', '2026-04-30', 'Top-flight women\'s football league.', '/images/leagues/wpl_logo.png', '/images/leagues/wpl_banner.jpg');

-- Insert Stadiums
INSERT INTO `stadiums` (`id`, `name`, `city`, `address`, `capacity`, `established_year`, `surface_type`, `status`, `latitude`, `longitude`, `image_path`) VALUES
(1, 'Independence Stadium', 'Windhoek', 'Independence Avenue, Windhoek', 25000, 1990, 'grass', 'active', -22.5700, 17.0836, '/images/stadiums/independence_stadium.jpg'),
(2, 'Sam Nujoma Stadium', 'Katutura, Windhoek', 'Katutura, Windhoek', 10000, 2005, 'grass', 'active', -22.5500, 17.1000, '/images/stadiums/sam_nujoma_stadium.jpg'),
(3, 'Kuisebmund Stadium', 'Walvis Bay', 'Walvis Bay', 4000, 1980, 'grass', 'active', -22.9575, 14.5053, '/images/stadiums/kuisebmund_stadium.jpg'),
(4, 'NFA Technical Centre', 'Windhoek', 'NFA Technical Centre, Windhoek', 3000, 2010, 'artificial', 'active', -22.5600, 17.0900, '/images/stadiums/nfa_technical_centre.jpg'),
(5, 'Mokati Stadium', 'Otjiwarongo', 'Otjiwarongo', 5000, 1995, 'grass', 'active', -20.4637, 16.6477, '/images/stadiums/mokati_stadium.jpg'),
(6, 'Legare Stadium', 'Gobabis', 'Gobabis', 2000, 1988, 'grass', 'active', -22.4475, 18.9681, '/images/stadiums/legare_stadium.jpg'),
(7, 'Nau-Aib Stadium', 'Okahandja', 'Okahandja', 5000, 1998, 'grass', 'active', -21.9833, 16.9167, '/images/stadiums/nau_aib_stadium.jpg'),
(8, 'UNAM Stadium', 'Windhoek', 'University of Namibia, Windhoek', 5000, 2000, 'grass', 'active', -22.5700, 17.0836, '/images/stadiums/unam_stadium.jpg'),
(9, 'Rundu Sports Stadium', 'Rundu', 'Rundu', 3000, 1992, 'grass', 'active', -17.9167, 19.7667, '/images/stadiums/rundu_sports_stadium.jpg'),
(10, 'Momhadi Stadium', 'Windhoek', 'Windhoek', 3500, 1991, 'grass', 'active', -22.5700, 17.0836, '/images/stadiums/momhadi_stadium.jpg');

-- Insert Users (password for all: "Password123")
-- NOTE: The password hash below is a proper bcryptjs hash for "Password123" generated using bcryptjs
-- All users have the password: Password123
INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `role`, `phone`, `profile_photo_path`, `status`) VALUES
(1, 'Tangi', 'Nangolo', 'tangi@gmail.com', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'admin', '0812345678', '/images/users/tangi_nangolo.jpg', 'active'),
(2, 'Maria', 'Amakali', 'maria.referee@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'referee', '0811111111', '/images/users/maria_amakali.jpg', 'active'),
(3, 'Samuel', 'Shihepo', 'samuel.manager@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'club_manager', '0812222222', '/images/users/samuel_shihepo.jpg', 'active'),
(4, 'David', 'Nangolo', 'david.admin@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'admin', '0813333333', '/images/users/david_nangolo.jpg', 'active'),
(5, 'Linda', 'Katjikuua', 'linda.referee@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'referee', '0814444444', '/images/users/linda_katjikuua.jpg', 'active'),
(6, 'Erick', 'Amutenya', 'erick.referee@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'referee', '0815555555', '/images/users/erick_amutenya.jpg', 'active'),
(7, 'Patience', 'Shikongo', 'patience.referee@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'referee', '0816666666', '/images/users/patience_shikongo.jpg', 'active'),
(8, 'Hileni', 'Mbongolo', 'hileni.manager@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'club_manager', '0817777777', '/images/users/hileni_mbongolo.jpg', 'active'),
(9, 'Tjikuua', 'Hango', 'tjikuua.manager@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'club_manager', '0818888888', '/images/users/tjikuua_hango.jpg', 'active'),
(10, 'Kaitano', 'Munyika', 'kaitano.manager@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'club_manager', '0819999999', '/images/users/kaitano_munyika.jpg', 'active'),
(11, 'John', 'Fan', 'fan@test.com', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'fan', '0810000000', '/images/users/john_fan.jpg', 'active'),
(12, 'Peter', 'Coach', 'peter.coach@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'coach', '0811111112', '/images/users/peter_coach.jpg', 'active'),
(13, 'Sarah', 'Reporter', 'sarah.journalist@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'journalist', '0811111113', '/images/users/sarah_reporter.jpg', 'active'),
(14, 'Michael', 'Coach', 'michael.coach@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'coach', '0811111114', '/images/users/michael_coach.jpg', 'active'),
(15, 'Emma', 'Journalist', 'emma.journalist@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'journalist', '0811111115', '/images/users/emma_journalist.jpg', 'active'),
(16, 'Anna', 'Admin', 'anna.admin@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'admin', '0811111116', '/images/users/anna_admin.jpg', 'active'),
(17, 'James', 'Referee', 'james.referee@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'referee', '0811111117', '/images/users/james_referee.jpg', 'active'),
(18, 'Robert', 'Manager', 'robert.manager@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'club_manager', '0811111118', '/images/users/robert_manager.jpg', 'active'),
(19, 'Lisa', 'Player', 'lisa.player@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'player', '0811111119', '/images/users/lisa_player.jpg', 'active'),
(20, 'Thomas', 'Fan', 'thomas.fan@test.com', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'fan', '0811111120', '/images/users/thomas_fan.jpg', 'active'),
(21, 'Jennifer', 'Coach', 'jennifer.coach@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'coach', '0811111121', '/images/users/jennifer_coach.jpg', 'active'),
(22, 'William', 'Journalist', 'william.journalist@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'journalist', '0811111122', '/images/users/william_journalist.jpg', 'active'),
(23, 'Patricia', 'Referee', 'patricia.referee@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'referee', '0811111123', '/images/users/patricia_referee.jpg', 'active'),
(24, 'Richard', 'Player', 'richard.player@nfa.org.na', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'player', '0811111124', '/images/users/richard_player.jpg', 'active'),
(25, 'Susan', 'Fan', 'susan.fan@test.com', '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi', 'fan', '0811111125', '/images/users/susan_fan.jpg', 'active');

-- Insert Teams
INSERT INTO `teams` (`id`, `name`, `code`, `league_id`, `manager_id`, `founded_year`, `logo_path`, `status`, `stadium_id`, `primary_color`, `secondary_color`) VALUES
(1, 'African Stars', 'AS', 1, 3, 1962, '/images/teams/african_stars_logo.png', 'approved', 2, '#0066CC', '#FFFFFF'),
(2, 'Blue Waters', 'BW', 1, 8, 1985, '/images/teams/blue_waters_logo.png', 'approved', 3, '#0000FF', '#FFFFFF'),
(3, 'UNam FC', 'UNAM', 1, 9, 1999, '/images/teams/unam_fc_logo.png', 'approved', 8, '#FF6600', '#000000'),
(4, 'Mighty Gunners', 'MG', 1, 10, 1995, '/images/teams/mighty_gunners_logo.png', 'approved', 5, '#FF0000', '#FFFFFF'),
(5, 'Khomas Nampol', 'KN', 1, 18, 1998, '/images/teams/khomas_nampol_logo.png', 'approved', 8, '#000080', '#FFFF00'),
(6, 'Ongos SC', 'ONG', 1, 3, 2005, '/images/teams/ongos_sc_logo.png', 'approved', 2, '#00FF00', '#000000'),
(7, 'Young African', 'YA', 1, 8, 1995, '/images/teams/young_african_logo.png', 'approved', 6, '#FF00FF', '#FFFFFF'),
(8, 'Okahandja United', 'OU', 1, 9, 1998, '/images/teams/okahandja_united_logo.png', 'approved', 7, '#800080', '#FFFFFF'),
(9, 'Julinho Sporting', 'JS', 1, 10, 1992, '/images/teams/julinho_sporting_logo.png', 'approved', 9, '#008000', '#FFFFFF'),
(10, 'Windhoek City', 'WC', 1, 18, 1990, '/images/teams/windhoek_city_logo.png', 'approved', 1, '#000000', '#FFFFFF'),
(11, 'Tura Magic', 'TM', 1, 3, 1990, '/images/teams/tura_magic_logo.png', 'approved', 2, '#FF6600', '#000000'),
(12, 'Black Africa FC', 'BA', 1, 8, 1985, '/images/teams/black_africa_logo.png', 'approved', 1, '#000000', '#FFFFFF'),
(13, 'Life Fighters', 'LF', 1, 9, 1992, '/images/teams/life_fighters_logo.png', 'approved', 4, '#0066CC', '#FFFFFF'),
(14, 'Citizens FC', 'CFC', 1, 10, 2000, '/images/teams/citizens_fc_logo.png', 'approved', 5, '#FF0000', '#FFFFFF'),
(15, 'Eleven Arrows', 'EA', 1, 18, 1988, '/images/teams/eleven_arrows_logo.png', 'approved', 3, '#0000FF', '#FFFFFF');

-- Insert Players (extensive test data)
INSERT INTO `players` (`id`, `team_id`, `first_name`, `last_name`, `dob`, `nationality`, `position`, `jersey_number`, `photo_path`, `status`) VALUES
(1, 1, 'Tjikuua', 'Nangolo', '1995-05-12', 'Namibian', 'Forward', '9', '/images/players/tjikuua_nangolo.jpg', 'active'),
(2, 1, 'Hileni', 'Shihepo', '1997-08-23', 'Namibian', 'Midfielder', '10', '/images/players/hileni_shihepo.jpg', 'active'),
(3, 1, 'Kaitano', 'Amutenya', '1996-11-05', 'Namibian', 'Defender', '5', '/images/players/kaitano_amutenya.jpg', 'active'),
(4, 1, 'Mushimba', 'Hango', '1998-02-18', 'Namibian', 'Goalkeeper', '1', '/images/players/mushimba_hango.jpg', 'active'),
(5, 1, 'Tjituka', 'Munyika', '1997-07-30', 'Namibian', 'Midfielder', '8', '/images/players/tjituka_munyika.jpg', 'active'),
(6, 1, 'Petrus', 'Shilongo', '1996-03-15', 'Namibian', 'Defender', '3', '/images/players/petrus_shilongo.jpg', 'active'),
(7, 1, 'Absalom', 'Iimbondi', '1998-06-20', 'Namibian', 'Forward', '7', '/images/players/absalom_iimbondi.jpg', 'active'),
(8, 2, 'Albert', 'Shilongo', '1995-01-15', 'Namibian', 'Forward', '11', '/images/players/albert_shilongo.jpg', 'active'),
(9, 2, 'Daniel', 'Iikela', '1996-03-22', 'Namibian', 'Midfielder', '7', '/images/players/daniel_iikela.jpg', 'active'),
(10, 2, 'Patience', 'Nashandi', '1998-12-01', 'Namibian', 'Defender', '4', '/images/players/patience_nashandi.jpg', 'active'),
(11, 2, 'Victor', 'Tjihuiko', '1994-06-10', 'Namibian', 'Goalkeeper', '1', '/images/players/victor_tjihuiko.jpg', 'active'),
(12, 2, 'Emma', 'Shikongo', '1999-09-19', 'Namibian', 'Midfielder', '10', '/images/players/emma_shikongo.jpg', 'active'),
(13, 2, 'Moses', 'Shikongo', '1997-04-25', 'Namibian', 'Defender', '2', '/images/players/moses_shikongo.jpg', 'active'),
(14, 2, 'Lazarus', 'Kaimbi', '1996-08-30', 'Namibian', 'Forward', '9', '/images/players/lazarus_kaimbi.jpg', 'active'),
(15, 3, 'Jason', 'Haikera', '1995-04-02', 'Namibian', 'Forward', '9', '/images/players/jason_haikera.jpg', 'active'),
(16, 3, 'Linda', 'Katjikuua', '1997-11-11', 'Namibian', 'Midfielder', '10', '/images/players/linda_katjikuua.jpg', 'active'),
(17, 3, 'Selma', 'Shikongo', '1996-07-07', 'Namibian', 'Defender', '5', '/images/players/selma_shikongo.jpg', 'active'),
(18, 3, 'Moses', 'Nangolo', '1998-08-08', 'Namibian', 'Goalkeeper', '1', '/images/players/moses_nangolo.jpg', 'active'),
(19, 3, 'Tobias', 'Mupya', '1999-09-09', 'Namibian', 'Midfielder', '8', '/images/players/tobias_mupya.jpg', 'active'),
(20, 3, 'Ronald', 'Ketjijere', '1994-12-14', 'Namibian', 'Midfielder', '6', '/images/players/ronald_ketjijere.jpg', 'active'),
(21, 3, 'Deon', 'Hotto', '1990-10-29', 'Namibian', 'Forward', '11', '/images/players/deon_hotto.jpg', 'active'),
(22, 4, 'David', 'Shilongo', '1995-05-05', 'Namibian', 'Forward', '9', '/images/players/david_shilongo.jpg', 'active'),
(23, 4, 'Angela', 'Iikela', '1996-06-06', 'Namibian', 'Midfielder', '10', '/images/players/angela_iikela.jpg', 'active'),
(24, 4, 'Ben', 'Haikera', '1997-07-07', 'Namibian', 'Defender', '5', '/images/players/ben_haikera.jpg', 'active'),
(25, 4, 'Hannah', 'Shikongo', '1998-08-08', 'Namibian', 'Goalkeeper', '1', '/images/players/hannah_shikongo.jpg', 'active'),
(26, 4, 'Lucas', 'Nangolo', '1999-09-09', 'Namibian', 'Midfielder', '8', '/images/players/lucas_nangolo.jpg', 'active'),
(27, 4, 'Peter', 'Shalulile', '1993-10-23', 'Namibian', 'Forward', '7', '/images/players/peter_shalulile.jpg', 'active'),
(28, 4, 'Benson', 'Shilongo', '1992-05-18', 'Namibian', 'Defender', '4', '/images/players/benson_shilongo.jpg', 'active'),
(29, 5, 'Itamunua', 'Keimuine', '1996-02-10', 'Namibian', 'Forward', '9', '/images/players/itamunua_keimuine.jpg', 'active'),
(30, 5, 'Willy', 'Stephanus', '1991-08-12', 'Namibian', 'Midfielder', '10', '/images/players/willy_stephanus.jpg', 'active'),
(31, 5, 'Larry', 'Horaeb', '1994-11-05', 'Namibian', 'Defender', '5', '/images/players/larry_horaeb.jpg', 'active'),
(32, 5, 'Max', 'Njilo', '1997-09-20', 'Namibian', 'Goalkeeper', '1', '/images/players/max_njilo.jpg', 'active'),
(33, 5, 'Denzil', 'Haoseb', '1995-07-15', 'Namibian', 'Midfielder', '8', '/images/players/denzil_haoseb.jpg', 'active'),
(34, 6, 'Aubrey', 'Amseb', '1996-03-22', 'Namibian', 'Forward', '9', '/images/players/aubrey_amseb.jpg', 'active'),
(35, 6, 'Pineas', 'Jacob', '1993-12-18', 'Namibian', 'Midfielder', '10', '/images/players/pineas_jacob.jpg', 'active'),
(36, 6, 'Ivan', 'Kamberipa', '1997-05-25', 'Namibian', 'Defender', '5', '/images/players/ivan_kamberipa.jpg', 'active'),
(37, 6, 'Virgil', 'Vries', '1989-06-10', 'Namibian', 'Goalkeeper', '1', '/images/players/virgil_vries.jpg', 'active'),
(38, 6, 'Ryan', 'Nyambe', '1997-12-14', 'Namibian', 'Defender', '2', '/images/players/ryan_nyambe.jpg', 'active'),
(39, 7, 'Benson', 'Shilongo', '1992-05-18', 'Namibian', 'Forward', '9', '/images/players/benson_shilongo_2.jpg', 'active'),
(40, 7, 'Hendrik', 'Somaeb', '1995-08-30', 'Namibian', 'Midfielder', '10', '/images/players/hendrik_somaeb.jpg', 'active'),
(41, 7, 'Ananias', 'Gebhardt', '1988-11-12', 'Namibian', 'Defender', '5', '/images/players/ananias_gebbardt.jpg', 'active'),
(42, 7, 'Loydt', 'Kazapua', '1990-03-14', 'Namibian', 'Goalkeeper', '1', '/images/players/loydt_kazapua.jpg', 'active'),
(43, 7, 'Dynamo', 'Fredericks', '1994-01-20', 'Namibian', 'Midfielder', '8', '/images/players/dynamo_fredericks.jpg', 'active'),
(44, 8, 'Absalom', 'Iimbondi', '1998-06-20', 'Namibian', 'Forward', '9', '/images/players/absalom_iimbondi_2.jpg', 'active'),
(45, 8, 'Petrus', 'Shitembi', '1992-09-05', 'Namibian', 'Midfielder', '10', '/images/players/petrus_shitembi.jpg', 'active'),
(46, 8, 'Chris', 'Katjiukua', '1988-07-18', 'Namibian', 'Defender', '5', '/images/players/chris_katjiukua.jpg', 'active'),
(47, 8, 'Ratanda', 'Mbazuvara', '1991-04-22', 'Namibian', 'Goalkeeper', '1', '/images/players/ratanda_mbazuvara.jpg', 'active'),
(48, 8, 'Wangu', 'Gome', '1996-11-08', 'Namibian', 'Midfielder', '8', '/images/players/wangu_gome.jpg', 'active'),
(49, 9, 'Muna', 'Katupose', '1995-02-14', 'Namibian', 'Forward', '9', '/images/players/muna_katupose.jpg', 'active'),
(50, 9, 'Marcel', 'Papama', '1993-06-25', 'Namibian', 'Midfielder', '10', '/images/players/marcel_papama.jpg', 'active'),
(51, 9, 'Riaan', 'Hanamub', '1995-02-08', 'Namibian', 'Defender', '5', '/images/players/riaan_hanamub.jpg', 'active'),
(52, 9, 'Edward', 'Maova', '1990-12-30', 'Namibian', 'Goalkeeper', '1', '/images/players/edward_maova.jpg', 'active'),
(53, 9, 'Tjipee', 'Karuuombe', '1994-09-12', 'Namibian', 'Midfielder', '8', '/images/players/tjipee_karuuombe.jpg', 'active'),
(54, 10, 'Elmo', 'Kambindu', '1996-01-15', 'Namibian', 'Forward', '9', '/images/players/elmo_kambindu.jpg', 'active'),
(55, 10, 'Wesley', 'Katz', '1992-07-20', 'Namibian', 'Midfielder', '10', '/images/players/wesley_katz.jpg', 'active'),
(56, 10, 'Aprocius', 'Petrus', '1989-05-18', 'Namibian', 'Defender', '5', '/images/players/aprocius_petrus.jpg', 'active'),
(57, 10, 'Kamaijanda', 'Ndisiro', '1991-03-10', 'Namibian', 'Goalkeeper', '1', '/images/players/kamaijanda_ndisiro.jpg', 'active'),
(58, 10, 'Panduleni', 'Nekundi', '1995-11-25', 'Namibian', 'Midfielder', '8', '/images/players/panduleni_nekundi.jpg', 'active');

-- Insert Matches (extensive test data - mix of upcoming fixtures and completed results)
INSERT INTO `matches` (`id`, `league_id`, `home_team_id`, `away_team_id`, `referee_id`, `venue`, `match_date`, `status`, `home_score`, `away_score`, `is_friendly`, `competition`, `image_path`) VALUES
(1, 1, 1, 2, 2, 'Sam Nujoma Stadium', '2025-12-15 15:00:00', 'scheduled', 0, 0, 0, 'Namibia Premier League', '/images/matches/match_1.jpg'),
(2, 1, 3, 4, 5, 'UNAM Stadium', '2025-12-16 17:00:00', 'scheduled', 0, 0, 0, 'Namibia Premier League', '/images/matches/match_2.jpg'),
(3, 1, 5, 6, 6, 'Nau-Aib Stadium', '2025-12-17 15:00:00', 'scheduled', 0, 0, 0, 'Namibia Premier League', '/images/matches/match_3.jpg'),
(4, 1, 7, 8, 7, 'Legare Stadium', '2025-12-18 16:00:00', 'scheduled', 0, 0, 0, 'Namibia Premier League', '/images/matches/match_4.jpg'),
(5, 1, 9, 10, 2, 'Rundu Sports Stadium', '2025-12-19 17:00:00', 'scheduled', 0, 0, 0, 'Namibia Premier League', '/images/matches/match_5.jpg'),
(6, 1, 11, 12, 5, 'Independence Stadium', '2025-12-20 15:00:00', 'scheduled', 0, 0, 0, 'Namibia Premier League', '/images/matches/match_6.jpg'),
(7, 1, 13, 14, 6, 'Sam Nujoma Stadium', '2025-12-21 17:00:00', 'scheduled', 0, 0, 0, 'Namibia Premier League', '/images/matches/match_7.jpg'),
(8, 1, 15, 1, 7, 'UNAM Stadium', '2025-12-22 15:00:00', 'scheduled', 0, 0, 0, 'Namibia Premier League', '/images/matches/match_8.jpg'),
(9, 1, 2, 3, 2, 'Kuisebmund Stadium', '2025-12-23 16:00:00', 'scheduled', 0, 0, 0, 'Namibia Premier League', '/images/matches/match_9.jpg'),
(10, 1, 4, 5, 5, 'Mokati Stadium', '2025-12-24 17:00:00', 'scheduled', 0, 0, 0, 'Namibia Premier League', '/images/matches/match_10.jpg'),
(11, 1, 2, 1, 5, 'Kuisebmund Stadium', '2025-11-10 15:00:00', 'completed', 2, 1, 0, 'Namibia Premier League', '/images/matches/match_11.jpg'),
(12, 1, 4, 3, 6, 'Mokati Stadium', '2025-11-11 17:00:00', 'completed', 1, 3, 0, 'Namibia Premier League', '/images/matches/match_12.jpg'),
(13, 1, 6, 5, 7, 'Sam Nujoma Stadium', '2025-11-12 15:00:00', 'completed', 0, 2, 0, 'Namibia Premier League', '/images/matches/match_13.jpg'),
(14, 1, 8, 7, 2, 'Okahandja United Stadium', '2025-11-13 16:00:00', 'completed', 2, 2, 0, 'Namibia Premier League', '/images/matches/match_14.jpg'),
(15, 1, 10, 9, 5, 'Independence Stadium', '2025-11-14 17:00:00', 'completed', 3, 1, 0, 'Namibia Premier League', '/images/matches/match_15.jpg'),
(16, 1, 12, 11, 6, 'Independence Stadium', '2025-11-15 15:00:00', 'completed', 1, 0, 0, 'Namibia Premier League', '/images/matches/match_16.jpg'),
(17, 1, 14, 13, 7, 'Mokati Stadium', '2025-11-16 16:00:00', 'completed', 2, 1, 0, 'Namibia Premier League', '/images/matches/match_17.jpg'),
(18, 1, 1, 15, 2, 'Sam Nujoma Stadium', '2025-11-17 17:00:00', 'completed', 4, 0, 0, 'Namibia Premier League', '/images/matches/match_18.jpg'),
(19, 1, 3, 2, 5, 'UNAM Stadium', '2025-11-18 15:00:00', 'completed', 1, 1, 0, 'Namibia Premier League', '/images/matches/match_19.jpg'),
(20, 1, 5, 4, 6, 'Nau-Aib Stadium', '2025-11-19 16:00:00', 'completed', 0, 3, 0, 'Namibia Premier League', '/images/matches/match_20.jpg'),
(21, 2, 1, 3, 2, 'Independence Stadium', '2025-12-20 15:00:00', 'scheduled', 0, 0, 0, 'Debmarine Cup', '/images/matches/cup_match_1.jpg'),
(22, 2, 2, 4, 5, 'Independence Stadium', '2025-12-21 17:00:00', 'scheduled', 0, 0, 0, 'Debmarine Cup', '/images/matches/cup_match_2.jpg'),
(23, 2, 5, 6, 6, 'Independence Stadium', '2025-12-22 15:00:00', 'scheduled', 0, 0, 0, 'Debmarine Cup', '/images/matches/cup_match_3.jpg'),
(24, 2, 7, 8, 7, 'Independence Stadium', '2025-12-23 17:00:00', 'scheduled', 0, 0, 0, 'Debmarine Cup', '/images/matches/cup_match_4.jpg');

-- Insert Match Events (for completed matches)
INSERT INTO `match_events` (`match_id`, `event_type`, `minute_mark`, `player_id`, `assisting_player_id`, `description`) VALUES
(11, 'goal', 23, 8, 9, 'Goal scored by Albert Shilongo'),
(11, 'goal', 45, 1, 2, 'Goal scored by Tjikuua Nangolo'),
(11, 'goal', 67, 8, NULL, 'Goal scored by Albert Shilongo'),
(11, 'yellow_card', 34, 3, NULL, 'Foul committed'),
(12, 'goal', 12, 15, 16, 'Goal scored by Jason Haikera'),
(12, 'goal', 28, 15, NULL, 'Goal scored by Jason Haikera'),
(12, 'goal', 55, 16, 15, 'Goal scored by Linda Katjikuua'),
(12, 'goal', 78, 22, NULL, 'Goal scored by David Shilongo'),
(12, 'red_card', 65, 24, NULL, 'Serious foul play'),
(13, 'goal', 33, 8, NULL, 'Goal scored by Albert Shilongo'),
(13, 'goal', 89, 8, 9, 'Goal scored by Albert Shilongo'),
(14, 'goal', 15, 44, 45, 'Goal scored by Absalom Iimbondi'),
(14, 'goal', 42, 39, NULL, 'Goal scored by Benson Shilongo'),
(14, 'goal', 67, 44, NULL, 'Goal scored by Absalom Iimbondi'),
(14, 'goal', 78, 40, NULL, 'Goal scored by Hendrik Somaeb'),
(15, 'goal', 8, 54, 55, 'Goal scored by Elmo Kambindu'),
(15, 'goal', 25, 54, NULL, 'Goal scored by Elmo Kambindu'),
(15, 'goal', 52, 54, 55, 'Goal scored by Elmo Kambindu'),
(15, 'goal', 71, 49, NULL, 'Goal scored by Muna Katupose'),
(16, 'goal', 33, 34, NULL, 'Goal scored by Aubrey Amseb'),
(17, 'goal', 18, 27, NULL, 'Goal scored by Peter Shalulile'),
(17, 'goal', 64, 27, 23, 'Goal scored by Peter Shalulile'),
(17, 'goal', 82, 25, NULL, 'Goal scored by Hannah Shikongo'),
(18, 'goal', 12, 1, 2, 'Goal scored by Tjikuua Nangolo'),
(18, 'goal', 28, 1, NULL, 'Goal scored by Tjikuua Nangolo'),
(18, 'goal', 45, 2, 1, 'Goal scored by Hileni Shihepo'),
(18, 'goal', 67, 7, NULL, 'Goal scored by Petrus Shilongo'),
(19, 'goal', 23, 15, NULL, 'Goal scored by Jason Haikera'),
(19, 'goal', 56, 8, NULL, 'Goal scored by Albert Shilongo'),
(20, 'goal', 34, 22, 23, 'Goal scored by David Shilongo'),
(20, 'goal', 51, 22, NULL, 'Goal scored by David Shilongo'),
(20, 'goal', 78, 27, NULL, 'Goal scored by Peter Shalulile');

-- Insert News/Announcements (extensive test data)
INSERT INTO `news` (`id`, `title`, `slug`, `summary`, `content`, `image_path`, `media_url`, `category`, `priority`, `author_id`, `published_at`) VALUES
(1, 'NFA Announces New Season Schedule', 'nfa-announces-new-season-schedule', 'The Namibia Football Association has released the official schedule for the 2025/2026 season.', 'The Namibia Football Association is pleased to announce the official schedule for the upcoming 2025/2026 season. All matches will be played according to the new calendar. The season promises to be exciting with 16 teams competing for the championship title.', '/images/news/nfa_season_schedule.jpg', NULL, 'announcement', 'high', 1, '2025-11-01 10:00:00'),
(2, 'Brave Warriors Qualify for AFCON', 'brave-warriors-qualify-afcon', 'Namibia national team secures qualification for the Africa Cup of Nations.', 'The Brave Warriors have successfully qualified for the 2025 Africa Cup of Nations after a thrilling victory in their final qualifying match. This marks a historic achievement for Namibian football.', '/images/news/brave_warriors_afcon.jpg', NULL, 'announcement', 'high', 1, '2025-11-05 14:00:00'),
(3, 'Match Preview: African Stars vs Blue Waters', 'match-preview-african-stars-blue-waters', 'Preview of the upcoming Premier League clash between two top teams.', 'This weekend sees a crucial match between African Stars and Blue Waters. Both teams are in excellent form and will be looking to secure three points. The match promises to be a thrilling encounter.', '/images/news/match_preview_1.jpg', NULL, 'preview', 'normal', 13, '2025-11-08 09:00:00'),
(4, 'Match Report: UNam FC Defeats Mighty Gunners', 'match-report-unam-mighty-gunners', 'Comprehensive report on UNam FC\'s victory over Mighty Gunners.', 'UNam FC secured an impressive 3-1 victory over Mighty Gunners in an entertaining match at UNAM Stadium. The home team dominated from start to finish with excellent performances from key players.', '/images/news/match_report_1.jpg', NULL, 'report', 'normal', 13, '2025-11-12 18:00:00'),
(5, 'NFA Press Release: New Sponsorship Deal', 'nfa-press-release-sponsorship', 'NFA announces major new sponsorship partnership.', 'The Namibia Football Association is delighted to announce a new multi-year sponsorship deal with a leading Namibian company. This partnership will support the development of football at all levels.', '/images/news/sponsorship_deal.jpg', NULL, 'press', 'high', 1, '2025-11-10 11:00:00'),
(6, 'Youth Development Program Launched', 'youth-development-program-launched', 'NFA launches comprehensive youth development initiative across all regions.', 'The Namibia Football Association has launched an ambitious youth development program aimed at identifying and nurturing young talent. The program will establish regional academies and provide coaching education.', '/images/news/youth_program.jpg', NULL, 'announcement', 'high', 1, '2025-11-15 09:00:00'),
(7, 'Transfer News: Star Player Signs New Contract', 'transfer-news-star-player-contract', 'Top player extends contract with Premier League club.', 'One of the league\'s most talented players has signed a new long-term contract with his current club, ending speculation about a potential transfer. The player expressed his commitment to the team.', '/images/news/transfer_news_1.jpg', NULL, 'transfer', 'normal', 13, '2025-11-18 14:00:00'),
(8, 'Stadium Renovation Project Completed', 'stadium-renovation-completed', 'Major stadium renovation project successfully completed ahead of schedule.', 'The Independence Stadium renovation project has been completed successfully. The upgraded facilities will enhance the matchday experience for fans and provide better infrastructure for players.', '/images/news/stadium_renovation.jpg', NULL, 'announcement', 'normal', 1, '2025-11-20 10:00:00'),
(9, 'Match Preview: Windhoek City vs Ongos SC', 'match-preview-windhoek-ongos', 'Preview of the weekend fixture between Windhoek City and Ongos SC.', 'Windhoek City will host Ongos SC in what promises to be an exciting match. Both teams are looking to climb the league table and secure valuable points.', '/images/news/match_preview_2.jpg', NULL, 'preview', 'normal', 13, '2025-11-22 08:00:00'),
(10, 'Coaching Course Registration Open', 'coaching-course-registration', 'NFA opens registration for advanced coaching certification course.', 'The Namibia Football Association is now accepting registrations for the upcoming advanced coaching certification course. This course is designed for experienced coaches looking to enhance their skills.', '/images/news/coaching_course.jpg', NULL, 'announcement', 'normal', 1, '2025-11-25 11:00:00'),
(11, 'Match Report: African Stars Win Thriller', 'match-report-african-stars-thriller', 'African Stars secure dramatic victory in last-minute thriller.', 'African Stars secured a dramatic 3-2 victory in a thrilling match that went down to the wire. The winning goal came in the 89th minute, sending the home fans into celebration.', '/images/news/match_report_2.jpg', NULL, 'report', 'normal', 13, '2025-11-28 19:00:00'),
(12, 'Referee Training Program Announced', 'referee-training-program', 'NFA announces comprehensive referee training and development program.', 'The Namibia Football Association has announced a new comprehensive referee training program aimed at improving officiating standards across all levels of football in the country.', '/images/news/referee_training.jpg', NULL, 'announcement', 'normal', 1, '2025-12-01 10:00:00'),
(13, 'Transfer Window Opens', 'transfer-window-opens', 'January transfer window officially opens for all clubs.', 'The January transfer window has officially opened, allowing clubs to strengthen their squads. Several clubs have already expressed interest in new signings.', '/images/news/transfer_window.jpg', NULL, 'transfer', 'normal', 13, '2025-12-05 09:00:00'),
(14, 'Match Preview: Cup Quarterfinals', 'match-preview-cup-quarterfinals', 'Preview of the upcoming cup quarterfinal matches.', 'The cup competition reaches the quarterfinal stage with four exciting matches scheduled. All teams will be giving their all to progress to the semifinals.', '/images/news/cup_quarterfinals.jpg', NULL, 'preview', 'normal', 13, '2025-12-08 08:00:00'),
(15, 'Player of the Month Award', 'player-month-award', 'Premier League announces Player of the Month award winner.', 'The Premier League has announced the Player of the Month award winner for November. The recipient has been in outstanding form, contributing significantly to his team\'s success.', '/images/news/player_of_month.jpg', NULL, 'announcement', 'normal', 1, '2025-12-10 12:00:00');

-- Insert Sponsors
INSERT INTO `sponsors` (`id`, `name`, `contact_email`, `phone`, `logo_path`) VALUES
(1, 'Namibia Breweries', 'contact@nb.com.na', '061-202020', '/images/sponsors/namibia_breweries_logo.png'),
(2, 'Ohorongo Cement', 'info@ohorongo.com.na', '061-303030', '/images/sponsors/ohorongo_cement_logo.png'),
(3, 'MTC Namibia', 'support@mtc.com.na', '061-404040', '/images/sponsors/mtc_logo.png'),
(4, 'FNB Namibia', 'contact@fnb.com.na', '061-505050', '/images/sponsors/fnb_logo.png'),
(5, 'Standard Bank Namibia', 'info@standardbank.com.na', '061-606060', '/images/sponsors/standardbank_logo.png');

-- Insert Team Sponsors
INSERT INTO `team_sponsors` (`team_id`, `sponsor_id`, `start_date`, `end_date`) VALUES
(1, 1, '2025-01-01', '2025-12-31'),
(2, 2, '2025-01-01', '2025-12-31'),
(3, 3, '2025-01-01', '2025-12-31'),
(4, 4, '2025-01-01', '2025-12-31'),
(5, 5, '2025-01-01', '2025-12-31');

-- Insert Products/Merchandise (extensive test data)
INSERT INTO `products` (`id`, `name`, `description`, `category`, `price`, `discount`, `stock`, `in_stock`, `image_url`, `sizes`, `rating`, `reviews`, `shipping_days`, `shipping_cost`, `free_shipping_threshold`, `status`) VALUES
(1, 'NamFootball Hub Home Jersey', 'Official home jersey of the Brave Warriors', 'Jerseys', 450.00, 0, 24, 1, '/images/products/home_jersey.jpg', '["S", "M", "L", "XL", "XXL"]', 4.7, 132, 3, 50.00, 500.00, 'active'),
(2, 'NamFootball Hub Away Jersey', 'Official away jersey of the Brave Warriors', 'Jerseys', 450.00, 0, 0, 0, '/images/products/away_jersey.jpg', '["S", "M", "L", "XL", "XXL"]', 4.5, 98, 3, 50.00, 500.00, 'active'),
(3, 'NFA Cap', 'Official NFA branded baseball cap', 'Accessories', 120.00, 20, 45, 1, '/images/products/nfa_cap.jpg', '["One Size"]', 4.2, 61, 2, 30.00, 500.00, 'active'),
(4, 'Official Football', 'Official match ball used in NFA competitions', 'Equipment', 280.00, 0, 15, 1, '/images/products/official_football.jpg', '["One Size"]', 4.6, 74, 3, 40.00, 500.00, 'active'),
(5, 'Team Scarf', 'Official team scarf with Brave Warriors colors', 'Accessories', 95.00, 0, 53, 1, '/images/products/team_scarf.jpg', '["One Size"]', 4.4, 45, 2, 25.00, 500.00, 'active'),
(6, 'Training Kit', 'Complete training kit for players and fans', 'Jerseys', 350.00, 0, 12, 1, '/images/products/training_kit.jpg', '["S", "M", "L", "XL", "XXL"]', 4.5, 88, 3, 50.00, 500.00, 'active'),
(7, 'Goalkeeper Jersey', 'Special goalkeeper jersey design', 'Jerseys', 480.00, 15, 8, 1, '/images/products/goalkeeper_jersey.jpg', '["S", "M", "L", "XL", "XXL"]', 4.3, 42, 3, 50.00, 500.00, 'active'),
(8, 'Team Jacket', 'Warm-up jacket with team logo', 'Accessories', 320.00, 0, 18, 1, '/images/products/team_jacket.jpg', '["S", "M", "L", "XL", "XXL"]', 4.6, 67, 3, 45.00, 500.00, 'active'),
(9, 'Team Shorts', 'Official team shorts', 'Accessories', 180.00, 0, 32, 1, '/images/products/team_shorts.jpg', '["S", "M", "L", "XL", "XXL"]', 4.4, 55, 2, 30.00, 500.00, 'active'),
(10, 'Team Socks', 'Official team socks', 'Accessories', 65.00, 0, 75, 1, '/images/products/team_socks.jpg', '["One Size"]', 4.1, 38, 2, 20.00, 500.00, 'active'),
(11, 'Team Backpack', 'Official team backpack for training', 'Accessories', 250.00, 10, 20, 1, '/images/products/team_backpack.jpg', '["One Size"]', 4.5, 52, 3, 40.00, 500.00, 'active'),
(12, 'Team Water Bottle', 'Reusable water bottle with team logo', 'Accessories', 85.00, 0, 60, 1, '/images/products/water_bottle.jpg', '["One Size"]', 4.3, 41, 2, 25.00, 500.00, 'active'),
(13, 'Team Keychain', 'Official team keychain', 'Accessories', 45.00, 0, 120, 1, '/images/products/keychain.jpg', '["One Size"]', 4.2, 89, 2, 15.00, 500.00, 'active'),
(14, 'Team Badge', 'Official team badge pin', 'Accessories', 35.00, 0, 150, 1, '/images/products/team_badge.jpg', '["One Size"]', 4.0, 72, 2, 15.00, 500.00, 'active'),
(15, 'Team Flag', 'Large team flag for display', 'Accessories', 200.00, 0, 15, 1, '/images/products/team_flag.jpg', '["One Size"]', 4.7, 28, 3, 35.00, 500.00, 'active'),
(16, 'Training Cones Set', 'Set of 10 training cones', 'Equipment', 150.00, 0, 25, 1, '/images/products/training_cones.jpg', '["One Size"]', 4.4, 33, 3, 30.00, 500.00, 'active'),
(17, 'Team Towel', 'Official team towel', 'Accessories', 75.00, 0, 40, 1, '/images/products/team_towel.jpg', '["One Size"]', 4.1, 47, 2, 20.00, 500.00, 'active'),
(18, 'Team Wristband', 'Official team wristband set', 'Accessories', 55.00, 0, 80, 1, '/images/products/wristband.jpg', '["One Size"]', 4.3, 56, 2, 20.00, 500.00, 'active'),
(19, 'Team Beanie', 'Warm team beanie for cold weather', 'Accessories', 90.00, 0, 35, 1, '/images/products/team_beanie.jpg', '["One Size"]', 4.5, 44, 2, 25.00, 500.00, 'active'),
(20, 'Team Polo Shirt', 'Casual team polo shirt', 'Jerseys', 220.00, 0, 28, 1, '/images/products/polo_shirt.jpg', '["S", "M", "L", "XL", "XXL"]', 4.6, 63, 3, 35.00, 500.00, 'active');

-- Insert Standings (test data)
INSERT INTO `standings` (`league_id`, `team_id`, `played`, `wins`, `draws`, `losses`, `goals_for`, `goals_against`, `goal_difference`, `points`) VALUES
(1, 1, 10, 7, 2, 1, 18, 8, 10, 23),
(1, 2, 10, 6, 3, 1, 16, 9, 7, 21),
(1, 3, 10, 6, 2, 2, 15, 10, 5, 20),
(1, 4, 10, 5, 4, 1, 14, 8, 6, 19),
(1, 5, 10, 5, 3, 2, 13, 9, 4, 18),
(1, 6, 10, 4, 4, 2, 12, 10, 2, 16),
(1, 7, 10, 4, 3, 3, 11, 11, 0, 15),
(1, 8, 10, 3, 5, 2, 10, 9, 1, 14),
(1, 9, 10, 3, 4, 3, 9, 10, -1, 13),
(1, 10, 10, 2, 5, 3, 8, 11, -3, 11),
(1, 11, 10, 2, 4, 4, 7, 12, -5, 10),
(1, 12, 10, 1, 6, 3, 6, 10, -4, 9),
(1, 13, 10, 1, 5, 4, 5, 12, -7, 8),
(1, 14, 10, 1, 4, 5, 4, 13, -9, 7),
(1, 15, 10, 0, 3, 7, 3, 15, -12, 3);

-- Insert Referees
INSERT INTO `referees` (`user_id`, `license_number`, `experience_years`, `region`, `photo_path`, `status`) VALUES
(2, 'REF-001', 8, 'Khomas', '/images/referees/maria_amakali.jpg', 'active'),
(5, 'REF-002', 5, 'Erongo', '/images/referees/linda_katjikuua.jpg', 'active'),
(6, 'REF-003', 10, 'Otjozondjupa', '/images/referees/erick_amutenya.jpg', 'active'),
(7, 'REF-004', 3, 'Omaheke', '/images/referees/patience_shikongo.jpg', 'active'),
(17, 'REF-005', 6, 'Khomas', '/images/referees/james_referee.jpg', 'active'),
(23, 'REF-006', 4, 'Erongo', '/images/referees/patricia_referee.jpg', 'active');

-- =====================================================
-- Add Foreign Key Constraints
-- =====================================================

ALTER TABLE `disciplinary_records`
  ADD CONSTRAINT `disciplinary_records_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `disciplinary_records_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `disciplinary_records_ibfk_3` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `disciplinary_records_ibfk_4` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `injuries`
  ADD CONSTRAINT `injuries_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

ALTER TABLE `matches`
  ADD CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matches_ibfk_3` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matches_ibfk_4` FOREIGN KEY (`referee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `match_events`
  ADD CONSTRAINT `match_events_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `match_events_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `match_events_ibfk_3` FOREIGN KEY (`assisting_player_id`) REFERENCES `players` (`id`) ON DELETE SET NULL;

ALTER TABLE `news`
  ADD CONSTRAINT `news_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `players`
  ADD CONSTRAINT `players_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE;

ALTER TABLE `player_match_stats`
  ADD CONSTRAINT `fk_stats_club` FOREIGN KEY (`club_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stats_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stats_match` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stats_player` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

ALTER TABLE `referees`
  ADD CONSTRAINT `referees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `standings`
  ADD CONSTRAINT `standings_ibfk_1` FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `standings_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE;

ALTER TABLE `teams`
  ADD CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `teams_ibfk_2` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `teams_ibfk_3` FOREIGN KEY (`stadium_id`) REFERENCES `stadiums` (`id`) ON DELETE SET NULL;

ALTER TABLE `team_sponsors`
  ADD CONSTRAINT `team_sponsors_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_sponsors_ibfk_2` FOREIGN KEY (`sponsor_id`) REFERENCES `sponsors` (`id`) ON DELETE CASCADE;

-- =====================================================
-- Create Tickets Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `section` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `row` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seat` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('available','sold','reserved','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `match_id` (`match_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Polls Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `polls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `author_id` int DEFAULT NULL,
  `news_id` int DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `allow_multiple_votes` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `news_id` (`news_id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `polls_ibfk_1` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE,
  CONSTRAINT `polls_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Poll Options Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `poll_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `poll_id` int NOT NULL,
  `option_text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_order` int DEFAULT '0',
  `vote_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `poll_id` (`poll_id`),
  CONSTRAINT `poll_options_ibfk_1` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Create Poll Votes Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `poll_votes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `poll_id` int NOT NULL,
  `option_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_poll` (`poll_id`,`user_id`),
  KEY `option_id` (`option_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `poll_votes_ibfk_1` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE,
  CONSTRAINT `poll_votes_ibfk_2` FOREIGN KEY (`option_id`) REFERENCES `poll_options` (`id`) ON DELETE CASCADE,
  CONSTRAINT `poll_votes_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- =====================================================
-- Database setup complete!
-- =====================================================
-- Test login credentials:
-- Email: tangi@gmail.com
-- Password: password123
-- =====================================================


