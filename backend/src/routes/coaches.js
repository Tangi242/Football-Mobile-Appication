import { Router } from 'express';
import { getCoaches, getCoachById, createCoach, updateCoach, deleteCoach } from '../services/dataService.js';

const router = Router();

// Get all coaches
router.get('/', async (req, res, next) => {
  try {
    const coaches = await getCoaches();
    res.json({ coaches });
  } catch (error) {
    next(error);
  }
});

// Get coach by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const coach = await getCoachById(id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    res.json({ coach });
  } catch (error) {
    next(error);
  }
});

// Create new coach
router.post('/', async (req, res, next) => {
  try {
    const coachData = req.body;
    const coach = await createCoach(coachData);
    res.status(201).json({ coach });
  } catch (error) {
    next(error);
  }
});

// Update coach
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const coachData = req.body;
    const coach = await updateCoach(id, coachData);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    res.json({ coach });
  } catch (error) {
    next(error);
  }
});

// Delete coach
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteCoach(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    res.json({ message: 'Coach deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

