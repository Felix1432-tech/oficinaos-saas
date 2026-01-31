import { z } from 'zod';
import { paginationSchema } from './common.schema.js';

export const cardStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'LOST', 'ABANDONED']);

export const createStageSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  position: z.number().int().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').default('#6B7280'),
  slaHours: z.number().int().min(1).optional(),
  isFinal: z.boolean().default(false),
  isLost: z.boolean().default(false),
});

export const updateStageSchema = createStageSchema.partial();

export const reorderStagesSchema = z.object({
  stages: z.array(z.object({
    id: z.string().uuid(),
    position: z.number().int().min(1),
  })),
});

export const createCardSchema = z.object({
  stageId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  channel: z.string().optional(),
  estimatedValue: z.coerce.number().min(0).optional(),
  complaint: z.string().optional(),
  diagnosis: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const updateCardSchema = createCardSchema.partial();

export const moveCardSchema = z.object({
  stageId: z.string().uuid(),
  position: z.number().int().min(0),
});

export const cardQuerySchema = paginationSchema.extend({
  stageId: z.string().uuid().optional(),
  status: cardStatusEnum.optional(),
  assignedToId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  tags: z.string().optional(), // comma-separated
});

export const timelineQuerySchema = paginationSchema.extend({
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  action: z.string().optional(),
});

export type CardStatus = z.infer<typeof cardStatusEnum>;
export type CreateStageInput = z.infer<typeof createStageSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;
export type CardQuery = z.infer<typeof cardQuerySchema>;
