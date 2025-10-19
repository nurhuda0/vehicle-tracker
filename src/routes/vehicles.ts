import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getVehicles,
  getVehicleById,
  getVehicleStatus,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController';

const router = Router();

// All vehicle routes require authentication
router.use(authenticateToken);

// Vehicle routes
router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.get('/:id/status', getVehicleStatus);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
