import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineAction } from '@oficina-os/database';

interface CreateTimelineEventDto {
  tenantId: string;
  entityType: string;
  entityId: string;
  action: TimelineAction;
  actorUserId?: string;
  actorRole?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(dto: CreateTimelineEventDto) {
    return this.prisma.timelineEvent.create({
      data: {
        tenantId: dto.tenantId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        action: dto.action,
        actorUserId: dto.actorUserId,
        actorRole: dto.actorRole,
        metadata: dto.metadata || {},
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      },
    });
  }

  async getEntityTimeline(
    tenantId: string,
    entityType: string,
    entityId: string,
    query: { page?: number; limit?: number },
  ) {
    const { page = 1, limit = 20 } = query;

    const [items, total] = await Promise.all([
      this.prisma.timelineEvent.findMany({
        where: { tenantId, entityType, entityId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actorUser: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.timelineEvent.count({
        where: { tenantId, entityType, entityId },
      }),
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

  async getRecentEvents(tenantId: string, limit = 50) {
    return this.prisma.timelineEvent.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actorUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }
}
