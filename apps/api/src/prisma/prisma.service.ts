import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@oficina-os/database';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper for soft delete queries
  excludeDeleted() {
    return { deletedAt: null };
  }

  // Helper for tenant-scoped queries
  tenantScope(tenantId: string) {
    return { tenantId, ...this.excludeDeleted() };
  }
}
