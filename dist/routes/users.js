"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', (req, res) => {
    res.json({ message: 'Users endpoint - to be implemented' });
});
router.get('/:id', (req, res) => {
    res.json({ message: 'Get user by ID - to be implemented' });
});
router.post('/', (0, auth_1.requireRole)(['ADMIN']), (req, res) => {
    res.json({ message: 'Create user - to be implemented' });
});
router.put('/:id', (0, auth_1.requireRole)(['ADMIN']), (req, res) => {
    res.json({ message: 'Update user - to be implemented' });
});
router.delete('/:id', (0, auth_1.requireRole)(['ADMIN']), (req, res) => {
    res.json({ message: 'Delete user - to be implemented' });
});
exports.default = router;
//# sourceMappingURL=users.js.map