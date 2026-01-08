import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';

const baseMatchSelect = `
  m.id,
  m.league_id,
  m.match_date,
  m.status,
  m.venue,
  m.home_score,
  m.away_score,
  COALESCE(l.name, 'Competition') AS competition,
  ht.name AS home_team,
  at.name AS away_team
`;

export const getFixtures = async () => {
  const sql = `
    SELECT ${baseMatchSelect}
    FROM matches m
    JOIN teams ht ON ht.id = m.home_team_id
    JOIN teams at ON at.id = m.away_team_id
    LEFT JOIN leagues l ON l.id = m.league_id
    WHERE m.status IN ('scheduled', 'in_progress')
    ORDER BY m.match_date ASC
    LIMIT 50
  `;
  return query(sql);
};

export const getResults = async () => {
  const sql = `
    SELECT ${baseMatchSelect}
    FROM matches m
    JOIN teams ht ON ht.id = m.home_team_id
    JOIN teams at ON at.id = m.away_team_id
    LEFT JOIN leagues l ON l.id = m.league_id
    WHERE m.status IN ('completed', 'cancelled')
    ORDER BY m.match_date DESC
    LIMIT 50
  `;
  return query(sql);
};

export const getReports = async () => {
  const sql = `
    SELECT
      m.league_id,
      m.id,
      m.match_date,
      m.referee_report AS summary,
      m.report_review_notes AS details,
      m.report_submitted_at AS created_at,
      ht.name AS home_team,
      at.name AS away_team
    FROM matches m
    JOIN teams ht ON ht.id = m.home_team_id
    JOIN teams at ON at.id = m.away_team_id
    WHERE m.referee_report IS NOT NULL
    ORDER BY m.report_submitted_at DESC
    LIMIT 50
  `;
  return query(sql);
};

export const getUsers = async ({ role }) => {
  const params = [];
  let where = '';
  if (role) {
    where = 'WHERE u.role = ?';
    params.push(role);
  }

  const sql = `
    SELECT
      u.id,
      CONCAT(u.first_name, ' ', u.last_name) AS full_name,
      u.role,
      u.phone,
      u.status,
      t.name AS team_name,
      NULL AS avatar_url
    FROM users u
    LEFT JOIN teams t ON t.manager_id = u.id
    ${where}
    ORDER BY full_name ASC
  `;
  return query(sql, params);
};

export const getAnnouncements = async (authorId = null) => {
  let sql = `
    SELECT
      id,
      title,
      slug,
      summary AS body,
      content,
      image_path AS media_url,
      media_url,
      author_id,
      category,
      priority,
      published_at,
      CASE
        WHEN LOWER(title) LIKE '%transfer%' 
          OR LOWER(title) LIKE '%sign%' 
          OR LOWER(title) LIKE '%loan%'
          OR LOWER(title) LIKE '%move%'
          OR LOWER(title) LIKE '%deal%'
          OR LOWER(summary) LIKE '%transfer%'
          OR LOWER(summary) LIKE '%sign%'
          OR LOWER(summary) LIKE '%loan%'
          OR LOWER(summary) LIKE '%move%'
          OR LOWER(summary) LIKE '%deal%'
          OR LOWER(content) LIKE '%transfer%'
          OR LOWER(content) LIKE '%sign%'
          OR LOWER(content) LIKE '%loan%'
          OR LOWER(content) LIKE '%move%'
          OR LOWER(content) LIKE '%deal%'
        THEN 'transfer'
        ELSE 'headline'
      END AS category
    FROM news
    ${authorId ? 'WHERE author_id = ?' : ''}
    ORDER BY COALESCE(published_at, created_at) DESC
    LIMIT 50
  `;
  return authorId ? query(sql, [authorId]) : query(sql);
};

export const getProducts = async () => {
  const sql = `
    SELECT
      id,
      name,
      description,
      category,
      price,
      discount,
      stock,
      in_stock AS inStock,
      image_url AS imageUrl,
      sizes,
      rating,
      reviews,
      shipping_days AS shippingDays,
      shipping_cost AS shippingCost,
      free_shipping_threshold AS freeShippingThreshold,
      status
    FROM products
    WHERE status = 'active'
    ORDER BY id ASC
  `;
  return query(sql);
};

export const upsertLiveEvent = async ({ matchId, payload = {} }) => {
  const sql = `
    INSERT INTO match_events (match_id, event_type, minute_mark, description)
    VALUES (?, ?, ?, ?)
  `;
  const lastEventType = payload?.event_type || 'goal';
  const minute = payload?.minute || 0;
  const description = payload?.last_event || JSON.stringify(payload);
  await query(sql, [matchId, lastEventType, minute, description]);
  return { matchId, payload };
};

export const recordNotificationToken = async ({ userId, token }) => {
  const sql = `
    INSERT INTO notification_tokens (user_id, token)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE token = VALUES(token), updated_at = NOW()
  `;
  await query(sql, [userId, token]);
};

export const getLeagues = async () => {
  const sql = `
    SELECT id, name, season, start_date, end_date, description, logo_path, image_path
    FROM leagues
    ORDER BY name ASC
  `;
  return query(sql);
};

export const getPlayerById = async (playerId) => {
  const sql = `
    SELECT
      p.id,
      p.first_name,
      p.last_name,
      CONCAT(p.first_name, ' ', p.last_name) AS full_name,
      p.dob,
      p.nationality,
      p.position,
      p.jersey_number,
      p.status,
      p.photo_path,
      t.id AS team_id,
      t.name AS team_name,
      t.logo_path AS team_logo,
      l.name AS league_name,
      DATEDIFF(CURDATE(), p.dob) / 365.25 AS age,
      COALESCE(SUM(stats.goals), 0) AS total_goals,
      COALESCE(SUM(stats.assists), 0) AS total_assists,
      COALESCE(SUM(stats.yellow_cards), 0) AS total_yellow_cards,
      COALESCE(SUM(stats.red_cards), 0) AS total_red_cards,
      COUNT(DISTINCT stats.match_id) AS matches_played
    FROM players p
    JOIN teams t ON t.id = p.team_id
    LEFT JOIN leagues l ON l.id = t.league_id
    LEFT JOIN player_match_stats stats ON stats.player_id = p.id
    WHERE p.id = ?
    GROUP BY p.id, t.id, l.id
  `;
  const results = await query(sql, [playerId]);
  return results[0] || null;
};

export const getPlayerIdByName = async (playerName) => {
  const sql = `
    SELECT id
    FROM players
    WHERE CONCAT(first_name, ' ', last_name) = ?
    LIMIT 1
  `;
  const results = await query(sql, [playerName]);
  return results[0]?.id || null;
};

const aggregateLeaderBoard = (column) => `
  SELECT
    p.id,
    CONCAT(p.first_name, ' ', p.last_name) AS player,
    t.name AS team,
    SUM(stats.${column}) AS value
  FROM player_match_stats stats
  JOIN players p ON p.id = stats.player_id
  JOIN teams t ON t.id = stats.club_id
  GROUP BY p.id, t.name
  HAVING value > 0
  ORDER BY value DESC
  LIMIT 10
`;

export const getLeaderBoards = async () => {
  const [goals, assists, yellows, reds] = await Promise.all([
    query(aggregateLeaderBoard('goals')),
    query(aggregateLeaderBoard('assists')),
    query(aggregateLeaderBoard('yellow_cards')),
    query(aggregateLeaderBoard('red_cards'))
  ]);

  return {
    goals,
    assists,
    yellows,
    reds
  };
};

// Team management functions
export const getTeams = async () => {
  const sql = `
    SELECT
      t.id,
      t.name,
      t.code,
      t.league_id,
      t.manager_id,
      t.founded_year,
      t.logo_path,
      t.status,
      t.stadium_id,
      t.primary_color,
      t.secondary_color,
      l.name AS league_name,
      s.name AS stadium_name,
      CONCAT(u.first_name, ' ', u.last_name) AS manager_name
    FROM teams t
    LEFT JOIN leagues l ON l.id = t.league_id
    LEFT JOIN stadiums s ON s.id = t.stadium_id
    LEFT JOIN users u ON u.id = t.manager_id
    ORDER BY t.name ASC
  `;
  return query(sql);
};

