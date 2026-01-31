import { z } from 'zod';
import { paginationSchema, plateSchema } from './common.schema.js';

export const fuelTypeEnum = z.enum([
  'GASOLINE',
  'ETHANOL',
  'FLEX',
  'DIESEL',
  'ELECTRIC',
  'HYBRID',
  'GAS',
]);

export const transmissionTypeEnum = z.enum([
  'MANUAL',
  'AUTOMATIC',
  'CVT',
  'AUTOMATED',
]);

export const damageSchema = z.object({
  location: z.string(),
  description: z.string(),
  severity: z.enum(['light', 'moderate', 'severe']),
  photos: z.array(z.string()).default([]),
});

export const createVehicleSchema = z.object({
  customerId: z.string().uuid().optional(),
  plate: plateSchema,
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  version: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  engine: z.string().optional(),
  mileage: z.coerce.number().int().min(0).optional(),
  fuelType: fuelTypeEnum.optional(),
  transmission: transmissionTypeEnum.optional(),
  color: z.string().optional(),
  photos: z.array(z.string()).default([]),
  damages: z.array(damageSchema).default([]),
  notes: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial().omit({ plate: true });

export const vehicleQuerySchema = paginationSchema.extend({
  customerId: z.string().uuid().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
});

export type FuelType = z.infer<typeof fuelTypeEnum>;
export type TransmissionType = z.infer<typeof transmissionTypeEnum>;
export type Damage = z.infer<typeof damageSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleQuery = z.infer<typeof vehicleQuerySchema>;
