import OpenAI from 'openai';
import axios from 'axios';
import { query } from '../config/db.js';

// Initialize OpenAI client (will be null if no API key)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Get football-related images from Unsplash
const getFootballImage = async () => {
  try {
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        query: 'football soccer namibia',
        client_id: process.env.UNSPLASH_ACCESS_KEY || 'your-unsplash-key'
      },
      timeout: 5000
    });
    return response.data?.urls?.regular || response.data?.urls?.small || null;
  } catch (error) {
    // Fallback to placeholder images
    const fallbackImages = [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80'
    ];
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }
};

// Generate news using AI
const generateNewsWithAI = async (context) => {
  if (!openai) {
    // Fallback: Generate news without AI
    return generateNewsFallback(context);
  }

  try {
    const prompt = `You are a sports journalist writing for the Namibia Football Association. 
Write a compelling news article based on the following information:

${JSON.stringify(context, null, 2)}

Requirements:
- Write in a professional, engaging style
- Focus on Namibian football
- Include relevant details about teams, players, or matches
- Keep it between 150-300 words
- Make it newsworthy and interesting
- Use proper football terminology

Format your response as JSON with:
{
  "title": "Article title (max 80 characters)",
  "summary": "Brief summary (max 150 characters)",
  "content": "Full article content"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional sports journalist specializing in Namibian football. Write engaging, accurate news articles.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Try to parse JSON response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If JSON parsing fails, extract content manually
    }

    // Fallback parsing
    const lines = responseText.split('\n');
    const title = lines.find(l => l.includes('title') || l.length < 100)?.replace(/title:?/i, '').trim() || 
                  context.title || 'Namibia Football Update';
    const summary = lines.find(l => l.includes('summary') || l.length < 200)?.replace(/summary:?/i, '').trim() || 
                    context.summary || 'Latest updates from Namibian football';
    const content = responseText.substring(responseText.indexOf(summary) + summary.length).trim() || responseText;

    return {
      title: title.substring(0, 200),
      summary: summary.substring(0, 300),
      content: content.substring(0, 2000)
    };
  } catch (error) {
    console.error('AI generation error:', error.message);
    return generateNewsFallback(context);
  }
};

// Fallback news generation without AI
const generateNewsFallback = (context) => {
  const templates = {
    match_result: {
      title: `${context.home_team} ${context.home_score}-${context.away_score} ${context.away_team}`,
      summary: `Match result: ${context.home_team} defeated ${context.away_team} ${context.home_score}-${context.away_score} in ${context.competition || 'competition'}.`,
      content: `In an exciting match, ${context.home_team} secured a ${context.home_score}-${context.away_score} victory over ${context.away_team}. The match took place at ${context.venue || 'the venue'} as part of ${context.competition || 'the competition'}. This result has significant implications for the league standings and both teams' season objectives.`
    },
    upcoming_match: {
      title: `Upcoming: ${context.home_team} vs ${context.away_team}`,
      summary: `Don't miss the upcoming match between ${context.home_team} and ${context.away_team} scheduled for ${context.match_date || 'soon'}.`,
      content: `Football fans are eagerly anticipating the upcoming clash between ${context.home_team} and ${context.away_team}. The match is scheduled to take place at ${context.venue || 'the venue'} and promises to be an exciting encounter. Both teams have been preparing intensively for this fixture, which is part of ${context.competition || 'the competition'}.`
    },
    lineup: {
      title: `Lineup Revealed: ${context.home_team} vs ${context.away_team}`,
      summary: `Both teams have announced their starting lineups for the upcoming match.`,
      content: `The starting lineups for ${context.home_team} vs ${context.away_team} have been confirmed. ${context.home_team} will field ${context.home_players_count || 11} players, while ${context.away_team} has selected ${context.away_players_count || 11} players for this crucial ${context.competition || 'match'}. The match is scheduled to take place at ${context.venue || 'the venue'}. Both managers have made their selections and the teams are ready for what promises to be an exciting encounter.`
    },
    league_update: {
      title: `League Update: ${context.competition || 'Namibia Football'}`,
      summary: `Latest updates from ${context.competition || 'Namibian football leagues'}.`,
      content: `The ${context.competition || 'Namibian football league'} continues to provide exciting action as teams compete for top positions. Recent matches have shown great determination and skill from all participating teams. The competition remains tight as we progress through the season.`
    }
  };

  const template = templates[context.type] || templates.league_update;
  return {
    title: template.title,
    summary: template.summary,
    content: template.content
  };
};

