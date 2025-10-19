"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const reportController_1 = require("../controllers/reportController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/vehicle/:vehicleId', reportController_1.generateVehicleReport);
router.get('/generate', reportController_1.generateGeneralReport);
exports.default = router;
//# sourceMappingURL=reports.js.map