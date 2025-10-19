"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string()
            .email('Invalid email format')
            .min(1, 'Email is required'),
        password: zod_1.z
            .string()
            .min(6, 'Password must be at least 6 characters')
            .max(100, 'Password must be less than 100 characters'),
    }),
});
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string()
            .email('Invalid email format')
            .min(1, 'Email is required'),
        password: zod_1.z
            .string()
            .min(6, 'Password must be at least 6 characters')
            .max(100, 'Password must be less than 100 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
        name: zod_1.z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must be less than 100 characters'),
        role: zod_1.z
            .enum(['ADMIN', 'USER'])
            .optional()
            .default('USER'),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z
            .string()
            .min(1, 'Refresh token is required'),
    }),
});
//# sourceMappingURL=auth.js.map