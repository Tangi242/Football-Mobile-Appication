import { Router } from 'express';
import {
  getPlayerStatistics,
  getTeamPlayerStatistics
} from '../services/dataService.js';

const router = Router();

// Get statistics for a specific player
router.get('/players/:playerId/stats', async (req, res, next) => {
  try {
    const playerId = parseInt(req.params.playerId);
    const season = req.query.season || null;
    if (!playerId) {
      return res.status(400).json({ message: 'Player ID is required' });
    }
    const stats = await getPlayerStatistics(playerId, season);
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

// Get statistics for all players in a team
router.get('/teams/:teamId/player-stats', async (req, res, next) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const season = req.query.season || null;
    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' });
    }
    const stats = await getTeamPlayerStatistics(teamId, season);
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

export default router;