export const getTeamById = async (id) => {
  const sql = `
    SELECT
      t.id,
      t.name,
      t.code,
      t.league_id,
      t.manager_id,
      t.founded_year,
      t.logo_path,
      t.status,
      t.stadium_id,
      t.primary_color,
      t.secondary_color,
      l.name AS league_name,
      s.name AS stadium_name,
      CONCAT(u.first_name, ' ', u.last_name) AS manager_name
    FROM teams t
    LEFT JOIN leagues l ON l.id = t.league_id
    LEFT JOIN stadiums s ON s.id = t.stadium_id
    LEFT JOIN users u ON u.id = t.manager_id
    WHERE t.id = ?
  `;
  const results = await query(sql, [id]);
  return results[0] || null;
};

export const createTeam = async (teamData) => {
  const {
    name, code, league_id, manager_id, founded_year, logo_path,
    status, stadium_id, primary_color, secondary_color
  } = teamData;
  
  const sql = `
    INSERT INTO teams (name, code, league_id, manager_id, founded_year, logo_path, status, stadium_id, primary_color, secondary_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [
    name, code || null, league_id || null, manager_id || null,
    founded_year || null, logo_path || null, status || 'pending',
    stadium_id || null, primary_color || null, secondary_color || null
  ]);
  return getTeamById(result.insertId);
};

export const updateTeam = async (id, teamData) => {
  const {
    name, code, league_id, manager_id, founded_year, logo_path,
    status, stadium_id, primary_color, secondary_color
  } = teamData;
  
  const sql = `
    UPDATE teams
    SET name = ?, code = ?, league_id = ?, manager_id = ?, founded_year = ?,
        logo_path = ?, status = ?, stadium_id = ?, primary_color = ?, secondary_color = ?
    WHERE id = ?
  `;
  await query(sql, [
    name, code || null, league_id || null, manager_id || null,
    founded_year || null, logo_path || null, status || 'pending',
    stadium_id || null, primary_color || null, secondary_color || null, id
  ]);
  return getTeamById(id);
};

export const deleteTeam = async (id) => {
  const sql = `DELETE FROM teams WHERE id = ?`;
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

// Coach management functions
export const getCoaches = async () => {
  const sql = `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      CONCAT(u.first_name, ' ', u.last_name) AS full_name,
      u.email,
      u.phone,
      u.profile_photo_path,
      u.status,
      t.id AS team_id,
      t.name AS team_name
    FROM users u
    LEFT JOIN teams t ON t.manager_id = u.id
    WHERE u.role = 'coach'
    ORDER BY u.first_name, u.last_name ASC
  `;
  return query(sql);
};

export const getCoachById = async (id) => {
  const sql = `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      CONCAT(u.first_name, ' ', u.last_name) AS full_name,
      u.email,
      u.phone,
      u.profile_photo_path,
      u.status,
      u.role,
      t.id AS team_id,
      t.name AS team_name
    FROM users u
    LEFT JOIN teams t ON t.manager_id = u.id
    WHERE u.id = ? AND u.role = 'coach'
  `;
  const results = await query(sql, [id]);
  return results[0] || null;
};

export const createCoach = async (coachData) => {
  const { first_name, last_name, email, phone, password_hash, profile_photo_path } = coachData;
  
  // First create the user
  const userSql = `
    INSERT INTO users (first_name, last_name, email, password_hash, role, phone, profile_photo_path, status)
    VALUES (?, ?, ?, ?, 'coach', ?, ?, 'active')
  `;
  const result = await query(userSql, [
    first_name, last_name, email, password_hash || '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    phone || null, profile_photo_path || null
  ]);
  return getCoachById(result.insertId);
};

export const updateCoach = async (id, coachData) => {
  const { first_name, last_name, email, phone, profile_photo_path, status } = coachData;
  
  const sql = `
    UPDATE users
    SET first_name = ?, last_name = ?, email = ?, phone = ?, profile_photo_path = ?, status = ?
    WHERE id = ? AND role = 'coach'
  `;
  await query(sql, [
    first_name, last_name, email, phone || null,
    profile_photo_path || null, status || 'active', id
  ]);
  return getCoachById(id);
};

export const deleteCoach = async (id) => {
  const sql = `DELETE FROM users WHERE id = ? AND role = 'coach'`;
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

// User management functions
export const getUserById = async (id) => {
  const sql = `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      CONCAT(u.first_name, ' ', u.last_name) AS full_name,
      u.email,
      u.role,
      u.phone,
      u.profile_photo_path,
      u.status,
      t.id AS team_id,
      t.name AS team_name
    FROM users u
    LEFT JOIN teams t ON t.manager_id = u.id
    WHERE u.id = ?
  `;
  const results = await query(sql, [id]);
  return results[0] || null;
};

export const updateUserStatus = async (id, status) => {
  const sql = `UPDATE users SET status = ? WHERE id = ?`;
  await query(sql, [status, id]);
  return getUserById(id);
};

// Authentication functions
export const registerUser = async (userData) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    role,
    id_document_path,
    referee_license_path
  } = userData;

  // Check if user already exists
  const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password
  const bcrypt = require('bcryptjs');
  const password_hash = await bcrypt.hash(password, 10);

  // Insert user with pending approval
  const sql = `
    INSERT INTO users (
      first_name, last_name, email, password_hash, role, phone,
      id_document_path, referee_license_path, status, approval_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 'pending')
  `;
  
  const result = await query(sql, [
    first_name,
    last_name,
    email,
    password_hash,
    role,
    phone || null,
    id_document_path || null,
    referee_license_path || null
  ]);

  return getUserById(result.insertId);
};

export const getUserById = async (id) => {
  const sql = `
    SELECT
      id,
      first_name,
      last_name,
      email,
      role,
      phone,
      profile_photo_path,
      id_document_path,
      referee_license_path,
      status,
      approval_status,
      rejection_reason,
      approved_by,
      approved_at,
      created_at
    FROM users
    WHERE id = ?
  `;
  const results = await query(sql, [id]);
  return results[0] || null;
};

export const getPendingRegistrations = async () => {
  const sql = `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      CONCAT(u.first_name, ' ', u.last_name) AS full_name,
      u.email,
      u.phone,
      u.role,
      u.id_document_path,
      u.referee_license_path,
      u.approval_status,
      u.rejection_reason,
      u.created_at
    FROM users u
    WHERE u.approval_status = 'pending'
    ORDER BY u.created_at ASC
  `;
  return query(sql);
};

export const approveUser = async (userId, adminId) => {
  const sql = `
    UPDATE users
    SET approval_status = 'approved',
        approved_by = ?,
        approved_at = NOW()
    WHERE id = ?
  `;
  await query(sql, [adminId, userId]);
  return getUserById(userId);
};

export const rejectUser = async (userId, adminId, reason) => {
  const sql = `
    UPDATE users
    SET approval_status = 'rejected',
        rejection_reason = ?,
        approved_by = ?,
        approved_at = NOW()
    WHERE id = ?
  `;
  await query(sql, [reason, adminId, userId]);
  return getUserById(userId);
};

export const loginUser = async (email, password) => {
  // Get user with password hash (case-insensitive email lookup)
  const sql = `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      CONCAT(u.first_name, ' ', u.last_name) AS name,
      u.email,
      u.password_hash,
      u.role,
      u.phone,
      u.profile_photo_path,
      u.status,
      u.approval_status,
      u.rejection_reason
    FROM users u
    WHERE LOWER(u.email) = LOWER(?) AND u.status = 'active'
  `;
  const results = await query(sql, [email.trim()]);
  const user = results[0] || null;
  
  if (!user) {
    console.log(`Login attempt failed: User not found or inactive - ${email}`);
    return null;
  }
  
  console.log(`User found: ${user.email}, role: ${user.role}, hash exists: ${!!user.password_hash}`);
  
  // Verify password
  if (!user.password_hash) {
    console.log(`Login attempt failed: No password hash for user - ${email}`);
    return null;
  }
  
  // Trim password and hash to handle any whitespace
  const trimmedPassword = password.trim();
  const trimmedHash = user.password_hash.trim();
  
  try {
    // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    const isBcryptHash = /^\$2[ayb]\$/.test(trimmedHash);
    console.log(`Password hash type: ${isBcryptHash ? 'bcrypt' : 'plain'}, hash: ${trimmedHash.substring(0, 20)}...`);
    
    if (isBcryptHash) {
      // Check if it's the old placeholder hash (temporary fallback)
      const oldPlaceholderHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
      if (trimmedHash === oldPlaceholderHash) {
        // Temporary fallback: allow "Password123" for old placeholder hash
        console.log(`Detected old placeholder hash, checking password`);
        if (trimmedPassword === 'Password123') {
          console.log(`Old placeholder hash password match successful for ${email}`);
          // Password matches, continue
        } else {
          console.log(`Login attempt failed: Invalid password for old placeholder hash - ${email}`);
          return null;
        }
      } else {
        // Real bcrypt hash - verify using bcrypt
        // Try direct comparison first (bcryptjs supports $2a$ and $2b$)
        console.log(`Verifying bcrypt hash for ${email}`);
        let isValid = false;
        
        try {
          isValid = await bcrypt.compare(trimmedPassword, trimmedHash);
        } catch (bcryptError) {
          // If bcryptjs doesn't support $2y$, try converting to $2a$
          if (trimmedHash.startsWith('$2y$')) {
            console.log(`bcryptjs error with $2y$ format, trying $2a$ conversion`);
            const convertedHash = '$2a$' + trimmedHash.substring(4);
            isValid = await bcrypt.compare(trimmedPassword, convertedHash);
          } else {
            console.error('Bcrypt comparison error:', bcryptError);
            throw bcryptError;
          }
        }
        
        console.log(`Bcrypt comparison result: ${isValid}`);
        if (!isValid) {
          console.log(`Login attempt failed: Password mismatch for bcrypt hash - ${email}`);
          return null;
        }
      }
    } else {
      // Not a bcrypt hash - direct comparison (for legacy/test data)
      console.log(`Comparing plain text password for ${email}`);
      if (trimmedHash !== trimmedPassword) {
        console.log(`Login attempt failed: Password mismatch for plain hash - ${email}`);
        return null;
      }
    }
  } catch (error) {
    console.error('Password verification error:', error);
    console.error('Error details:', error.message, error.stack);
    return null;
  }
  
  // Remove password_hash from returned user object
  delete user.password_hash;
  console.log(`Login successful for user: ${email}`);
  return user;
};

// League management functions
export const getLeagueById = async (id) => {
  const sql = `
    SELECT id, name, season, start_date, end_date, description, logo_path, image_path
    FROM leagues
    WHERE id = ?
  `;
  const results = await query(sql, [id]);
  return results[0] || null;
};

export const createLeague = async (leagueData) => {
  const { name, season, start_date, end_date, description, logo_path, image_path } = leagueData;
  const sql = `
    INSERT INTO leagues (name, season, start_date, end_date, description, logo_path, image_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [
    name, season || null, start_date || null, end_date || null,
    description || null, logo_path || null, image_path || null
  ]);
  return getLeagueById(result.insertId);
};

