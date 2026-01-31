import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: any) {
    const { page = 1, limit = 20, search, tags, source } = query;

    const where: any = { tenantId, deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags) {
      where.tags = { hasSome: tags.split(',') };
    }

    if (source) {
      where.source = source;
    }

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { vehicles: true, cards: true } },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        vehicles: { where: { deletedAt: null } },
        cards: {
          where: { deletedAt: null },
          include: { stage: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }

  async create(tenantId: string, data: any) {
    return this.prisma.customer.create({
      data: { tenantId, ...data },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Cliente excluído com sucesso' };
  }

  async getHistory(tenantId: string, customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const [proposals, workOrders] = await Promise.all([
      this.prisma.proposal.findMany({
        where: { tenantId, customerId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: { vehicle: { select: { plate: true, brand: true, model: true } } },
      }),
      this.prisma.workOrder.findMany({
        where: { tenantId, customerId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: { vehicle: { select: { plate: true, brand: true, model: true } } },
      }),
    ]);

    return { proposals, workOrders };
  }
}
