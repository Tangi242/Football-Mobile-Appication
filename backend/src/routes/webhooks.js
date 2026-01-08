import { Router } from 'express';
import { upsertLiveEvent, calculateStandings } from '../services/dataService.js';
import { query } from '../config/db.js';
import { generateNewsFromEvents, generateLineupNews } from '../services/aiNewsService.js';

const router = Router();

router.post('/live-updates', async (req, res, next) => {
  try {
    const signature = req.headers['x-php-signature'];
    if (!signature || signature !== (process.env.PHP_WEBHOOK_SECRET || '')) {
      return res.status(401).json({ message: 'Invalid signature' });
    }
    const { matchId, payload } = req.body;
    if (!matchId) {
      return res.status(400).json({ message: 'matchId is required' });
    }
    const result = await upsertLiveEvent({ matchId, payload });
    req.broadcast('live-events:update', result);
    
    // Update standings if match is completed
    if (payload?.status === 'completed') {
      try {
        // Get the match to find the league_id
        const match = await query('SELECT league_id FROM matches WHERE id = ?', [matchId]);
        if (match && match.length > 0 && match[0].league_id) {
          // Recalculate standings for the league asynchronously
          calculateStandings(match[0].league_id).catch(err => {
            console.error('Error recalculating standings:', err.message);
          });
        }
      } catch (err) {
        console.error('Error updating standings:', err.message);
      }
      
      // Trigger news generation if match is completed
      if (process.env.ENABLE_AI_NEWS !== 'false') {
        // Generate news asynchronously (don't wait for it)
        generateNewsFromEvents().catch(err => {
          console.error('Background news generation error:', err.message);
        });
      }
    }
    
    res.status(201).json({ message: 'Event stored' });
  } catch (error) {
    next(error);
  }
});

// Webhook endpoint for when lineups are uploaded
router.post('/lineup-uploaded', async (req, res, next) => {
  try {
    const signature = req.headers['x-php-signature'];
    if (!signature || signature !== (process.env.PHP_WEBHOOK_SECRET || '')) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const { matchId, teamId } = req.body;
    
    if (!matchId) {
      return res.status(400).json({ message: 'matchId is required' });
    }

    // Trigger lineup news generation asynchronously
    if (process.env.ENABLE_AI_NEWS !== 'false') {
      generateLineupNews().catch(err => {
        console.error('Background lineup news generation error:', err.message);
      });
    }

    res.status(200).json({ 
      message: 'Lineup received, news generation triggered',
      matchId 
    });
  } catch (error) {
    next(error);
  }
});

export default router;

