import { Router } from 'express';
import { getUsers, recordNotificationToken } from '../services/dataService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { role } = req.query;
    const users = await getUsers({ role });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.post('/notification-token', async (req, res, next) => {
  try {
    const { userId, token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'token is required' });
    }
    await recordNotificationToken({ userId: userId || null, token });
    res.status(201).json({ message: 'Token registered' });
  } catch (error) {
    next(error);
  }
});

export default router;

