import { Router } from 'express';
import { upsertLiveEvent } from '../services/dataService.js';

const router = Router();

router.post('/live-updates', async (req, res, next) => {
  try {
    const signature = req.headers['x-php-signature'];
    if (!signature || signature !== (process.env.PHP_WEBHOOK_SECRET || '')) {
      return res.status(401).json({ message: 'Invalid signature' });
    }
    const { matchId, payload } = req.body;
    if (!matchId) {
      return res.status(400).json({ message: 'matchId is required' });
    }
    const result = await upsertLiveEvent({ matchId, payload });
    req.broadcast('live-events:update', result);
    res.status(201).json({ message: 'Event stored' });
  } catch (error) {
    next(error);
  }
});

export default router;

