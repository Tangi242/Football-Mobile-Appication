import { Router } from 'express';
import {
  getCoachTeam,
  getTeamPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getCoachUpcomingMatches,
  getLineupByMatchAndTeam,
  getLineupPlayers,
  createLineup,
  addPlayerToLineup,
  removePlayerFromLineup,
  submitLineup,
  getAnnouncements,
  createNews
} from '../services/dataService.js';

const router = Router();

// Get coach's team
router.get('/team/:coachId', async (req, res, next) => {
  try {
    const coachId = parseInt(req.params.coachId);
    if (!coachId) {
      return res.status(400).json({ message: 'Coach ID is required' });
    }
    const team = await getCoachTeam(coachId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this coach' });
    }
    res.json({ team });
  } catch (error) {
    next(error);
  }
});

// Get team players (coach's team only)
router.get('/players/:coachId', async (req, res, next) => {
  try {
    const coachId = parseInt(req.params.coachId);
    if (!coachId) {
      return res.status(400).json({ message: 'Coach ID is required' });
    }
    const team = await getCoachTeam(coachId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this coach' });
    }
    const players = await getTeamPlayers(team.id);
    res.json({ players });
  } catch (error) {
    next(error);
  }
});

// Create player (coach's team only)
router.post('/players/:coachId', async (req, res, next) => {
  try {
    const coachId = parseInt(req.params.coachId);
    if (!coachId) {
      return res.status(400).json({ message: 'Coach ID is required' });
    }
    const team = await getCoachTeam(coachId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this coach' });
    }
    const playerData = { ...req.body, team_id: team.id };
    const player = await createPlayer(playerData);
    res.status(201).json({ player });
  } catch (error) {
    next(error);
  }
});

// Update player (coach's team only)
router.put('/players/:id/:coachId', async (req, res, next) => {
  try {
    const coachId = parseInt(req.params.coachId);
    const playerId = req.params.id;
    if (!coachId) {
      return res.status(400).json({ message: 'Coach ID is required' });
    }
    const team = await getCoachTeam(coachId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this coach' });
    }
    // Verify player belongs to coach's team
    const players = await getTeamPlayers(team.id);
    const playerExists = players.find(p => p.id === parseInt(playerId));
    if (!playerExists) {
      return res.status(403).json({ message: 'Player does not belong to your team' });
    }
    const updatedPlayer = await updatePlayer(playerId, req.body);
    res.json({ player: updatedPlayer });
  } catch (error) {
    next(error);
  }
});

// Delete player (coach's team only)
router.delete('/players/:id/:coachId', async (req, res, next) => {
  try {
    const coachId = parseInt(req.params.coachId);
    const playerId = req.params.id;
    if (!coachId) {
      return res.status(400).json({ message: 'Coach ID is required' });
    }
    const team = await getCoachTeam(coachId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this coach' });
    }
    // Verify player belongs to coach's team
    const players = await getTeamPlayers(team.id);
    const playerExists = players.find(p => p.id === parseInt(playerId));
    if (!playerExists) {
      return res.status(403).json({ message: 'Player does not belong to your team' });
    }
    await deletePlayer(playerId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get upcoming matches for coach's team
router.get('/matches/:coachId', async (req, res, next) => {
  try {
    const coachId = parseInt(req.params.coachId);
    if (!coachId) {
      return res.status(400).json({ message: 'Coach ID is required' });
    }
    const matches = await getCoachUpcomingMatches(coachId);
    res.json({ matches });
  } catch (error) {
    next(error);
  }
});

// Get lineup for a match
router.get('/lineups/:matchId/:coachId', async (req, res, next) => {
  try {
    const coachId = parseInt(req.params.coachId);
    const matchId = req.params.matchId;
    if (!coachId) {
      return res.status(400).json({ message: 'Coach ID is required' });
    }
    const team = await getCoachTeam(coachId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this coach' });
    }
    const lineup = await getLineupByMatchAndTeam(matchId, team.id);
    if (lineup) {
      const players = await getLineupPlayers(lineup.id);
      res.json({ lineup: { ...lineup, players } });
    } else {
      res.json({ lineup: null });
    }
  } catch (error) {
    next(error);
  }
});

// Create or update lineup
router.post('/lineups/:coachId', async (req, res, next) => {
  try {
    const coachId = parseInt(req.params.coachId);
    if (!coachId) {
      return res.status(400).json({ message: 'Coach ID is required' });
    }
    const team = await getCoachTeam(coachId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this coach' });
    }
    const { match_id, formation, notes, players } = req.body;
    const lineup = await createLineup({
      match_id,
      team_id: team.id,
      coach_id: coachId,
      formation,
      notes
    });
    
    // Add players to lineup
    if (players && Array.isArray(players)) {
      // Clear existing players
      await query('DELETE FROM lineup_players WHERE lineup_id = ?', [lineup.id]);
      // Add new players
      for (const player of players) {
        await addPlayerToLineup(lineup.id, player);
      }
    }
    
    const lineupPlayers = await getLineupPlayers(lineup.id);
    res.json({ lineup: { ...lineup, players: lineupPlayers } });
  } catch (error) {
    next(error);
  }
});

// Submit lineup
router.post('/lineups/:lineupId/submit/:coachId', async (req, res, next) => {
  try {
    const coachId = parseInt(req.params.coachId);
    const lineupId = req.params.lineupId;
    if (!coachId) {
      return res.status(400).json({ message: 'Coach ID is required' });
    }
    const team = await getCoachTeam(coachId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this coach' });
    }
    // Verify lineup belongs to coach
    const lineup = await query('SELECT match_id, team_id FROM lineups WHERE id = ?', [lineupId]);
    if (!lineup || lineup.length === 0 || lineup[0].team_id !== team.id) {
      return res.status(403).json({ message: 'Lineup does not belong to your team' });
    }
    const submittedLineup = await submitLineup(lineupId);
    const players = await getLineupPlayers(lineupId);
    res.json({ lineup: { ...submittedLineup, players } });
  } catch (error) {
    next(error);
  }
});

// Get team-related news (coach can post)
router.get('/news/:coachId', async (req, res, next) => {
  try {
    const coachId = parseInt(req.params.coachId);
    if (!coachId) {
      return res.status(400).json({ message: 'Coach ID is required' });
    }
    const team = await getCoachTeam(coachId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this coach' });
    }
    // Get news related to the team (by team name in title/content or author_id)
    const announcements = await getAnnouncements(coachId);
    // Filter to only team-related news
    const teamNews = announcements.filter(news => 
      news.title?.toLowerCase().includes(team.name.toLowerCase()) ||
      news.content?.toLowerCase().includes(team.name.toLowerCase()) ||
      news.author_id === coachId
    );
    res.json({ announcements: teamNews });
  } catch (error) {
    next(error);
  }
});

// Create team-related news
router.post('/news/:coachId', async (req, res, next) => {
  try {
    const coachId = parseInt(req.params.coachId);
    if (!coachId) {
      return res.status(400).json({ message: 'Coach ID is required' });
    }
    const team = await getCoachTeam(coachId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this coach' });
    }
    const newsData = {
      ...req.body,
      author_id: coachId,
      // Ensure team name is in the content or title
      title: req.body.title || `${team.name} Update`,
      content: req.body.content || ''
    };
    const news = await createNews(newsData);
    res.status(201).json({ news });
  } catch (error) {
    next(error);
  }
});

export default router;

