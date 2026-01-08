import { Router } from 'express';
import {
  getPlayerRatings,
  createPlayerRating,
  updatePlayerRating
} from '../services/dataService.js';

const router = Router();

// Get player ratings for a match
router.get('/:matchId/ratings', async (req, res, next) => {
  try {
    const matchId = parseInt(req.params.matchId);
    if (!matchId) {
      return res.status(400).json({ message: 'Match ID is required' });
    }
    const ratings = await getPlayerRatings(matchId);
    res.json({ ratings });
  } catch (error) {
    next(error);
  }
});

// Create or update a player rating
router.post('/:matchId/ratings', async (req, res, next) => {
  try {
    const matchId = parseInt(req.params.matchId);
    if (!matchId) {
      return res.status(400).json({ message: 'Match ID is required' });
    }
    await createPlayerRating(matchId, req.body);
    res.status(201).json({ message: 'Rating saved successfully' });
  } catch (error) {
    next(error);
  }
});

// Update a player rating
router.put('/:matchId/ratings/:playerId', async (req, res, next) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const playerId = parseInt(req.params.playerId);
    if (!matchId || !playerId) {
      return res.status(400).json({ message: 'Match ID and Player ID are required' });
    }
    await updatePlayerRating(matchId, playerId, req.body);
    res.json({ message: 'Rating updated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

