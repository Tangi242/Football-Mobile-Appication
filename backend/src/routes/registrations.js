import { Router } from 'express';
import { getPendingRegistrations, approveUser, rejectUser } from '../services/dataService.js';

const router = Router();

// Get all pending registrations (admin only)
router.get('/pending', async (req, res, next) => {
  try {
    const registrations = await getPendingRegistrations();
    res.json({ registrations });
  } catch (error) {
    next(error);
  }
});

// Approve a registration (admin only)
router.post('/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.body.admin_id || req.user?.id; // Get from auth middleware or body
    
    if (!adminId) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    const user = await approveUser(parseInt(id), parseInt(adminId));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User approved successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// Reject a registration (admin only)
router.post('/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, admin_id } = req.body;
    const adminId = admin_id || req.user?.id; // Get from auth middleware or body
    
    if (!adminId) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const user = await rejectUser(parseInt(id), parseInt(adminId), reason.trim());
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User rejected successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

export default router;

