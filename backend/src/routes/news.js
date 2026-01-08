import { Router } from 'express';
import { getAnnouncements, getNewsById, createNews, updateNews, deleteNews } from '../services/dataService.js';

const router = Router();

// Get all news (announcements)
// Supports filtering by author_id for journalists
router.get('/', async (req, res, next) => {
  try {
    const authorId = req.query.author_id ? parseInt(req.query.author_id) : null;
    const announcements = await getAnnouncements(authorId);
    res.json({ announcements });
  } catch (error) {
    next(error);
  }
});

// Get news by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const news = await getNewsById(id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json({ news });
  } catch (error) {
    next(error);
  }
});

// Create new news article
router.post('/', async (req, res, next) => {
  try {
    const newsData = req.body;
    const news = await createNews(newsData);
    res.status(201).json({ news });
  } catch (error) {
    next(error);
  }
});

// Update news article
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const newsData = req.body;
    // Extract user info from request if available (from auth middleware)
    const userId = req.user?.id || req.body.user_id || null;
    const userRole = req.user?.role || req.body.user_role || null;
    const news = await updateNews(id, newsData, userId, userRole);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json({ news });
  } catch (error) {
    if (error.message && error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
});

// Delete news article
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteNews(id);
    if (!deleted) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Trigger breaking news notification
router.post('/:id/breaking', async (req, res, next) => {
  try {
    const newsId = parseInt(req.params.id);
    if (!newsId) {
      return res.status(400).json({ message: 'News ID is required' });
    }
    
    // Update news to mark as breaking
    await query('UPDATE news SET is_breaking = 1 WHERE id = ?', [newsId]);
    
    // TODO: Send push notifications to all users
    // This would integrate with your notification service
    
    res.json({ message: 'Breaking news notification triggered' });
  } catch (error) {
    next(error);
  }
});

export default router;

