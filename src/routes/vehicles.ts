import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All vehicle routes require authentication
router.use(authenticateToken);

// Placeholder routes - will be implemented later
router.get('/', (req, res) => {
  res.json({ message: 'Get all vehicles - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get vehicle by ID - to be implemented' });
});

router.get('/:id/status', (req, res) => {
  res.json({ message: 'Get vehicle status - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create vehicle - to be implemented' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update vehicle - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete vehicle - to be implemented' });
});

export default router;
