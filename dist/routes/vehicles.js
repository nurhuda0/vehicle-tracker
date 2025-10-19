"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
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
exports.default = router;
//# sourceMappingURL=vehicles.js.map