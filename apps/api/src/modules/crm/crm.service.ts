import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from './timeline.service';
import {
  CreateStageDto,
  UpdateStageDto,
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
} from './dto/crm.dto';

@Injectable()
export class CrmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly timeline: TimelineService,
  ) {}

  // ============ STAGES ============

  async getStages(tenantId: string) {
    return this.prisma.crmStage.findMany({
      where: { tenantId },
      orderBy: { position: 'asc' },
      include: {
        _count: {
          select: { cards: { where: { deletedAt: null } } },
        },
      },
    });
  }

  async createStage(tenantId: string, dto: CreateStageDto) {
    const existingStage = await this.prisma.crmStage.findFirst({
      where: { tenantId, position: dto.position },
    });

    if (existingStage) {
      // Shift all stages at or after this position
      await this.prisma.crmStage.updateMany({
        where: { tenantId, position: { gte: dto.position } },
        data: { position: { increment: 1 } },
      });
    }

    return this.prisma.crmStage.create({
      data: {
        tenantId,
        ...dto,
      },
    });
  }

  async updateStage(tenantId: string, id: string, dto: UpdateStageDto) {
    const stage = await this.prisma.crmStage.findFirst({
      where: { id, tenantId },
    });

    if (!stage) {
      throw new NotFoundException('Estágio não encontrado');
    }

    return this.prisma.crmStage.update({
      where: { id },
      data: dto,
    });
  }

  async deleteStage(tenantId: string, id: string) {
    const stage = await this.prisma.crmStage.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { cards: true } } },
    });

    if (!stage) {
      throw new NotFoundException('Estágio não encontrado');
    }

    if (stage._count.cards > 0) {
      throw new BadRequestException(
        'Não é possível excluir estágio com cards. Mova os cards primeiro.',
      );
    }

    await this.prisma.crmStage.delete({ where: { id } });

    return { message: 'Estágio excluído com sucesso' };
  }

  async reorderStages(tenantId: string, stages: { id: string; position: number }[]) {
    await this.prisma.$transaction(
      stages.map((stage) =>
        this.prisma.crmStage.update({
          where: { id: stage.id },
          data: { position: stage.position },
        }),
      ),
    );

    return this.getStages(tenantId);
  }

  // ============ CARDS ============

  async getKanban(tenantId: string) {
    const stages = await this.prisma.crmStage.findMany({
      where: { tenantId },
      orderBy: { position: 'asc' },
      include: {
        cards: {
          where: { deletedAt: null, status: 'ACTIVE' },
          orderBy: { position: 'asc' },
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            vehicle: { select: { id: true, plate: true, brand: true, model: true } },
            assignedTo: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    return stages;
  }

  async getCards(tenantId: string, query: any) {
    const { page = 1, limit = 20, stageId, status, assignedToId, customerId, search } = query;

    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (stageId) where.stageId = stageId;
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { vehicle: { plate: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.crmCard.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          vehicle: { select: { id: true, plate: true, brand: true, model: true } },
          assignedTo: { select: { id: true, name: true, avatarUrl: true } },
          stage: { select: { id: true, name: true, color: true } },
        },
      }),
      this.prisma.crmCard.count({ where }),
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

  async getCard(tenantId: string, id: string) {
    const card = await this.prisma.crmCard.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: true,
        vehicle: true,
        assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
        stage: true,
        proposals: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        workOrders: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    return card;
  }

  async createCard(tenantId: string, userId: string, dto: CreateCardDto) {
    // Get max position in stage
    const maxPosition = await this.prisma.crmCard.aggregate({
      where: { tenantId, stageId: dto.stageId, deletedAt: null },
      _max: { position: true },
    });

    const position = (maxPosition._max.position || 0) + 1;

    // Calculate SLA deadline
    const stage = await this.prisma.crmStage.findUnique({
      where: { id: dto.stageId },
    });

    const slaDeadline = stage?.slaHours
      ? new Date(Date.now() + stage.slaHours * 60 * 60 * 1000)
      : null;

    const card = await this.prisma.crmCard.create({
      data: {
        tenantId,
        position,
        slaDeadline,
        ...dto,
      },
      include: {
        customer: { select: { id: true, name: true } },
        vehicle: { select: { id: true, plate: true, brand: true, model: true } },
        assignedTo: { select: { id: true, name: true } },
        stage: { select: { id: true, name: true } },
      },
    });

    // Create timeline event
    await this.timeline.createEvent({
      tenantId,
      entityType: 'card',
      entityId: card.id,
      action: 'CREATED',
      actorUserId: userId,
      metadata: { card: { title: card.title, stageId: card.stageId } },
    });

    return card;
  }

  async updateCard(tenantId: string, userId: string, id: string, dto: UpdateCardDto) {
    const existing = await this.prisma.crmCard.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Card não encontrado');
    }

    const card = await this.prisma.crmCard.update({
      where: { id },
      data: dto,
      include: {
        customer: { select: { id: true, name: true } },
        vehicle: { select: { id: true, plate: true, brand: true, model: true } },
        assignedTo: { select: { id: true, name: true } },
        stage: { select: { id: true, name: true } },
      },
    });

    // Create timeline event
    await this.timeline.createEvent({
      tenantId,
      entityType: 'card',
      entityId: card.id,
      action: 'UPDATED',
      actorUserId: userId,
      metadata: { changes: dto },
    });

    return card;
  }

  async moveCard(tenantId: string, userId: string, id: string, dto: MoveCardDto) {
    const card = await this.prisma.crmCard.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { stage: true },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    const oldStageId = card.stageId;
    const oldPosition = card.position;

    // Get new stage info
    const newStage = await this.prisma.crmStage.findUnique({
      where: { id: dto.stageId },
    });

    if (!newStage) {
      throw new NotFoundException('Estágio não encontrado');
    }

    // Calculate new SLA deadline if stage changed
    let slaDeadline = card.slaDeadline;
    if (dto.stageId !== oldStageId && newStage.slaHours) {
      slaDeadline = new Date(Date.now() + newStage.slaHours * 60 * 60 * 1000);
    }

    // Update positions
    await this.prisma.$transaction(async (tx) => {
      // If moving within same stage
      if (dto.stageId === oldStageId) {
        if (dto.position > oldPosition) {
          await tx.crmCard.updateMany({
            where: {
              tenantId,
              stageId: dto.stageId,
              position: { gt: oldPosition, lte: dto.position },
              deletedAt: null,
            },
            data: { position: { decrement: 1 } },
          });
        } else if (dto.position < oldPosition) {
          await tx.crmCard.updateMany({
            where: {
              tenantId,
              stageId: dto.stageId,
              position: { gte: dto.position, lt: oldPosition },
              deletedAt: null,
            },
            data: { position: { increment: 1 } },
          });
        }
      } else {
        // Moving to different stage
        // Decrement positions in old stage
        await tx.crmCard.updateMany({
          where: {
            tenantId,
            stageId: oldStageId,
            position: { gt: oldPosition },
            deletedAt: null,
          },
          data: { position: { decrement: 1 } },
        });

        // Increment positions in new stage
        await tx.crmCard.updateMany({
          where: {
            tenantId,
            stageId: dto.stageId,
            position: { gte: dto.position },
            deletedAt: null,
          },
          data: { position: { increment: 1 } },
        });
      }

      // Update the card
      await tx.crmCard.update({
        where: { id },
        data: {
          stageId: dto.stageId,
          position: dto.position,
          slaDeadline,
        },
      });
    });

    // Create timeline event
    await this.timeline.createEvent({
      tenantId,
      entityType: 'card',
      entityId: id,
      action: 'MOVED',
      actorUserId: userId,
      metadata: {
        from: { stageId: oldStageId, stageName: card.stage.name, position: oldPosition },
        to: { stageId: dto.stageId, stageName: newStage.name, position: dto.position },
      },
    });

    return this.getCard(tenantId, id);
  }

  async deleteCard(tenantId: string, userId: string, id: string) {
    const card = await this.prisma.crmCard.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    await this.prisma.crmCard.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'LOST' },
    });

    await this.timeline.createEvent({
      tenantId,
      entityType: 'card',
      entityId: id,
      action: 'DELETED',
      actorUserId: userId,
      metadata: { card: { title: card.title } },
    });

    return { message: 'Card excluído com sucesso' };
  }

  async getCardTimeline(tenantId: string, cardId: string, query: any) {
    const { page = 1, limit = 20 } = query;

    return this.timeline.getEntityTimeline(tenantId, 'card', cardId, { page, limit });
  }
}
