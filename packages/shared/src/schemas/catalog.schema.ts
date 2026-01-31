import { z } from 'zod';
import { paginationSchema } from './common.schema.js';

// Parts
export const createPartSchema = z.object({
  supplierId: z.string().uuid().optional(),
  code: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().default('UN'),
  costAvg: z.coerce.number().min(0).default(0),
  suggestedPrice: z.coerce.number().min(0).default(0),
  markupDefault: z.coerce.number().min(0).default(50),
  stockQty: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().min(0).default(0),
});

export const updatePartSchema = createPartSchema.partial();

export const partQuerySchema = paginationSchema.extend({
  category: z.string().optional(),
  supplierId: z.string().uuid().optional(),
  lowStock: z.coerce.boolean().optional(),
});

// Services
export const createServiceSchema = z.object({
  laborRateId: z.string().uuid().optional(),
  code: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  category: z.string().optional(),
  defaultTimeHrs: z.coerce.number().min(0.1).default(1),
  suggestedPrice: z.coerce.number().min(0).default(0),
  markupDefault: z.coerce.number().min(0).default(50),
  checklist: z.array(z.string()).optional(),
  executionMode: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  parts: z.array(z.object({
    partId: z.string().uuid(),
    quantity: z.coerce.number().min(0.001).default(1),
  })).default([]),
  consumables: z.array(z.object({
    consumableId: z.string().uuid(),
    quantity: z.coerce.number().min(0.001).default(1),
  })).default([]),
});

export const updateServiceSchema = createServiceSchema.partial();

export const serviceQuerySchema = paginationSchema.extend({
  category: z.string().optional(),
});

// Consumables
export const createConsumableSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  unit: z.string().default('UN'),
  costAvg: z.coerce.number().min(0).default(0),
  suggestedPrice: z.coerce.number().min(0).default(0),
  stockQty: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().min(0).default(0),
});

export const updateConsumableSchema = createConsumableSchema.partial();

// Suppliers
export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.any().optional(),
  notes: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

// Labor Rates
export const createLaborRateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.string().optional(),
  ratePerHour: z.coerce.number().min(0),
  isDefault: z.boolean().default(false),
});

export const updateLaborRateSchema = createLaborRateSchema.partial();

export type CreatePartInput = z.infer<typeof createPartSchema>;
export type UpdatePartInput = z.infer<typeof updatePartSchema>;
export type PartQuery = z.infer<typeof partQuerySchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceQuery = z.infer<typeof serviceQuerySchema>;
export type CreateConsumableInput = z.infer<typeof createConsumableSchema>;
export type UpdateConsumableInput = z.infer<typeof updateConsumableSchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreateLaborRateInput = z.infer<typeof createLaborRateSchema>;
export type UpdateLaborRateInput = z.infer<typeof updateLaborRateSchema>;
