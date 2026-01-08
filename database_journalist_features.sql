-- =====================================================
-- Database Schema for Journalist Features
-- =====================================================

-- Add status and scheduled_publish_at to news table
ALTER TABLE `news` 
ADD COLUMN IF NOT EXISTS `status` enum('draft','scheduled','published','archived') DEFAULT 'draft' AFTER `priority`,
ADD COLUMN IF NOT EXISTS `scheduled_publish_at` datetime DEFAULT NULL AFTER `published_at`,
ADD COLUMN IF NOT EXISTS `is_breaking` tinyint(1) DEFAULT '0' AFTER `featured`,
ADD COLUMN IF NOT EXISTS `match_id` int DEFAULT NULL AFTER `author_id`,
ADD KEY IF NOT EXISTS `match_id` (`match_id`);

-- Create Comments Table
CREATE TABLE IF NOT EXISTS `news_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `news_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected','flagged') DEFAULT 'pending',
  `moderated_by` int DEFAULT NULL,
  `moderated_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `news_id` (`news_id`),
  KEY `user_id` (`user_id`),
  KEY `parent_id` (`parent_id`),
  KEY `moderated_by` (`moderated_by`),
  CONSTRAINT `news_comments_ibfk_1` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE,
  CONSTRAINT `news_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `news_comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `news_comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `news_comments_ibfk_4` FOREIGN KEY (`moderated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Interviews Table
CREATE TABLE IF NOT EXISTS `interviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `interviewee_type` enum('player','coach','official','other') DEFAULT 'player',
  `interviewee_id` int DEFAULT NULL,
  `interviewee_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_id` int DEFAULT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  KEY `interviewee_id` (`interviewee_id`),
  CONSTRAINT `interviews_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Player Match Ratings Table
CREATE TABLE IF NOT EXISTS `player_match_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_id` int NOT NULL,
  `player_id` int NOT NULL,
  `journalist_id` int DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `commentary` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_player_match_journalist` (`match_id`, `player_id`, `journalist_id`),
  KEY `match_id` (`match_id`),
  KEY `player_id` (`player_id`),
  KEY `journalist_id` (`journalist_id`),
  CONSTRAINT `player_match_ratings_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `player_match_ratings_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
  CONSTRAINT `player_match_ratings_ibfk_3` FOREIGN KEY (`journalist_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add journalist_id to match_events for tracking who added the event
ALTER TABLE `match_events`
ADD COLUMN IF NOT EXISTS `journalist_id` int DEFAULT NULL AFTER `assisting_player_id`,
ADD COLUMN IF NOT EXISTS `commentary` text COLLATE utf8mb4_unicode_ci AFTER `description`,
ADD KEY IF NOT EXISTS `journalist_id` (`journalist_id`),
ADD CONSTRAINT IF NOT EXISTS `match_events_ibfk_3` FOREIGN KEY (`journalist_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- Create Media Assets Table
CREATE TABLE IF NOT EXISTS `media_assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` enum('image','video','audio','document') DEFAULT 'image',
  `media_type` enum('match_photo','interview_image','video_link','other') DEFAULT 'other',
  `related_match_id` int DEFAULT NULL,
  `related_news_id` int DEFAULT NULL,
  `related_interview_id` int DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `related_match_id` (`related_match_id`),
  KEY `related_news_id` (`related_news_id`),
  KEY `related_interview_id` (`related_interview_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `media_assets_ibfk_1` FOREIGN KEY (`related_match_id`) REFERENCES `matches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `media_assets_ibfk_2` FOREIGN KEY (`related_news_id`) REFERENCES `news` (`id`) ON DELETE SET NULL,
  CONSTRAINT `media_assets_ibfk_3` FOREIGN KEY (`related_interview_id`) REFERENCES `interviews` (`id`) ON DELETE SET NULL,
  CONSTRAINT `media_assets_ibfk_4` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Migration Complete!
-- =====================================================

