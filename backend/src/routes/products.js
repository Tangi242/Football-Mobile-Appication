import { Router } from 'express';
import { getProducts } from '../services/dataService.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const products = await getProducts();
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

export default router;