export const updateLeague = async (id, leagueData) => {
  const { name, season, start_date, end_date, description, logo_path, image_path } = leagueData;
  const sql = `
    UPDATE leagues
    SET name = ?, season = ?, start_date = ?, end_date = ?, description = ?, logo_path = ?, image_path = ?
    WHERE id = ?
  `;
  await query(sql, [
    name, season || null, start_date || null, end_date || null,
    description || null, logo_path || null, image_path || null, id
  ]);
  return getLeagueById(id);
};

export const deleteLeague = async (id) => {
  const sql = `DELETE FROM leagues WHERE id = ?`;
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

// Stadium management functions
export const getStadiums = async () => {
  const sql = `
    SELECT id, name, city, address, capacity, established_year, surface_type, status, latitude, longitude, image_path
    FROM stadiums
    ORDER BY name ASC
  `;
  return query(sql);
};

export const getStadiumById = async (id) => {
  const sql = `
    SELECT id, name, city, address, capacity, established_year, surface_type, status, latitude, longitude, image_path
    FROM stadiums
    WHERE id = ?
  `;
  const results = await query(sql, [id]);
  return results[0] || null;
};

export const createStadium = async (stadiumData) => {
  const { name, city, address, capacity, established_year, surface_type, status, latitude, longitude, image_path } = stadiumData;
  const sql = `
    INSERT INTO stadiums (name, city, address, capacity, established_year, surface_type, status, latitude, longitude, image_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [
    name, city || null, address || null, capacity || null, established_year || null,
    surface_type || 'grass', status || 'active', latitude || null, longitude || null, image_path || null
  ]);
  return getStadiumById(result.insertId);
};

export const updateStadium = async (id, stadiumData) => {
  const { name, city, address, capacity, established_year, surface_type, status, latitude, longitude, image_path } = stadiumData;
  const sql = `
    UPDATE stadiums
    SET name = ?, city = ?, address = ?, capacity = ?, established_year = ?, surface_type = ?, status = ?, latitude = ?, longitude = ?, image_path = ?
    WHERE id = ?
  `;
  await query(sql, [
    name, city || null, address || null, capacity || null, established_year || null,
    surface_type || 'grass', status || 'active', latitude || null, longitude || null, image_path || null, id
  ]);
  return getStadiumById(id);
};

export const deleteStadium = async (id) => {
  const sql = `DELETE FROM stadiums WHERE id = ?`;
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

// News management functions
export const getNewsById = async (id) => {
  const sql = `
    SELECT id, title, slug, summary, content, image_path, media_url, author_id, category, priority, published_at, is_poll, poll_id
    FROM news
    WHERE id = ?
  `;
  const results = await query(sql, [id]);
  return results[0] || null;
};

export const createNews = async (newsData) => {
  const { title, slug, summary, content, image_path, media_url, author_id, category, priority, published_at, scheduled_publish_at, status, is_breaking, match_id, is_poll, poll } = newsData;
  
  // Create news article
  let sql = `
    INSERT INTO news (title, slug, summary, content, image_path, media_url, author_id, category, priority, published_at, is_poll`;
  let values = [
    title, slug || null, summary || null, content, image_path || null, media_url || null,
    author_id || null, category || 'announcement', priority || 'normal', published_at || null, is_poll || false
  ];
  
  // Add optional fields if they exist in the table
  try {
    const checkColumns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'news' 
      AND COLUMN_NAME IN ('status', 'scheduled_publish_at', 'is_breaking', 'match_id')
    `);
    const existingColumns = checkColumns.map(c => c.COLUMN_NAME);
    
    if (existingColumns.includes('status')) {
      sql += `, status`;
      values.push(status || 'draft');
    }
    if (existingColumns.includes('scheduled_publish_at')) {
      sql += `, scheduled_publish_at`;
      values.push(scheduled_publish_at || null);
    }
    if (existingColumns.includes('is_breaking')) {
      sql += `, is_breaking`;
      values.push(is_breaking || false);
    }
    if (existingColumns.includes('match_id')) {
      sql += `, match_id`;
      values.push(match_id || null);
    }
  } catch (e) {
    // If check fails, just use basic fields
  }
  
  sql += `) VALUES (` + values.map(() => '?').join(', ') + `)`;
  const result = await query(sql, values);
  
  const newsId = result.insertId;
  
  // Create poll if included
  if (is_poll && poll) {
    const pollSql = `
      INSERT INTO polls (question, description, news_id, end_date, is_active, allow_multiple_votes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const pollResult = await query(pollSql, [
      poll.question,
      poll.description || null,
      newsId,
      poll.end_date || null,
      true,
      poll.allow_multiple_votes || false
    ]);
    
    const pollId = pollResult.insertId;
    
    // Create poll options
    if (poll.options && poll.options.length > 0) {
      for (const optionText of poll.options) {
        if (optionText.trim()) {
          const optionSql = `
            INSERT INTO poll_options (poll_id, option_text, option_order, vote_count)
            VALUES (?, ?, ?, 0)
          `;
          await query(optionSql, [pollId, optionText.trim(), poll.options.indexOf(optionText)]);
        }
      }
    }
    
    // Update news with poll_id
    await query('UPDATE news SET poll_id = ? WHERE id = ?', [pollId, newsId]);
  }
  
  return getNewsById(newsId);
};

export const updateNews = async (id, newsData, userId = null, userRole = null) => {
  // Check if user is authorized to update this news
  if (userId && userRole === 'journalist') {
    const existingNews = await getNewsById(id);
    if (!existingNews || existingNews.author_id !== userId) {
      throw new Error('Unauthorized: You can only update your own news articles');
    }
  }
  
  const { title, slug, summary, content, image_path, media_url, author_id, category, priority, published_at, scheduled_publish_at, status, is_breaking, match_id, is_poll, poll } = newsData;
  
  let sql = `
    UPDATE news
    SET title = ?, slug = ?, summary = ?, content = ?, image_path = ?, media_url = ?, author_id = ?, category = ?, priority = ?, published_at = ?, is_poll = ?`;
  let values = [
    title, slug || null, summary || null, content, image_path || null, media_url || null,
    author_id || null, category || 'announcement', priority || 'normal', published_at || null, is_poll || false
  ];
  
  // Add optional fields if they exist
  try {
    const checkColumns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'news' 
      AND COLUMN_NAME IN ('status', 'scheduled_publish_at', 'is_breaking', 'match_id')
    `);
    const existingColumns = checkColumns.map(c => c.COLUMN_NAME);
    
    if (existingColumns.includes('status')) {
      sql += `, status = ?`;
      values.push(status || 'draft');
    }
    if (existingColumns.includes('scheduled_publish_at')) {
      sql += `, scheduled_publish_at = ?`;
      values.push(scheduled_publish_at || null);
    }
    if (existingColumns.includes('is_breaking')) {
      sql += `, is_breaking = ?`;
      values.push(is_breaking || false);
    }
    if (existingColumns.includes('match_id')) {
      sql += `, match_id = ?`;
      values.push(match_id || null);
    }
  } catch (e) {
    // If check fails, just use basic fields
  }
  
  sql += ` WHERE id = ?`;
  values.push(id);
  await query(sql, values);
  
  // Handle poll updates
  if (is_poll && poll) {
    // Check if poll exists
    const existingPoll = await query('SELECT id FROM polls WHERE news_id = ?', [id]);
    
    if (existingPoll.length > 0) {
      // Update existing poll
      const pollId = existingPoll[0].id;
      await query(`
        UPDATE polls
        SET question = ?, description = ?, end_date = ?, allow_multiple_votes = ?
        WHERE id = ?
      `, [poll.question, poll.description || null, poll.end_date || null, poll.allow_multiple_votes || false, pollId]);
      
      // Delete old options and create new ones
      await query('DELETE FROM poll_options WHERE poll_id = ?', [pollId]);
      if (poll.options && poll.options.length > 0) {
        for (const optionText of poll.options) {
          if (optionText.trim()) {
            await query(`
              INSERT INTO poll_options (poll_id, option_text, option_order, vote_count)
              VALUES (?, ?, ?, 0)
            `, [pollId, optionText.trim(), poll.options.indexOf(optionText)]);
          }
        }
      }
    } else {
      // Create new poll
      const pollResult = await query(`
        INSERT INTO polls (question, description, news_id, end_date, is_active, allow_multiple_votes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [poll.question, poll.description || null, id, poll.end_date || null, true, poll.allow_multiple_votes || false]);
      
      const pollId = pollResult.insertId;
      if (poll.options && poll.options.length > 0) {
        for (const optionText of poll.options) {
          if (optionText.trim()) {
            await query(`
              INSERT INTO poll_options (poll_id, option_text, option_order, vote_count)
              VALUES (?, ?, ?, 0)
            `, [pollId, optionText.trim(), poll.options.indexOf(optionText)]);
          }
        }
      }
      await query('UPDATE news SET poll_id = ? WHERE id = ?', [pollId, id]);
    }
  } else {
    // Remove poll if is_poll is false
    const existingPoll = await query('SELECT id FROM polls WHERE news_id = ?', [id]);
    if (existingPoll.length > 0) {
      await query('DELETE FROM poll_options WHERE poll_id = ?', [existingPoll[0].id]);
      await query('DELETE FROM polls WHERE id = ?', [existingPoll[0].id]);
      await query('UPDATE news SET poll_id = NULL WHERE id = ?', [id]);
    }
  }
  
  return getNewsById(id);
};

export const deleteNews = async (id, userId = null, userRole = null) => {
  // Check if user is authorized to delete this news
  if (userId && userRole === 'journalist') {
    const existingNews = await getNewsById(id);
    if (!existingNews || existingNews.author_id !== userId) {
      throw new Error('Unauthorized: You can only delete your own news articles');
    }
  }
  
  const sql = `DELETE FROM news WHERE id = ?`;
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

// Ticket management functions
export const createTicket = async (ticketData) => {
  const { match_id, user_id, section, row, seat, price, status } = ticketData;
  const sql = `
    INSERT INTO tickets (match_id, user_id, section, row, seat, price, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const result = await query(sql, [
    match_id, user_id || null, section || null, row || null, seat || null, price, status || 'available'
  ]);
  return result.insertId;
};

// Coach-specific functions
export const getCoachTeam = async (coachId) => {
  const sql = `
    SELECT t.id, t.name, t.code, t.league_id, t.founded_year, t.logo_path, t.status
    FROM teams t
    WHERE t.manager_id = ?
    LIMIT 1
  `;
  const results = await query(sql, [coachId]);
  return results[0] || null;
};

export const getTeamPlayers = async (teamId) => {
  const sql = `
    SELECT 
      id, team_id, first_name, last_name, dob, nationality, position, 
      jersey_number, status, photo_path,
      CONCAT(first_name, ' ', last_name) AS full_name
    FROM players
    WHERE team_id = ?
    ORDER BY position, jersey_number ASC
  `;
  return query(sql, [teamId]);
};

export const getPlayerByIdSimple = async (playerId) => {
  const sql = `
    SELECT 
      id, team_id, first_name, last_name, dob, nationality, position, 
      jersey_number, status, photo_path,
      CONCAT(first_name, ' ', last_name) AS full_name
    FROM players
    WHERE id = ?
  `;
  const results = await query(sql, [playerId]);
  return results[0] || null;
};

export const createPlayer = async (playerData) => {
  const { team_id, first_name, last_name, dob, nationality, position, jersey_number, status, availability_status, injury_details, suspension_end_date, photo_path } = playerData;
  
  let sql = `
    INSERT INTO players (team_id, first_name, last_name, dob, nationality, position, jersey_number, status, photo_path`;
  let values = [
    team_id, first_name, last_name, dob || null, nationality || null, position || null, 
    jersey_number || null, status || 'active', photo_path || null
  ];
  
  // Add availability fields if they exist
  try {
    const checkColumns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'players' 
      AND COLUMN_NAME IN ('availability_status', 'injury_details', 'suspension_end_date')
    `);
    const existingColumns = checkColumns.map(c => c.COLUMN_NAME);
    
    if (existingColumns.includes('availability_status')) {
      sql += `, availability_status`;
      values.splice(8, 0, availability_status || 'available');
    }
    if (existingColumns.includes('injury_details')) {
      sql += `, injury_details`;
      values.push(injury_details || null);
    }
    if (existingColumns.includes('suspension_end_date')) {
      sql += `, suspension_end_date`;
      values.push(suspension_end_date || null);
    }
  } catch (e) {
    // If check fails, just use basic fields
  }
  
  sql += `) VALUES (` + values.map(() => '?').join(', ') + `)`;
  const result = await query(sql, values);
  return getPlayerByIdSimple(result.insertId);
};

export const updatePlayer = async (playerId, playerData) => {
  const { first_name, last_name, dob, nationality, position, jersey_number, status, availability_status, injury_details, suspension_end_date, photo_path } = playerData;
  
  let sql = `
    UPDATE players
    SET first_name = ?, last_name = ?, dob = ?, nationality = ?, position = ?, 
        jersey_number = ?, status = ?, photo_path = ?`;
  let values = [
    first_name, last_name, dob || null, nationality || null, position || null,
    jersey_number || null, status || 'active', photo_path || null
  ];
  
  // Add availability fields if they exist
  try {
    const checkColumns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'players' 
      AND COLUMN_NAME IN ('availability_status', 'injury_details', 'suspension_end_date')
    `);
    const existingColumns = checkColumns.map(c => c.COLUMN_NAME);
    
    if (existingColumns.includes('availability_status')) {
      sql += `, availability_status = ?`;
      values.push(availability_status || 'available');
    }
    if (existingColumns.includes('injury_details')) {
      sql += `, injury_details = ?`;
      values.push(injury_details || null);
    }
    if (existingColumns.includes('suspension_end_date')) {
      sql += `, suspension_end_date = ?`;
      values.push(suspension_end_date || null);
    }
  } catch (e) {
    // If check fails, just use basic fields
  }
  
  sql += ` WHERE id = ?`;
  values.push(playerId);
  await query(sql, values);
  return getPlayerByIdSimple(playerId);
};

export const deletePlayer = async (playerId) => {
  const sql = `DELETE FROM players WHERE id = ?`;
  const result = await query(sql, [playerId]);
  return result.affectedRows > 0;
};

// Lineup management functions
export const getLineupByMatchAndTeam = async (matchId, teamId) => {
  if (!matchId || !teamId) {
    return null;
  }
  const sql = `
    SELECT l.*, 
      COUNT(lp.id) AS player_count
    FROM lineups l
    LEFT JOIN lineup_players lp ON lp.lineup_id = l.id
    WHERE l.match_id = ? AND l.team_id = ?
    GROUP BY l.id
  `;
  const results = await query(sql, [matchId, teamId]);
  return results[0] || null;
};

export const getLineupPlayers = async (lineupId) => {
  const sql = `
    SELECT lp.*, p.first_name, p.last_name, p.position AS player_position, p.jersey_number AS player_jersey
    FROM lineup_players lp
    JOIN players p ON p.id = lp.player_id
    WHERE lp.lineup_id = ?
    ORDER BY lp.is_starting DESC, lp.order ASC
  `;
  return query(sql, [lineupId]);
};

export const createLineup = async (lineupData) => {
  const { match_id, team_id, coach_id, formation, notes } = lineupData;
  const sql = `
    INSERT INTO lineups (match_id, team_id, coach_id, formation, notes, status)
    VALUES (?, ?, ?, ?, ?, 'draft')
    ON DUPLICATE KEY UPDATE
      formation = VALUES(formation),
      notes = VALUES(notes),
      updated_at = CURRENT_TIMESTAMP
  `;
  const result = await query(sql, [match_id, team_id, coach_id, formation || '4-4-2', notes || null]);
  
  // Get the lineup ID (either new or existing)
  const existing = await getLineupByMatchAndTeam(match_id, team_id);
  return existing || { id: result.insertId };
};

export const addPlayerToLineup = async (lineupId, playerData) => {
  const { player_id, position, is_starting, is_captain, jersey_number, order } = playerData;
  const sql = `
    INSERT INTO lineup_players (lineup_id, player_id, position, is_starting, is_captain, jersey_number, \`order\`)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      position = VALUES(position),
      is_starting = VALUES(is_starting),
      is_captain = VALUES(is_captain),
      jersey_number = VALUES(jersey_number),
      \`order\` = VALUES(\`order\`)
  `;
  await query(sql, [lineupId, player_id, position, is_starting || 1, is_captain || 0, jersey_number || null, order || null]);
};

export const removePlayerFromLineup = async (lineupId, playerId) => {
  const sql = `DELETE FROM lineup_players WHERE lineup_id = ? AND player_id = ?`;
  const result = await query(sql, [lineupId, playerId]);
  return result.affectedRows > 0;
};

export const submitLineup = async (lineupId) => {
  const sql = `
    UPDATE lineups
    SET status = 'submitted', submitted_at = NOW()
    WHERE id = ?
  `;
  await query(sql, [lineupId]);
  const lineupInfo = await query('SELECT match_id, team_id FROM lineups WHERE id = ?', [lineupId]);
  if (lineupInfo && lineupInfo.length > 0) {
    return getLineupByMatchAndTeam(lineupInfo[0].match_id, lineupInfo[0].team_id);
  }
  return null;
};

export const getCoachUpcomingMatches = async (coachId) => {
  const sql = `
    SELECT m.*, 
      ht.name AS home_team_name,
      at.name AS away_team_name,
      l.name AS league_name,
      CASE 
        WHEN m.home_team_id = t.id THEN 'home'
        WHEN m.away_team_id = t.id THEN 'away'
      END AS team_side
    FROM matches m
    JOIN teams t ON (t.manager_id = ? AND (m.home_team_id = t.id OR m.away_team_id = t.id))
    LEFT JOIN teams ht ON ht.id = m.home_team_id
    LEFT JOIN teams at ON at.id = m.away_team_id
    LEFT JOIN leagues l ON l.id = m.league_id
    WHERE m.status = 'scheduled' 
      AND m.match_date > NOW()
    ORDER BY m.match_date ASC
  `;
  return query(sql, [coachId]);
};

// Standings management functions
export const calculateStandings = async (leagueId) => {
  // Get all completed matches for the league
  const matches = await query(`
    SELECT 
      home_team_id,
      away_team_id,
      home_score,
      away_score
    FROM matches
    WHERE league_id = ? 
      AND status = 'completed'
      AND is_friendly = 0
  `, [leagueId]);

  // Get all teams in the league
  const teams = await query(`
    SELECT DISTINCT t.id, t.name
    FROM teams t
    WHERE t.league_id = ?
  `, [leagueId]);

  // Initialize standings for all teams
  const standingsMap = {};
  teams.forEach(team => {
    standingsMap[team.id] = {
      team_id: team.id,
      team_name: team.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0
    };
  });

  // Calculate standings from matches
  matches.forEach(match => {
    const homeTeam = standingsMap[match.home_team_id];
    const awayTeam = standingsMap[match.away_team_id];
    
    if (homeTeam && awayTeam) {
      const homeScore = match.home_score || 0;
      const awayScore = match.away_score || 0;

      // Update home team
      homeTeam.played++;
      homeTeam.goals_for += homeScore;
      homeTeam.goals_against += awayScore;
      
      // Update away team
      awayTeam.played++;
      awayTeam.goals_for += awayScore;
      awayTeam.goals_against += homeScore;

      // Determine result
      if (homeScore > awayScore) {
        homeTeam.wins++;
        homeTeam.points += 3;
        awayTeam.losses++;
      } else if (awayScore > homeScore) {
        awayTeam.wins++;
        awayTeam.points += 3;
        homeTeam.losses++;
      } else {
        homeTeam.draws++;
        homeTeam.points += 1;
        awayTeam.draws++;
        awayTeam.points += 1;
      }
    }
  });

  // Calculate goal difference
  Object.values(standingsMap).forEach(team => {
    team.goal_difference = team.goals_for - team.goals_against;
  });

  // Update standings in database
  for (const team of Object.values(standingsMap)) {
    await query(`
      INSERT INTO standings (league_id, team_id, played, wins, draws, losses, goals_for, goals_against, goal_difference, points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        played = VALUES(played),
        wins = VALUES(wins),
        draws = VALUES(draws),
        losses = VALUES(losses),
        goals_for = VALUES(goals_for),
        goals_against = VALUES(goals_against),
        goal_difference = VALUES(goal_difference),
        points = VALUES(points),
        updated_at = CURRENT_TIMESTAMP
    `, [
      leagueId,
      team.team_id,
      team.played,
      team.wins,
      team.draws,
      team.losses,
      team.goals_for,
      team.goals_against,
      team.goal_difference,
      team.points
    ]);
  }

  return Object.values(standingsMap);
};

export const getStandings = async (leagueId) => {
  // First, recalculate standings to ensure they're up to date
  await calculateStandings(leagueId);
  
  // Then fetch the standings
  const sql = `
    SELECT 
      s.*,
      t.name AS team_name,
      t.logo_path AS team_logo,
      l.name AS league_name
    FROM standings s
    JOIN teams t ON t.id = s.team_id
    JOIN leagues l ON l.id = s.league_id
    WHERE s.league_id = ?
    ORDER BY 
      s.points DESC,
      s.goal_difference DESC,
      s.goals_for DESC,
      s.wins DESC,
      t.name ASC
  `;
  return query(sql, [leagueId]);
};

export const getAllStandings = async () => {
  const sql = `
    SELECT 
      s.*,
      t.name AS team_name,
      t.logo_path AS team_logo,
      l.name AS league_name,
      l.id AS league_id
    FROM standings s
    JOIN teams t ON t.id = s.team_id
    JOIN leagues l ON l.id = s.league_id
    ORDER BY 
      l.name ASC,
      s.points DESC,
      s.goal_difference DESC,
      s.goals_for DESC,
      s.wins DESC,
      t.name ASC
  `;
  return query(sql);
};

// Poll management functions
export const getPolls = async (authorId = null) => {
  let sql = `
    SELECT 
      p.*,
      COUNT(DISTINCT pv.id) as total_votes,
      GROUP_CONCAT(
        CONCAT(po.id, ':', po.option_text, ':', po.vote_count) 
        ORDER BY po.option_order 
        SEPARATOR '|'
      ) as options_data
    FROM polls p
    LEFT JOIN poll_options po ON po.poll_id = p.id
    LEFT JOIN poll_votes pv ON pv.poll_id = p.id
    WHERE p.news_id IS NULL
  `;
  
  if (authorId) {
    // Check if author_id column exists, if not, just filter by news_id IS NULL
    sql += ` GROUP BY p.id ORDER BY p.created_at DESC`;
    const results = await query(sql);
    // Filter by author_id in JavaScript if column exists
    let filtered = results;
    if (results.length > 0 && results[0].author_id !== undefined) {
      filtered = results.filter(poll => poll.author_id === authorId);
    }
    return filtered.map(poll => {
      const options = poll.options_data ? poll.options_data.split('|').map(opt => {
        const [id, text, votes] = opt.split(':');
        return { id: parseInt(id), option_text: text, vote_count: parseInt(votes) || 0 };
      }) : [];
      return { ...poll, options, total_votes: parseInt(poll.total_votes) || 0 };
    });
  }
  
  sql += ` GROUP BY p.id ORDER BY p.created_at DESC`;
  const results = await query(sql);
  return results.map(poll => {
    const options = poll.options_data ? poll.options_data.split('|').map(opt => {
      const [id, text, votes] = opt.split(':');
      return { id: parseInt(id), option_text: text, vote_count: parseInt(votes) || 0 };
    }) : [];
    return { ...poll, options, total_votes: parseInt(poll.total_votes) || 0 };
  });
};

export const getPollById = async (id) => {
  const sql = `
    SELECT 
      p.*,
      COUNT(DISTINCT pv.id) as total_votes
    FROM polls p
    LEFT JOIN poll_votes pv ON pv.poll_id = p.id
    WHERE p.id = ?
    GROUP BY p.id
  `;
  const results = await query(sql, [id]);
  if (results.length === 0) return null;
  
  const poll = results[0];
  const optionsSql = `
    SELECT id, option_text, option_order, vote_count
    FROM poll_options
    WHERE poll_id = ?
    ORDER BY option_order
  `;
  const options = await query(optionsSql, [id]);
  
  return {
    ...poll,
    options,
    total_votes: parseInt(poll.total_votes) || 0
  };
};

export const createPoll = async (pollData) => {
  const { question, description, author_id, end_date, is_active, allow_multiple_votes, options } = pollData;
  
  // Check if author_id column exists
  let sql = `
    INSERT INTO polls (question, description, end_date, is_active, allow_multiple_votes`;
  let values = [
    question,
    description || null,
    end_date || null,
    is_active !== false,
    allow_multiple_votes || false
  ];
  
  // Try to include author_id if column exists
  try {
    const checkColumn = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'polls' 
      AND COLUMN_NAME = 'author_id'
    `);
    if (checkColumn.length > 0) {
      sql += `, author_id) VALUES (?, ?, ?, ?, ?, ?)`;
      values.splice(2, 0, author_id || null);
    } else {
      sql += `) VALUES (?, ?, ?, ?, ?)`;
    }
  } catch (e) {
    // If check fails, just use without author_id
    sql += `) VALUES (?, ?, ?, ?, ?)`;
  }
  
  const result = await query(sql, values);
  
  const pollId = result.insertId;
  
  if (options && options.length > 0) {
    for (let i = 0; i < options.length; i++) {
      const optionText = options[i];
      if (optionText.trim()) {
        await query(`
          INSERT INTO poll_options (poll_id, option_text, option_order, vote_count)
          VALUES (?, ?, ?, 0)
        `, [pollId, optionText.trim(), i]);
      }
    }
  }
  
  return getPollById(pollId);
};

export const updatePoll = async (id, pollData) => {
  const { question, description, end_date, is_active, allow_multiple_votes, options } = pollData;
  
  const sql = `
    UPDATE polls
    SET question = ?, description = ?, end_date = ?, is_active = ?, allow_multiple_votes = ?
    WHERE id = ?
  `;
  await query(sql, [
    question,
    description || null,
    end_date || null,
    is_active !== false,
    allow_multiple_votes || false,
    id
  ]);
  
  if (options && options.length > 0) {
    await query('DELETE FROM poll_options WHERE poll_id = ?', [id]);
    for (let i = 0; i < options.length; i++) {
      const optionText = options[i];
      if (optionText.trim()) {
        await query(`
          INSERT INTO poll_options (poll_id, option_text, option_order, vote_count)
          VALUES (?, ?, ?, 0)
        `, [id, optionText.trim(), i]);
      }
    }
  }
  
  return getPollById(id);
};

export const deletePoll = async (id) => {
  const sql = 'DELETE FROM polls WHERE id = ?';
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

// Quiz management functions
export const getQuizzes = async (authorId = null) => {
  // Check if quizzes table exists
  try {
    let sql = `
      SELECT 
        q.*,
        COUNT(DISTINCT qa.id) as attempts
      FROM quizzes q
      LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id
    `;
    
    if (authorId) {
      sql += ` WHERE q.author_id = ?`;
      sql += ` GROUP BY q.id ORDER BY q.created_at DESC`;
      const results = await query(sql, [authorId]);
      return results;
    }
    
    sql += ` GROUP BY q.id ORDER BY q.created_at DESC`;
    return await query(sql);
  } catch (error) {
    // If table doesn't exist, return empty array
    if (error.message && error.message.includes("doesn't exist")) {
      return [];
    }
    throw error;
  }
};

export const getQuizById = async (id) => {
  try {
    const sql = 'SELECT * FROM quizzes WHERE id = ?';
    const results = await query(sql, [id]);
    if (results.length === 0) return null;
    
    const quiz = results[0];
    const questionsSql = `
      SELECT qq.*
      FROM quiz_questions qq
      WHERE qq.quiz_id = ?
      ORDER BY qq.question_order
    `;
    const questions = await query(questionsSql, [id]);
    
    for (const question of questions) {
      const optionsSql = `
        SELECT id, option_text, is_correct, option_order
        FROM quiz_options
        WHERE question_id = ?
        ORDER BY option_order
      `;
      question.options = await query(optionsSql, [question.id]);
    }
    
    return { ...quiz, questions };
  } catch (error) {
    if (error.message && error.message.includes("doesn't exist")) {
      return null;
    }
    throw error;
  }
};

export const createQuiz = async (quizData) => {
  try {
    const { title, description, author_id, category, is_active, start_date, end_date, questions } = quizData;
    
    const sql = `
      INSERT INTO quizzes (title, description, author_id, category, is_active, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      title,
      description || null,
      author_id || null,
      category || 'general',
      is_active !== false,
      start_date || null,
      end_date || null
    ]);
  
  const quizId = result.insertId;
  
  if (questions && questions.length > 0) {
    for (let qIndex = 0; qIndex < questions.length; qIndex++) {
      const question = questions[qIndex];
      const questionSql = `
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, points, question_order)
        VALUES (?, ?, ?, ?, ?)
      `;
      const questionResult = await query(questionSql, [
        quizId,
        question.question_text,
        question.question_type || 'multiple_choice',
        question.points || 1,
        qIndex
      ]);
      
      const questionId = questionResult.insertId;
      
      if (question.options && question.options.length > 0) {
        for (let oIndex = 0; oIndex < question.options.length; oIndex++) {
          const option = question.options[oIndex];
          if (option.option_text.trim()) {
            await query(`
              INSERT INTO quiz_options (question_id, option_text, is_correct, option_order)
              VALUES (?, ?, ?, ?)
            `, [questionId, option.option_text.trim(), option.is_correct || false, oIndex]);
          }
        }
      }
    }
  }
  
    return getQuizById(quizId);
  } catch (error) {
    if (error.message && error.message.includes("doesn't exist")) {
      throw new Error('Quiz tables not found. Please run the database migration to create quiz tables.');
    }
    throw error;
  }
};

