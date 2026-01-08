import { Router } from 'express';
import {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
  getInterviewById
} from '../services/dataService.js';

const router = Router();

// Get all interviews (optionally filtered by author)
router.get('/', async (req, res, next) => {
  try {
    const authorId = req.query.author_id ? parseInt(req.query.author_id) : null;
    const interviews = await getInterviews(authorId);
    res.json({ interviews });
  } catch (error) {
    next(error);
  }
});

// Get interview by ID
router.get('/:id', async (req, res, next) => {
  try {
    const interviewId = parseInt(req.params.id);
    if (!interviewId) {
      return res.status(400).json({ message: 'Interview ID is required' });
    }
    const interview = await getInterviewById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json({ interview });
  } catch (error) {
    next(error);
  }
});

// Create a new interview
router.post('/', async (req, res, next) => {
  try {
    const interview = await createInterview(req.body);
    res.status(201).json({ interview });
  } catch (error) {
    next(error);
  }
});

// Update an interview
router.put('/:id', async (req, res, next) => {
  try {
    const interviewId = parseInt(req.params.id);
    if (!interviewId) {
      return res.status(400).json({ message: 'Interview ID is required' });
    }
    const interview = await updateInterview(interviewId, req.body);
    res.json({ interview });
  } catch (error) {
    next(error);
  }
});

// Delete an interview
router.delete('/:id', async (req, res, next) => {
  try {
    const interviewId = parseInt(req.params.id);
    if (!interviewId) {
      return res.status(400).json({ message: 'Interview ID is required' });
    }
    const success = await deleteInterview(interviewId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Interview not found' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

