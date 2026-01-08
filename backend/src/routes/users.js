import { Router } from 'express';
import { getUsers, recordNotificationToken, updateUserStatus, getUserById } from '../services/dataService.js';

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

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "active" or "suspended"' });
    }
    const user = await updateUserStatus(id, status);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
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