export const updateQuiz = async (id, quizData) => {
  try {
    const { title, description, category, is_active, start_date, end_date, questions } = quizData;
    
    const sql = `
      UPDATE quizzes
      SET title = ?, description = ?, category = ?, is_active = ?, start_date = ?, end_date = ?
      WHERE id = ?
    `;
    await query(sql, [
      title,
      description || null,
      category || 'general',
      is_active !== false,
      start_date || null,
      end_date || null,
      id
    ]);
  
  if (questions && questions.length > 0) {
    await query('DELETE FROM quiz_questions WHERE quiz_id = ?', [id]);
    
    for (let qIndex = 0; qIndex < questions.length; qIndex++) {
      const question = questions[qIndex];
      const questionSql = `
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, points, question_order)
        VALUES (?, ?, ?, ?, ?)
      `;
      const questionResult = await query(questionSql, [
        id,
        question.question_text,
        question.question_type || 'multiple_choice',
        question.points || 1,
        qIndex
      ]);
      
      const questionId = questionResult.insertId;
      
      if (question.options && question.options.length > 0) {
        for (let oIndex = 0; oIndex < question.options.length; oIndex++) {
          const option = question.options[oIndex];
          if (option.option_text.trim()) {
            await query(`
              INSERT INTO quiz_options (question_id, option_text, is_correct, option_order)
              VALUES (?, ?, ?, ?)
            `, [questionId, option.option_text.trim(), option.is_correct || false, oIndex]);
          }
        }
      }
    }
  }
  
    return getQuizById(id);
  } catch (error) {
    if (error.message && error.message.includes("doesn't exist")) {
      throw new Error('Quiz tables not found. Please run the database migration to create quiz tables.');
    }
    throw error;
  }
};

