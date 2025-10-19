import { z } from 'zod';

export const generateReportSchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
    vehicleId: z
      .string()
      .min(1, 'Vehicle ID is required')
      .optional(),
    status: z
      .enum(['TRIP', 'IDLE', 'STOPPED'])
      .optional(),
    format: z
      .enum(['xlsx', 'csv'])
      .default('xlsx'),
  }),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>['query'];
