-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 11, 2025 at 01:32 PM
-- Server version: 8.0.41
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `football`
--

-- --------------------------------------------------------

--
-- Table structure for table `disciplinary_records`
--

DROP TABLE IF EXISTS `disciplinary_records`;
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

-- --------------------------------------------------------

--
-- Table structure for table `injuries`
--

DROP TABLE IF EXISTS `injuries`;
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

-- --------------------------------------------------------

--
-- Table structure for table `leagues`
--

DROP TABLE IF EXISTS `leagues`;
CREATE TABLE IF NOT EXISTS `leagues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `season` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leagues`
--

INSERT INTO `leagues` (`id`, `name`, `season`, `start_date`, `end_date`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Namibia Premier League', '2025/2026', '2025-08-01', '2026-05-31', 'Top-flight professional football league in Namibia.', '2025-11-11 12:53:20', '2025-11-11 12:53:20'),
(2, 'Debmarine Cup', '2025', '2025-03-10', '2025-10-15', 'National knockout cup competition.', '2025-11-11 12:53:20', '2025-11-11 12:53:20');

-- --------------------------------------------------------

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `league_id` (`league_id`),
  KEY `home_team_id` (`home_team_id`),
  KEY `away_team_id` (`away_team_id`),
  KEY `referee_id` (`referee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `matches`
--

INSERT INTO `matches` (`id`, `league_id`, `home_team_id`, `away_team_id`, `referee_id`, `venue`, `match_date`, `status`, `home_score`, `away_score`, `is_friendly`, `report_status`, `referee_report`, `report_submitted_at`, `report_reviewed_at`, `report_review_notes`, `cancellation_reason`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 3, 'Sam Nujoma Stadium', '2025-09-15 15:00:00', 'scheduled', 0, 0, 0, 'draft', NULL, NULL, NULL, NULL, NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(2, 1, 3, 4, 2, 'UNAM Stadium', '2025-09-16 17:00:00', 'scheduled', 0, 0, 0, 'draft', NULL, NULL, NULL, NULL, NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(3, 1, 5, 6, 1, 'Nau-Aib Stadium', '2025-09-17 15:00:00', 'scheduled', 0, 0, 0, 'draft', NULL, NULL, NULL, NULL, NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(4, 1, 7, 8, 2, 'Legare Stadium', '2025-09-18 16:00:00', 'scheduled', 0, 0, 0, 'draft', NULL, NULL, NULL, NULL, NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(5, 1, 9, 10, 3, 'Rundu Sports Stadium', '2025-09-19 17:00:00', 'scheduled', 0, 0, 0, 'draft', NULL, NULL, NULL, NULL, NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27');

-- --------------------------------------------------------

--
-- Table structure for table `match_events`
--

DROP TABLE IF EXISTS `match_events`;
CREATE TABLE IF NOT EXISTS `match_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_id` int NOT NULL,
  `event_type` enum('goal','yellow_card','red_card','substitution','penalty','own_goal') COLLATE utf8mb4_unicode_ci NOT NULL,
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

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
CREATE TABLE IF NOT EXISTS `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `summary` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_id` int DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `players`
--

INSERT INTO `players` (`id`, `team_id`, `first_name`, `last_name`, `dob`, `nationality`, `position`, `jersey_number`, `status`, `photo_path`, `created_at`, `updated_at`) VALUES
(1, 1, 'Tjikuua', 'Nangolo', '1995-05-12', 'Namibian', 'Forward', '9', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(2, 1, 'Hileni', 'Shihepo', '1997-08-23', 'Namibian', 'Midfielder', '10', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(3, 1, 'Kaitano', 'Amutenya', '1996-11-05', 'Namibian', 'Defender', '5', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(4, 1, 'Mushimba', 'Hango', '1998-02-18', 'Namibian', 'Goalkeeper', '1', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(5, 1, 'Tjituka', 'Munyika', '1997-07-30', 'Namibian', 'Midfielder', '8', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(6, 2, 'Albert', 'Shilongo', '1995-01-15', 'Namibian', 'Forward', '11', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(7, 2, 'Daniel', 'Iikela', '1996-03-22', 'Namibian', 'Midfielder', '7', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(8, 2, 'Patience', 'Nashandi', '1998-12-01', 'Namibian', 'Defender', '4', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(9, 2, 'Victor', 'Tjihuiko', '1994-06-10', 'Namibian', 'Goalkeeper', '1', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(10, 2, 'Emma', 'Shikongo', '1999-09-19', 'Namibian', 'Midfielder', '10', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(11, 3, 'Jason', 'Haikera', '1995-04-02', 'Namibian', 'Forward', '9', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(12, 3, 'Linda', 'Katjikuua', '1997-11-11', 'Namibian', 'Midfielder', '10', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(13, 3, 'Selma', 'Shikongo', '1996-07-07', 'Namibian', 'Defender', '5', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(14, 3, 'Moses', 'Nangolo', '1998-08-08', 'Namibian', 'Goalkeeper', '1', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(15, 3, 'Tobias', 'Mupya', '1999-09-09', 'Namibian', 'Midfielder', '8', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(16, 4, 'David', 'Shilongo', '1995-05-05', 'Namibian', 'Forward', '9', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(17, 4, 'Angela', 'Iikela', '1996-06-06', 'Namibian', 'Midfielder', '10', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(18, 4, 'Ben', 'Haikera', '1997-07-07', 'Namibian', 'Defender', '5', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(19, 4, 'Hannah', 'Shikongo', '1998-08-08', 'Namibian', 'Goalkeeper', '1', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(20, 4, 'Lucas', 'Nangolo', '1999-09-09', 'Namibian', 'Midfielder', '8', 'active', NULL, '2025-11-11 13:05:27', '2025-11-11 13:05:27');

-- --------------------------------------------------------

--
-- Table structure for table `player_match_stats`
--

DROP TABLE IF EXISTS `player_match_stats`;
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

-- --------------------------------------------------------

--
-- Table structure for table `referees`
--

DROP TABLE IF EXISTS `referees`;
CREATE TABLE IF NOT EXISTS `referees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `license_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience_years` int DEFAULT NULL,
  `region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
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

-- --------------------------------------------------------

--
-- Table structure for table `sponsors`
--

DROP TABLE IF EXISTS `sponsors`;
CREATE TABLE IF NOT EXISTS `sponsors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sponsors`
--

INSERT INTO `sponsors` (`id`, `name`, `contact_email`, `phone`, `logo_path`, `created_at`, `updated_at`) VALUES
(1, 'Namibia Breweries', 'contact@nb.com.na', '061-202020', '/logos/namibia_breweries.png', '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(2, 'Ohorongo Cement', 'info@ohorongo.com.na', '061-303030', '/logos/ohorongo_cement.png', '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(3, 'MTC Namibia', 'support@mtc.com.na', '061-404040', '/logos/mtc.png', '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(4, 'FNB Namibia', 'contact@fnb.com.na', '061-505050', '/logos/fnb.png', '2025-11-11 13:05:27', '2025-11-11 13:05:27'),
(5, 'Standard Bank Namibia', 'info@standardbank.com.na', '061-606060', '/logos/standardbank.png', '2025-11-11 13:05:27', '2025-11-11 13:05:27');

-- --------------------------------------------------------

--
-- Table structure for table `stadiums`
--

DROP TABLE IF EXISTS `stadiums`;
CREATE TABLE IF NOT EXISTS `stadiums` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `established_year` int DEFAULT NULL,
  `surface_type` enum('grass','artificial','mixed') COLLATE utf8mb4_unicode_ci DEFAULT 'grass',
  `status` enum('active','under_renovation','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stadiums`
--

INSERT INTO `stadiums` (`id`, `name`, `city`, `capacity`, `established_year`, `surface_type`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Independence Stadium', 'Windhoek', 25000, 1990, 'grass', 'active', '2025-11-11 12:53:20', '2025-11-11 12:53:20'),
(2, 'Sam Nujoma Stadium', 'Katutura, Windhoek', 10000, 2005, 'grass', 'active', '2025-11-11 12:53:20', '2025-11-11 12:53:20'),
(3, 'Kuisebmund Stadium', 'Walvis Bay', 4000, 1980, 'grass', 'active', '2025-11-11 12:53:20', '2025-11-11 12:53:20'),
(4, 'NFA Technical Centre', 'Windhoek', 3000, 2010, 'artificial', 'active', '2025-11-11 12:53:20', '2025-11-11 12:53:20'),
(5, 'Mokati Stadium', 'Otjiwarongo', 5000, 1995, 'grass', 'active', '2025-11-11 12:53:20', '2025-11-11 12:53:20'),
(6, 'Legare Stadium', 'Gobabis', 2000, 1988, 'grass', 'active', '2025-11-11 12:53:20', '2025-11-11 12:53:20'),
(7, 'Nau-Aib Stadium', 'Okahandja', 5000, 1998, 'grass', 'active', '2025-11-11 12:53:20', '2025-11-11 12:53:20'),
(8, 'UNAM Stadium', 'Windhoek', 5000, 2000, 'grass', 'active', '2025-11-11 12:53:20', '2025-11-11 12:53:20'),
(9, 'Rundu Sports Stadium', 'Rundu', 3000, 1992, 'grass', 'active', '2025-11-11 12:53:20', '2025-11-11 12:53:20'),
(10, 'Momhadi Stadium', 'Windhoek', 3500, 1991, 'grass', 'active', '2025-11-11 12:53:20', '2025-11-11 12:53:20');

-- --------------------------------------------------------

--
-- Table structure for table `standings`
--

DROP TABLE IF EXISTS `standings`;
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

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `league_id` (`league_id`),
  KEY `manager_id` (`manager_id`),
  KEY `stadium_id` (`stadium_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `name`, `code`, `league_id`, `manager_id`, `founded_year`, `logo_path`, `status`, `stadium_id`, `created_at`, `updated_at`) VALUES
(1, 'African Stars', 'AS', 1, 3, 1962, NULL, 'approved', 2, '2025-11-11 12:53:21', '2025-11-11 13:05:26'),
(2, 'Blue Waters', 'BW', 1, 39, 1985, NULL, 'approved', 3, '2025-11-11 12:53:21', '2025-11-11 13:05:26'),
(3, 'UNam FC', 'UNAM', 1, 40, 1999, NULL, 'approved', 8, '2025-11-11 12:53:21', '2025-11-11 13:05:27'),
(4, 'Mighty Gunners', 'MG', 1, 3, 1995, NULL, 'approved', 5, '2025-11-11 12:53:21', '2025-11-11 13:05:27'),
(5, 'Khomas Nampol', 'KN', 1, 39, 1998, NULL, 'approved', 8, '2025-11-11 12:53:21', '2025-11-11 13:05:27'),
(6, 'Ongos SC', 'ONG', 1, 40, 2005, NULL, 'approved', 2, '2025-11-11 12:53:21', '2025-11-11 13:05:27'),
(7, 'Young African', 'YA', 1, 3, 1995, NULL, 'approved', 6, '2025-11-11 12:53:21', '2025-11-11 13:05:27'),
(8, 'Okahandja United', 'OU', 1, 39, 1998, NULL, 'approved', 7, '2025-11-11 12:53:21', '2025-11-11 13:05:27'),
(9, 'Julinho Sporting', 'JS', 1, 40, 1992, NULL, 'approved', 9, '2025-11-11 12:53:21', '2025-11-11 13:05:27'),
(10, 'Windhoek City', 'WC', 1, 3, 1990, NULL, 'approved', 1, '2025-11-11 12:53:21', '2025-11-11 13:05:27');

-- --------------------------------------------------------

--
-- Table structure for table `team_sponsors`
--

DROP TABLE IF EXISTS `team_sponsors`;
CREATE TABLE IF NOT EXISTS `team_sponsors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `sponsor_id` int NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  KEY `sponsor_id` (`sponsor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team_sponsors`
--

INSERT INTO `team_sponsors` (`id`, `team_id`, `sponsor_id`, `start_date`, `end_date`) VALUES
(1, 1, 1, '2025-01-01', '2025-12-31'),
(2, 2, 2, '2025-01-01', '2025-12-31'),
(3, 3, 3, '2025-01-01', '2025-12-31'),
(4, 4, 4, '2025-01-01', '2025-12-31'),
(5, 5, 5, '2025-01-01', '2025-12-31');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','referee','club_manager') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'referee',
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `role`, `phone`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Tangi', 'Nangolo', 'tangi@gmail.com', '$2y$10$JmIBSDOAzr2coy4unAjh/.85zto4VYSMJ3WZmVMOse9ijx0k0GLwu', 'admin', '0812345678', 'active', '2025-11-11 12:53:20', '2025-11-11 13:12:58'),
(2, 'Maria', 'Amakali', 'maria.referee@nfa.org.na', '$2y$10$JmIBSDOAzr2coy4unAjh/.85zto4VYSMJ3WZmVMOse9ijx0k0GLwu', 'referee', '0811111111', 'active', '2025-11-11 12:53:20', '2025-11-11 12:53:20'),
(3, 'Samuel', 'Shihepo', 'samuel.manager@nfa.org.na', '$2y$10$JmIBSDOAzr2coy4unAjh/.85zto4VYSMJ3WZmVMOse9ijx0k0GLwu', 'club_manager', '0812222222', 'active', '2025-11-11 12:53:20', '2025-11-11 13:20:59'),
(4, 'David', 'Nangolo', 'david.admin@nfa.org.na', '$2y$10$JmIBSDOAzr2coy4unAjh/.85zto4VYSMJ3WZmVMOse9ijx0k0GLwu', 'admin', '0813333333', 'active', '2025-11-11 12:53:20', '2025-11-11 12:53:20'),
(5, 'Linda', 'Katjikuua', 'linda.referee@nfa.org.na', '$2y$10$JmIBSDOAzr2coy4unAjh/.85zto4VYSMJ3WZmVMOse9ijx0k0GLwu', 'referee', '0814444444', 'active', '2025-11-11 13:05:26', '2025-11-11 13:05:26'),
(6, 'Erick', 'Amutenya', 'erick.referee@nfa.org.na', '$2y$10$JmIBSDOAzr2coy4unAjh/.85zto4VYSMJ3WZmVMOse9ijx0k0GLwu', 'referee', '0815555555', 'active', '2025-11-11 13:05:26', '2025-11-11 13:05:26'),
(7, 'Patience', 'Shikongo', 'patience.referee@nfa.org.na', '$2y$10$JmIBSDOAzr2coy4unAjh/.85zto4VYSMJ3WZmVMOse9ijx0k0GLwu', 'referee', '0816666666', 'active', '2025-11-11 13:05:26', '2025-11-11 13:05:26'),
(8, 'Hileni', 'Mbongolo', 'hileni.manager@nfa.org.na', '$2y$10$JmIBSDOAzr2coy4unAjh/.85zto4VYSMJ3WZmVMOse9ijx0k0GLwu', 'club_manager', '0817777777', 'active', '2025-11-11 13:05:26', '2025-11-11 13:21:00'),
(9, 'Tjikuua', 'Hango', 'tjikuua.manager@nfa.org.na', '$2y$10$JmIBSDOAzr2coy4unAjh/.85zto4VYSMJ3WZmVMOse9ijx0k0GLwu', 'club_manager', '0818888888', 'active', '2025-11-11 13:05:26', '2025-11-11 13:21:00'),
(10, 'Kaitano', 'Munyika', 'kaitano.manager@nfa.org.na', '$2y$10$JmIBSDOAzr2coy4unAjh/.85zto4VYSMJ3WZmVMOse9ijx0k0GLwu', 'club_manager', '0819999999', 'active', '2025-11-11 13:05:26', '2025-11-11 13:21:00');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `disciplinary_records`
--
ALTER TABLE `disciplinary_records`
  ADD CONSTRAINT `disciplinary_records_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `disciplinary_records_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `disciplinary_records_ibfk_3` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `disciplinary_records_ibfk_4` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `injuries`
--
ALTER TABLE `injuries`
  ADD CONSTRAINT `injuries_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `matches`
--
ALTER TABLE `matches`
  ADD CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matches_ibfk_3` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matches_ibfk_4` FOREIGN KEY (`referee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `match_events`
--
ALTER TABLE `match_events`
  ADD CONSTRAINT `match_events_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `match_events_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `match_events_ibfk_3` FOREIGN KEY (`assisting_player_id`) REFERENCES `players` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `news`
--
ALTER TABLE `news`
  ADD CONSTRAINT `news_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `players`
--
ALTER TABLE `players`
  ADD CONSTRAINT `players_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `player_match_stats`
--
ALTER TABLE `player_match_stats`
  ADD CONSTRAINT `fk_stats_club` FOREIGN KEY (`club_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stats_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stats_match` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stats_player` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `referees`
--
ALTER TABLE `referees`
  ADD CONSTRAINT `referees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `standings`
--
ALTER TABLE `standings`
  ADD CONSTRAINT `standings_ibfk_1` FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `standings_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `teams_ibfk_2` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `teams_ibfk_3` FOREIGN KEY (`stadium_id`) REFERENCES `stadiums` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `team_sponsors`
--
ALTER TABLE `team_sponsors`
  ADD CONSTRAINT `team_sponsors_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_sponsors_ibfk_2` FOREIGN KEY (`sponsor_id`) REFERENCES `sponsors` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
