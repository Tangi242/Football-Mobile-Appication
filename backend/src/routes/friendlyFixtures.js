import { Router } from 'express';
import {
  getFriendlyFixtures,
  createFriendlyFixture,
  updateFriendlyFixture,
  deleteFriendlyFixture
} from '../services/dataService.js';

const router = Router();

// Get friendly fixtures (optionally filtered by coach)
router.get('/', async (req, res, next) => {
  try {
    const coachId = req.query.coach_id ? parseInt(req.query.coach_id) : null;
    const fixtures = await getFriendlyFixtures(coachId);
    res.json({ fixtures });
  } catch (error) {
    next(error);
  }
});

// Create a friendly fixture
router.post('/', async (req, res, next) => {
  try {
    const fixture = await createFriendlyFixture(req.body);
    res.status(201).json({ fixture });
  } catch (error) {
    next(error);
  }
});

// Update a friendly fixture
router.put('/:id', async (req, res, next) => {
  try {
    const fixtureId = parseInt(req.params.id);
    if (!fixtureId) {
      return res.status(400).json({ message: 'Fixture ID is required' });
    }
    const fixture = await updateFriendlyFixture(fixtureId, req.body);
    res.json({ fixture });
  } catch (error) {
    next(error);
  }
});

// Delete a friendly fixture
router.delete('/:id', async (req, res, next) => {
  try {
    const fixtureId = parseInt(req.params.id);
    if (!fixtureId) {
      return res.status(400).json({ message: 'Fixture ID is required' });
    }
    const success = await deleteFriendlyFixture(fixtureId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Fixture not found' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

