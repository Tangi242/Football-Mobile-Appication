import { Router } from 'express';
import {
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizById
} from '../services/dataService.js';

const router = Router();

// Get all quizzes (optionally filtered by author)
router.get('/', async (req, res, next) => {
  try {
    const authorId = req.query.author_id ? parseInt(req.query.author_id) : null;
    const quizzes = await getQuizzes(authorId);
    res.json({ quizzes });
  } catch (error) {
    next(error);
  }
});

// Get quiz by ID
router.get('/:id', async (req, res, next) => {
  try {
    const quizId = parseInt(req.params.id);
    if (!quizId) {
      return res.status(400).json({ message: 'Quiz ID is required' });
    }
    const quiz = await getQuizById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json({ quiz });
  } catch (error) {
    next(error);
  }
});

// Create a new quiz
router.post('/', async (req, res, next) => {
  try {
    const quiz = await createQuiz(req.body);
    res.status(201).json({ quiz });
  } catch (error) {
    next(error);
  }
});

// Update a quiz
router.put('/:id', async (req, res, next) => {
  try {
    const quizId = parseInt(req.params.id);
    if (!quizId) {
      return res.status(400).json({ message: 'Quiz ID is required' });
    }
    const quiz = await updateQuiz(quizId, req.body);
    res.json({ quiz });
  } catch (error) {
    next(error);
  }
});

// Delete a quiz
router.delete('/:id', async (req, res, next) => {
  try {
    const quizId = parseInt(req.params.id);
    if (!quizId) {
      return res.status(400).json({ message: 'Quiz ID is required' });
    }
    const success = await deleteQuiz(quizId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

