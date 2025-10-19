"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/generate', (req, res) => {
    res.json({ message: 'Generate report - to be implemented' });
});
exports.default = router;
//# sourceMappingURL=reports.js.map