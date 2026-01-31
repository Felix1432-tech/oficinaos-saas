import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const uuidSchema = z.string().uuid();

export const idParamSchema = z.object({
  id: uuidSchema,
});

export const addressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default('BR'),
});

export const phoneSchema = z.string().regex(
  /^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/,
  'Telefone inválido'
);

export const cpfSchema = z.string().regex(
  /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
  'CPF inválido'
);

export const cnpjSchema = z.string().regex(
  /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/,
  'CNPJ inválido'
);

export const plateSchema = z.string().regex(
  /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/,
  'Placa inválida (use formato ABC1D23 ou ABC-1234)'
);

export type Pagination = z.infer<typeof paginationSchema>;
export type Address = z.infer<typeof addressSchema>;
