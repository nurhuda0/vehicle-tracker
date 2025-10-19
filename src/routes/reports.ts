import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All report routes require authentication
router.use(authenticateToken);

// Placeholder routes - will be implemented later
router.get('/generate', (req, res) => {
  res.json({ message: 'Generate report - to be implemented' });
});

export default router;