// Generate news for lineup uploads
export const generateLineupNews = async () => {
  try {
    // Find matches with recently uploaded lineups (player_match_stats created in last 2 hours)
    const matchesWithLineups = await query(`
      SELECT DISTINCT
        m.id AS match_id,
        ht.name AS home_team,
        at.name AS away_team,
        m.match_date,
        m.venue,
        l.name AS competition,
        MAX(pms.created_at) AS lineup_uploaded_at
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      LEFT JOIN leagues l ON l.id = m.league_id
      JOIN player_match_stats pms ON pms.match_id = m.id
      WHERE m.status IN ('scheduled', 'in_progress')
        AND pms.created_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
        AND m.match_date >= NOW()
      GROUP BY m.id, ht.name, at.name, m.match_date, m.venue, l.name
      HAVING COUNT(DISTINCT pms.player_id) >= 11
      ORDER BY lineup_uploaded_at DESC
      LIMIT 5
    `);

    const generatedNews = [];

    for (const match of matchesWithLineups) {
      // Check if news already exists for this lineup
      const existingNews = await query(`
        SELECT id FROM news 
        WHERE (title LIKE ? OR content LIKE ?)
          AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        LIMIT 1
      `, [`%${match.home_team}%${match.away_team}%lineup%`, `%${match.home_team}%${match.away_team}%lineup%`]);

      if (existingNews.length > 0) continue;

      // Get lineup details for both teams
      const homeLineup = await query(`
        SELECT 
          p.first_name,
          p.last_name,
          p.position,
          p.jersey_number,
          t.name AS team_name
        FROM player_match_stats pms
        JOIN players p ON p.id = pms.player_id
        JOIN teams t ON t.id = pms.club_id
        WHERE pms.match_id = ? AND pms.club_id = (
          SELECT home_team_id FROM matches WHERE id = ?
        )
        ORDER BY 
          CASE p.position
            WHEN 'Goalkeeper' THEN 1
            WHEN 'Defender' THEN 2
            WHEN 'Midfielder' THEN 3
            WHEN 'Forward' THEN 4
            ELSE 5
          END,
          p.jersey_number
        LIMIT 11
      `, [match.match_id, match.match_id]);

      const awayLineup = await query(`
        SELECT 
          p.first_name,
          p.last_name,
          p.position,
          p.jersey_number,
          t.name AS team_name
        FROM player_match_stats pms
        JOIN players p ON p.id = pms.player_id
        JOIN teams t ON t.id = pms.club_id
        WHERE pms.match_id = ? AND pms.club_id = (
          SELECT away_team_id FROM matches WHERE id = ?
        )
        ORDER BY 
          CASE p.position
            WHEN 'Goalkeeper' THEN 1
            WHEN 'Defender' THEN 2
            WHEN 'Midfielder' THEN 3
            WHEN 'Forward' THEN 4
            ELSE 5
          END,
          p.jersey_number
        LIMIT 11
      `, [match.match_id, match.match_id]);

      if (homeLineup.length === 0 && awayLineup.length === 0) continue;

      // Build lineup context
      const homePlayers = homeLineup.map(p => `${p.first_name} ${p.last_name} (${p.position})`).join(', ');
      const awayPlayers = awayLineup.map(p => `${p.first_name} ${p.last_name} (${p.position})`).join(', ');

      const context = {
        type: 'lineup',
        home_team: match.home_team,
        away_team: match.away_team,
        venue: match.venue,
        competition: match.competition,
        match_date: match.match_date,
        home_lineup: homePlayers,
        away_lineup: awayPlayers,
        home_players_count: homeLineup.length,
        away_players_count: awayLineup.length
      };

      const newsData = await generateNewsWithAI(context);
      const imageUrl = await getFootballImage();

      // Insert into database
      await query(`
        INSERT INTO news (title, summary, content, image_path, published_at, created_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `, [
        newsData.title,
        newsData.summary,
        newsData.content,
        imageUrl
      ]);

      generatedNews.push(newsData.title);
    }

    return generatedNews;
  } catch (error) {
    console.error('Error generating lineup news:', error);
    return [];
  }
};

