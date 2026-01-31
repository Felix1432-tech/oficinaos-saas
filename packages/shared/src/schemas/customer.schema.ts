import { z } from 'zod';
import { addressSchema, paginationSchema } from './common.schema.js';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  document: z.string().optional(),
  address: addressSchema.optional(),
  tags: z.array(z.string()).default([]),
  source: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerQuerySchema = paginationSchema.extend({
  tags: z.string().optional(), // comma-separated
  source: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerQuery = z.infer<typeof customerQuerySchema>;
