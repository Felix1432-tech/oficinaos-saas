import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../crm/timeline.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly timeline: TimelineService,
  ) {}

  async findAll(tenantId: string, query: any) {
    const { page = 1, limit = 20, status, customerId, cardId } = query;
    const where: any = { tenantId, deletedAt: null };
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (cardId) where.cardId = cardId;

    const [items, total] = await Promise.all([
      this.prisma.proposal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          vehicle: { select: { id: true, plate: true, brand: true, model: true } },
        },
      }),
      this.prisma.proposal.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const proposal = await this.prisma.proposal.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: true,
        vehicle: true,
        template: true,
        items: { orderBy: { position: 'asc' } },
      },
    });
    if (!proposal) throw new NotFoundException('Orçamento não encontrado');
    return proposal;
  }

  async create(tenantId: string, userId: string, data: any) {
    const number = await this.getNextNumber(tenantId);

    const proposal = await this.prisma.proposal.create({
      data: {
        tenantId,
        number,
        subtotal: new Decimal(0),
        total: new Decimal(0),
        ...data,
      },
    });

    await this.timeline.createEvent({
      tenantId,
      entityType: 'proposal',
      entityId: proposal.id,
      action: 'CREATED',
      actorUserId: userId,
    });

    return proposal;
  }

  async update(tenantId: string, userId: string, id: string, data: any) {
    const proposal = await this.findOne(tenantId, id);

    const updated = await this.prisma.proposal.update({
      where: { id },
      data,
    });

    await this.timeline.createEvent({
      tenantId,
      entityType: 'proposal',
      entityId: id,
      action: 'UPDATED',
      actorUserId: userId,
    });

    return updated;
  }

  async addItem(tenantId: string, proposalId: string, item: any) {
    const proposal = await this.findOne(tenantId, proposalId);

    const total = new Decimal(item.quantity).mul(item.unitPrice).sub(item.discount || 0);

    const created = await this.prisma.proposalItem.create({
      data: {
        proposalId,
        ...item,
        total,
      },
    });

    await this.recalculateTotals(proposalId);
    return created;
  }

  async removeItem(tenantId: string, proposalId: string, itemId: string) {
    await this.findOne(tenantId, proposalId);
    await this.prisma.proposalItem.delete({ where: { id: itemId } });
    await this.recalculateTotals(proposalId);
    return { message: 'Item removido' };
  }

  async send(tenantId: string, userId: string, id: string, data: any) {
    await this.findOne(tenantId, id);

    const updated = await this.prisma.proposal.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    });

    await this.timeline.createEvent({
      tenantId,
      entityType: 'proposal',
      entityId: id,
      action: 'SENT',
      actorUserId: userId,
      metadata: { email: data.email },
    });

    // TODO: Enqueue email job
    return updated;
  }

  async approve(tenantId: string, userId: string, id: string) {
    await this.findOne(tenantId, id);

    const updated = await this.prisma.proposal.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });

    await this.timeline.createEvent({
      tenantId,
      entityType: 'proposal',
      entityId: id,
      action: 'APPROVED',
      actorUserId: userId,
    });

    return updated;
  }

  private async getNextNumber(tenantId: string): Promise<number> {
    const last = await this.prisma.proposal.findFirst({
      where: { tenantId },
      orderBy: { number: 'desc' },
    });
    return (last?.number || 0) + 1;
  }

  private async recalculateTotals(proposalId: string) {
    const items = await this.prisma.proposalItem.findMany({
      where: { proposalId },
    });

    let subtotal = new Decimal(0);
    let costTotal = new Decimal(0);

    for (const item of items) {
      subtotal = subtotal.add(item.total);
      costTotal = costTotal.add(new Decimal(item.costPrice).mul(item.quantity));
    }

    const proposal = await this.prisma.proposal.findUnique({ where: { id: proposalId } });
    const discount = proposal?.discount || new Decimal(0);
    const taxes = proposal?.taxes || new Decimal(0);
    const total = subtotal.sub(discount).add(taxes);
    const profit = total.sub(costTotal);
    const margin = total.gt(0) ? profit.div(total).mul(100) : new Decimal(0);

    await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { subtotal, costTotal, total, profit, margin },
    });
  }
}
