import { Router } from 'express';
import { getFixtures } from '../services/dataService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const fixtures = await getFixtures();
    res.json({ fixtures });
  } catch (error) {
    next(error);
  }
});

export default router;

