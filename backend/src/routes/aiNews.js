import { Router } from 'express';
import { triggerNewsGeneration } from '../services/aiNewsService.js';

const router = Router();

// Manual trigger endpoint for AI news generation
router.post('/generate', async (req, res, next) => {
  try {
    const result = await triggerNewsGeneration();
    res.json({
      success: result.success,
      message: result.success 
        ? `Generated ${result.count} news articles` 
        : `Failed: ${result.error}`,
      articles: result.articles || []
    });
  } catch (error) {
    next(error);
  }
});

export default router;

