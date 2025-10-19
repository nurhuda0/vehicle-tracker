"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportSchema = void 0;
const zod_1 = require("zod");
exports.generateReportSchema = zod_1.z.object({
    query: zod_1.z.object({
        startDate: zod_1.z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
        endDate: zod_1.z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
        vehicleId: zod_1.z
            .string()
            .min(1, 'Vehicle ID is required')
            .optional(),
        status: zod_1.z
            .enum(['TRIP', 'IDLE', 'STOPPED'])
            .optional(),
        format: zod_1.z
            .enum(['xlsx', 'csv'])
            .default('xlsx'),
    }),
});
//# sourceMappingURL=report.js.map