export const deleteQuiz = async (id) => {
  try {
    const sql = 'DELETE FROM quizzes WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    if (error.message && error.message.includes("doesn't exist")) {
      return false;
    }
    throw error;
  }
};

// Interview management functions
export const getInterviews = async (authorId = null) => {
  let sql = 'SELECT * FROM interviews';
  if (authorId) {
    sql += ' WHERE author_id = ?';
    sql += ' ORDER BY created_at DESC';
    return query(sql, [authorId]);
  }
  sql += ' ORDER BY created_at DESC';
  return query(sql);
};

export const getInterviewById = async (id) => {
  const sql = 'SELECT * FROM interviews WHERE id = ?';
  const results = await query(sql, [id]);
  return results.length > 0 ? results[0] : null;
};

export const createInterview = async (interviewData) => {
  const { title, summary, content, interviewee_type, interviewee_id, interviewee_name, author_id, image_path, video_url, published_at, status } = interviewData;
  
  const sql = `
    INSERT INTO interviews (title, summary, content, interviewee_type, interviewee_id, interviewee_name, author_id, image_path, video_url, published_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [
    title,
    summary || null,
    content,
    interviewee_type || 'player',
    interviewee_id || null,
    interviewee_name,
    author_id || null,
    image_path || null,
    video_url || null,
    published_at || null,
    status || 'draft'
  ]);
  
  return getInterviewById(result.insertId);
};

export const updateInterview = async (id, interviewData) => {
  const { title, summary, content, interviewee_type, interviewee_id, interviewee_name, image_path, video_url, published_at, status } = interviewData;
  
  const sql = `
    UPDATE interviews
    SET title = ?, summary = ?, content = ?, interviewee_type = ?, interviewee_id = ?, interviewee_name = ?, image_path = ?, video_url = ?, published_at = ?, status = ?
    WHERE id = ?
  `;
  await query(sql, [
    title,
    summary || null,
    content,
    interviewee_type || 'player',
    interviewee_id || null,
    interviewee_name,
    image_path || null,
    video_url || null,
    published_at || null,
    status || 'draft',
    id
  ]);
  
  return getInterviewById(id);
};

export const deleteInterview = async (id) => {
  const sql = 'DELETE FROM interviews WHERE id = ?';
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

// Comment management functions
export const getComments = async (newsId = null, status = null) => {
  let sql = `
    SELECT 
      c.*,
      u.full_name AS user_name,
      n.title AS news_title
    FROM news_comments c
    LEFT JOIN users u ON u.id = c.user_id
    LEFT JOIN news n ON n.id = c.news_id
  `;
  const conditions = [];
  const params = [];
  
  if (newsId) {
    conditions.push('c.news_id = ?');
    params.push(newsId);
  }
  if (status) {
    conditions.push('c.status = ?');
    params.push(status);
  }
  
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  
  sql += ' ORDER BY c.created_at DESC';
  return query(sql, params);
};

export const moderateComment = async (commentId, status, moderatorId = null) => {
  const sql = `
    UPDATE news_comments
    SET status = ?, moderated_by = ?, moderated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  await query(sql, [status, moderatorId, commentId]);
  
  const result = await query('SELECT * FROM news_comments WHERE id = ?', [commentId]);
  return result.length > 0 ? result[0] : null;
};

