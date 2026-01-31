import { z } from 'zod';
import { paginationSchema } from './common.schema.js';

export const proposalStatusEnum = z.enum([
  'DRAFT',
  'SENT',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
]);

export const proposalItemTypeEnum = z.enum([
  'PART',
  'LABOR',
  'DIAGNOSTIC',
  'CONSUMABLE',
  'TAX',
  'THIRD_PARTY',
  'DISCOUNT',
  'PACKAGE',
]);

export const proposalItemSchema = z.object({
  id: z.string().uuid().optional(),
  type: proposalItemTypeEnum,
  catalogPartId: z.string().uuid().optional(),
  catalogServiceId: z.string().uuid().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.coerce.number().min(0.001),
  unitPrice: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0).default(0),
  markupPercent: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  position: z.number().int().min(0).default(0),
});

export const createProposalSchema = z.object({
  cardId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  validityDays: z.number().int().min(1).default(7),
  warranty: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(proposalItemSchema).default([]),
});

export const updateProposalSchema = createProposalSchema.partial();

export const addProposalItemSchema = proposalItemSchema;

export const updateProposalItemSchema = proposalItemSchema.partial();

export const sendProposalSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export const proposalQuerySchema = paginationSchema.extend({
  status: proposalStatusEnum.optional(),
  customerId: z.string().uuid().optional(),
  cardId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export type ProposalStatus = z.infer<typeof proposalStatusEnum>;
export type ProposalItemType = z.infer<typeof proposalItemTypeEnum>;
export type ProposalItem = z.infer<typeof proposalItemSchema>;
export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
export type SendProposalInput = z.infer<typeof sendProposalSchema>;
export type ProposalQuery = z.infer<typeof proposalQuerySchema>;
