"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVehicleStatusSchema = exports.deleteVehicleSchema = exports.getVehicleSchema = exports.updateVehicleSchema = exports.createVehicleSchema = void 0;
const zod_1 = require("zod");
exports.createVehicleSchema = zod_1.z.object({
    body: zod_1.z.object({
        plateNumber: zod_1.z
            .string()
            .min(1, 'Plate number is required')
            .max(20, 'Plate number must be less than 20 characters')
            .regex(/^[A-Z0-9\s]+$/, 'Plate number must contain only uppercase letters, numbers, and spaces'),
        model: zod_1.z
            .string()
            .min(1, 'Model is required')
            .max(100, 'Model must be less than 100 characters'),
        brand: zod_1.z
            .string()
            .min(1, 'Brand is required')
            .max(100, 'Brand must be less than 100 characters'),
        year: zod_1.z
            .number()
            .int('Year must be an integer')
            .min(1900, 'Year must be after 1900')
            .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
        status: zod_1.z
            .enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE'])
            .default('ACTIVE'),
    }),
});
exports.updateVehicleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Vehicle ID is required'),
    }),
    body: zod_1.z.object({
        plateNumber: zod_1.z
            .string()
            .min(1, 'Plate number is required')
            .max(20, 'Plate number must be less than 20 characters')
            .regex(/^[A-Z0-9\s]+$/, 'Plate number must contain only uppercase letters, numbers, and spaces')
            .optional(),
        model: zod_1.z
            .string()
            .min(1, 'Model is required')
            .max(100, 'Model must be less than 100 characters')
            .optional(),
        brand: zod_1.z
            .string()
            .min(1, 'Brand is required')
            .max(100, 'Brand must be less than 100 characters')
            .optional(),
        year: zod_1.z
            .number()
            .int('Year must be an integer')
            .min(1900, 'Year must be after 1900')
            .max(new Date().getFullYear() + 1, 'Year cannot be in the future')
            .optional(),
        status: zod_1.z
            .enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE'])
            .optional(),
    }),
});
exports.getVehicleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Vehicle ID is required'),
    }),
});
exports.deleteVehicleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Vehicle ID is required'),
    }),
});
exports.getVehicleStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Vehicle ID is required'),
    }),
    query: zod_1.z.object({
        date: zod_1.z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
            .optional(),
        startDate: zod_1.z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
            .optional(),
        endDate: zod_1.z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
            .optional(),
    }),
});
//# sourceMappingURL=vehicle.js.map