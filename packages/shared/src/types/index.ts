// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Auth Types
export interface TokenPayload {
  sub: string;
  email: string;
  tenantId: string | null;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
  avatarUrl?: string;
}

// Tenant Types
export interface TenantSettings {
  timezone: string;
  currency: string;
  language: string;
  logo?: string;
  primaryColor?: string;
}

// CRM Types
export interface KanbanBoard {
  stages: KanbanStage[];
}

export interface KanbanStage {
  id: string;
  name: string;
  position: number;
  color: string;
  slaHours?: number;
  isFinal: boolean;
  isLost: boolean;
  cards: KanbanCard[];
}

export interface KanbanCard {
  id: string;
  title: string;
  position: number;
  customer?: {
    id: string;
    name: string;
  };
  vehicle?: {
    id: string;
    plate: string;
    brand: string;
    model: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  estimatedValue?: number;
  slaDeadline?: string;
  tags: string[];
  status: string;
  createdAt: string;
}

// Timeline Types
export interface TimelineEntry {
  id: string;
  action: string;
  actorUser?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  actorRole?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// Proposal Types
export interface ProposalSummary {
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
  costTotal: number;
  margin: number;
  profit: number;
}

// Dashboard Types
export interface DashboardMetrics {
  leadsThisMonth: number;
  leadsGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  averageTicket: number;
  ticketGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
}

export interface LeadsByChannel {
  channel: string;
  count: number;
  percentage: number;
}

export interface StageMetrics {
  stageId: string;
  stageName: string;
  count: number;
  avgTimeHours: number;
}

// Public Quote Types
export interface PublicQuoteStep {
  step: number;
  name: string;
  completed: boolean;
}

export interface PublicQuoteData {
  contact: {
    name: string;
    phone: string;
    email?: string;
  };
  vehicle: {
    plate: string;
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
  };
  category: string;
  answers: Record<string, string | string[]>;
  selectedServices: string[];
}

export interface PublicQuoteEstimate {
  services: {
    id: string;
    name: string;
    price: number;
    timeHours: number;
  }[];
  laborCost: number;
  partsCost: number;
  diagnosticCost: number;
  consumablesCost: number;
  subtotal: number;
  estimatedTime: string;
}
