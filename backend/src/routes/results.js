import { Router } from 'express';
import { getResults } from '../services/dataService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const results = await getResults();
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

export default router;

