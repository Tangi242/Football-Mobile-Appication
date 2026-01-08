import { Router } from 'express';
import { getTeams, getTeamById, createTeam, updateTeam, deleteTeam } from '../services/dataService.js';

const router = Router();

// Get all teams
router.get('/', async (req, res, next) => {
  try {
    const teams = await getTeams();
    res.json({ teams });
  } catch (error) {
    next(error);
  }
});

// Get team by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const team = await getTeamById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json({ team });
  } catch (error) {
    next(error);
  }
});

// Create new team
router.post('/', async (req, res, next) => {
  try {
    const teamData = req.body;
    const team = await createTeam(teamData);
    res.status(201).json({ team });
  } catch (error) {
    next(error);
  }
});

// Update team
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const teamData = req.body;
    const team = await updateTeam(id, teamData);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json({ team });
  } catch (error) {
    next(error);
  }
});

// Delete team
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteTeam(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

