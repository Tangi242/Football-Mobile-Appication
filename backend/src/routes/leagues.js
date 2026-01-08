import { Router } from 'express';
import { getLeagues, getLeagueById, createLeague, updateLeague, deleteLeague } from '../services/dataService.js';

const router = Router();

// Get all leagues
router.get('/', async (req, res, next) => {
  try {
    const leagues = await getLeagues();
    res.json({ leagues });
  } catch (error) {
    next(error);
  }
});

// Get league by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const league = await getLeagueById(id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    res.json({ league });
  } catch (error) {
    next(error);
  }
});

// Create new league
router.post('/', async (req, res, next) => {
  try {
    const leagueData = req.body;
    const league = await createLeague(leagueData);
    res.status(201).json({ league });
  } catch (error) {
    next(error);
  }
});

// Update league
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const leagueData = req.body;
    const league = await updateLeague(id, leagueData);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    res.json({ league });
  } catch (error) {
    next(error);
  }
});

// Delete league
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteLeague(id);
    if (!deleted) {
      return res.status(404).json({ message: 'League not found' });
    }
    res.json({ message: 'League deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

