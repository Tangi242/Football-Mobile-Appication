import { Router } from 'express';
import {
  getPolls,
  createPoll,
  updatePoll,
  deletePoll,
  getPollById
} from '../services/dataService.js';

const router = Router();

// Get all polls (optionally filtered by author)
router.get('/', async (req, res, next) => {
  try {
    const authorId = req.query.author_id ? parseInt(req.query.author_id) : null;
    const polls = await getPolls(authorId);
    res.json({ polls });
  } catch (error) {
    next(error);
  }
});

// Get poll by ID
router.get('/:id', async (req, res, next) => {
  try {
    const pollId = parseInt(req.params.id);
    if (!pollId) {
      return res.status(400).json({ message: 'Poll ID is required' });
    }
    const poll = await getPollById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    res.json({ poll });
  } catch (error) {
    next(error);
  }
});

// Create a new poll
router.post('/', async (req, res, next) => {
  try {
    const poll = await createPoll(req.body);
    res.status(201).json({ poll });
  } catch (error) {
    next(error);
  }
});

// Update a poll
router.put('/:id', async (req, res, next) => {
  try {
    const pollId = parseInt(req.params.id);
    if (!pollId) {
      return res.status(400).json({ message: 'Poll ID is required' });
    }
    const poll = await updatePoll(pollId, req.body);
    res.json({ poll });
  } catch (error) {
    next(error);
  }
});

// Delete a poll
router.delete('/:id', async (req, res, next) => {
  try {
    const pollId = parseInt(req.params.id);
    if (!pollId) {
      return res.status(400).json({ message: 'Poll ID is required' });
    }
    const success = await deletePoll(pollId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Poll not found' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

