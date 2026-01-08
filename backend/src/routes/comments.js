import { Router } from 'express';
import {
  getComments,
  moderateComment,
  deleteComment as deleteCommentService
} from '../services/dataService.js';

const router = Router();

// Get all comments (optionally filtered by news_id and status)
router.get('/', async (req, res, next) => {
  try {
    const newsId = req.query.news_id ? parseInt(req.query.news_id) : null;
    const status = req.query.status || null;
    const comments = await getComments(newsId, status);
    res.json({ comments });
  } catch (error) {
    next(error);
  }
});

// Moderate a comment (approve/reject/flag)
router.put('/:id/moderate', async (req, res, next) => {
  try {
    const commentId = parseInt(req.params.id);
    const { status } = req.body;
    if (!commentId || !status) {
      return res.status(400).json({ message: 'Comment ID and status are required' });
    }
    if (!['approved', 'rejected', 'flagged'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved, rejected, or flagged' });
    }
    const comment = await moderateComment(commentId, status, req.user?.id);
    res.json({ comment });
  } catch (error) {
    next(error);
  }
});

// Delete a comment
router.delete('/:id', async (req, res, next) => {
  try {
    const commentId = parseInt(req.params.id);
    if (!commentId) {
      return res.status(400).json({ message: 'Comment ID is required' });
    }
    const success = await deleteCommentService(commentId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Comment not found' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

