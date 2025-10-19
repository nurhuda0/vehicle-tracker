import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  generateVehicleReport,
  generateGeneralReport,
} from '../controllers/reportController';

const router = Router();

// All report routes require authentication
router.use(authenticateToken);

// Report routes
router.get('/vehicle/:vehicleId', generateVehicleReport);
router.get('/generate', generateGeneralReport);

export default router;
