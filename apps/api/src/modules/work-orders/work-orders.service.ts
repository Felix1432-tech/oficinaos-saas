import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: any) {
    const { page = 1, limit = 20, status } = query;
    const where: any = { tenantId, deletedAt: null };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, name: true } }, vehicle: { select: { id: true, plate: true, brand: true, model: true } } },
      }),
      this.prisma.workOrder.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { customer: true, vehicle: true, proposal: true, items: true },
    });
    if (!wo) throw new NotFoundException('OS não encontrada');
    return wo;
  }

  async create(tenantId: string, data: any) {
    const number = await this.getNextNumber(tenantId);
    return this.prisma.workOrder.create({
      data: { tenantId, number, totalCost: new Decimal(0), totalRevenue: new Decimal(0), ...data },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id);
    return this.prisma.workOrder.update({ where: { id }, data });
  }

  async start(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.workOrder.update({ where: { id }, data: { status: 'IN_PROGRESS', startedAt: new Date() } });
  }

  async complete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.workOrder.update({ where: { id }, data: { status: 'COMPLETED', finishedAt: new Date() } });
  }

  async deliver(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.workOrder.update({ where: { id }, data: { status: 'DELIVERED', deliveredAt: new Date() } });
  }

  private async getNextNumber(tenantId: string): Promise<number> {
    const last = await this.prisma.workOrder.findFirst({ where: { tenantId }, orderBy: { number: 'desc' } });
    return (last?.number || 0) + 1;
  }
}
