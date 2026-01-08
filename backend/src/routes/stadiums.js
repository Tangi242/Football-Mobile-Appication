import { Router } from 'express';
import { getStadiums, getStadiumById, createStadium, updateStadium, deleteStadium } from '../services/dataService.js';

const router = Router();

// Get all stadiums
router.get('/', async (req, res, next) => {
  try {
    const stadiums = await getStadiums();
    res.json({ stadiums });
  } catch (error) {
    next(error);
  }
});

// Get stadium by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const stadium = await getStadiumById(id);
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }
    res.json({ stadium });
  } catch (error) {
    next(error);
  }
});

// Create new stadium
router.post('/', async (req, res, next) => {
  try {
    const stadiumData = req.body;
    const stadium = await createStadium(stadiumData);
    res.status(201).json({ stadium });
  } catch (error) {
    next(error);
  }
});

// Update stadium
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const stadiumData = req.body;
    const stadium = await updateStadium(id, stadiumData);
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }
    res.json({ stadium });
  } catch (error) {
    next(error);
  }
});

// Delete stadium
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteStadium(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Stadium not found' });
    }
    res.json({ message: 'Stadium deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