export const deleteComment = async (id) => {
  const sql = 'DELETE FROM news_comments WHERE id = ?';
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

// Match events management (for journalists)
export const getMatchEvents = async (matchId) => {
  const sql = `
    SELECT 
      e.*,
      p1.first_name AS player_first_name,
      p1.last_name AS player_last_name,
      p2.first_name AS assist_first_name,
      p2.last_name AS assist_last_name
    FROM match_events e
    LEFT JOIN players p1 ON p1.id = e.player_id
    LEFT JOIN players p2 ON p2.id = e.assisting_player_id
    WHERE e.match_id = ?
    ORDER BY e.minute_mark ASC
  `;
  return query(sql, [matchId]);
};

export const createMatchEvent = async (matchId, eventData) => {
  const { event_type, minute_mark, player_id, assisting_player_id, description, commentary, journalist_id } = eventData;
  
  const sql = `
    INSERT INTO match_events (match_id, event_type, minute_mark, player_id, assisting_player_id, description, commentary, journalist_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [
    matchId,
    event_type,
    minute_mark,
    player_id || null,
    assisting_player_id || null,
    description,
    commentary || null,
    journalist_id || null
  ]);
  
  return result.insertId;
};

export const updateMatchEvent = async (matchId, eventId, eventData) => {
  const { event_type, minute_mark, player_id, assisting_player_id, description, commentary } = eventData;
  
  const sql = `
    UPDATE match_events
    SET event_type = ?, minute_mark = ?, player_id = ?, assisting_player_id = ?, description = ?, commentary = ?
    WHERE id = ? AND match_id = ?
  `;
  await query(sql, [
    event_type,
    minute_mark,
    player_id || null,
    assisting_player_id || null,
    description,
    commentary || null,
    eventId,
    matchId
  ]);
  
  return true;
};

export const deleteMatchEvent = async (matchId, eventId) => {
  const sql = 'DELETE FROM match_events WHERE id = ? AND match_id = ?';
  const result = await query(sql, [eventId, matchId]);
  return result.affectedRows > 0;
};

// Player ratings management (for journalists)
export const getPlayerRatings = async (matchId) => {
  const sql = `
    SELECT 
      r.*,
      p.first_name,
      p.last_name,
      t.name AS team_name
    FROM player_match_ratings r
    JOIN players p ON p.id = r.player_id
    JOIN teams t ON t.id = p.team_id
    WHERE r.match_id = ?
    ORDER BY r.rating DESC
  `;
  return query(sql, [matchId]);
};

export const createPlayerRating = async (matchId, ratingData) => {
  const { player_id, journalist_id, rating, commentary } = ratingData;
  
  const sql = `
    INSERT INTO player_match_ratings (match_id, player_id, journalist_id, rating, commentary)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE rating = ?, commentary = ?
  `;
  await query(sql, [matchId, player_id, journalist_id, rating, commentary, rating, commentary]);
  
  return true;
};

export const updatePlayerRating = async (matchId, playerId, ratingData) => {
  const { rating, commentary, journalist_id } = ratingData;
  
  const sql = `
    UPDATE player_match_ratings
    SET rating = ?, commentary = ?
    WHERE match_id = ? AND player_id = ? AND journalist_id = ?
  `;
  await query(sql, [rating, commentary, matchId, playerId, journalist_id]);
  
  return true;
};

// Transfer request management functions
export const getTransferRequests = async (coachId = null) => {
  let sql = `
    SELECT 
      tr.*,
      p.first_name,
      p.last_name,
      t1.name AS from_team_name,
      t2.name AS to_team_name
    FROM transfer_requests tr
    JOIN players p ON p.id = tr.player_id
    JOIN teams t1 ON t1.id = tr.from_team_id
    JOIN teams t2 ON t2.id = tr.to_team_id
  `;
  
  if (coachId) {
    sql += ' WHERE tr.requested_by_coach_id = ?';
    sql += ' ORDER BY tr.requested_at DESC';
    return query(sql, [coachId]);
  }
  
  sql += ' ORDER BY tr.requested_at DESC';
  return query(sql);
};

export const createTransferRequest = async (requestData) => {
  const { player_id, from_team_id, to_team_id, requested_by_coach_id, request_type, transfer_fee, notes } = requestData;
  
  const sql = `
    INSERT INTO transfer_requests (player_id, from_team_id, to_team_id, requested_by_coach_id, request_type, transfer_fee, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [
    player_id,
    from_team_id,
    to_team_id,
    requested_by_coach_id || null,
    request_type || 'permanent',
    transfer_fee || null,
    notes || null
  ]);
  
  return getTransferRequests(requested_by_coach_id).then(requests => 
    requests.find(r => r.id === result.insertId)
  );
};

export const cancelTransferRequest = async (requestId, coachId) => {
  // Verify request belongs to coach
  const request = await query('SELECT requested_by_coach_id FROM transfer_requests WHERE id = ?', [requestId]);
  if (request.length === 0 || request[0].requested_by_coach_id !== coachId) {
    return false;
  }
  
  const sql = 'UPDATE transfer_requests SET status = ? WHERE id = ?';
  const result = await query(sql, ['cancelled', requestId]);
  return result.affectedRows > 0;
};

// Friendly fixture management functions
export const getFriendlyFixtures = async (coachId = null) => {
  let sql = `
    SELECT 
      ff.*,
      t1.name AS home_team_name,
      t2.name AS away_team_name,
      s.name AS venue_name
    FROM friendly_fixtures ff
    JOIN teams t1 ON t1.id = ff.home_team_id
    JOIN teams t2 ON t2.id = ff.away_team_id
    LEFT JOIN stadiums s ON s.id = ff.venue_id
  `;
  
  if (coachId) {
    sql += ' WHERE ff.created_by_coach_id = ?';
    sql += ' ORDER BY ff.match_date DESC';
    return query(sql, [coachId]);
  }
  
  sql += ' ORDER BY ff.match_date DESC';
  return query(sql);
};

export const createFriendlyFixture = async (fixtureData) => {
  const { home_team_id, away_team_id, created_by_coach_id, match_date, venue_id, venue_name, notes } = fixtureData;
  
  const sql = `
    INSERT INTO friendly_fixtures (home_team_id, away_team_id, created_by_coach_id, match_date, venue_id, venue_name, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [
    home_team_id,
    away_team_id,
    created_by_coach_id || null,
    match_date,
    venue_id || null,
    venue_name || null,
    notes || null
  ]);
  
  return getFriendlyFixtures(created_by_coach_id).then(fixtures => 
    fixtures.find(f => f.id === result.insertId)
  );
};

export const updateFriendlyFixture = async (id, fixtureData) => {
  const { match_date, venue_id, venue_name, status, home_score, away_score, notes } = fixtureData;
  
  const sql = `
    UPDATE friendly_fixtures
    SET match_date = ?, venue_id = ?, venue_name = ?, status = ?, home_score = ?, away_score = ?, notes = ?
    WHERE id = ?
  `;
  await query(sql, [
    match_date,
    venue_id || null,
    venue_name || null,
    status || 'pending',
    home_score || null,
    away_score || null,
    notes || null,
    id
  ]);
  
  const result = await query('SELECT * FROM friendly_fixtures WHERE id = ?', [id]);
  return result.length > 0 ? result[0] : null;
};

export const deleteFriendlyFixture = async (id) => {
  const sql = 'DELETE FROM friendly_fixtures WHERE id = ?';
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

// Training session management functions
export const getTrainingSessions = async (coachId = null) => {
  let sql = 'SELECT * FROM training_sessions';
  
  if (coachId) {
    sql += ' WHERE coach_id = ?';
    sql += ' ORDER BY session_date DESC';
    return query(sql, [coachId]);
  }
  
  sql += ' ORDER BY session_date DESC';
  return query(sql);
};

export const createTrainingSession = async (sessionData) => {
  const { team_id, coach_id, session_date, session_type, duration_minutes, location, focus_areas, attendance, notes } = sessionData;
  
  const sql = `
    INSERT INTO training_sessions (team_id, coach_id, session_date, session_type, duration_minutes, location, focus_areas, attendance, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [
    team_id,
    coach_id || null,
    session_date,
    session_type || 'regular',
    duration_minutes || 90,
    location || null,
    focus_areas || null,
    attendance || null,
    notes || null
  ]);
  
  const newSession = await query('SELECT * FROM training_sessions WHERE id = ?', [result.insertId]);
  return newSession.length > 0 ? newSession[0] : null;
};

export const updateTrainingSession = async (id, sessionData) => {
  const { session_date, session_type, duration_minutes, location, focus_areas, attendance, notes } = sessionData;
  
  const sql = `
    UPDATE training_sessions
    SET session_date = ?, session_type = ?, duration_minutes = ?, location = ?, focus_areas = ?, attendance = ?, notes = ?
    WHERE id = ?
  `;
  await query(sql, [
    session_date,
    session_type || 'regular',
    duration_minutes || 90,
    location || null,
    focus_areas || null,
    attendance || null,
    notes || null,
    id
  ]);
  
  const result = await query('SELECT * FROM training_sessions WHERE id = ?', [id]);
  return result.length > 0 ? result[0] : null;
};

export const deleteTrainingSession = async (id) => {
  const sql = 'DELETE FROM training_sessions WHERE id = ?';
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

// Player statistics functions
export const getPlayerStatistics = async (playerId, season = null) => {
  let sql = `
    SELECT 
      ps.*,
      p.first_name,
      p.last_name,
      p.position
    FROM player_statistics ps
    JOIN players p ON p.id = ps.player_id
    WHERE ps.player_id = ?
  `;
  
  const params = [playerId];
  if (season) {
    sql += ' AND ps.season = ?';
    params.push(season);
  }
  
  sql += ' ORDER BY ps.created_at DESC';
  return query(sql, params);
};

export const getTeamPlayerStatistics = async (teamId, season = null) => {
  let sql = `
    SELECT 
      ps.*,
      p.first_name,
      p.last_name,
      p.position,
      p.team_id
    FROM player_statistics ps
    JOIN players p ON p.id = ps.player_id
    WHERE p.team_id = ?
  `;
  
  const params = [teamId];
  if (season) {
    sql += ' AND ps.season = ?';
    params.push(season);
  }
  
  // Aggregate statistics per player
  sql = `
    SELECT 
      ps.player_id,
      p.first_name,
      p.last_name,
      p.position,
      SUM(ps.goals) as goals,
      SUM(ps.assists) as assists,
      SUM(ps.yellow_cards) as yellow_cards,
      SUM(ps.red_cards) as red_cards,
      SUM(ps.minutes_played) as minutes_played,
      SUM(ps.matches_started) as matches_started,
      SUM(ps.matches_substituted) as matches_substituted,
      SUM(ps.clean_sheets) as clean_sheets,
      SUM(ps.saves) as saves,
      AVG(ps.rating) as rating
    FROM player_statistics ps
    JOIN players p ON p.id = ps.player_id
    WHERE p.team_id = ?
  `;
  
  if (season) {
    sql += ' AND ps.season = ?';
  }
  
  sql += ' GROUP BY ps.player_id, p.first_name, p.last_name, p.position';
  return query(sql, params);
};
