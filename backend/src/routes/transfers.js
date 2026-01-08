import { Router } from 'express';
import {
  getTransferRequests,
  createTransferRequest,
  cancelTransferRequest
} from '../services/dataService.js';

const router = Router();

// Get transfer requests (optionally filtered by coach)
router.get('/', async (req, res, next) => {
  try {
    const coachId = req.query.coach_id ? parseInt(req.query.coach_id) : null;
    const requests = await getTransferRequests(coachId);
    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

// Create a transfer request
router.post('/', async (req, res, next) => {
  try {
    const request = await createTransferRequest(req.body);
    res.status(201).json({ request });
  } catch (error) {
    next(error);
  }
});

// Cancel a transfer request (coach only, their own requests)
router.delete('/:id', async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id);
    const coachId = req.query.coach_id ? parseInt(req.query.coach_id) : (req.body.coach_id ? parseInt(req.body.coach_id) : null);
    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }
    if (!coachId) {
      return res.status(400).json({ message: 'Coach ID is required' });
    }
    const success = await cancelTransferRequest(requestId, coachId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Request not found or unauthorized' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

