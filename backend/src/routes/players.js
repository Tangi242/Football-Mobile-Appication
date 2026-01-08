import { Router } from 'express';
import { getPlayerById, getPlayerIdByName } from '../services/dataService.js';

const router = Router();

router.get('/:id', async (req, res, next) => {
  try {
    const playerId = parseInt(req.params.id);
    if (isNaN(playerId)) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }
    const player = await getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json({ player });
  } catch (error) {
    next(error);
  }
});

router.get('/search/:name', async (req, res, next) => {
  try {
    const playerName = decodeURIComponent(req.params.name);
    const playerId = await getPlayerIdByName(playerName);
    if (!playerId) {
      return res.status(404).json({ error: 'Player not found' });
    }
    const player = await getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json({ player });
  } catch (error) {
    next(error);
  }
});

export default router;




