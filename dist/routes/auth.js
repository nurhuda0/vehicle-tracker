"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("@/controllers/authController");
const validation_1 = require("@/middleware/validation");
const auth_1 = require("@/middleware/auth");
const auth_2 = require("@/validators/auth");
const router = (0, express_1.Router)();
router.post('/login', (0, validation_1.validate)(auth_2.loginSchema), authController_1.login);
router.post('/register', (0, validation_1.validate)(auth_2.registerSchema), authController_1.register);
router.post('/refresh', (0, validation_1.validate)(auth_2.refreshTokenSchema), authController_1.refreshToken);
router.post('/logout', auth_1.authenticateToken, authController_1.logout);
router.get('/me', auth_1.authenticateToken, authController_1.getProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map