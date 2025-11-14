import { Router } from 'express';
import { getAnnouncements } from '../services/dataService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const announcements = await getAnnouncements();
    res.json({ announcements });
  } catch (error) {
    next(error);
  }
});

export default router;

