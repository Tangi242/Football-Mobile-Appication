import { Router } from 'express';
import {
  getTrainingSessions,
  createTrainingSession,
  updateTrainingSession,
  deleteTrainingSession
} from '../services/dataService.js';

const router = Router();

// Get training sessions (optionally filtered by coach)
router.get('/', async (req, res, next) => {
  try {
    const coachId = req.query.coach_id ? parseInt(req.query.coach_id) : null;
    const sessions = await getTrainingSessions(coachId);
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

// Create a training session
router.post('/', async (req, res, next) => {
  try {
    const session = await createTrainingSession(req.body);
    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

// Update a training session
router.put('/:id', async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }
    const session = await updateTrainingSession(sessionId, req.body);
    res.json({ session });
  } catch (error) {
    next(error);
  }
});

// Delete a training session
router.delete('/:id', async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }
    const success = await deleteTrainingSession(sessionId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

