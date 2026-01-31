import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      leadsThisMonth,
      leadsLastMonth,
      proposalsSent,
      proposalsApproved,
      activeCards,
      stageMetrics,
    ] = await Promise.all([
      this.prisma.crmCard.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
      this.prisma.crmCard.count({ where: { tenantId, createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      this.prisma.proposal.count({ where: { tenantId, status: 'SENT', createdAt: { gte: startOfMonth } } }),
      this.prisma.proposal.count({ where: { tenantId, status: 'APPROVED', createdAt: { gte: startOfMonth } } }),
      this.prisma.crmCard.count({ where: { tenantId, status: 'ACTIVE', deletedAt: null } }),
      this.getStageMetrics(tenantId),
    ]);

    const leadsGrowth = leadsLastMonth > 0 ? ((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100 : 0;
    const conversionRate = proposalsSent > 0 ? (proposalsApproved / proposalsSent) * 100 : 0;

    return {
      leadsThisMonth,
      leadsGrowth: Math.round(leadsGrowth * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
      proposalsSent,
      proposalsApproved,
      activeCards,
      stageMetrics,
    };
  }

  async getStageMetrics(tenantId: string) {
    const stages = await this.prisma.crmStage.findMany({
      where: { tenantId },
      orderBy: { position: 'asc' },
      include: { _count: { select: { cards: { where: { deletedAt: null, status: 'ACTIVE' } } } } },
    });

    return stages.map(s => ({
      id: s.id,
      name: s.name,
      color: s.color,
      count: s._count.cards,
    }));
  }

  async getLeadsByChannel(tenantId: string) {
    const result = await this.prisma.crmCard.groupBy({
      by: ['channel'],
      where: { tenantId, deletedAt: null },
      _count: true,
    });

    const total = result.reduce((acc, r) => acc + r._count, 0);

    return result.map(r => ({
      channel: r.channel || 'Não informado',
      count: r._count,
      percentage: total > 0 ? Math.round((r._count / total) * 100) : 0,
    }));
  }

  async getRecentActivity(tenantId: string, limit = 20) {
    return this.prisma.timelineEvent.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { actorUser: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  // Super Admin Dashboard
  async getSuperAdminOverview() {
    const [tenantsCount, usersCount, cardsCount] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.crmCard.count(),
    ]);

    return {
      tenantsCount,
      usersCount,
      cardsCount,
      mrr: 0, // Placeholder
      churn: 0, // Placeholder
    };
  }
}
