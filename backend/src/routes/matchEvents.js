import { Router } from 'express';
import {
  getMatchEvents,
  createMatchEvent,
  updateMatchEvent,
  deleteMatchEvent
} from '../services/dataService.js';

const router = Router();

// Get events for a match
router.get('/:matchId/events', async (req, res, next) => {
  try {
    const matchId = parseInt(req.params.matchId);
    if (!matchId) {
      return res.status(400).json({ message: 'Match ID is required' });
    }
    const events = await getMatchEvents(matchId);
    res.json({ events });
  } catch (error) {
    next(error);
  }
});

// Create a match event
router.post('/:matchId/events', async (req, res, next) => {
  try {
    const matchId = parseInt(req.params.matchId);
    if (!matchId) {
      return res.status(400).json({ message: 'Match ID is required' });
    }
    const eventId = await createMatchEvent(matchId, req.body);
    res.status(201).json({ eventId, message: 'Event created successfully' });
  } catch (error) {
    next(error);
  }
});

// Update a match event
router.put('/:matchId/events/:eventId', async (req, res, next) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const eventId = parseInt(req.params.eventId);
    if (!matchId || !eventId) {
      return res.status(400).json({ message: 'Match ID and Event ID are required' });
    }
    await updateMatchEvent(matchId, eventId, req.body);
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete a match event
router.delete('/:matchId/events/:eventId', async (req, res, next) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const eventId = parseInt(req.params.eventId);
    if (!matchId || !eventId) {
      return res.status(400).json({ message: 'Match ID and Event ID are required' });
    }
    const success = await deleteMatchEvent(matchId, eventId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

