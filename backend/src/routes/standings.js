import { Router } from 'express';
import { getStandings, getAllStandings, calculateStandings } from '../services/dataService.js';

const router = Router();

// Get standings for a specific league
router.get('/league/:leagueId', async (req, res, next) => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    if (!leagueId) {
      return res.status(400).json({ message: 'League ID is required' });
    }
    const standings = await getStandings(leagueId);
    res.json({ standings });
  } catch (error) {
    next(error);
  }
});

// Get all standings (all leagues)
router.get('/', async (req, res, next) => {
  try {
    const standings = await getAllStandings();
    res.json({ standings });
  } catch (error) {
    next(error);
  }
});

// Manually recalculate standings for a league
router.post('/recalculate/:leagueId', async (req, res, next) => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    if (!leagueId) {
      return res.status(400).json({ message: 'League ID is required' });
    }
    await calculateStandings(leagueId);
    const standings = await getStandings(leagueId);
    res.json({ message: 'Standings recalculated', standings });
  } catch (error) {
    next(error);
  }
});

export default router;

