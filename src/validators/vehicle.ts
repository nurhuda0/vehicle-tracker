import { z } from 'zod';

export const createVehicleSchema = z.object({
  body: z.object({
    plateNumber: z
      .string()
      .min(1, 'Plate number is required')
      .max(20, 'Plate number must be less than 20 characters')
      .regex(
        /^[A-Z0-9\s]+$/,
        'Plate number must contain only uppercase letters, numbers, and spaces'
      ),
    model: z
      .string()
      .min(1, 'Model is required')
      .max(100, 'Model must be less than 100 characters'),
    brand: z
      .string()
      .min(1, 'Brand is required')
      .max(100, 'Brand must be less than 100 characters'),
    year: z
      .number()
      .int('Year must be an integer')
      .min(1900, 'Year must be after 1900')
      .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
    status: z
      .enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE'])
      .default('ACTIVE'),
  }),
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Vehicle ID is required'),
  }),
  body: z.object({
    plateNumber: z
      .string()
      .min(1, 'Plate number is required')
      .max(20, 'Plate number must be less than 20 characters')
      .regex(
        /^[A-Z0-9\s]+$/,
        'Plate number must contain only uppercase letters, numbers, and spaces'
      )
      .optional(),
    model: z
      .string()
      .min(1, 'Model is required')
      .max(100, 'Model must be less than 100 characters')
      .optional(),
    brand: z
      .string()
      .min(1, 'Brand is required')
      .max(100, 'Brand must be less than 100 characters')
      .optional(),
    year: z
      .number()
      .int('Year must be an integer')
      .min(1900, 'Year must be after 1900')
      .max(new Date().getFullYear() + 1, 'Year cannot be in the future')
      .optional(),
    status: z
      .enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE'])
      .optional(),
  }),
});

export const getVehicleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Vehicle ID is required'),
  }),
});

export const deleteVehicleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Vehicle ID is required'),
  }),
});

export const getVehicleStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Vehicle ID is required'),
  }),
  query: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .optional(),
  }),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>['body'];
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>['body'];
export type GetVehicleInput = z.infer<typeof getVehicleSchema>['params'];
export type DeleteVehicleInput = z.infer<typeof deleteVehicleSchema>['params'];
export type GetVehicleStatusInput = z.infer<typeof getVehicleStatusSchema>['params'] & 
  z.infer<typeof getVehicleStatusSchema>['query'];
