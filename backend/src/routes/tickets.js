import { Router } from 'express';
import { createTicket } from '../services/dataService.js';

const router = Router();

// Create new ticket
router.post('/', async (req, res, next) => {
  try {
    const ticketData = req.body;
    const ticketId = await createTicket(ticketData);
    res.status(201).json({ ticketId, message: 'Ticket created successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

