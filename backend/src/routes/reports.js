import { Router } from 'express';
import { getReports } from '../services/dataService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const reports = await getReports();
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

export default router;

