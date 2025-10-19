"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const vehicleController_1 = require("../controllers/vehicleController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', vehicleController_1.getVehicles);
router.get('/:id', vehicleController_1.getVehicleById);
router.get('/:id/status', vehicleController_1.getVehicleStatus);
router.post('/', vehicleController_1.createVehicle);
router.put('/:id', vehicleController_1.updateVehicle);
router.delete('/:id', vehicleController_1.deleteVehicle);
exports.default = router;
//# sourceMappingURL=vehicles.js.map