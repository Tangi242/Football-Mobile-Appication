import { query } from '../config/db.js';

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

export const getAnnouncements = async () => {
  const sql = `
    SELECT
      id,
      title,
      summary AS body,
      image_path AS media_url,
      'normal' AS priority,
      published_at
    FROM news
    ORDER BY COALESCE(published_at, created_at) DESC
    LIMIT 25
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
    SELECT id, name, season, start_date, end_date
    FROM leagues
    ORDER BY name ASC
  `;
  return query(sql);
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

