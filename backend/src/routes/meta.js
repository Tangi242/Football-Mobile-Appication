import { Router } from 'express';
import { getLeagues, getLeaderBoards } from '../services/dataService.js';

const router = Router();

router.get('/leagues', async (_req, res, next) => {
  try {
    const leagues = await getLeagues();
    res.json({ leagues });
  } catch (error) {
    next(error);
  }
});

router.get('/leaders', async (_req, res, next) => {
  try {
    const leaders = await getLeaderBoards();
    res.json({ leaders });
  } catch (error) {
    next(error);
  }
});

export default router;