// Analyze recent matches and events to generate news
export const generateNewsFromEvents = async () => {
  try {
    // Generate lineup news first
    const lineupNews = await generateLineupNews();
    console.log(`Generated ${lineupNews.length} lineup news articles`);

    // Get recent match results (last 24 hours)
    const recentResults = await query(`
      SELECT 
        m.id,
        ht.name AS home_team,
        at.name AS away_team,
        m.home_score,
        m.away_score,
        m.match_date,
        m.venue,
        l.name AS competition
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      LEFT JOIN leagues l ON l.id = m.league_id
      WHERE m.status = 'completed'
        AND m.match_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY m.match_date DESC
      LIMIT 5
    `);

    // Get upcoming important matches
    const upcomingMatches = await query(`
      SELECT 
        m.id,
        ht.name AS home_team,
        at.name AS away_team,
        m.match_date,
        m.venue,
        l.name AS competition
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      LEFT JOIN leagues l ON l.id = m.league_id
      WHERE m.status = 'scheduled'
        AND m.match_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
      ORDER BY m.match_date ASC
      LIMIT 3
    `);

    const generatedNews = [];

    // Generate news from recent results
    for (const match of recentResults) {
      // Check if news already exists for this match
      const existingNews = await query(`
        SELECT id FROM news 
        WHERE title LIKE ? OR content LIKE ?
        LIMIT 1
      `, [`%${match.home_team}%${match.away_team}%`, `%${match.home_team}%${match.away_team}%`]);

      if (existingNews.length > 0) continue;

      const context = {
        type: 'match_result',
        home_team: match.home_team,
        away_team: match.away_team,
        home_score: match.home_score,
        away_score: match.away_score,
        venue: match.venue,
        competition: match.competition,
        match_date: match.match_date
      };

      const newsData = await generateNewsWithAI(context);
      const imageUrl = await getFootballImage();

      // Insert into database
      await query(`
        INSERT INTO news (title, summary, content, image_path, published_at, created_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `, [
        newsData.title,
        newsData.summary,
        newsData.content,
        imageUrl
      ]);

      generatedNews.push(newsData.title);
    }

    // Generate news for upcoming important matches
    if (upcomingMatches && Array.isArray(upcomingMatches)) {
      for (const match of upcomingMatches.slice(0, 2)) {
        if (!match || !match.home_team || !match.away_team) continue;
        
        const existingNews = await query(`
          SELECT id FROM news 
          WHERE title LIKE ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          LIMIT 1
        `, [`%${match.home_team}%${match.away_team}%`]);

        if (existingNews.length > 0) continue;

        const context = {
          type: 'upcoming_match',
          home_team: match.home_team,
          away_team: match.away_team,
          venue: match.venue,
          competition: match.competition,
          match_date: match.match_date
        };

        const newsData = await generateNewsWithAI(context);
        const imageUrl = await getFootballImage();

        await query(`
          INSERT INTO news (title, summary, content, image_path, published_at, created_at)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [
          newsData.title,
          newsData.summary,
          newsData.content,
          imageUrl
        ]);

        generatedNews.push(newsData.title);
      }
    }

    // Generate general league update news (once per day)
    const lastLeagueNews = await query(`
      SELECT id FROM news 
      WHERE title LIKE '%League Update%' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      LIMIT 1
    `);

    if (lastLeagueNews.length === 0) {
      const leagues = await query(`
        SELECT DISTINCT l.name AS competition
        FROM leagues l
        JOIN matches m ON m.league_id = l.id
        WHERE m.match_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        LIMIT 1
      `);

      if (leagues && leagues.length > 0) {
        const context = {
          type: 'league_update',
          competition: leagues[0].competition || 'Namibia Football'
        };

        const newsData = await generateNewsWithAI(context);
        let imageUrl = null;
        try {
          imageUrl = await getFootballImage();
        } catch (error) {
          console.error('Error fetching image for league update:', error.message);
          // Continue without image
        }

        await query(`
          INSERT INTO news (title, summary, content, image_path, published_at, created_at)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [
          newsData.title,
          newsData.summary,
          newsData.content,
          imageUrl
        ]);

        generatedNews.push(newsData.title);
      }
    }

    const totalCount = generatedNews.length + lineupNews.length;
    const allArticles = [...lineupNews, ...generatedNews];
    
    console.log(`Generated ${totalCount} news articles (${lineupNews.length} lineup, ${generatedNews.length} match/league):`, allArticles);
    return { success: true, count: totalCount, articles: allArticles };
  } catch (error) {
    console.error('Error generating news:', error);
    return { success: false, error: error.message };
  }
};

// Manual trigger function
export const triggerNewsGeneration = async () => {
  return await generateNewsFromEvents();
};

